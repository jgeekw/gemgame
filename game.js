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
                showModal("Congratulations! You found them all
