import { clone, normalizeForSearch, normalizeQuestionKey, pickBestExplanation, sortByName } from "./utils.js";

const LOCAL_STORAGE_KEY = "qcm-local-drafts-v1";

function getDefaultData() {
  return clone(window.DEFAULT_QUIZ_DATA || { categories: [], questions: [] });
}

function safeReadDrafts() {
  try {
    const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : null;
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.questions)) {
      return { categories: [], questions: [] };
    }
    return parsed;
  } catch (error) {
    return { categories: [], questions: [] };
  }
}

function writeDrafts(drafts) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
}

function mergeCategories(defaultCategories, draftCategories) {
  const byName = new Map();
  [...defaultCategories, ...draftCategories].forEach((category) => {
    const nameKey = normalizeForSearch(category.name);
    if (byName.has(nameKey)) {
      return;
    }
    byName.set(nameKey, category);
  });
  return sortByName([...byName.values()]);
}

function mergeQuestions(defaultQuestions, draftQuestions) {
  const byKey = new Map();

  [...defaultQuestions, ...draftQuestions].forEach((question) => {
    const key = normalizeQuestionKey(question);
    if (!byKey.has(key)) {
      byKey.set(key, question);
      return;
    }
    const current = byKey.get(key);
    byKey.set(key, {
      ...current,
      explanation: pickBestExplanation(current.explanation, question.explanation),
      isFrequent40: current.isFrequent40 || question.isFrequent40,
      isEssential120: current.isEssential120 || question.isEssential120,
      isPriority: current.isPriority || question.isPriority || current.isFrequent40 || current.isEssential120,
    });
  });

  return [...byKey.values()];
}

export function createLocalStore(options = {}) {
  const readOnly = Boolean(options.readOnly);
  const readOnlyReason = options.readOnlyReason || "Mode cloud obligatoire non configure.";

  return {
    mode: "local",
    canWrite: !readOnly,
    allowDelete: !readOnly,
    label: readOnly
      ? `${readOnlyReason} La banque embarquee reste consultable, mais les ajouts sont bloques tant qu'aucun stockage partage n'est configure.`
      : "Mode local prive actif. Les ajouts et categories crees dans ce navigateur sont conserves localement et distincts de la banque embarquee.",
    async load() {
      const defaults = getDefaultData();
      const drafts = safeReadDrafts();
      return {
        categories: mergeCategories(defaults.categories, drafts.categories),
        questions: mergeQuestions(defaults.questions, drafts.questions),
      };
    },
    async saveCategory(category) {
      if (readOnly) {
        throw new Error(readOnlyReason);
      }
      const drafts = safeReadDrafts();
      if (!drafts.categories.some((entry) => entry.id === category.id)) {
        drafts.categories.push({ ...category, source: "local" });
      }
      writeDrafts(drafts);
    },
    async saveQuestions(questions) {
      if (readOnly) {
        throw new Error(readOnlyReason);
      }
      const drafts = safeReadDrafts();
      questions.forEach((question) => {
        if (!drafts.questions.some((entry) => entry.id === question.id)) {
          drafts.questions.push({ ...question, source: "local" });
        }
      });
      writeDrafts(drafts);
    },
    async deleteQuestion(questionId) {
      if (readOnly) {
        throw new Error(readOnlyReason);
      }
      const drafts = safeReadDrafts();
      const nextQuestions = drafts.questions.filter((question) => question.id !== questionId);
      if (nextQuestions.length === drafts.questions.length) {
        return false;
      }
      drafts.questions = nextQuestions;
      writeDrafts(drafts);
      return true;
    },
  };
}

function mapQuestionFromRemote(record) {
  return {
    id: record.id,
    categoryId: record.category_id,
    prompt: record.prompt,
    options: Array.isArray(record.options) ? record.options : [],
    answers: Array.isArray(record.answers) ? record.answers : [],
    explanation: record.explanation || null,
    isPriority: Boolean(record.is_priority),
    isFrequent40: Boolean(record.is_frequent40),
    isEssential120: Boolean(record.is_essential120),
    source: "shared",
  };
}

function mapQuestionToRemote(question) {
  return {
    id: question.id,
    category_id: question.categoryId,
    prompt: question.prompt,
    options: question.options,
    answers: question.answers,
    explanation: question.explanation || null,
    is_priority: Boolean(question.isPriority),
    is_frequent40: Boolean(question.isFrequent40),
    is_essential120: Boolean(question.isEssential120),
  };
}

export function createSupabaseStore(config = {}) {
  const defaultData = getDefaultData();
  const url = `${config.supabaseUrl || ""}`.replace(/\/$/, "");
  const anonKey = config.supabaseAnonKey || "";

  const request = async (path, init = {}) => {
    const response = await fetch(`${url}${path}`, {
      ...init,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error((await response.text()) || `Erreur ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const seedIfNeeded = async () => {
    const categories = await request("/rest/v1/categories?select=id");
    if (Array.isArray(categories) && categories.length === 0 && config.seedDefaultsOnFirstCloudLoad !== false) {
      if (defaultData.categories.length) {
        await request("/rest/v1/categories?on_conflict=id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(defaultData.categories),
        });
      }
      if (defaultData.questions.length) {
        await request("/rest/v1/questions?on_conflict=id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(defaultData.questions.map(mapQuestionToRemote)),
        });
      }
    }
  };

  return {
    mode: "supabase",
    canWrite: true,
    allowDelete: config.allowPublicDelete === true,
    label: "Mode partage public actif. Les ajouts sont synchronises entre tous les appareils relies a la meme base.",
    async load() {
      await seedIfNeeded();
      const [categories, questions] = await Promise.all([
        request("/rest/v1/categories?select=*&order=name.asc"),
        request("/rest/v1/questions?select=*&order=prompt.asc"),
      ]);
      return {
        categories: Array.isArray(categories) ? categories : [],
        questions: Array.isArray(questions) ? questions.map(mapQuestionFromRemote) : [],
      };
    },
    async saveCategory(category) {
      await request("/rest/v1/categories?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify([category]),
      });
    },
    async saveQuestions(questions) {
      if (!questions.length) {
        return;
      }
      await request("/rest/v1/questions?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(questions.map(mapQuestionToRemote)),
      });
    },
    async deleteQuestion(questionId) {
      if (config.allowPublicDelete !== true) {
        throw new Error("La suppression publique est desactivee dans la configuration.");
      }
      await request(`/rest/v1/questions?id=eq.${encodeURIComponent(questionId)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      return true;
    },
  };
}

export function resolveStore(config = {}) {
  const mode = config.storageMode || "auto";
  const hasCloud = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  if ((mode === "auto" || mode === "cloud") && hasCloud) {
    return createSupabaseStore(config);
  }
  if (mode === "cloud_only" && !hasCloud) {
    return createLocalStore({
      readOnly: true,
      readOnlyReason: "Le mode cloud_only est actif sans configuration Supabase valide.",
    });
  }
  return createLocalStore();
}
