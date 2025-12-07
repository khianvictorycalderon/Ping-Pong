// CANVAS SETUP
const canvas = document.getElementById("content");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// DEVICE DETECTION
function getDeviceType() {
    const w = window.innerWidth;
    if (w <= 600) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
}

const device = getDeviceType();

// PLAYER/BOT SPEED CONSTANTS
const mobileSpeed = 400;
const tabletSpeed = 500;
const desktopSpeed = 600;

const mobileBotSpeed = 320;
const tabletBotSpeed = 480;
const desktopBotSpeed = 600;

// SPEED OBJECT
const speed = {
    player:
        device === "mobile"
            ? mobileSpeed
            : device === "tablet"
            ? tabletSpeed
            : desktopSpeed,

    bot:
        device === "mobile"
            ? mobileBotSpeed
            : device === "tablet"
            ? tabletBotSpeed
            : desktopBotSpeed
};

// PADDLE SIZE
let paddleWidth = device === "mobile" ? 100 : 140;
let paddleHeight = 20;

// BALL SPEED SETTINGS (scaled for mobile)
let ballSpeed = device === "mobile" ? 30 : 50;
const increaseRateBallSpeed = device === "mobile" ? 35 : 50;
const maxBallSpeed = 900;

// SCORE
let playerScore = 0;
let botScore = 0;
const scoreDisplay = document.getElementById("score");

function displayScore() {
    scoreDisplay.innerHTML = `<div style="color:red">${botScore}</div> : <div style="color:blue">${playerScore}</div>`;
}

// PADDLES
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
    width: paddleWidth * (device === "mobile" ? 0.85 : 1),
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

    // Reset ball speed scaling
    ballSpeed = device === "mobile" ? 30 : 50;

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

// MOBILE BUTTONS
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

let gameRunning = false;
let lastTime = 0;

// UPDATE GAME
function update(dt) {
    if (!gameRunning) return;

    // PLAYER MOVEMENT
    if (player.moveLeft) player.x -= speed.player * dt;
    if (player.moveRight) player.x += speed.player * dt;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // BOT MOVEMENT
    if (ball.x < bot.x + bot.width / 2) bot.x -= speed.bot * dt;
    if (ball.x > bot.x + bot.width / 2) bot.x += speed.bot * dt;
    bot.x = Math.max(0, Math.min(canvas.width - bot.width, bot.x));

    // BALL MOVEMENT
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Increase ball speed
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

    // SCORE LOGIC
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

    // COLLISIONS WITH PADDLES
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
