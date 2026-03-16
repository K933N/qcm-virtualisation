import {
  LETTERS,
  normalizeQuestionKey,
  normalizeWhitespace,
  pickBestExplanation,
  randomId,
} from "./utils.js";

const QUESTION_HEADER = /^(?:question|qcm)\s+\d+/i;
const OPTION_HEADER = /^([A-Z])[\.\)]\s*(.*)$/;
const ANSWER_HEADER = /^bonnes?\s+r[eé]ponses?\s*:\s*(.+)$/i;
const EXPLANATION_HEADER = /^explication\s*:\s*(.*)$/i;

function splitIntoBlocks(rawText) {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let current = [];

  lines.forEach((line) => {
    const cleaned = line.trimEnd();
    if (QUESTION_HEADER.test(cleaned.trim()) && current.length) {
      blocks.push(current);
      current = [cleaned];
      return;
    }
    if (cleaned.trim() || current.length) {
      current.push(cleaned);
    }
  });

  if (current.length) {
    blocks.push(current);
  }

  return blocks;
}

function parseBlock(blockLines) {
  if (!blockLines.length || !QUESTION_HEADER.test(blockLines[0].trim())) {
    return null;
  }

  const lines = [...blockLines];
  lines.shift();

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  const promptLines = [];
  while (lines.length) {
    const currentLine = lines[0].trim();
    if (!currentLine) {
      lines.shift();
      if (promptLines.length) {
        break;
      }
      continue;
    }
    if (OPTION_HEADER.test(currentLine)) {
      break;
    }
    promptLines.push(lines.shift().trim());
  }

  const prompt = normalizeWhitespace(promptLines.join(" "));
  if (!prompt) {
    return null;
  }

  const options = [];
  let currentOption = null;

  while (lines.length) {
    const rawLine = lines.shift();
    const trimmed = rawLine.trim();

    if (!trimmed) {
      continue;
    }
    if (ANSWER_HEADER.test(trimmed) || EXPLANATION_HEADER.test(trimmed) || QUESTION_HEADER.test(trimmed)) {
      lines.unshift(rawLine);
      break;
    }

    const optionMatch = trimmed.match(OPTION_HEADER);
    if (optionMatch) {
      currentOption = {
        letter: optionMatch[1].toUpperCase(),
        value: normalizeWhitespace(optionMatch[2]),
      };
      options.push(currentOption);
      continue;
    }

    if (currentOption) {
      currentOption.value = normalizeWhitespace(`${currentOption.value} ${trimmed}`);
    }
  }

  let answerLetters = [];
  if (lines.length && ANSWER_HEADER.test(lines[0].trim())) {
    const answerLine = lines.shift().trim();
    const answerMatch = answerLine.match(ANSWER_HEADER);
    answerLetters = (answerMatch?.[1] || "")
      .split(/[;,/]/)
      .map((token) => token.trim().toUpperCase())
      .flatMap((token) => token.split(/\s+/))
      .map((token) => token.replace(/[^A-Z]/g, ""))
      .filter(Boolean);
  }

  let explanation = null;
  if (lines.length && EXPLANATION_HEADER.test(lines[0].trim())) {
    const firstLine = lines.shift().trim();
    const explanationMatch = firstLine.match(EXPLANATION_HEADER);
    const explanationLines = [explanationMatch?.[1] || ""];
    while (lines.length && !QUESTION_HEADER.test(lines[0].trim())) {
      explanationLines.push(lines.shift().trim());
    }
    explanation = normalizeWhitespace(explanationLines.join("\n").replace(/\n+/g, "\n"));
  }

  const optionValues = options
    .filter((option) => option.value)
    .map((option) => ({ ...option, value: normalizeWhitespace(option.value) }));
  if (optionValues.length < 4 || !answerLetters.length) {
    return null;
  }

  const answers = answerLetters
    .filter((letter, index, all) => all.indexOf(letter) === index)
    .map((letter) => optionValues.find((option) => option.letter === letter)?.value)
    .filter(Boolean);

  if (!answers.length) {
    return null;
  }

  return {
    prompt,
    options: optionValues.map((option) => option.value),
    answers,
    explanation: explanation || null,
  };
}

export function mergeQuestionsByKey(questions) {
  const byKey = new Map();

  questions.forEach((question) => {
    const key = normalizeQuestionKey(question);
    if (!key) {
      return;
    }

    if (byKey.has(key)) {
      const current = byKey.get(key);
      current.explanation = pickBestExplanation(current.explanation, question.explanation);
      current.isFrequent40 = current.isFrequent40 || Boolean(question.isFrequent40);
      current.isEssential120 = current.isEssential120 || Boolean(question.isEssential120);
      current.isPriority = current.isPriority || Boolean(question.isPriority) || current.isFrequent40 || current.isEssential120;
      return;
    }

    byKey.set(key, {
      ...question,
      explanation: question.explanation || null,
      isFrequent40: Boolean(question.isFrequent40),
      isEssential120: Boolean(question.isEssential120),
      isPriority: Boolean(question.isPriority) || Boolean(question.isFrequent40) || Boolean(question.isEssential120),
    });
  });

  return [...byKey.values()];
}

export function parseQuestionsText(rawText, categoryId, options = {}) {
  const idPrefix = options.idPrefix || categoryId || "question";
  const parsed = [];
  let ignoredCount = 0;

  splitIntoBlocks(rawText).forEach((block, blockIndex) => {
    const question = parseBlock(block);
    if (!question) {
      ignoredCount += 1;
      return;
    }

    parsed.push({
      id: randomId(`${idPrefix}-${blockIndex + 1}`),
      categoryId,
      prompt: question.prompt,
      options: question.options,
      answers: question.answers,
      explanation: question.explanation,
      isPriority: Boolean(options.isPriority),
      isFrequent40: Boolean(options.isFrequent40),
      isEssential120: Boolean(options.isEssential120),
      source: options.source || "import",
    });
  });

  return {
    questions: mergeQuestionsByKey(parsed),
    ignoredCount,
  };
}

export function hydrateManualQuestion({ categoryId, prompt, options, answers, explanation, meta = {} }) {
  const cleanPrompt = normalizeWhitespace(prompt);
  const cleanOptions = options.map((option) => normalizeWhitespace(option)).filter(Boolean);
  const cleanAnswers = answers.map((answer) => normalizeWhitespace(answer)).filter(Boolean);
  if (!cleanPrompt || cleanOptions.length < 4 || !cleanAnswers.length) {
    return null;
  }

  return {
    id: randomId(categoryId || "question"),
    categoryId,
    prompt: cleanPrompt,
    options: cleanOptions,
    answers: cleanAnswers,
    explanation: normalizeWhitespace(explanation) || null,
    isPriority: Boolean(meta.isPriority),
    isFrequent40: Boolean(meta.isFrequent40),
    isEssential120: Boolean(meta.isEssential120),
    source: meta.source || "manual",
  };
}

export function answerLettersFromValues(question) {
  return question.answers
    .map((answer) => {
      const index = question.options.findIndex((option) => option === answer);
      return index >= 0 ? LETTERS[index] : null;
    })
    .filter(Boolean);
}
