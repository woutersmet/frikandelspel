// Game canvas en context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variabelen
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Camera variabelen
let cameraX = 0;

// Speler object (frikandel)
const player = {
    x: 100,
    y: 400,
    width: 20,
    height: 45,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    color: '#8B4513' // Bruine kleur voor frikandel
};

// Grond en muren array
const ground = { x: 0, y: 550, width: 2000, height: 50, color: '#4ECDC4' };

// Verticale muren om overheen te springen (lager zodat je erover kunt springen)
const walls = [
    { x: 250, y: 480, width: 20, height: 70, color: '#DC143C' },
    { x: 400, y: 470, width: 20, height: 80, color: '#DC143C' },
    { x: 550, y: 485, width: 20, height: 65, color: '#DC143C' },
    { x: 700, y: 475, width: 20, height: 75, color: '#DC143C' },
    { x: 850, y: 480, width: 20, height: 70, color: '#DC143C' },
    { x: 1000, y: 470, width: 20, height: 80, color: '#DC143C' }
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

    // Teken speler als ronde frikandel
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.ellipse(
        player.x + player.width/2,
        player.y + player.height/2,
        player.width/2,
        player.height/2,
        0, 0, 2 * Math.PI
    );
    ctx.fill();

    // Voeg ogen toe aan frikandel
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + 6, player.y + 15, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 14, player.y + 15, 2.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + 6, player.y + 15, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 14, player.y + 15, 1, 0, 2 * Math.PI);
    ctx.fill();

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
