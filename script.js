// Alt kjører først når DOM-en er klar
window.addEventListener("DOMContentLoaded", () => {
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

  // bilder fra img-mappen (sørg for at filnavnene stemmer!)
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
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highscoreEl = document.getElementById("highscore");
  const restartBtn = document.getElementById("restart");

  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const currentPlayerNameEl = document.getElementById("currentPlayerName");
  const nameForm = document.getElementById("nameForm");
  const leaderboardList = document.getElementById("leaderboardList");

  console.log("Snake-spill startet, canvas:", canvas);

  // sanity check på elementene
  console.log("Navnefelt:", playerNameInput);
  console.log("Lagre-knapp:", saveNameBtn);
  console.log("Spiller-label:", currentPlayerNameEl);

  // =======================================
  // GRID / SPILLDATA
  // =======================================
  const tileSize = 20;
  const tileCount = canvas.width / tileSize;

  let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  let dx = 1;
  let dy = 0;

  let directionQueue = [];

  let food = randomFoodPosition();
  let score = 0;
  let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;
  highscoreEl.textContent = highscore;

  let playerName = localStorage.getItem("snakePlayerName") || "";
  let leaderboard = JSON.parse(localStorage.getItem("snakeLeaderboard") || "[]");

  if (playerName) {
    currentPlayerNameEl.textContent = playerName;
    nameForm.style.display = "none";
  } else {
    currentPlayerNameEl.textContent = "Ingen";
    nameForm.style.display = "flex";
  }

  renderLeaderboard();

  let isGameOver = false;
  const speed = 130;
  let gameInterval = setInterval(gameLoop, speed);

  // =======================================
  // EVENT LISTENERS
  // =======================================
  document.addEventListener("keydown", handleKeyDown);
  restartBtn.addEventListener("click", restartGame);

  saveNameBtn.addEventListener("click", () => {
    console.log("Lagre-knapp trykket");

    const name = playerNameInput.value.trim();
    console.log("Navn i input:", name);

    if (!name) {
      console.log("Tomt navn, gjør ingenting");
      return;
    }

    playerName = name;
    localStorage.setItem("snakePlayerName", playerName);
    console.log("Navn lagret i localStorage:", playerName);

    currentPlayerNameEl.textContent = playerName;
    nameForm.style.display = "none";
  });

  // =======================================
  // GAME LOOP
  // =======================================
  function gameLoop() {
    if (isGameOver) return;
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

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }

    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        endGame();
        return;
      }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;

      if (score > highscore) {
        highscore = score;
        highscoreEl.textContent = highscore;
        localStorage.setItem("snakeHighscore", highscore);
      }

      food = randomFoodPosition();
    } else {
      snake.pop();
    }
  }

  // =======================================
  // DRAW
  // =======================================
  function draw() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      sprites.apple,
      food.x * tileSize,
      food.y * tileSize,
      tileSize,
      tileSize
    );

    for (let i = 0; i < snake.length; i++) {
      drawSnakeSegment(i);
    }

    if (isGameOver) {
      ctx.fillStyle = colors.text;
      ctx.font = "24px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px system-ui";
      ctx.fillText("Trykk Restart", canvas.width / 2, canvas.height / 2 + 30);
    }
  }

  // =======================================
  // TEGN SLANGE-SEGMENT
  // =======================================
  function drawSnakeSegment(index) {
    const segment = snake[index];
    const isHead = index === 0;
    const isTail = index === snake.length - 1;

    const px = segment.x * tileSize;
    const py = segment.y * tileSize;

    if (isHead) {
      if (dx === 1 && dy === 0) return ctx.drawImage(sprites.head_right, px, py, tileSize, tileSize);
      if (dx === -1 && dy === 0) return ctx.drawImage(sprites.head_left, px, py, tileSize, tileSize);
      if (dy === -1 && dx === 0) return ctx.drawImage(sprites.head_up, px, py, tileSize, tileSize);
      if (dy === 1 && dx === 0) return ctx.drawImage(sprites.head_down, px, py, tileSize, tileSize);
    }

    if (isTail) {
      const prev = snake[index - 1];
      if (prev.x < segment.x) return ctx.drawImage(sprites.tail_right, px, py, tileSize, tileSize);
      if (prev.x > segment.x) return ctx.drawImage(sprites.tail_left, px, py, tileSize, tileSize);
      if (prev.y < segment.y) return ctx.drawImage(sprites.tail_down, px, py, tileSize, tileSize);
      if (prev.y > segment.y) return ctx.drawImage(sprites.tail_up, px, py, tileSize, tileSize);
    }

    const prev = snake[index - 1];
    const next = snake[index + 1];

    if (!prev || !next) {
      return;
    }

    if (prev.y === segment.y && next.y === segment.y) {
      return ctx.drawImage(sprites.body_horizontal, px, py, tileSize, tileSize);
    }

    if (prev.x === segment.x && next.x === segment.x) {
      return ctx.drawImage(sprites.body_vertical, px, py, tileSize, tileSize);
    }

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
    if (isGameOver) return;

    let newDx = dx;
    let newDy = dy;

    switch (e.key) {
      case "ArrowUp":
        newDx = 0;
        newDy = -1;
        break;
      case "ArrowDown":
        newDx = 0;
        newDy = 1;
        break;
      case "ArrowLeft":
        newDx = -1;
        newDy = 0;
        break;
      case "ArrowRight":
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
  function randomFoodPosition() {
    return {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }

  function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
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
    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Ingen scores ennå";
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
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    directionQueue = [];
    food = randomFoodPosition();
    score = 0;
    scoreEl.textContent = score;
    isGameOver = false;

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
  }
});
