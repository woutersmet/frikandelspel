// Game canvas en context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sound system
const sounds = {
    walking: new Audio('geluid_lopen.m4a'),
    jumping: new Audio('geluid_springen.m4a'),
    death: new Audio('geluid_dood.mp3'),
    levelComplete: new Audio('geluid_level_gedaan.mp3')
};

// Configure sound settings
sounds.walking.loop = true;
sounds.walking.volume = 0.3;
sounds.jumping.volume = 0.5;
sounds.death.volume = 0.7;
sounds.levelComplete.volume = 0.8;

// Sound state tracking
let isWalkingSoundPlaying = false;
let soundEnabled = true;

// Sound helper functions
function playSound(soundName) {
    if (!soundEnabled) return;
    try {
        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // Reset to beginning
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
}

function stopSound(soundName) {
    try {
        const sound = sounds[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    } catch (e) {
        console.log('Sound stop error:', e);
    }
}

function playWalkingSound() {
    if (!soundEnabled) return;
    if (!isWalkingSoundPlaying) {
        isWalkingSoundPlaying = true;
        sounds.walking.play().catch(e => console.log('Walking sound failed:', e));
    }
}

function stopWalkingSound() {
    if (isWalkingSoundPlaying) {
        isWalkingSoundPlaying = false;
        sounds.walking.pause();
        sounds.walking.currentTime = 0;
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
        // Stop all currently playing sounds
        stopWalkingSound();
        Object.keys(sounds).forEach(soundName => {
            if (soundName !== 'walking') {
                stopSound(soundName);
            }
        });
    }
}

// Game variabelen
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Camera variabelen
let cameraX = 0;

// Level systeem
let currentLevel = 1;
let levelComplete = false;

// Speler object (frikandel)
const player = {
    x: 100,
    y: 400,
    width: 20,
    height: 45,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    color: '#9069caff', // Bruine kleur voor frikandel
    isDrogeWorst: false // Easter egg state
};

// Level data
const levels = {
    1: {
        ground: { x: 0, y: 550, width: 1400, height: 50, color: '#4ECDC4' },
        walls: [
            { x: 250, y: 480, width: 20, height: 70, color: '#DC143C' },
            { x: 400, y: 470, width: 20, height: 80, color: '#DC143C' },
            { x: 550, y: 485, width: 20, height: 65, color: '#DC143C' },
            { x: 700, y: 475, width: 20, height: 75, color: '#DC143C' },
            { x: 850, y: 480, width: 20, height: 70, color: '#DC143C' },
            { x: 1000, y: 470, width: 20, height: 80, color: '#DC143C' }
        ],
        platforms: [],
        door: { x: 1300, y: 480, width: 40, height: 70, color: '#8B4513' },
        lasers: []
    },
    2: {
        ground: { x: 0, y: 550, width: 2000, height: 50, color: '#4ECDC4' },
        walls: [
            { x: 200, y: 480, width: 20, height: 70, color: '#DC143C' },
            { x: 450, y: 470, width: 20, height: 80, color: '#DC143C' },
            { x: 700, y: 485, width: 20, height: 65, color: '#DC143C' },
            { x: 950, y: 475, width: 20, height: 75, color: '#DC143C' },
            { x: 1200, y: 480, width: 20, height: 70, color: '#DC143C' },
            { x: 1450, y: 470, width: 20, height: 80, color: '#DC143C' }
        ],
        platforms: [],
        door: { x: 1850, y: 480, width: 40, height: 70, color: '#8B4513' },
        lasers: [
            { x: 300, active: false, timer: 0, interval: 120 },
            { x: 500, active: false, timer: 60, interval: 120 },
            { x: 800, active: false, timer: 30, interval: 120 },
            { x: 1100, active: false, timer: 90, interval: 120 },
            { x: 1350, active: false, timer: 45, interval: 120 }
        ]
    },
    3: {
        ground: { x: 0, y: 550, width: 2400, height: 50, color: '#4ECDC4' },
        walls: [
            { x: 300, y: 480, width: 20, height: 70, color: '#DC143C' },
            { x: 800, y: 470, width: 20, height: 80, color: '#DC143C' },
            { x: 1400, y: 485, width: 20, height: 65, color: '#DC143C' }
        ],
        platforms: [
            { x: 200, y: 450, width: 120, height: 20, color: '#45B7D1' },
            { x: 450, y: 380, width: 150, height: 20, color: '#45B7D1' },
            { x: 700, y: 320, width: 140, height: 20, color: '#45B7D1' },
            { x: 950, y: 250, width: 160, height: 20, color: '#45B7D1' },
            { x: 1200, y: 180, width: 150, height: 20, color: '#45B7D1' },
            { x: 1500, y: 300, width: 140, height: 20, color: '#45B7D1' },
            { x: 1800, y: 200, width: 120, height: 20, color: '#45B7D1' },
            // Extra platforms aan het einde voor meer sprongmogelijkheden
            { x: 1950, y: 350, width: 100, height: 20, color: '#45B7D1' },
            { x: 2080, y: 280, width: 120, height: 20, color: '#45B7D1' },
            { x: 1920, y: 150, width: 100, height: 20, color: '#45B7D1' },
            { x: 2050, y: 100, width: 140, height: 20, color: '#45B7D1' },
            { x: 1750, y: 80, width: 100, height: 20, color: '#45B7D1' },
            // Platforms dichter bij de grond voor gemakkelijke toegang
            { x: 1650, y: 480, width: 120, height: 20, color: '#45B7D1' },
            { x: 1850, y: 420, width: 100, height: 20, color: '#45B7D1' },
            { x: 2000, y: 460, width: 110, height: 20, color: '#45B7D1' },
            { x: 2150, y: 400, width: 100, height: 20, color: '#45B7D1' },
            { x: 2280, y: 350, width: 100, height: 20, color: '#45B7D1' }
        ],
        door: { x: 2080, y: 30, width: 40, height: 70, color: '#8B4513' }, // Op het hoogste nieuwe platform
        lasers: [
            { x: 350, active: false, timer: 0, interval: 150 },
            { x: 650, active: false, timer: 75, interval: 150 },
            { x: 1100, active: false, timer: 50, interval: 150 }
        ]
    }
};

// Huidige level data
let ground = levels[currentLevel].ground;
let walls = levels[currentLevel].walls;
let platforms = levels[currentLevel].platforms;
let door = levels[currentLevel].door;
let lasers = levels[currentLevel].lasers;

// Input handling
const keys = {};

// Konami code easter egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiSequence = [];
let konamiActivated = false;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Check for Konami code sequence
    if (!konamiActivated) {
        konamiSequence.push(e.code);

        // Keep only the last 10 keys
        if (konamiSequence.length > konamiCode.length) {
            konamiSequence.shift();
        }

        // Check if sequence matches Konami code
        if (konamiSequence.length === konamiCode.length) {
            let matches = true;
            for (let i = 0; i < konamiCode.length; i++) {
                if (konamiSequence[i] !== konamiCode[i]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                konamiActivated = true;
                player.isDrogeWorst = true;
                player.color = '#8B4513'; // Darker brown for droge worst
                console.log('🌭➡️🥩 KONAMI CODE ACTIVATED! Frikandel transformed into Droge Worst!');
            }
        }
    }

    // Reset easter egg with R key
    if (e.code === 'KeyR' && konamiActivated) {
        konamiActivated = false;
        player.isDrogeWorst = false;
        player.color = '#9069caff'; // Reset to original frikandel color
        konamiSequence = [];
        console.log('🥩➡️🌭 Easter egg reset! Back to normal frikandel!');
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Mouse click handling for sound button
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Sound button area (top right corner)
    const buttonX = canvas.width - 50;
    const buttonY = 10;
    const buttonSize = 35;

    if (x >= buttonX && x <= buttonX + buttonSize &&
        y >= buttonY && y <= buttonY + buttonSize) {
        toggleSound();
    }
});

// Mouse move handling for cursor change
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Sound button area (top right corner)
    const buttonX = canvas.width - 50;
    const buttonY = 10;
    const buttonSize = 35;

    if (x >= buttonX && x <= buttonX + buttonSize &&
        y >= buttonY && y <= buttonY + buttonSize) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Level management
function loadLevel(levelNum) {
    // Stop all sounds when loading new level
    stopWalkingSound();

    console.log(`Loading level ${levelNum}`);
    currentLevel = levelNum;
    ground = levels[currentLevel].ground;
    walls = levels[currentLevel].walls;
    platforms = levels[currentLevel].platforms;
    door = levels[currentLevel].door;
    lasers = levels[currentLevel].lasers;

    // Reset speler positie
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    cameraX = 0;
    levelComplete = false;
    console.log(`Level ${currentLevel} loaded successfully`);
}

// Update lasers (voor level 2 en 3)
function updateLasers() {
    if (currentLevel !== 2 && currentLevel !== 3) return;

    lasers.forEach(laser => {
        laser.timer++;
        if (laser.timer >= laser.interval) {
            laser.active = !laser.active;
            laser.timer = 0;
        }
    });
}

// Update speler positie en physics
function updatePlayer() {
    // Horizontale beweging
    let isMoving = false;
    if (keys['ArrowLeft']) {
        player.velocityX = -MOVE_SPEED;
        isMoving = true;
    } else if (keys['ArrowRight']) {
        player.velocityX = MOVE_SPEED;
        isMoving = true;
    } else {
        player.velocityX *= 0.8; // Wrijving
    }

    // Walking sound management
    if (isMoving && player.onGround && Math.abs(player.velocityX) > 1) {
        playWalkingSound();
    } else {
        stopWalkingSound();
    }

    // Springen
    if (keys['Space'] && player.onGround) {
        player.velocityY = JUMP_FORCE;
        player.onGround = false;
        // playSound('jumping');
        stopWalkingSound(); // Stop walking sound when jumping
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

    // Collision detection met platforms
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Van boven op platform landen
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Van onder tegen platform
            else if (player.velocityY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Van links tegen platform
            else if (player.velocityX > 0 && player.x < platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            // Van rechts tegen platform
            else if (player.velocityX < 0 && player.x > platform.x) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });

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
    
    // Check collision met deurtje
    if (checkCollision(player, door)) {
        // playSound('levelComplete');
        stopWalkingSound();
        if (currentLevel < 3) {
            const nextLevel = currentLevel + 1;
            console.log(`Level ${currentLevel} completed! Moving to level ${nextLevel}`);
            setTimeout(() => {
                loadLevel(nextLevel);
            }, 500); // Small delay to let sound play
        } else {
            // Spel gewonnen!
            levelComplete = true;
        }
    }

    // Check collision met actieve lasers (level 2 en 3)
    if (currentLevel === 2 || currentLevel === 3) {
        lasers.forEach(laser => {
            if (laser.active) {
                const laserRect = { x: laser.x, y: 0, width: 10, height: 550 };
                if (checkCollision(player, laserRect)) {
                    // Play death sound and stop walking
                    // playSound('death');
                    stopWalkingSound();

                    // Reset naar begin van level
                    player.x = 100;
                    player.y = 400;
                    player.velocityX = 0;
                    player.velocityY = 0;
                    cameraX = 0;
                }
            }
        });
    }

    // Als speler valt, reset positie
    if (player.y > canvas.height) {
        // playSound('death');
        stopWalkingSound();
        player.x = 100;
        player.y = 400;
        player.velocityX = 0;
        player.velocityY = 0;
        cameraX = 0;
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

    // Teken platforms (alleen die zichtbaar zijn)
    platforms.forEach(platform => {
        if (platform.x + platform.width > cameraX && platform.x < cameraX + canvas.width) {
            // Voeg wat schaduw toe
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(platform.x + 2, platform.y + 2, platform.width, platform.height);

            // Teken het platform
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    });

    // Teken deurtje
    if (door.x + door.width > cameraX && door.x < cameraX + canvas.width) {
        // Schaduw
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(door.x + 2, door.y + 2, door.width, door.height);

        // Deur
        ctx.fillStyle = door.color;
        ctx.fillRect(door.x, door.y, door.width, door.height);

        // Deurknop
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(door.x + door.width - 8, door.y + door.height/2, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Teken lasers (level 2 en 3)
    if (currentLevel === 2 || currentLevel === 3) {
        lasers.forEach(laser => {
            if (laser.x + 10 > cameraX && laser.x < cameraX + canvas.width) {
                if (laser.active) {
                    // Actieve laser - rood
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(laser.x, 0, 10, 550);

                    // Laser glow effect
                    ctx.fillStyle = 'rgba(255,0,0,0.3)';
                    ctx.fillRect(laser.x - 5, 0, 20, 550);
                } else {
                    // Inactieve laser - donkerrood
                    ctx.fillStyle = '#800000';
                    ctx.fillRect(laser.x + 3, 0, 4, 550);
                }
            }
        });
    }

    // Teken speler als frikandel of droge worst
    if (player.isDrogeWorst) {
        // Teken droge worst (meer rechthoekig en donkerder)
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Voeg textuur toe aan droge worst
        ctx.fillStyle = '#654321';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(player.x + 2, player.y + 5 + i * 12, player.width - 4, 2);
        }

        // Voeg ogen toe aan droge worst (meer vierkant)
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 4, player.y + 12, 4, 4);
        ctx.fillRect(player.x + 12, player.y + 12, 4, 4);

        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 5, player.y + 13, 2, 2);
        ctx.fillRect(player.x + 13, player.y + 13, 2, 2);

        // Voeg "DROGE WORST" label toe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DROGE WORST', player.x + player.width/2, player.y - 5);
        ctx.textAlign = 'left';
    } else {
        // Teken normale ronde frikandel
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
    }

    // Restore context
    ctx.restore();

    // Teken level info
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level ${currentLevel}`, 20, 30);

    // Teken sound toggle button (top right corner)
    const buttonX = canvas.width - 50;
    const buttonY = 10;
    const buttonSize = 35;

    // Button background
    ctx.fillStyle = soundEnabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);

    // Button border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);

    // Sound icon
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    if (soundEnabled) {
        ctx.fillText('🔊', buttonX + buttonSize/2, buttonY + buttonSize/2 + 7);
    } else {
        ctx.fillText('🔇', buttonX + buttonSize/2, buttonY + buttonSize/2 + 7);
    }
    ctx.textAlign = 'left'; // Reset text alignment

    // Teken easter egg status
    if (player.isDrogeWorst) {
        ctx.fillStyle = '#FFD700'; // Gouden kleur voor easter egg
        ctx.font = '16px Arial';
        ctx.fillText('🥩 DROGE WORST MODE! 🥩', 20, 60);
    }

    if (levelComplete && currentLevel === 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 GEFELICITEERD! 🎉', canvas.width/2, canvas.height/2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Je hebt alle levels voltooid!', canvas.width/2, canvas.height/2 + 20);
        ctx.textAlign = 'left';
    }
}

// Game loop
function gameLoop() {
    updateLasers();
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start het spel
gameLoop();
