import './style.css';

document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.querySelector('#app');
  if (appRoot) {
    appRoot.innerHTML = `
      <div id="menu-container" class="menu-container">
        <header class="menu-header">
          <h1 class="app-title">Questionary</h1>
        </header>
        <main class="menu-content">
          <div class="menu-section">
            <label for="category-select">Categoría / Modo</label>
            <select id="category-select">
              <option value="/data.json" selected>Dataset: data.json</option>
              <option value="/data2.json">Dataset: data2.json</option>
              <option value="/data3.json">Dataset: data3.json</option>
              <option value="/capitulo1LMDA.json">Dataset: capitulo1LMDA.json</option>
              <option value="/capitulo2LMDA.json">Dataset: capitulo2LMDA.json</option>
            </select>
          </div>

          <button id="start-button" class="primary">Comenzar Quiz</button>

          <div class="menu-grid">
            <button id="settings-button" class="secondary">Configuración</button>
            <button id="stats-button" class="secondary">Progreso / Puntuación</button>
            <button id="tutorial-button" class="secondary">Cómo jugar</button>
            <button id="exit-button" class="secondary">Salir</button>
          </div>

          <div id="stats-panel" class="panel" style="display:none;">
            <h3>Estadísticas</h3>
            <ul>
              <li>Mejor puntaje: <span id="stat-highscore">0</span></li>
              <li>Partidas jugadas: <span id="stat-games">0</span></li>
              <li>Porcentaje de aciertos: <span id="stat-accuracy">0%</span></li>
            </ul>
          </div>
        </main>
      </div>

      <div id="settings-container" class="panel" style="display:none;">
        <h2>Configuración</h2>
        <div class="settings-group">
          <label for="language-select">Idioma</label>
          <select id="language-select">
            <option value="es" selected>Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="settings-group">
          <label for="difficulty-select">Dificultad</label>
          <select id="difficulty-select">
            <option value="normal" selected>Normal</option>
            <option value="easy">Fácil</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
        <div class="settings-group">
          <label for="volume-range">Volumen</label>
          <input id="volume-range" type="range" min="0" max="100" value="70" />
        </div>
        <div class="settings-group">
          <label>
            <input id="reduced-motion" type="checkbox" /> Reducir animaciones
          </label>
        </div>
        <div class="settings-actions">
          <button id="settings-save" class="primary">Guardar</button>
          <button id="settings-cancel" class="secondary">Cancelar</button>
        </div>
      </div>

      <div id="tutorial-container" class="panel" style="display:none;">
        <h2>Cómo jugar</h2>
        <ol>
          <li>Elige una categoría o modo.</li>
          <li>Lee la pregunta y selecciona una respuesta.</li>
          <li>Respuestas correctas suman puntaje; verás la solución si te equivocas.</li>
          <li>Al final verás tu puntaje y un resumen de respuestas.</li>
        </ol>
        <button id="tutorial-back" class="secondary">Volver</button>
      </div>

      <div class="quiz-container" id="quiz-container" style="display:none;">
        <header>
          <span id="question-number">1/10</span>
          <span id="timer">30</span>
          <span id="score">Score: 0</span>
        </header>
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>

        <main>
          <h2 id="question-text"></h2>
          <div class="options">
            <label>
              <input type="radio" name="answer" value="Tracks with eyes">
              <span></span>
            </label>
            <label>
              <input type="radio" name="answer" value="Tries to follow">
              <span></span>
            </label>
            <label>
              <input type="radio" name="answer" value="Gets excited">
              <span></span>
            </label>
            <label>
              <input type="radio" name="answer" value="Different reaction">
              <span></span>
            </label>
          </div>
        </main>
        <footer>
          <button id="next-button">Continue</button>
          <button id="show-answer-label" style="display:none;">Show Answer</button>
        </footer>
      </div>
      <div class="scoreboard-container" id="scoreboard-container" style="display: none;">
        <h2>Scoreboard</h2>
        <table id="scoreboard">
          <thead>
            <tr>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <button id="restart-button">Restart Quiz</button>
      </div>
      <div id="popup-modal" class="modal">
        <main class="popup-card">
          <h2 class="question-text2">TEXTG</h2>
          <div class="modal-content" id="popup-content"></div>
          <button id="popup-button">Siguiente</button>
        </main>
      </div>
    `;
  }
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