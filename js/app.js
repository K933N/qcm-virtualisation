import { createAntiCheatController } from "./anti-cheat.js";
import { answerLettersFromValues, hydrateManualQuestion, mergeQuestionsByKey, parseQuestionsText } from "./parsing.js";
import { buildQuizQuestions, buildSessionResult, scoreQuestion } from "./quiz-engine.js";
import { resolveStore } from "./stores.js";
import { compareText, formatPoints, normalizeForSearch, randomId, slugify } from "./utils.js";

const DEFAULT_QUIZ_SIZE = 10;

const selectors = {
  screens: {
    home: document.getElementById("home-screen"),
    manager: document.getElementById("manager-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("result-screen"),
    review: document.getElementById("review-screen"),
  },
  storageStatus: document.getElementById("storage-status"),
  managerStorageStatus: document.getElementById("manager-storage-status"),
  categorySelect: document.getElementById("category-select"),
  quizSizeInput: document.getElementById("quiz-size-input"),
  antiCheatToggle: document.getElementById("anti-cheat-toggle"),
  categoryStats: document.getElementById("category-stats"),
  categorySummary: document.getElementById("category-summary"),
  startBtn: document.getElementById("start-btn"),
  openManagerBtn: document.getElementById("open-manager-btn"),
  backHomeBtn: document.getElementById("back-home-btn"),
  manualTabBtn: document.getElementById("manual-tab-btn"),
  bulkTabBtn: document.getElementById("bulk-tab-btn"),
  manualPanel: document.getElementById("manual-panel"),
  bulkPanel: document.getElementById("bulk-panel"),
  questionForm: document.getElementById("question-form"),
  managerCategorySelect: document.getElementById("manager-category-select"),
  newCategoryInput: document.getElementById("new-category-input"),
  questionPromptInput: document.getElementById("question-prompt-input"),
  questionExplanationInput: document.getElementById("question-explanation-input"),
  optionsBuilder: document.getElementById("options-builder"),
  addOptionBtn: document.getElementById("add-option-btn"),
  managerFeedback: document.getElementById("manager-feedback"),
  bulkCategorySelect: document.getElementById("bulk-category-select"),
  bulkNewCategoryInput: document.getElementById("bulk-new-category-input"),
  bulkImportInput: document.getElementById("bulk-import-input"),
  bulkImportBtn: document.getElementById("bulk-import-btn"),
  bulkClearBtn: document.getElementById("bulk-clear-btn"),
  bulkFeedback: document.getElementById("bulk-feedback"),
  questionListCategory: document.getElementById("question-list-category"),
  questionList: document.getElementById("question-list"),
  quizCategoryLabel: document.getElementById("quiz-category-label"),
  progressText: document.getElementById("progress-text"),
  scoreHint: document.getElementById("score-hint"),
  questionText: document.getElementById("question-text"),
  answersForm: document.getElementById("answers-form"),
  nextBtn: document.getElementById("next-btn"),
  antiCheatBanner: document.getElementById("anti-cheat-banner"),
  integrityCounter: document.getElementById("integrity-counter"),
  antiCheatLock: document.getElementById("anti-cheat-lock"),
  resumeQuizBtn: document.getElementById("resume-quiz-btn"),
  resultTitle: document.getElementById("result-title"),
  resultSummary: document.getElementById("result-summary"),
  resultSessionMeta: document.getElementById("result-session-meta"),
  resultExplanationsSummary: document.getElementById("result-explanations-summary"),
  resultExplanationsList: document.getElementById("result-explanations-list"),
  retryBtn: document.getElementById("retry-btn"),
  errorsBtn: document.getElementById("errors-btn"),
  resultHomeBtn: document.getElementById("result-home-btn"),
  reviewTitle: document.getElementById("review-title"),
  reviewDescription: document.getElementById("review-description"),
  reviewList: document.getElementById("review-list"),
  reviewRetryBtn: document.getElementById("review-retry-btn"),
  reviewBackBtn: document.getElementById("review-back-btn"),
  reviewHomeBtn: document.getElementById("review-home-btn"),
};

function showScreen(screenName) {
  Object.entries(selectors.screens).forEach(([name, element]) => {
    element.classList.toggle("active", name === screenName);
  });
}

function setManagerMode(mode) {
  const manual = mode === "manual";
  selectors.manualPanel.classList.toggle("hidden", !manual);
  selectors.bulkPanel.classList.toggle("hidden", manual);
  selectors.manualPanel.classList.toggle("active-mode", manual);
  selectors.bulkPanel.classList.toggle("active-mode", !manual);
  selectors.manualTabBtn.className = manual ? "primary" : "secondary";
  selectors.bulkTabBtn.className = manual ? "secondary" : "primary";
}

function createAppState() {
  return {
    store: null,
    data: { categories: [], questions: [] },
    currentQuiz: [],
    currentIndex: 0,
    sessionResult: null,
    reviewMode: "errors",
  };
}

function questionCountLabel(count) {
  return `${count} question${count > 1 ? "s" : ""}`;
}

function getCategoryById(state, categoryId) {
  return state.data.categories.find((category) => category.id === categoryId) || null;
}

function getQuestionsByCategory(state, categoryId) {
  return state.data.questions.filter((question) => question.categoryId === categoryId);
}

function syncStorageBanner(state) {
  selectors.storageStatus.textContent = state.store.label;
  selectors.storageStatus.className = `status-banner ${state.store.mode === "supabase" ? "cloud" : "local"}`;
  selectors.managerStorageStatus.textContent = state.store.canWrite
    ? state.store.mode === "supabase"
      ? "Les ajouts sont partages publiquement via la base configuree."
      : "Les ajouts manuels et imports restent prives a ce navigateur tant qu'aucun cloud n'est configure."
    : "Les ajouts sont bloques tant que la configuration de stockage partage demandee n'est pas disponible.";
}

function syncWriteAvailability(state) {
  const writable = state.store.canWrite;
  [selectors.questionForm, selectors.bulkPanel].forEach((container) => {
    container.querySelectorAll("input, textarea, select, button").forEach((element) => {
      element.disabled = !writable;
    });
  });
  selectors.manualTabBtn.disabled = false;
  selectors.bulkTabBtn.disabled = false;
  selectors.backHomeBtn.disabled = false;

  if (!writable) {
    selectors.managerFeedback.textContent = "Edition bloquee: configure un stockage partage valide ou repasse en mode local/auto.";
    selectors.bulkFeedback.textContent = "Import bloque: configure un stockage partage valide ou repasse en mode local/auto.";
  }
}

function buildCategorySummary(state) {
  selectors.categorySummary.innerHTML = "";
  state.data.categories.forEach((category) => {
    const categoryQuestions = getQuestionsByCategory(state, category.id);
    const priorityCount = categoryQuestions.filter((question) => question.isPriority).length;
    const item = document.createElement("article");
    item.className = "summary-item";
    item.innerHTML = `
      <strong>${category.name}</strong>
      <span class="question-meta">${questionCountLabel(categoryQuestions.length)}</span>
      ${priorityCount ? `<span class="question-meta">${priorityCount} question(s) prioritaire(s)</span>` : ""}
    `;
    selectors.categorySummary.appendChild(item);
  });
}

function refreshCategorySelectors(state) {
  const allSelects = [
    selectors.categorySelect,
    selectors.managerCategorySelect,
    selectors.bulkCategorySelect,
    selectors.questionListCategory,
  ];

  allSelects.forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = "";
    state.data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
    if (state.data.categories.some((category) => category.id === currentValue)) {
      select.value = currentValue;
    }
    if (!select.value && state.data.categories[0]) {
      select.value = state.data.categories[0].id;
    }
  });

  buildCategorySummary(state);
  updateCategoryStats(state);
  renderQuestionList(state);
}

