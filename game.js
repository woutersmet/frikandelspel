// Game canvas en context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variabelen
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Speler object
const player = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    color: '#FF6B6B'
};

// Muren/platforms array
const walls = [
    { x: 0, y: 550, width: 800, height: 50, color: '#4ECDC4' }, // Grond
    { x: 200, y: 450, width: 100, height: 20, color: '#45B7D1' },
    { x: 400, y: 350, width: 100, height: 20, color: '#45B7D1' },
    { x: 600, y: 250, width: 100, height: 20, color: '#45B7D1' },
    { x: 300, y: 200, width: 150, height: 20, color: '#45B7D1' },
    { x: 550, y: 150, width: 100, height: 20, color: '#45B7D1' },
    { x: 100, y: 100, width: 120, height: 20, color: '#45B7D1' }
];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update speler positie en physics
function updatePlayer() {
    // Horizontale beweging
    if (keys['ArrowLeft']) {
        player.velocityX = -MOVE_SPEED;
    } else if (keys['ArrowRight']) {
        player.velocityX = MOVE_SPEED;
    } else {
        player.velocityX *= 0.8; // Wrijving
    }
    
    // Springen
    if (keys['Space'] && player.onGround) {
        player.velocityY = JUMP_FORCE;
        player.onGround = false;
    }
    
    // Zwaartekracht toepassen
    player.velocityY += GRAVITY;
    
    // Positie updaten
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Reset onGround status
    player.onGround = false;
    
    // Collision detection met muren
    for (let wall of walls) {
        if (checkCollision(player, wall)) {
            // Van boven op platform landen
            if (player.velocityY > 0 && player.y < wall.y) {
                player.y = wall.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Van onder tegen platform
            else if (player.velocityY < 0 && player.y > wall.y) {
                player.y = wall.y + wall.height;
                player.velocityY = 0;
            }
            // Van links tegen muur
            else if (player.velocityX > 0 && player.x < wall.x) {
                player.x = wall.x - player.width;
                player.velocityX = 0;
            }
            // Van rechts tegen muur
            else if (player.velocityX < 0 && player.x > wall.x) {
                player.x = wall.x + wall.width;
                player.velocityX = 0;
            }
        }
    }
    
    // Grenzen van het canvas
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.velocityX = 0;
    }
    
    // Als speler valt, reset positie
    if (player.y > canvas.height) {
        player.x = 100;
        player.y = 400;
        player.velocityX = 0;
        player.velocityY = 0;
    }
}

// Teken alles
function draw() {
    // Clear canvas met gradient achtergrond
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Teken muren/platforms
    walls.forEach(wall => {
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        
        // Voeg wat schaduw toe
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(wall.x + 2, wall.y + 2, wall.width, wall.height);
        
        // Teken de muur weer
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Teken speler
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Voeg ogen toe aan speler
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 19, player.y + 8, 6, 6);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 7, player.y + 10, 2, 2);
    ctx.fillRect(player.x + 21, player.y + 10, 2, 2);
}

// Game loop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start het spel
gameLoop();
