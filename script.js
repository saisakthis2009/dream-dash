
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

const ground = 270;

// GAME SETTINGS
let score = 0;
let speed = 3;
const maxSpeed = 8;
let gameOver = false;
let frame = 0;
let shieldTime = 0;
let bestScore = Number(localStorage.getItem("dreamDashBest")) || 0;

// PLAYER
let player = {
    x: 80,
    y: ground - 40,
    width: 32,
    height: 40,
    velocity: 0,
    jumping: false
};

// BACKGROUND STARS
let stars = [];

for (let i = 0; i < 85; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 255,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.8 + 0.2
    });
}

// BACKGROUND PLANETS
let planets = [
    { x: 220, y: 65, radius: 24, color: "#7546B8", speed: 0.3 },
    { x: 650, y: 105, radius: 17, color: "#D45B9A", speed: 0.2 }
];

// OBSTACLES
let obstacles = [];
let obstacleTimer = 100;

// CRYSTAL
let crystal = {
    x: 550,
    y: 190,
    width: 22,
    height: 25,
    active: true
};

// SHIELD POWER-UP
let powerUp = {
    x: 1100,
    y: 190,
    width: 25,
    height: 25,
    active: false
};

// PARTICLES
let particles = [];

// BACKGROUND
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach(star => {
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillRect(star.x, star.y, star.size, star.size);

        star.x -= star.speed;

        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * 250;
        }
    });

    ctx.globalAlpha = 1;

    // Planets
    planets.forEach(planet => {
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(
            planet.x,
            planet.y,
            planet.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Planet ring
        ctx.strokeStyle = "#D8B4FE";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
            planet.x,
            planet.y,
            planet.radius + 9,
            7,
            -0.3,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        planet.x -= planet.speed;

        if (planet.x < -50) {
            planet.x = canvas.width + 50;
        }
    });
}

// PIXEL ASTRONAUT

// PIXEL ASTRONAUT
function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    const movement = player.jumping
        ? 0
        : Math.round(Math.sin(frame / 5) * 2);

    // Oxygen backpack
    ctx.fillStyle = "#5740A5";
    ctx.fillRect(x - 8, y + 13, 11, 20);

    ctx.fillStyle = "#46E6E0";
    ctx.fillRect(x - 7, y + 17, 5, 9);

    // Backpack side details
    ctx.fillStyle = "#A78BFA";
    ctx.fillRect(x - 9, y + 12, 4, 19);

    // Helmet outer border
    ctx.fillStyle = "#A78BFA";
    ctx.fillRect(x + 3, y - 3, 27, 25);
    ctx.fillRect(x, y + 3, 33, 15);

    // Helmet
    ctx.fillStyle = "#F4F1FF";
    ctx.fillRect(x + 5, y, 23, 19);
    ctx.fillRect(x + 2, y + 5, 29, 11);

    // Helmet glass
    ctx.fillStyle = "#25205B";
    ctx.fillRect(x + 7, y + 5, 21, 11);

    // Visor reflections
    ctx.fillStyle = "#46E6E0";
    ctx.fillRect(x + 10, y + 6, 5, 3);
    ctx.fillRect(x + 22, y + 11, 3, 2);

    // Helmet light
    ctx.fillStyle = "#FDE68A";
    ctx.fillRect(x + 15, y - 3, 5, 3);

    // Neck
    ctx.fillStyle = "#C4B5FD";
    ctx.fillRect(x + 12, y + 18, 10, 4);

    // Spacesuit body
    ctx.fillStyle = "#F4F1FF";
    ctx.fillRect(x + 6, y + 20, 21, 14);

    // Suit outline
    ctx.fillStyle = "#A78BFA";
    ctx.fillRect(x + 6, y + 20, 3, 14);
    ctx.fillRect(x + 24, y + 20, 3, 14);

    // Chest control panel
    ctx.fillStyle = "#5740A5";
    ctx.fillRect(x + 12, y + 22, 11, 7);

    // Chest lights
    ctx.fillStyle = "#46E6E0";
    ctx.fillRect(x + 14, y + 24, 3, 3);

    ctx.fillStyle = "#FDE68A";
    ctx.fillRect(x + 19, y + 24, 2, 3);

    // Arms
    ctx.fillStyle = "#F4F1FF";
    ctx.fillRect(x, y + 21, 7, 10);
    ctx.fillRect(x + 26, y + 21, 7, 10);

    // Gloves
    ctx.fillStyle = "#A78BFA";
    ctx.fillRect(x, y + 29, 7, 4);
    ctx.fillRect(x + 26, y + 29, 7, 4);

    // Legs
    ctx.fillStyle = "#F4F1FF";
    ctx.fillRect(x + 7 + movement, y + 33, 8, 6);
    ctx.fillRect(x + 19 - movement, y + 33, 8, 6);

    // Space boots
    ctx.fillStyle = "#5740A5";
    ctx.fillRect(x + 5 + movement, y + 38, 11, 4);
    ctx.fillRect(x + 18 - movement, y + 38, 11, 4);

    // Energy shield
    if (shieldTime > 0) {
        ctx.save();
        ctx.strokeStyle = "#46E6E0";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#46E6E0";
        ctx.shadowBlur = 18;

        ctx.beginPath();
        ctx.ellipse(
            x + 15, y + 20,
            27, 27,
            0, 0, Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
    }
}

