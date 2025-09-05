// Game canvas en context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variabelen
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Camera variabelen
let cameraX = 0;

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

// Grond en muren array
const ground = { x: 0, y: 550, width: 2000, height: 50, color: '#4ECDC4' };

// Verticale muren om overheen te springen
const walls = [
    { x: 250, y: 450, width: 20, height: 100, color: '#45B7D1' },
    { x: 400, y: 400, width: 20, height: 150, color: '#45B7D1' },
    { x: 550, y: 420, width: 20, height: 130, color: '#45B7D1' },
    { x: 700, y: 380, width: 20, height: 170, color: '#45B7D1' },
    { x: 850, y: 450, width: 20, height: 100, color: '#45B7D1' },
    { x: 1000, y: 400, width: 20, height: 150, color: '#45B7D1' }
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

    // Collision detection met grond
    if (checkCollision(player, ground)) {
        if (player.velocityY > 0 && player.y < ground.y) {
            player.y = ground.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }
    }

    // Collision detection met verticale muren (blokkeren beweging)
    for (let wall of walls) {
        if (checkCollision(player, wall)) {
            // Van links tegen muur
            if (player.velocityX > 0 && player.x < wall.x) {
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
    
    // Update camera om speler te volgen
    cameraX = player.x - canvas.width / 2;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > ground.width - canvas.width) cameraX = ground.width - canvas.width;

    // Grenzen van de wereld
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > ground.width) {
        player.x = ground.width - player.width;
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

    // Save context voor camera transformatie
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Teken grond
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(ground.x + 2, ground.y + 2, ground.width, ground.height);
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

    // Teken verticale muren (alleen die zichtbaar zijn)
    walls.forEach(wall => {
        if (wall.x + wall.width > cameraX && wall.x < cameraX + canvas.width) {
            // Voeg wat schaduw toe
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(wall.x + 2, wall.y + 2, wall.width, wall.height);

            // Teken de muur
            ctx.fillStyle = wall.color;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
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

    // Restore context
    ctx.restore();
}

// Game loop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start het spel
gameLoop();