function updateCategoryStats(state) {
  const categoryId = selectors.categorySelect.value;
  const category = getCategoryById(state, categoryId);
  const count = getQuestionsByCategory(state, categoryId).length;

  selectors.categoryStats.textContent = category
    ? `${category.name}: ${questionCountLabel(count)} disponibles.`
    : "Aucune categorie disponible.";
  selectors.quizSizeInput.max = Math.max(count, 1);
  selectors.quizSizeInput.value = count ? `${Math.min(Number(selectors.quizSizeInput.value) || DEFAULT_QUIZ_SIZE, count)}` : "1";
  selectors.startBtn.disabled = !count;
}

function createOptionRow(index) {
  const row = document.createElement("div");
  row.className = "option-row";
  row.innerHTML = `
    <label class="field">
      <span>Proposition ${index + 1}</span>
      <input type="text" data-option-input="${index}" placeholder="Texte de la proposition ${index + 1}">
    </label>
    <label class="option-toggle">
      <input type="checkbox" data-correct-input="${index}">
      <span>Bonne reponse</span>
    </label>
  `;
  return row;
}

function ensureMinimumOptionRows(minimum = 4) {
  while (selectors.optionsBuilder.children.length < minimum) {
    selectors.optionsBuilder.appendChild(createOptionRow(selectors.optionsBuilder.children.length));
  }
}