// ASTEROID
function drawAsteroid(x, y) {
    ctx.fillStyle = "#A77BCE";

    ctx.fillRect(x + 8, y, 18, 8);
    ctx.fillRect(x + 3, y + 8, 28, 20);
    ctx.fillRect(x + 8, y + 28, 18, 8);
    ctx.fillRect(x, y + 14, 34, 12);

    ctx.fillStyle = "#67458F";
    ctx.fillRect(x + 5, y + 18, 8, 8);
    ctx.fillRect(x + 19, y + 8, 7, 6);

    ctx.fillStyle = "#E1C4FF";
    ctx.fillRect(x + 10, y + 5, 7, 4);
}

// ALIEN
function drawAlien(x, y) {
    ctx.fillStyle = "#55E6A5";

    // Head
    ctx.fillRect(x + 5, y + 5, 25, 20);
    ctx.fillRect(x, y + 12, 35, 12);

    // Antennas
    ctx.fillRect(x + 7, y, 4, 8);
    ctx.fillRect(x + 26, y, 4, 8);

    // Eyes
    ctx.fillStyle = "#25204D";
    ctx.fillRect(x + 9, y + 12, 5, 7);
    ctx.fillRect(x + 23, y + 12, 5, 7);

    // Feet
    ctx.fillStyle = "#35B77E";
    ctx.fillRect(x + 5, y + 25, 8, 8);
    ctx.fillRect(x + 23, y + 25, 8, 8);
}

// DRONE
function drawDrone(x, y) {
    ctx.fillStyle = "#F59ECA";

    ctx.fillRect(x + 7, y + 7, 22, 19);
    ctx.fillRect(x, y + 12, 36, 9);

    ctx.fillStyle = "#5B3A91";
    ctx.fillRect(x + 12, y + 13, 5, 5);
    ctx.fillRect(x + 21, y + 13, 5, 5);

    ctx.fillStyle = "#46E6E0";
    ctx.fillRect(x + 4, y + 4, 7, 4);
    ctx.fillRect(x + 25, y + 4, 7, 4);
}

// DRAW OBSTACLES
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === "asteroid") {
            drawAsteroid(obstacle.x, obstacle.y);
        } else if (obstacle.type === "alien") {
            drawAlien(obstacle.x, obstacle.y);
        } else {
            drawDrone(obstacle.x, obstacle.y);
        }
    });
}

// CREATE OBSTACLE
function createObstacle() {
    const types = ["asteroid", "alien", "drone"];
    const type = types[Math.floor(Math.random() * types.length)];

    obstacles.push({
        x: canvas.width + 20,
        y: ground - 36,
        width: 36,
        height: 36,
        type: type,
        passed: false
    });
}

// DRAW CRYSTAL
function drawCrystal() {
    if (!crystal.active) return;

    const x = Math.round(crystal.x);
    const y = Math.round(crystal.y);

    ctx.save();
    ctx.shadowColor = "#22D3EE";
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#22D3EE";
    ctx.fillRect(x + 7, y, 8, 4);
    ctx.fillRect(x + 3, y + 4, 16, 5);
    ctx.fillRect(x, y + 9, 22, 9);
    ctx.fillRect(x + 4, y + 18, 14, 4);
    ctx.fillRect(x + 7, y + 22, 8, 3);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x + 7, y + 5, 4, 4);

    ctx.restore();
}

// DRAW SHIELD POWER-UP
function drawPowerUp() {
    if (!powerUp.active) return;

    ctx.save();
    ctx.shadowColor = "#46E6E0";
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#46E6E0";
    ctx.beginPath();
    ctx.arc(
        powerUp.x + 12,
        powerUp.y + 12,
        12,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("S", powerUp.x + 12, powerUp.y + 18);

    ctx.restore();
}

// GROUND
function drawGround() {
    ctx.fillStyle = "#8B5CF6";
    ctx.fillRect(0, ground, canvas.width, 3);

    ctx.fillStyle = "#30205F";
    ctx.fillRect(0, ground + 3, canvas.width, 30);
}

// PARTICLE EFFECT
function createParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 25
        });
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = "#67E8F9";
        ctx.fillRect(p.x, p.y, 4, 4);

        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });

    particles = particles.filter(p => p.life > 0);
}

