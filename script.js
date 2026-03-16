(function () {
  const state = {
    questions: normalizeQuestionArray(window.DEFAULT_QUESTION_BANKS || []),
    examQuestions: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    submitted: false
  };

  const heroSection = document.getElementById("hero-section");
  const setupSection = document.getElementById("setup-section");
  const setupForm = document.getElementById("setup-form");
  const seriesSizeInput = document.getElementById("series-size");
  const examPanel = document.getElementById("exam-panel");
  const examTitle = document.getElementById("exam-title");
  const examProgress = document.getElementById("exam-progress");
  const examForm = document.getElementById("exam-form");
  const stopExamButton = document.getElementById("stop-exam");
  const nextQuestionButton = document.getElementById("next-question");
  const finishExamButton = document.getElementById("finish-exam");
  const resultsPanel = document.getElementById("results-panel");
  const resultsSummary = document.getElementById("results-summary");
  const resultsSubsummary = document.getElementById("results-subsummary");
  const resultsErrors = document.getElementById("results-errors");
  const resultsDetails = document.getElementById("results-details");
  const backHomeButton = document.getElementById("back-home");
  const restartExamButton = document.getElementById("restart-exam");
  const toggleDetailsButton = document.getElementById("toggle-details");

  resetToHome();

  setupForm.addEventListener("submit", handleStartExam);

  stopExamButton.addEventListener("click", stopExamEarly);
  finishExamButton.addEventListener("click", finishExam);
  nextQuestionButton.addEventListener("click", goToNextQuestion);
  backHomeButton.addEventListener("click", resetToHome);
  restartExamButton.addEventListener("click", restartExam);
  toggleDetailsButton.addEventListener("click", toggleResultsDetails);
  window.addEventListener("pageshow", resetToHome);

  function normalizeQuestionArray(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item, index) => normalizeQuestion(item, index))
      .filter(Boolean);
  }

  function normalizeQuestion(item, index) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const choices = Array.isArray(item.choices) ? item.choices.map(normalizeText).filter(Boolean) : [];
    const answer = Number(item.answer);
    const question = normalizeText(item.question);

    if (!question || choices.length < 2 || Number.isNaN(answer) || answer < 0 || answer >= choices.length) {
      return null;
    }

    return {
      id: item.id || `q-${index + 1}`,
      question,
      choices,
      answer,
      explanation: normalizeText(item.explanation)
    };
  }

  function normalizeText(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/\r/g, "")
      .replace(/\uFFFD/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function handleStartExam(event) {
    event.preventDefault();
    const size = Number(seriesSizeInput.value);
    startRandomExam(size);
  }

  function startRandomExam(size) {
    if (!Number.isInteger(size) || size <= 0) {
      alert("La taille de la serie est invalide.");
      return;
    }

    const generated = shuffleArray(state.questions);

    if (generated.length < size) {
      alert("Il n'y a pas assez de questions disponibles pour cette serie.");
      return;
    }

    state.examQuestions = generated.slice(0, size).map(shuffleQuestionChoices);
    state.userAnswers = new Array(size).fill(null);
    state.currentQuestionIndex = 0;
    state.submitted = false;

    renderExam(size);
  }

  function restartExam() {
    const size = state.examQuestions.length || Number(seriesSizeInput.value);
    startRandomExam(size);
  }

  function renderExam(size) {
    heroSection.classList.add("hidden");
    setupSection.classList.add("hidden");
    examPanel.classList.remove("hidden");
    examPanel.hidden = false;
    resultsPanel.classList.add("hidden");
    resultsPanel.hidden = true;

    examTitle.textContent = `Serie sur ${size} questions`;
    renderCurrentQuestion();
    window.scrollTo({ top: examPanel.offsetTop - 16, behavior: "smooth" });
  }

  function resetToHome() {
    state.examQuestions = [];
    state.userAnswers = [];
    state.currentQuestionIndex = 0;
    state.submitted = false;

    heroSection.classList.remove("hidden");
    setupSection.classList.remove("hidden");
    examPanel.classList.add("hidden");
    examPanel.hidden = true;
    resultsPanel.classList.add("hidden");
    resultsPanel.hidden = true;
    examTitle.textContent = "";
    examProgress.textContent = "";
    examForm.innerHTML = "";
    resultsErrors.innerHTML = "";
    resultsDetails.innerHTML = "";
    resultsSummary.textContent = "";
    resultsSubsummary.textContent = "";
    resultsDetails.classList.add("hidden");
    resultsDetails.hidden = true;
    toggleDetailsButton.textContent = "Voir le detail complet";
  }

  function renderCurrentQuestion() {
    const index = state.currentQuestionIndex;
    const question = state.examQuestions[index];
    examProgress.textContent = `Question ${index + 1} sur ${state.examQuestions.length}`;
    examForm.innerHTML = renderQuestionCard(question, index, state.userAnswers[index]);
    nextQuestionButton.classList.toggle("hidden", index === state.examQuestions.length - 1);
    finishExamButton.classList.toggle("hidden", index !== state.examQuestions.length - 1);
    updateActionButtons();
  }

  function renderQuestionCard(question, index, selectedIndex) {
    const choices = question.choices
      .map((choice, choiceIndex) => {
        const inputId = `q${index}-c${choiceIndex}`;
        const checked = selectedIndex === choiceIndex ? "checked" : "";
        return `
          <label class="choice-option" for="${inputId}">
            <input id="${inputId}" type="radio" name="question-${index}" value="${choiceIndex}" ${checked}>
            <span>${escapeHtml(choice)}</span>
          </label>
        `;
      })
      .join("");

    return `
      <article class="question-card">
        <p class="question-meta">Question ${index + 1}</p>
        <p class="question-text">${escapeHtml(question.question)}</p>
        <div class="choices">${choices}</div>
      </article>
    `;
  }

  function storeCurrentAnswer() {
    const checked = examForm.querySelector(`input[name="question-${state.currentQuestionIndex}"]:checked`);
    state.userAnswers[state.currentQuestionIndex] = checked ? Number(checked.value) : null;
  }

  function updateActionButtons() {
    const selectedIndex = state.userAnswers[state.currentQuestionIndex];
    const isAnswered = selectedIndex !== null && selectedIndex !== undefined;

    if (!nextQuestionButton.classList.contains("hidden")) {
      nextQuestionButton.disabled = !isAnswered;
    }

    if (!finishExamButton.classList.contains("hidden")) {
      finishExamButton.disabled = !isAnswered;
    }
  }

  function goToNextQuestion() {
    if (!state.examQuestions.length) {
      return;
    }

    storeCurrentAnswer();
    if (state.userAnswers[state.currentQuestionIndex] === null) {
      return;
    }

    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= state.examQuestions.length) {
      return;
    }

    state.currentQuestionIndex = nextIndex;
    renderCurrentQuestion();
    window.scrollTo({ top: examPanel.offsetTop - 16, behavior: "smooth" });
  }

  function finishExam() {
    if (state.submitted || !state.examQuestions.length) {
      return;
    }

    storeCurrentAnswer();
    if (state.userAnswers[state.currentQuestionIndex] === null) {
      return;
    }

    state.submitted = true;
    showResults(state.examQuestions.length);
  }

  function stopExamEarly() {
    if (state.submitted || !state.examQuestions.length) {
      return;
    }

    state.submitted = true;
    showResults(state.currentQuestionIndex);
  }

  function showResults(questionCount) {
    const answers = state.examQuestions.slice(0, questionCount).map((question, index) => {
      const selectedIndex = state.userAnswers[index];
      const isCorrect = selectedIndex === question.answer;

      return {
        question,
        selectedIndex,
        isCorrect
      };
    });

    const score = answers.filter((entry) => entry.isCorrect).length;
    renderResults(answers, score);
  }

  function renderResults(answers, score) {
    examPanel.classList.add("hidden");
    examPanel.hidden = true;
    resultsPanel.classList.remove("hidden");
    resultsPanel.hidden = false;
    const percentage = Math.round((score / answers.length) * 100);
    const wrongAnswers = answers.filter((entry) => !entry.isCorrect);

    resultsSummary.textContent = `${score}/${answers.length}`;
    resultsSubsummary.textContent = `${percentage}% de bonnes reponses. ${wrongAnswers.length} erreur(s).`;

    resultsErrors.innerHTML = wrongAnswers.length
      ? wrongAnswers.map((entry, index) => renderDetailedCard(entry, index)).join("")
      : `<article class="result-card"><p class="result-question">Aucune erreur sur cette serie.</p></article>`;

    resultsDetails.innerHTML = answers.map((entry, index) => renderDetailedCard(entry, index)).join("");
    resultsDetails.classList.add("hidden");
    resultsDetails.hidden = true;
    toggleDetailsButton.textContent = "Voir le detail complet";

    window.scrollTo({ top: resultsPanel.offsetTop - 16, behavior: "smooth" });
  }

  function renderDetailedCard(entry, index) {
    const userAnswer =
      entry.selectedIndex === null
        ? "Aucune reponse"
        : entry.question.choices[entry.selectedIndex];
    const correctAnswer = entry.question.choices[entry.question.answer];
    const statusClass = entry.isCorrect ? "status-ok" : "status-ko";
    const statusLabel = entry.isCorrect ? "Bonne reponse" : "Erreur";
    const explanation = entry.question.explanation
      ? `<div class="explanation-box"><strong>Explication :</strong> ${escapeHtml(entry.question.explanation)}</div>`
      : "";

    return `
      <article class="result-card">
        <p class="result-meta">Question ${index + 1}</p>
        <p class="result-question">${escapeHtml(entry.question.question)}</p>
        <div>Ta reponse : <strong>${escapeHtml(userAnswer)}</strong></div>
        <div>Bonne reponse : <strong>${escapeHtml(correctAnswer)}</strong></div>
        <p class="status-line ${statusClass}">${statusLabel}</p>
        ${explanation}
      </article>
    `;
  }

  function toggleResultsDetails() {
    const isHidden = resultsDetails.classList.contains("hidden");
    resultsDetails.classList.toggle("hidden", !isHidden);
    resultsDetails.hidden = !isHidden ? true : false;
    toggleDetailsButton.textContent = isHidden ? "Masquer le detail complet" : "Voir le detail complet";
  }

  function shuffleArray(items) {
    const clone = [...items];
    for (let index = clone.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
    }
    return clone;
  }

  function shuffleQuestionChoices(question) {
    const choiceEntries = question.choices.map((choice, index) => ({
      choice,
      isCorrect: index === question.answer
    }));
    const shuffledEntries = shuffleArray(choiceEntries);

    return {
      ...question,
      choices: shuffledEntries.map((entry) => entry.choice),
      answer: shuffledEntries.findIndex((entry) => entry.isCorrect)
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  examForm.addEventListener("change", storeCurrentAnswer);
  examForm.addEventListener("change", updateActionButtons);
})();
