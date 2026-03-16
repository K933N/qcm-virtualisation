import { compareText, normalizeQuestionKey, roundScore, shuffle } from "./utils.js";

const APS_CATEGORY_ID = "securite-aps";

function withShuffledOptions(question) {
  const shuffledOptions = shuffle(question.options);
  return {
    ...question,
    options: shuffledOptions,
    answers: question.answers.filter((answer) => shuffledOptions.includes(answer)),
  };
}

function sampleDistinct(pool, wantedCount, excludedKeys = new Set()) {
  const picked = [];
  for (const question of shuffle(pool)) {
    const key = normalizeQuestionKey(question);
    if (excludedKeys.has(key)) {
      continue;
    }
    picked.push(question);
    excludedKeys.add(key);
    if (picked.length >= wantedCount) {
      break;
    }
  }
  return picked;
}

function pickApsQuestions(questions, requestedCount) {
  const frequentPool = questions.filter((question) => question.isFrequent40);
  const essentialPool = questions.filter((question) => question.isEssential120 && !question.isFrequent40);
  const otherPool = questions.filter((question) => !question.isFrequent40 && !question.isEssential120);
  const excludedKeys = new Set();
  const targetFrequent = Math.floor(requestedCount * 0.3);
  const targetEssential = Math.floor(requestedCount * 0.3);
  const targetOther = Math.max(0, requestedCount - targetFrequent - targetEssential);

  const picked = [
    ...sampleDistinct(frequentPool, targetFrequent, excludedKeys),
    ...sampleDistinct(essentialPool, targetEssential, excludedKeys),
    ...sampleDistinct(otherPool, targetOther, excludedKeys),
  ];

  const fallbackPool = questions.filter((question) => !excludedKeys.has(normalizeQuestionKey(question)));
  if (picked.length < requestedCount) {
    picked.push(...sampleDistinct(fallbackPool, requestedCount - picked.length, excludedKeys));
  }

  return picked.slice(0, requestedCount);
}

export function buildQuizQuestions(allQuestions, categoryId, requestedCount) {
  const categoryQuestions = allQuestions.filter((question) => question.categoryId === categoryId);
  const uniqueQuestions = [];
  const seenKeys = new Set();

  categoryQuestions.forEach((question) => {
    const key = normalizeQuestionKey(question);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueQuestions.push(question);
    }
  });

  const sessionSize = Math.min(requestedCount, uniqueQuestions.length);
  if (!sessionSize) {
    return [];
  }

  const picked = categoryId === APS_CATEGORY_ID
    ? pickApsQuestions(uniqueQuestions, sessionSize)
    : shuffle(uniqueQuestions).slice(0, sessionSize);

  return shuffle(picked).map(withShuffledOptions);
}

export function scoreQuestion(question, selectedAnswers) {
  const expected = [...question.answers].sort(compareText);
  const actual = [...selectedAnswers].sort(compareText);

  if (expected.length === 1) {
    return {
      score: actual.length === 1 && actual[0] === expected[0] ? 1 : 0,
      isPerfect: actual.length === 1 && actual[0] === expected[0],
    };
  }

  const correctSelections = actual.filter((answer) => expected.includes(answer)).length;
  const wrongSelections = actual.filter((answer) => !expected.includes(answer)).length;
  const correctShare = expected.length ? correctSelections / expected.length : 0;
  const wrongOptionCount = Math.max(1, question.options.length - expected.length);
  const penalty = wrongSelections / wrongOptionCount;
  const score = roundScore(Math.max(0, Math.min(1, correctShare - penalty)));

  return {
    score,
    isPerfect: score === 1,
  };
}

export function buildSessionResult(session) {
  const totalScore = roundScore(session.answers.reduce((sum, answer) => sum + answer.score, 0));
  return {
    ...session,
    totalScore,
    maxScore: session.questions.length,
    incidentCount: session.antiCheatEnabled ? session.incidentCount : 0,
  };
}