// JUMP
document.addEventListener("keydown", function(event) {
    if (
        (event.code === "Space" || event.code === "ArrowUp") &&
        !player.jumping &&
        !gameOver
    ) {
        event.preventDefault();
        player.jumping = true;
        player.velocity = -14;
    }
});

// COLLISION DETECTION
function rectanglesCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkObstacleCollision(obstacle) {
    const playerBox = {
        x: player.x + 5,
        y: player.y + 5,
        width: player.width - 10,
        height: player.height - 5
    };

    return rectanglesCollide(playerBox, obstacle);
}

// GAME OVER SCREEN
function drawGameOver() {
    ctx.fillStyle = "rgba(10, 5, 35, 0.82)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    ctx.fillStyle = "#E9D5FF";
    ctx.font = "bold 36px monospace";
    ctx.fillText("MISSION FAILED!", 400, 115);

    ctx.fillStyle = "#67E8F9";
    ctx.font = "22px monospace";
    ctx.fillText("Final Score: " + score, 400, 155);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px monospace";
    ctx.fillText("Best Score: " + bestScore, 400, 185);

    ctx.fillStyle = "#C4B5FD";
    ctx.fillText("Press Restart Adventure to play again", 400, 220);
}

// SCORE DISPLAY
function updateScore() {
    scoreDisplay.innerText =
        "Score: " + score + " | Best: " + bestScore;
}

// MAIN GAME LOOP
function updateGame() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    frame++;

    drawBackground();

    // GRADUALLY INCREASE SPEED
    if (frame % 60 === 0 && speed < maxSpeed) {
        speed += 0.12;
    }

    // PLAYER JUMPING
    if (player.jumping) {
        player.y += player.velocity;
        player.velocity += 0.6;

        if (player.y >= ground - player.height) {
            player.y = ground - player.height;
            player.jumping = false;
            player.velocity = 0;
        }
    }

    // SHIELD TIMER
    if (shieldTime > 0) {
        shieldTime--;
    }

    // CREATE OBSTACLES
    obstacleTimer--;

    if (obstacleTimer <= 0) {
        createObstacle();
        obstacleTimer = 115 + Math.random() * 65;
    }

    // MOVE AND CHECK OBSTACLES
    obstacles.forEach(obstacle => {
        obstacle.x -= speed;

        if (
            !obstacle.passed &&
            obstacle.x + obstacle.width < player.x
        ) {
            obstacle.passed = true;
            score++;
            updateScore();
        }

        if (checkObstacleCollision(obstacle)) {
            if (shieldTime > 0) {
                shieldTime = 0;
                obstacle.x = -100;
                createParticles(player.x + 15, player.y + 20);
            } else {
                gameOver = true;
            }
        }
    });

    obstacles = obstacles.filter(o => o.x > -60);

    // MOVE CRYSTAL
    if (crystal.active) {
        crystal.x -= speed;

        if (rectanglesCollide(
            player,
            crystal
        )) {
            score += 5;
            updateScore();

            createParticles(crystal.x, crystal.y);
            crystal.active = false;
        }

        if (crystal.x < -30) {
            crystal.active = false;
        }
    } else if (Math.random() < 0.012) {
        crystal.active = true;
        crystal.x = canvas.width + 100;
        crystal.y = 180 + Math.random() * 40;
    }

    // MOVE SHIELD POWER-UP
    if (powerUp.active) {
        powerUp.x -= speed;

        if (rectanglesCollide(player, powerUp)) {
            shieldTime = 300;
            powerUp.active = false;
            createParticles(powerUp.x, powerUp.y);
        }

        if (powerUp.x < -30) {
            powerUp.active = false;
        }
    } else if (Math.random() < 0.002) {
        powerUp.active = true;
        powerUp.x = canvas.width + 100;
        powerUp.y = 190;
    }

    // BEST SCORE
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("dreamDashBest", bestScore);
    }

    updateScore();

    // DRAW EVERYTHING
    drawGround();
    drawParticles();
    drawCrystal();
    drawPowerUp();
    drawObstacles();
    drawPlayer();

    // SHIELD STATUS
    if (shieldTime > 0) {
        ctx.fillStyle = "#46E6E0";
        ctx.font = "14px monospace";
        ctx.textAlign = "right";
        ctx.fillText("SHIELD ACTIVE", 780, 25);
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    requestAnimationFrame(updateGame);
}

// RESTART
restartBtn.addEventListener("click", function() {
    player.y = ground - player.height;
    player.velocity = 0;
    player.jumping = false;

    obstacles = [];
    particles = [];

    crystal.x = 550;
    crystal.y = 190;
    crystal.active = true;

    powerUp.x = 1100;
    powerUp.active = false;

    score = 0;
    speed = 3;
    frame = 0;
    shieldTime = 0;
    obstacleTimer = 100;
    gameOver = false;

    updateScore();

    updateGame();
});

// START
updateScore();
updateGame();
