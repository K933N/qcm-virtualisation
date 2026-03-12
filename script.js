const QUESTION_BANK = Array.isArray(window.QUESTION_BANK_DATA) ? window.QUESTION_BANK_DATA : [];
const PRIORITY_IDS = new Set(Array.isArray(window.PRIORITY_QUESTION_IDS) ? window.PRIORITY_QUESTION_IDS : []);
const QUIZ_SIZE = 10;
const MIN_PRIORITY_QUESTIONS = 3;
const LETTERS = ["A", "B", "C", "D"];

const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  review: document.getElementById("review-screen"),
};

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const errorsBtn = document.getElementById("errors-btn");
const reviewRetryBtn = document.getElementById("review-retry-btn");
const reviewBackBtn = document.getElementById("review-back-btn");

const progressText = document.getElementById("progress-text");
const scoreHint = document.getElementById("score-hint");
const questionText = document.getElementById("question-text");
const answersForm = document.getElementById("answers-form");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultExplanationsSummary = document.getElementById("result-explanations-summary");
const resultExplanationsList = document.getElementById("result-explanations-list");
const reviewList = document.getElementById("review-list");

let currentQuiz = [];
let currentIndex = 0;
let userResults = [];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isMultiple(question) {
  return Array.isArray(question.answers);
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function buildWeightedPool(basePool) {
  const weighted = [];
  basePool.forEach((question) => {
    weighted.push(question);
    if (question.priority) {
      weighted.push(question);
      weighted.push(question);
    }
  });
  return weighted;
}

function pickUniqueRandom(pool, count, excludedIds = new Set()) {
  const weighted = shuffle(buildWeightedPool(pool));
  const picked = [];
  const localExcluded = new Set(excludedIds);

  for (const question of weighted) {
    if (picked.length >= count) {
      break;
    }
    if (localExcluded.has(question.id)) {
      continue;
    }
    localExcluded.add(question.id);
    picked.push(question);
  }

  if (picked.length < count) {
    for (const question of shuffle(pool)) {
      if (picked.length >= count) {
        break;
      }
      if (localExcluded.has(question.id)) {
        continue;
      }
      localExcluded.add(question.id);
      picked.push(question);
    }
  }

  return picked;
}

function pickQuestions() {
  const enrichedBank = QUESTION_BANK.map((question) => ({
    ...question,
    priority: PRIORITY_IDS.has(question.id) || question.priority === true,
  }));

  const priorityPool = enrichedBank.filter((question) => question.priority);
  const regularPool = enrichedBank.filter((question) => !question.priority);
  const guaranteedCount = Math.min(MIN_PRIORITY_QUESTIONS, QUIZ_SIZE, priorityPool.length);
  const guaranteed = pickUniqueRandom(priorityPool, guaranteedCount);
  const excludedIds = new Set(guaranteed.map((question) => question.id));
  const remainingCount = Math.max(0, QUIZ_SIZE - guaranteed.length);
  const remainingPool = uniqueById([...priorityPool, ...regularPool]);
  const remainder = pickUniqueRandom(remainingPool, remainingCount, excludedIds);

  return shuffle([...guaranteed, ...remainder]).map((question) => ({
    ...question,
    shuffledOptions: shuffle(question.options),
  }));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function updateNextButtonState() {
  const inputs = Array.from(answersForm.querySelectorAll('input[name="answer"]'));
  nextBtn.disabled = !inputs.some((input) => input.checked);
}

function startQuiz() {
  currentQuiz = pickQuestions();
  currentIndex = 0;
  userResults = [];
  renderQuestion();
  showScreen("quiz");
}

function renderQuestion() {
  const question = currentQuiz[currentIndex];
  const multiple = isMultiple(question);
  progressText.textContent = `Question ${currentIndex + 1} / ${QUIZ_SIZE}`;
  scoreHint.textContent = multiple ? "Plusieurs reponses possibles" : "1 point par question";
  questionText.textContent = question.prompt;
  nextBtn.disabled = true;
  answersForm.innerHTML = "";

  question.shuffledOptions.forEach((option, index) => {
    const id = `answer-${currentIndex}-${index}`;
    const wrapper = document.createElement("label");
    wrapper.className = "answer-option";
    wrapper.htmlFor = id;

    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = "answer";
    input.id = id;
    input.value = option;
    input.addEventListener("change", updateNextButtonState);

    const letter = document.createElement("span");
    letter.className = "answer-label";
    letter.textContent = LETTERS[index] || `${index + 1}`;

    const text = document.createElement("span");
    text.textContent = option;

    wrapper.appendChild(input);
    wrapper.appendChild(letter);
    wrapper.appendChild(text);
    answersForm.appendChild(wrapper);
  });
}

function normalizeList(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  return answer;
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

function formatPoints(value) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function calculateQuestionScore(correctAnswer, userAnswer) {
  if (!Array.isArray(correctAnswer)) {
    return userAnswer === correctAnswer ? 1 : 0;
  }

  const correctSet = new Set(correctAnswer);
  const userSet = new Set(userAnswer);
  let correctSelected = 0;
  let incorrectSelected = 0;

  userSet.forEach((answer) => {
    if (correctSet.has(answer)) {
      correctSelected += 1;
    } else {
      incorrectSelected += 1;
    }
  });

  return Math.max(0, roundScore((correctSelected - incorrectSelected) / correctAnswer.length));
}

function storeAnswer() {
  const selected = Array.from(answersForm.querySelectorAll('input[name="answer"]:checked')).map((input) => input.value);
  if (selected.length === 0) {
    return false;
  }

  const question = currentQuiz[currentIndex];
  const correctAnswer = isMultiple(question) ? normalizeList(question.answers) : question.answer;
  const userAnswer = isMultiple(question) ? normalizeList(selected) : selected[0];
  const pointsEarned = calculateQuestionScore(correctAnswer, userAnswer);
  const isCorrect = pointsEarned === 1;

  userResults.push({
    prompt: question.prompt,
    userAnswer,
    correctAnswer,
    isCorrect,
    pointsEarned,
    explanation: question.explanation,
    priority: question.priority,
  });

  return true;
}

function nextQuestion() {
  if (!storeAnswer()) {
    return;
  }

  currentIndex += 1;
  if (currentIndex < currentQuiz.length) {
    renderQuestion();
    return;
  }

  renderResults();
  showScreen("result");
}

function renderResults() {
  const score = roundScore(userResults.reduce((total, result) => total + result.pointsEarned, 0));
  resultTitle.textContent = `Ta note : ${formatPoints(score)} / ${QUIZ_SIZE}`;
  resultSummary.textContent = score === QUIZ_SIZE
    ? "Sans faute. Relance pour avoir un nouveau tirage aleatoire."
    : "Tu peux voir tes erreurs en detail, puis relancer un nouveau QCM quand tu veux.";
  renderResultExplanations();
}

function createCorrectionItem(result, indexLabel) {
  const item = document.createElement("article");
  item.className = `review-item ${result.isCorrect ? "good" : result.pointsEarned > 0 ? "partial" : "bad"}`;

  const title = document.createElement("h3");
  title.textContent = `${indexLabel}. ${result.prompt}`;

  const score = document.createElement("p");
  score.className = "review-score";
  if (result.isCorrect) {
    score.textContent = "1 point : bonne reponse";
  } else if (result.pointsEarned > 0) {
    score.textContent = `${formatPoints(result.pointsEarned)} point sur 1 : reponse partiellement correcte`;
  } else {
    score.textContent = "0 point : mauvaise reponse";
  }

  const chosen = document.createElement("p");
  chosen.textContent = `Ta reponse : ${formatAnswer(result.userAnswer)}`;

  const correct = document.createElement("p");
  correct.textContent = `Bonne reponse : ${formatAnswer(result.correctAnswer)}`;

  item.appendChild(title);
  item.appendChild(score);
  item.appendChild(chosen);
  item.appendChild(correct);

  if (result.explanation) {
    const explanation = document.createElement("p");
    explanation.className = "review-explanation";
    explanation.textContent = `Explication de cours : ${result.explanation}`;
    item.appendChild(explanation);
  }

  return item;
}

function renderResultExplanations() {
  resultExplanationsList.innerHTML = "";

  const explainedMistakes = userResults.filter((result) => !result.isCorrect && result.explanation);
  const explainedPriority = userResults.filter((result) => result.priority && result.explanation);
  const explainedCorrect = userResults.filter((result) => result.isCorrect && result.explanation);
  const itemsToShow = explainedMistakes.length > 0
    ? explainedMistakes
    : explainedPriority.length > 0
      ? explainedPriority.slice(0, 3)
      : explainedCorrect.slice(0, 3);

  if (explainedMistakes.length > 0) {
    resultExplanationsSummary.textContent = "Voici les notions a revoir en priorite sur les questions ratees de cette session.";
  } else if (itemsToShow.length > 0) {
    resultExplanationsSummary.textContent = "Aucune erreur avec explication sur cette session. Voici quelques rappels de cours utiles du tirage.";
  } else {
    resultExplanationsSummary.textContent = "Aucune explication de cours n'est disponible pour les questions de cette session.";
  }

  itemsToShow.forEach((result, index) => {
    resultExplanationsList.appendChild(createCorrectionItem(result, index + 1));
  });
}

function renderReview() {
  reviewList.innerHTML = "";
  userResults.forEach((result, index) => {
    reviewList.appendChild(createCorrectionItem(result, index + 1));
  });
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
retryBtn.addEventListener("click", startQuiz);
reviewRetryBtn.addEventListener("click", startQuiz);
errorsBtn.addEventListener("click", () => {
  renderReview();
  showScreen("review");
});
reviewBackBtn.addEventListener("click", () => showScreen("result"));
