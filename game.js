const MAP_SIZE = 10;
const TILE_SIZE = 50;
const canvas = document.getElementById("gameCanvas");
canvas.width = MAP_SIZE * TILE_SIZE;
canvas.height = MAP_SIZE * TILE_SIZE;
const ctx = canvas.getContext("2d");

// Game state variables
let map, player, enemies, treasures, inventory, currentLevel;

// Initialize the game
function initializeGame() {
    map = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill('.'));
    player = { x: 0, y: 0, health: 100 };
    enemies = [];
    treasures = 0;
    inventory = [];
    currentLevel = currentLevel || 1;

    // Place player
    map[player.x][player.y] = 'P';

    // Spawn entities
    spawnEntities('E', 3 + currentLevel, enemies, 50); // Enemies
    spawnEntities('T', 5); // Treasures
    spawnEntities('H', 2); // Health packs

    drawGame();
}

function spawnEntities(type, count, arr = null, health = null) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * MAP_SIZE);
            y = Math.floor(Math.random() * MAP_SIZE);
        } while (map[x][y] !== '.');

        map[x][y] = type;
        if (arr) arr.push({ x, y, health });
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the map
    for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
            let color;
            switch (map[i][j]) {
                case 'P': color = "blue"; break; // Player
                case 'E': color = "red"; break; // Enemy
                case 'T': color = "yellow"; break; // Treasure
                case 'H': color = "green"; break; // Health pack
                default: color = "lightgray"; // Empty space
            }
            ctx.fillStyle = color;
            ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Update stats
    document.getElementById("health").textContent =
        `Health: ${player.health}`;

    document.getElementById("inventory").textContent =
        `Treasures: ${treasures}/5, Inventory: ${inventory.join(", ")}`;

    document.getElementById("level").textContent =
        `Level: ${currentLevel}`;
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (isValidMove(newX, newY)) {
        const cell = map[newX][newY];

        // Handle interactions
        map[player.x][player.y] = '.';
        player.x = newX;
        player.y = newY;

        if (cell === 'T') {
            treasures++;
            inventory.push("Treasure");
        } else if (cell === 'H') {
            player.health = Math.min(player.health + 20, 100);
        } else if (cell === 'E') {
            combat(newX, newY);
        }

        map[player.x][player.y] = 'P';
        moveEnemies();
        drawGame();

        // Check win or loss conditions
        if (player.health <= 0) {
            alert("You have been defeated! Game Over.");
            restartGame();
        } else if (treasures >= 5) {
            nextLevel();
        }
    }
}

function isValidMove(x, y) {
    return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

function combat(enemyX, enemyY) {
    const enemyIndex = enemies.findIndex(e => e.x === enemyX && e.y === enemyY);
    if (enemyIndex === -1) return;

    const enemy = enemies[enemyIndex];
    while (player.health > 0 && enemy.health > 0) {
        const playerDamage = Math.floor(Math.random() * 20) + 10;
        const enemyDamage = Math.floor(Math.random() * 15) + 5;

        enemy.health -= playerDamage;
        player.health -= enemyDamage;

        if (enemy.health <= 0) {
            map[enemy.x][enemy.y] = '.';
            enemies.splice(enemyIndex, 1); // Remove defeated enemy
        }
    }
}

function moveEnemies() {
    enemies.forEach(enemy => {
        if (enemy.health > 0) {
            const dx = Math.sign(player.x - enemy.x);
            const dy = Math.sign(player.y - enemy.y);

            const newX = enemy.x + dx;
            const newY = enemy.y + dy;

            if (isValidMove(newX, newY) && map[newX][newY] === '.') {
                map[enemy.x][enemy.y] = '.';
                enemy.x = newX;
                enemy.y = newY;
                map[newX][newY] = 'E';
            }
        }
    });
}

function nextLevel() {
    alert(`Level ${currentLevel} complete!`);
    currentLevel++;
    initializeGame();
}

function restartGame() {
    currentLevel = 1;
    initializeGame();
}

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp": movePlayer(-1, 0); break;
        case "ArrowDown": movePlayer(1, 0); break;
        case "ArrowLeft": movePlayer(0, -1); break;
        case "ArrowRight": movePlayer(0, 1); break;
    }
});

initializeGame();
