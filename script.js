// =======================================
// FARGER
// =======================================
const colors = {
  background: "#222",
  snakeHead: "#32FF32",
  snakeBody: "#7CFC00",
  snakeBorder: "#006400",
  snakeEyeWhite: "#FFFFFF",
  snakeEyePupil: "#000000",
  food: "#FF3333",
  text: "#FFFFFF"
};

// =======================================
// DOM-REFERANSER
// =======================================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore"); // NY
const restartBtn = document.getElementById("restart");


console.log("Snake-spill startet, canvas:", canvas);

// =======================================
// GRID / SPILLDATA
// =======================================
const tileSize = 20;
const tileCount = canvas.width / tileSize;

// Start-slangen: 3 segmenter
let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

// Retning (grid, ikke piksler)
let dx = 1;
let dy = 0;

// Kø for retningsendringer
let directionQueue = [];

// Mat og score
let food = randomFoodPosition();
let score = 0;
let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;
highscoreEl.textContent = highscore;


// Spillstatus
let isGameOver = false;

// Fart (ms mellom hver oppdatering)
const speed = 150;
let gameInterval = setInterval(gameLoop, speed);

// =======================================
// EVENT LISTENERS
// =======================================
document.addEventListener("keydown", handleKeyDown);
restartBtn.addEventListener("click", restartGame);

// =======================================
// GAME LOOP
// =======================================
function gameLoop() {
  if (isGameOver) return;
  update();
  draw();
}

// =======================================
// UPDATE: LOGIKK
// =======================================
function update() {
  // bruk neste retning i køen hvis det finnes
  if (directionQueue.length > 0) {
    const nextDir = directionQueue.shift();
    dx = nextDir.dx;
    dy = nextDir.dy;
  }

  // nytt hode basert på retning
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // kollisjon med vegg
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame();
    return;
  }

  // kollisjon med egen kropp
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }

  // legg til nytt hode
  snake.unshift(head);

  // sjekk om vi spiser mat
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;

    // oppdater highscore hvis nødvendig
    if (score > highscore) {
      highscore = score;
      highscoreEl.textContent = highscore;
      localStorage.setItem("snakeHighscore", highscore);
    }

    food = randomFoodPosition(); // ny mat
  } else {
    snake.pop();
  }
} // ← DENNE manglet

// =======================================
// DRAW: TEGNING
// =======================================
function draw() {
  // bakgrunn
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // mat
  ctx.fillStyle = colors.food;
  ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

  // slange
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const isHead = i === 0;
    drawSnakeSegment(segment.x, segment.y, isHead);
  }

  // game over tekst
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
// DRAW: TEGNING
// =======================================
function draw() {
  // bakgrunn
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // mat
  ctx.fillStyle = colors.food;
  ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

  // slange
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const isHead = i === 0;
    drawSnakeSegment(segment.x, segment.y, isHead);
  }

  // game over tekst
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
function drawSnakeSegment(x, y, isHead) {
  const centerX = x * tileSize + tileSize / 2;
  const centerY = y * tileSize + tileSize / 2;

  const outerRadius = isHead ? tileSize / 2 - 1 : tileSize / 2 - 2;
  const innerRadius = isHead ? tileSize / 2 - 3 : tileSize / 2 - 4;

  // YTRE sirkel (som border)
  ctx.fillStyle = colors.snakeBorder;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  // INDRE sirkel (selve kroppen)
  ctx.fillStyle = isHead ? colors.snakeHead : colors.snakeBody;
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bare hodet får øyne
  if (!isHead) return;

  // ØYNE
  const eyeRadius = innerRadius * 0.25;
  const pupilRadius = eyeRadius * 0.5;

  // Hvor øynene skal sitte i forhold til sentrum
  const forwardOffset = innerRadius * 0.6;
  const sideOffset = innerRadius * 0.45;

  let eye1x, eye1y, eye2x, eye2y;

  if (dx === 1 && dy === 0) {
    // høyre
    eye1x = centerX + forwardOffset;
    eye2x = centerX + forwardOffset;
    eye1y = centerY - sideOffset;
    eye2y = centerY + sideOffset;
  } else if (dx === -1 && dy === 0) {
    // venstre
    eye1x = centerX - forwardOffset;
    eye2x = centerX - forwardOffset;
    eye1y = centerY - sideOffset;
    eye2y = centerY + sideOffset;
  } else if (dx === 0 && dy === -1) {
    // opp
    eye1x = centerX - sideOffset;
    eye2x = centerX + sideOffset;
    eye1y = centerY - forwardOffset;
    eye2y = centerY - forwardOffset;
  } else if (dx === 0 && dy === 1) {
    // ned
    eye1x = centerX - sideOffset;
    eye2x = centerX + sideOffset;
    eye1y = centerY + forwardOffset;
    eye2y = centerY + forwardOffset;
  } else {
    // default hvis noe går skeis
    eye1x = centerX - sideOffset;
    eye2x = centerX + sideOffset;
    eye1y = centerY - forwardOffset;
    eye2y = centerY - forwardOffset;
  }

  // Tegn øyne (hvitt)
  ctx.fillStyle = colors.snakeEyeWhite;
  ctx.beginPath();
  ctx.arc(eye1x, eye1y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2x, eye2y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupiller
  ctx.fillStyle = colors.snakeEyePupil;
  ctx.beginPath();
  ctx.arc(eye1x, eye1y, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2x, eye2y, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
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
      return; // ignorer andre taster
  }

  // Finn "siste planlagte retning"
  let lastDx = dx;
  let lastDy = dy;

  if (directionQueue.length > 0) {
    const last = directionQueue[directionQueue.length - 1];
    lastDx = last.dx;
    lastDy = last.dy;
  }

  // blokker 180-grader (kan ikke snu rett tilbake i deg selv)
  if (newDx === -lastDx && newDy === -lastDy) {
    return;
  }

  // hvis ny retning er lik siste, ikke spam den
  if (newDx === lastDx && newDy === lastDy) {
    return;
  }

  // legg til i køen → brukes i neste/kommende update()
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