function resetManualForm() {
  selectors.questionForm.reset();
  selectors.optionsBuilder.innerHTML = "";
  ensureMinimumOptionRows(4);
}

function ensureCategory(state, existingId, categoryName) {
  const nextName = `${categoryName || ""}`.trim();
  if (!nextName) {
    return getCategoryById(state, existingId) || null;
  }

  const existing = state.data.categories.find((category) => normalizeForSearch(category.name) === normalizeForSearch(nextName));
  if (existing) {
    return existing;
  }

  const slug = slugify(nextName) || randomId("category");
  let uniqueId = slug;
  let cursor = 2;
  while (state.data.categories.some((category) => category.id === uniqueId)) {
    uniqueId = `${slug}-${cursor}`;
    cursor += 1;
  }

  return {
    id: uniqueId,
    name: nextName,
    source: state.store.mode === "supabase" ? "shared" : "local",
  };
}

function getManualQuestionPayload() {
  const options = [];
  const answers = [];

  selectors.optionsBuilder.querySelectorAll(".option-row").forEach((row) => {
    const optionInput = row.querySelector("[data-option-input]");
    const correctInput = row.querySelector("[data-correct-input]");
    const value = optionInput.value.trim();
    if (!value) {
      return;
    }
    options.push(value);
    if (correctInput.checked) {
      answers.push(value);
    }
  });

  return {
    prompt: selectors.questionPromptInput.value.trim(),
    options,
    answers,
    explanation: selectors.questionExplanationInput.value.trim(),
  };
}

function renderQuestionList(state) {
  selectors.questionList.innerHTML = "";
  const categoryId = selectors.questionListCategory.value;
  const questions = getQuestionsByCategory(state, categoryId).sort((left, right) => compareText(left.prompt, right.prompt));

  if (!questions.length) {
    selectors.questionList.innerHTML = '<div class="empty-state">Aucune question dans cette categorie pour le moment.</div>';
    return;
  }

  questions.forEach((question) => {
    const sourceLabel = question.source === "local" ? "Brouillon local" : question.source === "shared" ? "Partage" : "Embarque";
    const canDelete = state.store.allowDelete && question.source === "local";
    const card = document.createElement("article");
    card.className = "question-card";
    card.innerHTML = `
      <div class="question-card-head">
        <h3>${question.prompt}</h3>
        <span class="pill">${sourceLabel}</span>
      </div>
      <p class="question-meta">${question.answers.length > 1 ? "QCM multiple" : "QCM simple"} · ${question.options.length} propositions</p>
      <div class="answer-chip-list">
        ${question.answers.map((answer) => `<span class="answer-chip good">${answer}</span>`).join("")}
      </div>
      ${question.explanation ? `<p class="question-meta">Explication: ${question.explanation}</p>` : ""}
      ${canDelete ? `<div class="question-actions actions"><button type="button" class="secondary" data-delete-question="${question.id}">Supprimer ce brouillon</button></div>` : ""}
    `;
    selectors.questionList.appendChild(card);
  });
}

