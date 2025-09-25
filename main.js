import './style.css';

document.addEventListener("DOMContentLoaded", () => {
  let quizData = []; // Cambiamos esto a una variable global para usar después
  let currentQuestionIndex = 0;
  let score = 0;
  let timerInterval;
  const userAnswers = [];

  // Views / Menu elements
  const menuContainer = document.getElementById("menu-container");
  const startButton = document.getElementById("start-button");
  const categorySelect = document.getElementById("category-select");
  const settingsButton = document.getElementById("settings-button");
  const statsButton = document.getElementById("stats-button");
  const tutorialButton = document.getElementById("tutorial-button");
  const exitButton = document.getElementById("exit-button");

  const settingsContainer = document.getElementById("settings-container");
  const languageSelect = document.getElementById("language-select");
  const difficultySelect = document.getElementById("difficulty-select");
  const volumeRange = document.getElementById("volume-range");
  const reducedMotion = document.getElementById("reduced-motion");
  const settingsSave = document.getElementById("settings-save");
  const settingsCancel = document.getElementById("settings-cancel");

  const tutorialContainer = document.getElementById("tutorial-container");
  const tutorialBack = document.getElementById("tutorial-back");

  const statsPanel = document.getElementById("stats-panel");
  const statHighscore = document.getElementById("stat-highscore");
  const statGames = document.getElementById("stat-games");
  const statAccuracy = document.getElementById("stat-accuracy");

  // Quiz elements
  const quizContainer = document.getElementById("quiz-container");
  const questionNumberElement = document.getElementById("question-number");
  const questionTextElement = document.getElementById("question-text");
  const optionsContainer = document.querySelector(".options");
  const nextButton = document.getElementById("next-button");
  const timerElement = document.getElementById("timer");
  const scoreElement = document.getElementById("score");
  const progressBar = document.getElementById("progress-bar");
  const scoreboardContainer = document.getElementById("scoreboard-container");
  const scoreboardBody = document.querySelector("#scoreboard tbody");
  const restartButton = document.getElementById("restart-button");
  const popupModal = document.getElementById("popup-modal");
  const popupContent = document.getElementById("popup-content");
  const popupButton = document.getElementById("popup-button");
  const questionText = document.querySelector(".question-text2");

  // App settings and stats
  const SETTINGS_KEY = 'qa_settings_v1';
  const STATS_KEY = 'qa_stats_v1';
  let currentMode = '/data.json';

  const defaultSettings = { language: 'es', difficulty: 'normal', volume: 70, reducedMotion: false };
  const defaultStats = { highScore: 0, gamesPlayed: 0, correctTotal: 0, answeredTotal: 0 };

  function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
    languageSelect.value = settings.language;
    difficultySelect.value = settings.difficulty;
    volumeRange.value = settings.volume;
    reducedMotion.checked = settings.reducedMotion;
    applyReducedMotion(settings.reducedMotion);
    return settings;
  }

  function saveSettings() {
    const settings = {
      language: languageSelect.value,
      difficulty: difficultySelect.value,
      volume: Number(volumeRange.value),
      reducedMotion: reducedMotion.checked,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyReducedMotion(settings.reducedMotion);
    return settings;
  }

  function loadStats() {
    const raw = localStorage.getItem(STATS_KEY);
    const stats = raw ? { ...defaultStats, ...JSON.parse(raw) } : { ...defaultStats };
    updateStatsPanel(stats);
    return stats;
  }

  function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    updateStatsPanel(stats);
  }

  function updateStatsPanel(stats) {
    statHighscore.textContent = String(stats.highScore);
    statGames.textContent = String(stats.gamesPlayed);
    const accuracy = stats.answeredTotal > 0 ? Math.round((stats.correctTotal / stats.answeredTotal) * 100) : 0;
    statAccuracy.textContent = `${accuracy}%`;
  }

  function applyReducedMotion(enabled) {
    if (enabled) {
      document.documentElement.style.setProperty('scroll-behavior', 'auto');
    } else {
      document.documentElement.style.removeProperty('scroll-behavior');
    }
  }

  // Función para cargar los datos del quiz desde un archivo JSON
  async function loadQuizData() {
    try {
      const datasetPath = currentMode || '/data.json';
      const response = await fetch(datasetPath);
      if (!response.ok) {
        throw new Error('Error al cargar los datos del quiz');
      }
      quizData = await response.json();
      initializeQuiz(); // Inicia el quiz después de cargar los datos
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo cargar el dataset seleccionado. Verifica que exista en /public.');
    }
  }

  // Función para guardar el progreso en localStorage
  function saveProgress() {
    localStorage.setItem(
      "quizProgress",
      JSON.stringify({
        currentQuestionIndex,
        score,
        userAnswers,
        currentMode
      })
    );
  }

  // Función para recuperar el progreso de localStorage
  function retrieveProgress() {
    const savedProgress = localStorage.getItem("quizProgress");
    if (savedProgress) {
      const {
        currentQuestionIndex: savedIndex,
        score: savedScore,
        userAnswers: savedAnswers,
        currentMode: savedMode
      } = JSON.parse(savedProgress);
      if (savedIndex < quizData.length) {
        currentQuestionIndex = savedIndex;
        score = savedScore;
        currentMode = savedMode || '/data.json';
        userAnswers.push(...savedAnswers);
        loadQuestion();
      } else {
        displayResults();
      }
    } else {
      initializeQuiz();
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function filterByMode(data, mode) {
    // For datasets, we just return the loaded dataset.
    return data;
  }

  function initializeQuiz() {
    const filtered = filterByMode(quizData, currentMode);
    quizData = [...filtered];
    shuffleArray(quizData);
    loadQuestion();
  }

  function loadQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    questionNumberElement.textContent = `${currentQuestionIndex + 1}/${
      quizData.length
    }`;
    questionTextElement.textContent = currentQuestion.question;

    optionsContainer.innerHTML = "";
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    shuffledOptions.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = option;

      const span = document.createElement("span");
      span.textContent = option;

      label.appendChild(input);
      label.appendChild(span);
      optionsContainer.appendChild(label);

      // Agregar evento change para seleccionar una respuesta
      input.addEventListener("change", () => {
        showPopupModal(input.value);
        //handleNextButtonClick(); // Llama a la función que maneja la continuación
      });

    });

    updateProgressBar();
    //timer iniciar y resetear
    //resetTimer();
  }

  function updateProgressBar() {
    const progress = (currentQuestionIndex + 1) / quizData.length * 100;
    //const progress = (currentQuestionIndex / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function showPopupModal(selectedAnswer) {
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct;


    if (isCorrect) {
      score++;
      scoreElement.textContent = `Score: ${score}`;
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        loadQuestion();
      } else {
        displayResults();
      } 
    } else{
      popupContent.innerHTML = isCorrect
      ? `<p>¡Correcto! La respuesta es: ${currentQuestion.correct}</p>`
      : `<p>Incorrecto. La respuesta correcta es: ${currentQuestion.correct}</p>`;
      popupModal.style.display = "block";
      console.log(questionText);
      questionText.innerHTML = `${currentQuestion.question}`;
      console.log(currentQuestion)
      


    }

    userAnswers.push({
      question: currentQuestion.question,
      yourAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correct
    });

  }

  popupButton.addEventListener("click", () => {
    popupModal.style.display = "none";
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      loadQuestion();
    } else {
      displayResults();
    }
  });

  function resetTimer() {
    clearInterval(timerInterval);
    let timeLeft = 30;
    timerElement.textContent = timeLeft;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;

      // Color change when timer is running low
      if (timeLeft <= 10) {
        timerElement.style.color = "#e74c3c"; // Change to red
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleNextButtonClick(); // Automatically move to next question or end quiz
      }
    }, 1000);
  }

  function handleNextButtonClick() {
    const selectedOption = document.querySelector(
      'input[name="answer"]:checked'
    );
    if (selectedOption) {
      userAnswers.push({
        question: quizData[currentQuestionIndex].question,
        yourAnswer: selectedOption.value,
        correctAnswer: quizData[currentQuestionIndex].correct
      });

      if (selectedOption.value === quizData[currentQuestionIndex].correct) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
      }
    } else {
      userAnswers.push({
        question: quizData[currentQuestionIndex].question,
        yourAnswer: "No answer selected",
        correctAnswer: quizData[currentQuestionIndex].correct
      });
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      saveProgress(); // Save progress before loading next question
      loadQuestion();
    } else {
      saveProgress(); // Save progress before displaying results
      displayResults();
    }

    document
      .querySelectorAll('input[name="answer"]')
      .forEach((input) => (input.checked = false));
  }

  function displayResults() {
    clearInterval(timerInterval);
    questionNumberElement.textContent = "Quiz Completed";
    questionTextElement.textContent = `Your score is ${score}/${quizData.length}`;

    // update stats
    const stats = loadStats();
    const answeredNow = userAnswers.length;
    const correctNow = userAnswers.filter(a => a.yourAnswer === a.correctAnswer).length;
    const newHigh = Math.max(stats.highScore, score);
    const newStats = {
      ...stats,
      highScore: newHigh,
      gamesPlayed: stats.gamesPlayed + 1,
      correctTotal: stats.correctTotal + correctNow,
      answeredTotal: stats.answeredTotal + answeredNow,
    };
    saveStats(newStats);

    optionsContainer.innerHTML = "";
    nextButton.style.display = "none";
    scoreboardContainer.style.display = "block";
    renderScoreboard();
    localStorage.removeItem("quizProgress"); // Clear saved progress after displaying results
  }

  function renderScoreboard() {
    scoreboardBody.innerHTML = "";
    userAnswers.forEach((answer, index) => {
      const row = document.createElement("tr");
      const questionCell = document.createElement("td");
      const yourAnswerCell = document.createElement("td");
      const correctAnswerCell = document.createElement("td");

      questionCell.textContent = `Q${index + 1}: ${answer.question}`;
      yourAnswerCell.textContent = answer.yourAnswer;
      correctAnswerCell.textContent = answer.correctAnswer;

      row.appendChild(questionCell);
      row.appendChild(yourAnswerCell);
      row.appendChild(correctAnswerCell);
      scoreboardBody.appendChild(row);
    });
  }

  function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers.length = 0;
    scoreElement.textContent = `Score: ${score}`;
    nextButton.textContent = "Continue";
    nextButton.style.display = "block";
    scoreboardContainer.style.display = "none";
    nextButton.removeEventListener("click", restartQuiz);
    nextButton.addEventListener("click", handleNextButtonClick);
    localStorage.removeItem("quizProgress"); // Clear saved progress on restart
    loadQuizData(); // Reiniciar la carga de datos del cuestionario
  }

  // ===== MENU NAVIGATION / VIEW SWITCHING =====
  function showMenu() {
    menuContainer.style.display = 'block';
    settingsContainer.style.display = 'none';
    tutorialContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    scoreboardContainer.style.display = 'none';
  }

  function startFromMenu() {
    currentMode = categorySelect.value || '/data.json';
    // Reset quiz state when starting a new game
    currentQuestionIndex = 0;
    score = 0;
    userAnswers.length = 0;
    scoreElement.textContent = `Score: ${score}`;

    menuContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    loadQuizData();
  }

  startButton?.addEventListener('click', startFromMenu);

  settingsButton?.addEventListener('click', () => {
    loadSettings();
    menuContainer.style.display = 'none';
    settingsContainer.style.display = 'block';
  });

  settingsSave?.addEventListener('click', () => {
    saveSettings();
    showMenu();
  });

  settingsCancel?.addEventListener('click', () => {
    showMenu();
  });

  statsButton?.addEventListener('click', () => {
    loadStats();
    // toggle panel inline on menu
    statsPanel.style.display = statsPanel.style.display === 'none' ? 'block' : 'none';
  });

  tutorialButton?.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    tutorialContainer.style.display = 'block';
  });

  tutorialBack?.addEventListener('click', () => {
    showMenu();
  });

  exitButton?.addEventListener('click', () => {
    // Placeholder: clear progress and simulate logout
    localStorage.removeItem('quizProgress');
    showMenu();
    alert('Has salido de la aplicación.');
  });

  restartButton.addEventListener("click", () => {
    // Return to menu after a game
    showMenu();
  });

  nextButton.addEventListener("click", handleNextButtonClick);

  // App boot: show menu and preload settings/stats
  loadSettings();
  loadStats();
  showMenu();
});