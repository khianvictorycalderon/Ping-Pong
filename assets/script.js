const botSpeed = 600;
const playerSpeed = 600;

let gameRunning = false;

// BALL SPEED SETTINGS
let ballSpeed = 50;
const increaseRateBallSpeed = 50;
const maxBallSpeed = 1000;

// CANVAS SETUP
const canvas = document.getElementById("content");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// SCORE
let playerScore = 0;
let botScore = 0;
const scoreDisplay = document.getElementById("score");

function displayScore() {
    scoreDisplay.innerHTML = `<div style="color:red">${botScore}</div> : <div style="color:blue">${playerScore}</div>`;
}

// PADDLES
const paddleWidth = 140;
const paddleHeight = 20;

const player = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleHeight - 20,
    width: paddleWidth,
    height: paddleHeight,
    moveLeft: false,
    moveRight: false
};

const bot = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: 20,
    width: paddleWidth,
    height: paddleHeight
};

// BALL
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 12,
    vx: 300,
    vy: 300
};

// RESET BALL AFTER SCORE
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    // Reset speed
    ballSpeed = 1;

    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;

    ball.vx = 300 * dirX;
    ball.vy = 300 * dirY;
}

// DESKTOP INPUT
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a") player.moveLeft = true;
    if (e.key === "ArrowRight" || e.key === "d") player.moveRight = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "a") player.moveLeft = false;
    if (e.key === "ArrowRight" || e.key === "d") player.moveRight = false;
});

const leftBtn = document.getElementById("control-left");
const rightBtn = document.getElementById("control-right");

leftBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    player.moveLeft = true;
});
leftBtn.addEventListener("touchend", e => {
    e.preventDefault();
    player.moveLeft = false;
});

rightBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    player.moveRight = true;
});
rightBtn.addEventListener("touchend", e => {
    e.preventDefault();
    player.moveRight = false;
});

let lastTime = 0;

// UPDATE GAME
function update(dt) {
    if (!gameRunning) return;

    // PLAYER MOVEMENT
    if (player.moveLeft) player.x -= playerSpeed * dt;
    if (player.moveRight) player.x += playerSpeed * dt;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // BOT MOVEMENT
    if (ball.x < bot.x + bot.width / 2) bot.x -= botSpeed * dt;
    if (ball.x > bot.x + bot.width / 2) bot.x += botSpeed * dt;
    bot.x = Math.max(0, Math.min(canvas.width - bot.width, bot.x));

    // BALL MOVEMENT
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Increase ball speed linearly, capped
    ballSpeed += increaseRateBallSpeed * dt;
    ballSpeed = Math.min(ballSpeed, maxBallSpeed);

    // Normalize velocity and apply ballSpeed
    const velDir = Math.hypot(ball.vx, ball.vy);
    if (velDir > 0) {
        const nx = ball.vx / velDir;
        const ny = ball.vy / velDir;
        const currentSpeed = Math.min(velDir + ballSpeed * dt, maxBallSpeed);
        ball.vx = nx * currentSpeed;
        ball.vy = ny * currentSpeed;
    }

    // WALL COLLISIONS
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -1;
    }

    // SCORE
    if (ball.y - ball.radius < 0) {
        playerScore++;
        displayScore();
        resetBall();
    }

    if (ball.y + ball.radius > canvas.height) {
        botScore++;
        displayScore();
        resetBall();
    }

    // COLLISION WITH PADDLES
    function collide(p) {
        return (
            ball.x > p.x &&
            ball.x < p.x + p.width &&
            ball.y + ball.radius > p.y &&
            ball.y - ball.radius < p.y + p.height
        );
    }

    if (collide(player) && ball.vy > 0) ball.vy *= -1;
    if (collide(bot) && ball.vy < 0) ball.vy *= -1;
}

// DRAW EVERYTHING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // PLAYER
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // BOT
    ctx.fillStyle = "red";
    ctx.fillRect(bot.x, bot.y, bot.width, bot.height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(bot.x, bot.y, bot.width, bot.height);

    // BALL
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
}

// MAIN LOOP
function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000; // seconds
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// PLAY BUTTON
document.getElementById("playBtn").addEventListener("click", () => {
    gameRunning = true;
    displayScore();

    document.getElementById("playBtn").style.display = "none";
    document.getElementById("info").style.display = "none";

    leftBtn.style.display = "block";
    rightBtn.style.display = "block";
});
