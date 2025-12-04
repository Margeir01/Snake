// Hele spillet kjører først når DOM-en er klar
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starter snake-spill…");

  // =======================================
  // SPRÅK-TEKSTER
  // =======================================
  const translations = {
    no: {
      title: "Snake",
      subtitle: "Bruk piltastene eller WASD for å styre 🐍",
      langLabel: "Språk:",
      playerLabel: "Spiller:",
      namePlaceholder: "Skriv navnet ditt",
      saveNameBtn: "Lagre navn",
      menuTitle: "Innstillinger",
      appleCountLabel: "Antall epler",
      wrapLabel: "Gå gjennom vegger",
      menuHint: "Tips: spillet er automatisk pauset mens menyen er åpen.",
      menuCloseBtn: "Lukk meny",
      leaderboardTitle: "Leaderboard",
      scoreLabel: "Score:",
      highscoreLabel: "Highscore:",
      pauseLabelPause: "Pause",
      pauseLabelResume: "Fortsett",
      restartLabel: "Restart",
      noScores: "Ingen scores ennå",
      gameOver: "GAME OVER",
      gameOverHint: "Trykk Restart eller SPACE",
      pauseOverlay: "PAUSE",
      pauseInfo: "Trykk SPACE for å pause"
    },
    en: {
      title: "Snake",
      subtitle: "Use the arrow keys or WASD to control 🐍",
      langLabel: "Language:",
      playerLabel: "Player:",
      namePlaceholder: "Enter your name",
      saveNameBtn: "Save name",
      menuTitle: "Settings",
      appleCountLabel: "Number of apples",
      wrapLabel: "Walk through walls",
      menuHint: "Tip: the game is automatically paused while the menu is open.",
      menuCloseBtn: "Close menu",
      leaderboardTitle: "Leaderboard",
      scoreLabel: "Score:",
      highscoreLabel: "High score:",
      pauseLabelPause: "Pause",
      pauseLabelResume: "Resume",
      restartLabel: "Restart",
      noScores: "No scores yet",
      gameOver: "GAME OVER",
      gameOverHint: "Press Restart or SPACE",
      pauseOverlay: "PAUSED",
      pauseInfo: "Press SPACE to pause"
    }
  };

  let currentLang = localStorage.getItem("snakeLang") || "no";

  // =======================================
  // FARGER
  // =======================================
  const colors = {
    background: "#222",
    text: "#FFFFFF",
  };

  // =======================================
  // SPRITE-BILDER
  // =======================================
  const sprites = {
    head_up: new Image(),
    head_down: new Image(),
    head_left: new Image(),
    head_right: new Image(),
    body_horizontal: new Image(),
    body_vertical: new Image(),
    body_topleft: new Image(),
    body_topright: new Image(),
    body_bottomleft: new Image(),
    body_bottomright: new Image(),
    tail_up: new Image(),
    tail_down: new Image(),
    tail_left: new Image(),
    tail_right: new Image(),
    apple: new Image(),
  };

  // Bakgrunnsbilde
  const backgroundImage = new Image();
  backgroundImage.src = "img/bakgrunn.jpg";

  // last inn sprites (sørg for at filnavn stemmer!)
  sprites.head_up.src = "img/head_up.png";
  sprites.head_down.src = "img/head_down.png";
  sprites.head_left.src = "img/head_left.png";
  sprites.head_right.src = "img/head_right.png";

  sprites.body_horizontal.src = "img/body_horizontal.png";
  sprites.body_vertical.src = "img/body_vertical.png";
  sprites.body_topleft.src = "img/body_topleft.png";
  sprites.body_topright.src = "img/body_topright.png";
  sprites.body_bottomleft.src = "img/body_bottomleft.png";
  sprites.body_bottomright.src = "img/body_bottomright.png";

  sprites.tail_up.src = "img/tail_up.png";
  sprites.tail_down.src = "img/tail_down.png";
  sprites.tail_left.src = "img/tail_left.png";
  sprites.tail_right.src = "img/tail_right.png";

  sprites.apple.src = "img/apple.png";

  // =======================================
  // DOM-REFERANSER
  // =======================================
  const pauseInfoEl = document.getElementById("pauseInfo");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");

  const langLabelEl = document.getElementById("langLabel");
  const languageSelect = document.getElementById("languageSelect");

  const scoreEl = document.getElementById("score");
  const highscoreEl = document.getElementById("highscore");
  const restartBtn = document.getElementById("restart");
  const pauseBtn = document.getElementById("pause");

  const scoreLabelEl = document.getElementById("scoreLabel");
  const highscoreLabelEl = document.getElementById("highscoreLabel");

  const playerLabelEl = document.getElementById("playerLabel");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const currentPlayerNameEl = document.getElementById("currentPlayerName");
  const nameForm = document.getElementById("nameForm");
  const leaderboardList = document.getElementById("leaderboardList");
  const leaderboardTitleEl = document.getElementById("leaderboardTitle");

  // meny + settings
  const menu = document.getElementById("game-menu");
  const menuCloseBtn = document.getElementById("menuCloseBtn");
  const appleCountSelect = document.getElementById("appleCount");
  const wrapToggle = document.getElementById("wrapToggle");
  const menuTitleEl = document.getElementById("menuTitle");
  const appleCountLabelEl = document.getElementById("appleCountLabel");
  const wrapLabelEl = document.getElementById("wrapLabel");
  const menuHintEl = document.getElementById("menuHint");

  // =======================================
  // GRID / SPILLDATA
  // =======================================
  const tileSize = 30;
  const tileCount = canvas.width / tileSize; // 480 / 30 = 16

  let snake = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 }
  ];

  let dx = 1;
  let dy = 0;

  let directionQueue = [];

  let foods = [];
  let score = 0;
  let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;
  highscoreEl.textContent = highscore;

  let playerName = localStorage.getItem("snakePlayerName") || "";
  let leaderboard = JSON.parse(localStorage.getItem("snakeLeaderboard") || "[]");

  let wrapEnabled = wrapToggle ? wrapToggle.checked : false;

  let appleCount = 1;
  if (appleCountSelect) {
    const val = parseInt(appleCountSelect.value, 10);
    appleCount = isNaN(val) ? 1 : val;
  }

  let isGameOver = false;
  let isPaused = true; // starter pauset

  const speed = 130;
  let gameInterval = setInterval(gameLoop, speed);

  // =======================================
  // SPRÅK-APPLIKASJON
  // =======================================
  function applyLanguage(lang) {
    const t = translations[lang] || translations.no;
    currentLang = lang;
    localStorage.setItem("snakeLang", lang);

    titleEl.textContent = t.title;
    subtitleEl.textContent = t.subtitle;
    pauseInfoEl.textContent = t.pauseInfo;

    langLabelEl.textContent = t.langLabel;

    playerLabelEl.textContent = t.playerLabel;
    playerNameInput.placeholder = t.namePlaceholder;
    saveNameBtn.textContent = t.saveNameBtn;

    menuTitleEl.textContent = t.menuTitle;
    appleCountLabelEl.textContent = t.appleCountLabel;
    wrapLabelEl.textContent = t.wrapLabel;
    menuHintEl.textContent = t.menuHint;
    menuCloseBtn.textContent = t.menuCloseBtn;

    leaderboardTitleEl.textContent = t.leaderboardTitle;
    scoreLabelEl.textContent = t.scoreLabel;
    highscoreLabelEl.textContent = t.highscoreLabel;

    pauseBtn.textContent = isPaused ? t.pauseLabelResume : t.pauseLabelPause;
    restartBtn.textContent = t.restartLabel;

    if (languageSelect.value !== lang) {
      languageSelect.value = lang;
    }

    draw();
  }

  languageSelect.value = currentLang;
  applyLanguage(currentLang);

  if (playerName) {
    currentPlayerNameEl.textContent = playerName;
    nameForm.style.display = "none";
  } else {
    currentPlayerNameEl.textContent = currentLang === "no" ? "Ingen" : "None";
    nameForm.style.display = "flex";
  }

  resetFoods();
  renderLeaderboard();

  // =======================================
  // EVENT LISTENERS
  // =======================================
  document.addEventListener("keydown", handleKeyDown);

  if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", togglePause);
  }

  if (saveNameBtn) {
    saveNameBtn.addEventListener("click", () => {
      const name = playerNameInput.value.trim();
      if (!name) return;
      playerName = name;
      localStorage.setItem("snakePlayerName", playerName);
      currentPlayerNameEl.textContent = playerName;
      nameForm.style.display = "none";
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      const lang = languageSelect.value;
      applyLanguage(lang);
      if (!playerName) {
        currentPlayerNameEl.textContent = lang === "no" ? "Ingen" : "None";
      }
      renderLeaderboard();
    });
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", () => {
      console.log("Lukk meny klikket");
      hideMenu();
      isPaused = false;
      const t = translations[currentLang] || translations.no;
      pauseBtn.textContent = t.pauseLabelPause;
    });
  }

  if (appleCountSelect) {
    appleCountSelect.addEventListener("change", () => {
      const val = parseInt(appleCountSelect.value, 10);
      appleCount = isNaN(val) ? 1 : val;
      resetFoods();
    });
  }

  if (wrapToggle) {
    wrapToggle.addEventListener("change", () => {
      wrapEnabled = wrapToggle.checked;
    });
  }

  // =======================================
  // GAME LOOP
  // =======================================
  function gameLoop() {
    if (isGameOver) return;

    if (isPaused) {
      draw();
      return;
    }

    update();
    draw();
  }

  // =======================================
  // UPDATE
  // =======================================
  function update() {
    if (directionQueue.length > 0) {
      const nextDir = directionQueue.shift();
      dx = nextDir.dx;
      dy = nextDir.dy;
    }

    let head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      if (wrapEnabled) {
        if (head.x < 0) head.x = tileCount - 1;
        else if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        else if (head.y >= tileCount) head.y = 0;
      } else {
        endGame();
        return;
      }
    }

    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        endGame();
        return;
      }
    }

    snake.unshift(head);

    let ateIndex = -1;
    for (let i = 0; i < foods.length; i++) {
      if (head.x === foods[i].x && head.y === foods[i].y) {
        ateIndex = i;
        break;
      }
    }

    if (ateIndex !== -1) {
      score++;
      scoreEl.textContent = score;

      if (score > highscore) {
        highscore = score;
        highscoreEl.textContent = highscore;
        localStorage.setItem("snakeHighscore", highscore);
      }

      foods[ateIndex] = randomFoodPosition(foods);
    } else {
      snake.pop();
    }
  }

  // =======================================
  // DRAW
  // =======================================
  function draw() {
    const t = translations[currentLang] || translations.no;

    if (backgroundImage.complete) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (const food of foods) {
      ctx.drawImage(
        sprites.apple,
        food.x * tileSize,
        food.y * tileSize,
        tileSize,
        tileSize
      );
    }

    for (let i = 0; i < snake.length; i++) {
      drawSnakeSegment(i);
    }

    if (isPaused && !isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colors.text;
      ctx.font = "24px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(t.pauseOverlay, canvas.width / 2, canvas.height / 2);
    }

    if (isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colors.text;
      ctx.font = "24px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(t.gameOver, canvas.width / 2, canvas.height / 2);
      ctx.font = "16px system-ui";
      ctx.fillText(t.gameOverHint, canvas.width / 2, canvas.height / 2 + 30);
    }
  }

  // =======================================
  // SLANGE-SEGMENT (GRID-BASERT, INGEN SMOOTH)
  // =======================================
  function drawSnakeSegment(index) {
    const segment = snake[index];
    const isHead = index === 0;
    const isTail = index === snake.length - 1;

    const px = segment.x * tileSize;
    const py = segment.y * tileSize;

    // HODE
    if (isHead) {
      if (dx === 1 && dy === 0) return ctx.drawImage(sprites.head_right, px, py, tileSize, tileSize);
      if (dx === -1 && dy === 0) return ctx.drawImage(sprites.head_left,  px, py, tileSize, tileSize);
      if (dy === -1 && dx === 0) return ctx.drawImage(sprites.head_up,    px, py, tileSize, tileSize);
      if (dy === 1  && dx === 0) return ctx.drawImage(sprites.head_down,  px, py, tileSize, tileSize);
    }

    // HALE
    if (isTail) {
      const prev = snake[index - 1];
      if (prev.x < segment.x)  return ctx.drawImage(sprites.tail_right, px, py, tileSize, tileSize);
      if (prev.x > segment.x)  return ctx.drawImage(sprites.tail_left,  px, py, tileSize, tileSize);
      if (prev.y < segment.y)  return ctx.drawImage(sprites.tail_down,  px, py, tileSize, tileSize);
      if (prev.y > segment.y)  return ctx.drawImage(sprites.tail_up,    px, py, tileSize, tileSize);
    }

    const prev = snake[index - 1];
    const next = snake[index + 1];
    if (!prev || !next) return;

    // Rett horisontal
    if (prev.y === segment.y && next.y === segment.y) {
      return ctx.drawImage(sprites.body_horizontal, px, py, tileSize, tileSize);
    }

    // Rett vertikal
    if (prev.x === segment.x && next.x === segment.x) {
      return ctx.drawImage(sprites.body_vertical, px, py, tileSize, tileSize);
    }

    // Hjørner
    if ((prev.x < segment.x && next.y < segment.y) ||
        (next.x < segment.x && prev.y < segment.y)) {
      return ctx.drawImage(sprites.body_topleft, px, py, tileSize, tileSize);
    }

    if ((prev.x > segment.x && next.y < segment.y) ||
        (next.x > segment.x && prev.y < segment.y)) {
      return ctx.drawImage(sprites.body_topright, px, py, tileSize, tileSize);
    }

    if ((prev.x < segment.x && next.y > segment.y) ||
        (next.x < segment.x && prev.y > segment.y)) {
      return ctx.drawImage(sprites.body_bottomleft, px, py, tileSize, tileSize);
    }

    if ((prev.x > segment.x && next.y > segment.y) ||
        (next.x > segment.x && prev.y > segment.y)) {
      return ctx.drawImage(sprites.body_bottomright, px, py, tileSize, tileSize);
    }
  }

  // =======================================
  // STYRING
  // =======================================
  function handleKeyDown(e) {
    if (document.activeElement === playerNameInput) {
      return;
    }

    const t = translations[currentLang] || translations.no;

    // GAME OVER: SPACE / ENTER / R = restart
    if (isGameOver) {
      if (
        e.key === " " ||
        e.key === "Spacebar" ||
        e.key === "Enter" ||
        e.key === "r" ||
        e.key === "R"
      ) {
        e.preventDefault();
        restartGame();
      }
      return;
    }

    // MENY (P / ESC)
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      if (menu && menu.style.display === "block") {
        hideMenu();
        isPaused = false;
        pauseBtn.textContent = t.pauseLabelPause;
      } else {
        showMenu();
      }
      return;
    }

    // SPACE: start spill / toggle meny
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();

      // Spillet er pauset, ingen meny → start spill
      if (isPaused && (!menu || menu.style.display !== "block")) {
        isPaused = false;
        pauseBtn.textContent = t.pauseLabelPause;
        return;
      }

      // Hvis menyen er åpen → lukk
      if (menu && menu.style.display === "block") {
        hideMenu();
        isPaused = false;
        pauseBtn.textContent = t.pauseLabelPause;
        return;
      }

      // ellers: åpne meny
      showMenu();
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }

    let newDx = dx;
    let newDy = dy;

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        newDx = 0;
        newDy = -1;
        break;

      case "ArrowDown":
      case "s":
      case "S":
        newDx = 0;
        newDy = 1;
        break;

      case "ArrowLeft":
      case "a":
      case "A":
        newDx = -1;
        newDy = 0;
        break;

      case "ArrowRight":
      case "d":
      case "D":
        newDx = 1;
        newDy = 0;
        break;

      default:
        return;
    }

    let lastDx = dx;
    let lastDy = dy;

    if (directionQueue.length > 0) {
      const last = directionQueue[directionQueue.length - 1];
      lastDx = last.dx;
      lastDy = last.dy;
    }

    if (newDx === -lastDx && newDy === -lastDy) {
      return;
    }

    if (newDx === lastDx && newDy === lastDy) {
      return;
    }

    directionQueue.push({ dx: newDx, dy: newDy });
  }

  // =======================================
  // HJELPEFUNKSJONER
  // =======================================
  function randomFoodPosition(blockedFoods = []) {
    let newPos;
    let isOnSnake;
    let isOnOtherFood;

    do {
      newPos = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };

      isOnSnake = snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
      isOnOtherFood = blockedFoods.some(f => f.x === newPos.x && f.y === newPos.y);

    } while (isOnSnake || isOnOtherFood);

    return newPos;
  }

  function resetFoods() {
    foods = [];
    const count = appleCount > 0 ? appleCount : 1;

    for (let i = 0; i < count; i++) {
      foods.push(randomFoodPosition(foods));
    }
  }

  function togglePause() {
    if (isGameOver) return;
    const t = translations[currentLang] || translations.no;
    isPaused = !isPaused;
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? t.pauseLabelResume : t.pauseLabelPause;
    }
  }

  function showMenu() {
    console.log("Vis meny");
    if (menu) {
      menu.style.display = "block";
    }
    isPaused = true;
    const t = translations[currentLang] || translations.no;
    if (pauseBtn) {
      pauseBtn.textContent = t.pauseLabelResume;
    }
  }

  function hideMenu() {
    console.log("Skjul meny");
    if (menu) {
      menu.style.display = "none";
    }
  }

  function endGame() {
    isGameOver = true;
    console.log("Game over");

    if (score > 0) {
      updateLeaderboard(playerName, score);
    }
  }

  function updateLeaderboard(name, score) {
    if (!name || score <= 0) return;

    const existing = leaderboard.find(entry => entry.name === name);

    if (existing) {
      if (score > existing.score) {
        existing.score = score;
      }
    } else {
      leaderboard.push({ name, score });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem("snakeLeaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
  }

  function renderLeaderboard() {
    const t = translations[currentLang] || translations.no;

    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {
      const li = document.createElement("li");
      li.textContent = t.noScores;
      leaderboardList.appendChild(li);
      return;
    }

    leaderboard.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${entry.name} – ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  }

  function restartGame() {
    snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 }
    ];
    dx = 1;
    dy = 0;
    directionQueue = [];
    resetFoods();
    score = 0;
    scoreEl.textContent = score;
    isGameOver = false;
    isPaused = true; // restart begynner også pauset

    const t = translations[currentLang] || translations.no;
    if (pauseBtn) {
      pauseBtn.textContent = t.pauseLabelResume;
    }

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
  }
});