function renderCurrentQuestion(state) {
  const question = state.currentQuiz[state.currentIndex];
  if (!question) {
    return;
  }

  const category = getCategoryById(state, question.categoryId);
  const isMultiple = question.answers.length > 1;

  selectors.quizCategoryLabel.textContent = `${category?.name || "Categorie"} · ${isMultiple ? "Plusieurs reponses possibles" : "Une seule reponse attendue"}`;
  selectors.progressText.textContent = `Question ${state.currentIndex + 1} / ${state.currentQuiz.length}`;
  selectors.scoreHint.textContent = isMultiple ? "Score partiel possible" : "1 point si la reponse est correcte";
  selectors.questionText.textContent = question.prompt;
  selectors.answersForm.innerHTML = "";
  selectors.nextBtn.disabled = true;

  question.options.forEach((option, index) => {
    const id = `answer-${state.currentIndex}-${index}`;
    const row = document.createElement("label");
    row.className = "answer-option";
    row.setAttribute("for", id);
    row.innerHTML = `
      <input id="${id}" name="answer" type="${isMultiple ? "checkbox" : "radio"}" value="${option}">
      <span class="answer-label">${String.fromCharCode(65 + index)}</span>
      <span>${option}</span>
    `;
    selectors.answersForm.appendChild(row);
  });
}

function getSelectedAnswers() {
  return [...selectors.answersForm.querySelectorAll("input:checked")].map((input) => input.value);
}

function renderReviewCard(entry) {
  const reviewClass = entry.score === 1 ? "good" : entry.score > 0 ? "partial" : "bad";
  return `
    <article class="review-item ${reviewClass}">
      <h3>${entry.question.prompt}</h3>
      <p class="review-score">Points obtenus: ${formatPoints(entry.score)} / 1</p>
      <p><strong>Ta reponse:</strong> ${entry.userAnswers.length ? entry.userAnswers.join(", ") : "Aucune reponse"}</p>
      <p><strong>Bonne reponse:</strong> ${entry.question.answers.join(", ")}</p>
      <p><strong>Reponse attendue (lettres):</strong> ${answerLettersFromValues(entry.question).join(", ")}</p>
      ${entry.question.explanation ? `<div class="review-explanation"><strong>Explication:</strong> ${entry.question.explanation}</div>` : ""}
    </article>
  `;
}

function renderResultScreen(state) {
  const result = state.sessionResult;
  selectors.resultTitle.textContent = `Score final: ${formatPoints(result.totalScore)} / ${result.maxScore}`;
  selectors.resultSummary.textContent = `Tu as obtenu ${formatPoints(result.totalScore)} point(s) sur ${result.maxScore} question(s).`;
  selectors.resultSessionMeta.textContent = result.antiCheatEnabled
    ? `Anti-triche actif · ${result.incidentCount} incident(s) detecte(s).`
    : "Anti-triche desactive pendant cette session.";

  const missedWithExplanation = result.answers
    .filter((entry) => entry.score < 1 && entry.question.explanation)
    .sort((left, right) => left.score - right.score);
  const fallbackReminders = result.answers.filter((entry) => entry.score === 1 && entry.question.explanation).slice(0, 3);
  const highlighted = missedWithExplanation.length ? missedWithExplanation : fallbackReminders;

  selectors.resultExplanationsSummary.textContent = missedWithExplanation.length
    ? "Questions a revoir en priorite avec leur explication."
    : highlighted.length
      ? "Aucune erreur commentee. Voici quelques rappels utiles sur des questions reussies."
      : "Aucune explication disponible pour cette session.";
  selectors.resultExplanationsList.innerHTML = highlighted.length
    ? highlighted.map((entry) => renderReviewCard(entry)).join("")
    : '<div class="empty-state">Aucune correction commentee a afficher.</div>';
}

function renderReviewScreen(state) {
  const allItems = state.sessionResult?.answers || [];
  const items = state.reviewMode === "errors" ? allItems.filter((entry) => entry.score < 1) : allItems;

  selectors.reviewTitle.textContent = state.reviewMode === "errors" ? "Mes erreurs" : "Resume complet";
  selectors.reviewDescription.textContent = state.reviewMode === "errors"
    ? "Seules les questions non totalement reussies sont affichees."
    : "Toutes les questions de la session sont affichees.";
  selectors.reviewList.innerHTML = items.length
    ? items.map((entry) => renderReviewCard(entry)).join("")
    : '<div class="empty-state">Aucune erreur sur cette session.</div>';
}

