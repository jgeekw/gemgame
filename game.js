const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const counterElement = document.getElementById('counter');
const timerElement = document.getElementById('timer');
const modal = document.getElementById('modal');
const resetButton = document.getElementById('resetButton');

let player = { x: 10, y: 10, width: 10, height: 10, speed: 5 };
let keys = {};
let maze = [];
let gems = [];
let gemCount = 100;
const mazeWidth = 40;
const mazeHeight = 30;
const cellSize = 20;
let timeLeft = 120; // 2 minutes in seconds
let timerInterval;

// Initialize maze
function initializeMaze() {
    maze = Array.from({ length: mazeHeight }, () => Array(mazeWidth).fill(0));
    generateMaze(0, 0);
}

// Depth-First Search Maze Generation
function generateMaze(x, y) {
    const directions = [
        [0, -1], // up
        [1, 0],  // right
        [0, 1],  // down
        [-1, 0]  // left
    ];
    shuffle(directions);

    for (const [dx, dy] of directions) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;

        if (nx >= 0 && ny >= 0 && nx < mazeWidth && ny < mazeHeight && maze[ny][nx] === 0) {
            maze[ny][nx] = 1;
            maze[y + dy][x + dx] = 1;
            generateMaze(nx, ny);
        }
    }
}

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialize gems
function initializeGems() {
    gems = [];
    for (let i = 0; i < gemCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * mazeWidth) * cellSize;
            y = Math.floor(Math.random() * mazeHeight) * cellSize;
        } while (maze[y / cellSize][x / cellSize] === 0);
        gems.push({ x, y, width: 10, height: 10 });
    }
}

initializeMaze();
initializeGems();

function update() {
    if (keys['ArrowUp'] && canMove(player.x, player.y - player.speed, player.width, player.height)) player.y -= player.speed;
    if (keys['ArrowDown'] && canMove(player.x, player.y + player.speed, player.width, player.height)) player.y += player.speed;
    if (keys['ArrowLeft'] && canMove(player.x - player.speed, player.y, player.width, player.height)) player.x -= player.speed;
    if (keys['ArrowRight'] && canMove(player.x + player.speed, player.y, player.width, player.height)) player.x += player.speed;

    // Check for gem collection
    for (let i = gems.length - 1; i >= 0; i--) {
        if (isColliding(player, gems[i])) {
            gems.splice(i, 1);
            gemCount--;
            counterElement.textContent = `Gems left: ${gemCount}`;
            if (gemCount === 0) {
                clearInterval(timerInterval);
                showModal("Congratulations! You found them all.");
            }
        }
    }

    // Check if time is up
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showModal("You have lost. Time's up!");
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    ctx.fillStyle = 'black';
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            if (maze[y][x] === 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw gems
    ctx.fillStyle = 'green';
    gems.forEach(gem => {
        ctx.fillRect(gem.x, gem.y, gem.width, gem.height);
    });
}

function canMove(x, y, width, height) {
    const cellX1 = Math.floor(x / cellSize);
    const cellY1 = Math.floor(y / cellSize);
    const cellX2 = Math.floor((x + width - 1) / cellSize);
    const cellY2 = Math.floor((y + height - 1) / cellSize);

    return maze[cellY1] && maze[cellY1][cellX1] === 1 &&
           maze[cellY1] && maze[cellY1][cellX2] === 1 &&
           maze[cellY2] && maze[cellY2][cellX1] === 1 &&
           maze[cellY2] && maze[cellY2][cellX2] === 1;
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function showModal(message) {
    modal.querySelector('p').textContent = message;
    modal.style.display = 'block';
}

function resetGame() {
    player = { x: 10, y: 10, width: 10, height: 10, speed: 5 };
    gemCount = 100;
    timeLeft = 120;
    counterElement.textContent = `Gems left: ${gemCount}`;
    timerElement.textContent = `Time left: ${timeLeft}s`;
    initializeMaze();
    initializeGems();
    modal.style.display = 'none';
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showModal("You have lost. Time's up!");
        }
    }, 1000);
}

function collectAllGems() {
    gems = [];
    gemCount = 0;
    counterElement.textContent = `Gems left: ${gemCount}`;
    clearInterval(timerInterval);
    showModal("Congratulations! You found them all.");
}

resetButton.addEventListener('click', resetGame);

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'c' || e.key === 'C') {
        collectAllGems();
    }
});
window.addEventListener('keyup', (e) => keys[e.key] = false);

setInterval(() => {
    update();
    draw();
}, 1000 / 60);

startTimer();