function buildSessionAnswer(question, userAnswers) {
  const evaluation = scoreQuestion(question, userAnswers);
  return {
    question,
    userAnswers,
    score: evaluation.score,
    isPerfect: evaluation.isPerfect,
  };
}

async function refreshData(state) {
  state.data = await state.store.load();
  refreshCategorySelectors(state);
  syncStorageBanner(state);
  syncWriteAvailability(state);
}

export async function bootstrapApp() {
  const state = createAppState();
  state.store = resolveStore(window.APP_CONFIG || {});
  await refreshData(state);
  resetManualForm();
  setManagerMode("manual");
  showScreen("home");

  const antiCheat = createAntiCheatController({
    isSessionActive: () => selectors.screens.quiz.classList.contains("active") && state.currentQuiz.length > 0,
    onIncident: (count) => {
      selectors.integrityCounter.textContent = `${count} incident(s) detecte(s)`;
    },
    onLockChange: (locked, count) => {
      selectors.antiCheatLock.classList.toggle("hidden", !locked);
      selectors.nextBtn.disabled = locked || getSelectedAnswers().length === 0;
      selectors.integrityCounter.textContent = `${count} incident(s) detecte(s)`;
      selectors.antiCheatBanner.classList.toggle("hidden", !selectors.antiCheatToggle.checked);
    },
  });

  selectors.categorySelect.addEventListener("change", () => updateCategoryStats(state));
  selectors.questionListCategory.addEventListener("change", () => renderQuestionList(state));
  selectors.openManagerBtn.addEventListener("click", () => showScreen("manager"));
  selectors.backHomeBtn.addEventListener("click", () => showScreen("home"));
  selectors.manualTabBtn.addEventListener("click", () => setManagerMode("manual"));
  selectors.bulkTabBtn.addEventListener("click", () => setManagerMode("bulk"));
  selectors.addOptionBtn.addEventListener("click", () => {
    selectors.optionsBuilder.appendChild(createOptionRow(selectors.optionsBuilder.children.length));
  });

  selectors.questionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    selectors.managerFeedback.textContent = "";

    try {
      const category = ensureCategory(state, selectors.managerCategorySelect.value, selectors.newCategoryInput.value);
      if (!category) {
        throw new Error("Choisis une categorie ou cree-en une nouvelle.");
      }

      const question = hydrateManualQuestion({
        categoryId: category.id,
        ...getManualQuestionPayload(),
        meta: {
          source: state.store.mode === "supabase" ? "shared" : "local",
        },
      });
      if (!question) {
        throw new Error("Renseigne une question, au moins 4 propositions et au moins une bonne reponse.");
      }

      const merged = mergeQuestionsByKey([...state.data.questions, question]);
      if (merged.length === state.data.questions.length) {
        throw new Error("Cette question existe deja dans la banque active.");
      }

      if (!state.data.categories.some((entry) => entry.id === category.id)) {
        await state.store.saveCategory(category);
      }
      await state.store.saveQuestions([question]);
      await refreshData(state);
      resetManualForm();
      selectors.managerCategorySelect.value = category.id;
      selectors.questionListCategory.value = category.id;
      selectors.managerFeedback.textContent = "Question enregistree avec succes.";
    } catch (error) {
      selectors.managerFeedback.textContent = error.message;
    }
  });

  selectors.bulkImportBtn.addEventListener("click", async () => {
    selectors.bulkFeedback.textContent = "";

    try {
      const category = ensureCategory(state, selectors.bulkCategorySelect.value, selectors.bulkNewCategoryInput.value);
      if (!category) {
        throw new Error("Choisis une categorie ou cree-en une nouvelle.");
      }
      const rawBlock = selectors.bulkImportInput.value.trim();
      if (!rawBlock) {
        throw new Error("Colle un bloc texte avant de lancer l'import.");
      }

      const parsed = parseQuestionsText(rawBlock, category.id, {
        source: state.store.mode === "supabase" ? "shared" : "local",
      });
      const deduped = mergeQuestionsByKey([...state.data.questions, ...parsed.questions]);
      const newQuestions = deduped.filter((question) => !state.data.questions.some((existing) => existing.id === question.id));

      if (!newQuestions.length) {
        throw new Error(parsed.ignoredCount ? "Aucune question exploitable importee. Les blocs incomplets ont ete ignores." : "Toutes les questions importees existent deja.");
      }

      if (!state.data.categories.some((entry) => entry.id === category.id)) {
        await state.store.saveCategory(category);
      }
      await state.store.saveQuestions(newQuestions);
      await refreshData(state);
      selectors.bulkCategorySelect.value = category.id;
      selectors.questionListCategory.value = category.id;
      selectors.bulkFeedback.textContent = `${newQuestions.length} question(s) importee(s). ${parsed.ignoredCount ? `${parsed.ignoredCount} bloc(s) incomplet(s) ignore(s).` : ""}`;
    } catch (error) {
      selectors.bulkFeedback.textContent = error.message;
    }
  });

  selectors.bulkClearBtn.addEventListener("click", () => {
    selectors.bulkImportInput.value = "";
    selectors.bulkFeedback.textContent = "";
  });

  selectors.questionList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-question]");
    if (!button) {
      return;
    }
    try {
      const deleted = await state.store.deleteQuestion(button.dataset.deleteQuestion);
      if (!deleted) {
        throw new Error("Seuls les brouillons locaux peuvent etre supprimes dans ce mode.");
      }
      await refreshData(state);
      selectors.managerFeedback.textContent = "Question supprimee.";
    } catch (error) {
      selectors.managerFeedback.textContent = error.message;
    }
  });

  selectors.answersForm.addEventListener("change", () => {
    selectors.nextBtn.disabled = antiCheat.isLocked() || getSelectedAnswers().length === 0;
  });

  selectors.startBtn.addEventListener("click", () => {
    const categoryId = selectors.categorySelect.value;
    const requestedCount = Math.max(1, Number(selectors.quizSizeInput.value) || DEFAULT_QUIZ_SIZE);
    const quizQuestions = buildQuizQuestions(state.data.questions, categoryId, requestedCount);

    if (!quizQuestions.length) {
      selectors.categoryStats.textContent = "Cette categorie ne contient pas assez de questions pour lancer un quiz.";
      return;
    }

    state.currentQuiz = quizQuestions;
    state.currentIndex = 0;
    state.sessionResult = {
      questions: quizQuestions,
      answers: [],
      antiCheatEnabled: selectors.antiCheatToggle.checked,
      incidentCount: 0,
    };
    antiCheat.reset();
    antiCheat.setEnabled(selectors.antiCheatToggle.checked);
    selectors.antiCheatBanner.classList.toggle("hidden", !selectors.antiCheatToggle.checked);
    renderCurrentQuestion(state);
    showScreen("quiz");
  });

  selectors.nextBtn.addEventListener("click", () => {
    const currentQuestion = state.currentQuiz[state.currentIndex];
    const selectedAnswers = getSelectedAnswers();
    if (!selectedAnswers.length || antiCheat.isLocked()) {
      return;
    }

    state.sessionResult.answers.push(buildSessionAnswer(currentQuestion, selectedAnswers));
    state.currentIndex += 1;

    if (state.currentIndex >= state.currentQuiz.length) {
      state.sessionResult.incidentCount = antiCheat.getIncidentCount();
      state.sessionResult = buildSessionResult(state.sessionResult);
      renderResultScreen(state);
      showScreen("result");
      return;
    }

    renderCurrentQuestion(state);
  });

  selectors.resumeQuizBtn.addEventListener("click", () => {
    antiCheat.resume();
    selectors.nextBtn.disabled = getSelectedAnswers().length === 0;
  });

  selectors.retryBtn.addEventListener("click", () => showScreen("home"));
  selectors.resultHomeBtn.addEventListener("click", () => showScreen("home"));
  selectors.reviewHomeBtn.addEventListener("click", () => showScreen("home"));
  selectors.reviewBackBtn.addEventListener("click", () => showScreen("result"));
  selectors.reviewRetryBtn.addEventListener("click", () => showScreen("home"));

  selectors.errorsBtn.addEventListener("click", () => {
    state.reviewMode = "errors";
    renderReviewScreen(state);
    showScreen("review");
  });
}
