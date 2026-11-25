document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // TUNG SAHUR ESCAPE GAEM v0.5
    // Vila (v0.03) -> Fase 1 com jogabilidade/sprites do original
    // ============================================================

    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingVideo = document.getElementById('loadingVideo');
    const villageScene = document.getElementById('villageScene');
    const villageWorld = document.getElementById('villageWorld');
    const villagePlayer = document.getElementById('villagePlayer');
    const npcCarlinhos = document.getElementById('npcCarlinhos');
    const interactionPrompt = document.getElementById('interactionPrompt');

    const gameContainer = document.getElementById('gameContainer');
    const gameArea = document.getElementById('game-area');
    const gameScaler = document.getElementById('gameScaler');
    const player = document.getElementById('player');

    const dialogueBox = document.getElementById('dialogueBox');
    const dialoguePortrait = document.getElementById('dialoguePortrait');
    const dialogueName = document.getElementById('dialogueName');
    const dialogueText = document.getElementById('dialogueText');
    const dialoguePrompt = document.getElementById('dialoguePrompt');

    const gameOverScreen = document.getElementById('gameOverScreen');
    const missionCompleteScreen = document.getElementById('missionCompleteScreen');
    const continueButton = document.getElementById('continueButton');

    const freezeTimer = document.getElementById('freezeTimer');
    const levelValue = document.getElementById('levelValue');
    const appleValue = document.getElementById('appleValue');
    const stickInfo = document.getElementById('stickInfo');
    const healthBarTitle = document.getElementById('healthBarTitle');
    const healthBarFill = document.getElementById('healthBarFill');
    const modeLabel = document.getElementById('modeLabel');

    // --- Áudios ---
    const backgroundMusic = document.getElementById('backgroundMusic');
    const bossMusic = document.getElementById('bossMusic');
    const boss2Music = document.getElementById('boss2Music');
    const itemAudio = document.getElementById('itemAudio');
    const allAudio = [backgroundMusic, bossMusic, boss2Music, itemAudio];

    function tocar(audio) {
        audio.play().catch(e => console.warn('Áudio bloqueado:', e));
    }
    function parar(audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    // --- Modo de jogo ---
    const modo = new URLSearchParams(window.location.search).get('modo') === 'infinite'
        ? 'infinite'
        : 'mission';
    modeLabel.textContent = modo === 'mission' ? 'MISSÃO' : 'INFINITE MODE';

    // loading | village | playing | gameover | complete
    let phase = 'loading';

    // ============================================================
    // VILA (novidade do v0.03)
    // ============================================================
    const VILLAGE_PLAYER_SIZE = 60;
    let villageX = 0;
    let villageY = 0;
    let npcX = 0;
    let npcY = 0;
    let canInteract = false;
    let dialogueActive = false;
    let villageDialogue = 'none'; // intro | carlinhos | none

    const vKeys = {
        arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
        w: false, a: false, s: false, d: false
    };

    function positionVillage() {
        npcX = window.innerWidth / 2 + window.innerWidth * 0.15 - VILLAGE_PLAYER_SIZE / 2;
        npcY = window.innerHeight / 2 - window.innerHeight * 0.12 - VILLAGE_PLAYER_SIZE / 2;
        npcCarlinhos.style.left = npcX + 'px';
        npcCarlinhos.style.top = npcY + 'px';
        villageX = Math.max(0, Math.min(window.innerWidth - VILLAGE_PLAYER_SIZE, villageX));
        villageY = Math.max(0, Math.min(window.innerHeight - VILLAGE_PLAYER_SIZE, villageY));
        villagePlayer.style.left = villageX + 'px';
        villagePlayer.style.top = villageY + 'px';
    }

    function setupVillage() {
        villageX = window.innerWidth * 0.25 - VILLAGE_PLAYER_SIZE / 2;
        villageY = window.innerHeight / 2 - VILLAGE_PLAYER_SIZE / 2;
        positionVillage();
    }

    function checkNPCProximity() {
        const distance = Math.hypot(villageX - npcX, villageY - npcY);
        canInteract = distance < VILLAGE_PLAYER_SIZE * 2.5 && !dialogueActive;
        interactionPrompt.classList.toggle('active', canInteract);
    }

    function showVillageDialogue(type) {
        dialogueActive = true;
        villageDialogue = type;
        interactionPrompt.classList.remove('active');
        canInteract = false;
        dialogueBox.classList.remove('hidden');

        if (type === 'intro') {
            dialoguePortrait.className = 'dialogue-portrait protagonist';
            dialogueName.textContent = 'TUNG SAHUR';
            dialogueText.textContent = 'Onde estão os cavalos que sempre vejo aqui? Preciso investigar!';
            dialoguePrompt.textContent = 'APERTE X PARA CONTINUAR';
        } else {
            dialoguePortrait.className = 'dialogue-portrait carlinhos';
            dialogueName.textContent = 'CARLINHOS';
            dialogueText.textContent = 'Os skibidi toilets pegaram meus cavalos! Colete maçãs e derrote os dois chefes para resgatá-los.';
            dialoguePrompt.textContent = 'X PARA COMEÇAR A FASE 1';
        }
    }

    function advanceVillageDialogue() {
        if (!dialogueActive || phase !== 'village') return;
        dialogueActive = false;
        dialogueBox.classList.add('hidden');
        if (villageDialogue === 'carlinhos') {
            villageDialogue = 'none';
            startArena();
        } else {
            villageDialogue = 'none';
        }
    }

    function villageLoop() {
        if (phase === 'village' && !dialogueActive) {
            const speed = 5;
            if (vKeys.arrowup || vKeys.w) villageY -= speed;
            if (vKeys.arrowdown || vKeys.s) villageY += speed;
            if (vKeys.arrowleft || vKeys.a) villageX -= speed;
            if (vKeys.arrowright || vKeys.d) villageX += speed;

            villageX = Math.max(0, Math.min(window.innerWidth - VILLAGE_PLAYER_SIZE, villageX));
            villageY = Math.max(0, Math.min(window.innerHeight - VILLAGE_PLAYER_SIZE, villageY));
            villagePlayer.style.left = villageX + 'px';
            villagePlayer.style.top = villageY + 'px';
            checkNPCProximity();
        }
    }

    function startArena() {
        Object.keys(vKeys).forEach(k => { vKeys[k] = false; });
        villageScene.classList.remove('active');
        interactionPrompt.classList.remove('active');
        gameContainer.classList.add('active');
        fitGame();
        GAME_WIDTH = gameArea.offsetWidth;
        GAME_HEIGHT = gameArea.offsetHeight;
        initializeGame();
        phase = 'playing';
        startGameLoop();
        tocar(backgroundMusic);
        console.log('Fase 1 iniciada!');
    }

    window.addEventListener('resize', () => {
        if (phase === 'village') positionVillage();
        else fitGame();
    });

    // ============================================================
    // Configurações da arena (originais)
    // ============================================================
    let GAME_WIDTH = 800;
    let GAME_HEIGHT = 500;

    const PLAYER_SIZE = 50;
    let playerX = 0;
    let playerY = 0;
    let playerDirection = 'right';
    const PLAYER_SPEED = 5;

    const ENEMY_SIZE = 50;
    const ENEMY_SPEED_BASE = 1.8;
    let enemySpeed = ENEMY_SPEED_BASE;
    const enemies = [];
    const MAX_ENEMIES_PER_LEVEL = 10;

    let apple = null;
    const APPLE_SIZE = 30;
    let totalApples = 0;

    let boss = null;
    const BOSS_SIZE = 125;
    const BOSS_SPEED_BASE = 1.0;
    let bossSpeed = BOSS_SPEED_BASE;
    let isBossLevel = false;
    const FIRST_BOSS_LEVEL = 5;
    const APPLES_TO_DEFEAT_FIRST_BOSS = 5;

    let boss2 = null;
    const BOSS2_SIZE = 70;
    const BOSS2_SPEED_BASE = 1.5;
    let boss2Speed = BOSS2_SPEED_BASE;
    let isBoss2Level = false;
    const SECOND_BOSS_LEVEL = 12;
    const APPLES_TO_DEFEAT_SECOND_BOSS = 10;

    let currentBoss = null;
    let appleCountOnBossLevel = 0;

    let stickItem = null;
    const STICK_ITEM_SIZE = 30;
    let hasStickItem = false;
    let bossParalyzed = false;
    let enemiesFrozen = false;
    let freezeTimeLeft = 0;
    let freezeInterval = null;
    const PARALYZE_DURATION_MS = 5000;
    let stickUsesRemaining = 0;
    const MAX_STICK_USES = 3;

    let gameLoopInterval = null;
    let gameOver = false;
    let currentLevel = 1;

    // Arena mantém as dimensões lógicas de 800x500 do original
    function fitGame() {
        if (!gameContainer.classList.contains('active')) return;
        const scale = Math.min(
            1,
            (window.innerWidth - 30) / 800,
            (window.innerHeight - 210) / 500
        );
        const safeScale = Math.max(0.4, scale);
        gameScaler.style.width = (800 * safeScale) + 'px';
        gameScaler.style.height = (500 * safeScale) + 'px';
        gameArea.style.transform = `scale(${safeScale})`;
    }

    // ============================================================
    // Cores de fundo: apenas céu/chão e os chefes (sem sol/lua)
    // ============================================================
    function updateBackground() {
        if (isBossLevel) {
            document.body.style.backgroundColor = '#FF0000';
            gameArea.style.backgroundColor = '#8B0000';
        } else if (isBoss2Level) {
            document.body.style.backgroundColor = '#0000FF';
            gameArea.style.backgroundColor = '#00008B';
        } else {
            document.body.style.backgroundColor = '#87CEEB';
            gameArea.style.backgroundColor = '#32CD32';
        }
    }

    // ============================================================
    // Inicialização / reset da arena
    // ============================================================
    function initializeGame() {
        currentLevel = 1;
        isBossLevel = false;
        isBoss2Level = false;
        appleCountOnBossLevel = 0;
        totalApples = 0;
        bossSpeed = BOSS_SPEED_BASE;
        boss2Speed = BOSS2_SPEED_BASE;
        currentBoss = null;
        hasStickItem = false;
        bossParalyzed = false;
        stickUsesRemaining = 0;
        playerDirection = 'right';
        enemySpeed = ENEMY_SPEED_BASE;
        clearFreeze();

        playerX = Math.floor(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
        playerY = Math.floor(GAME_HEIGHT / 2 - PLAYER_SIZE / 2);
        player.style.width = PLAYER_SIZE + 'px';
        player.style.height = PLAYER_SIZE + 'px';
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';

        gameOverScreen.classList.remove('active');
        missionCompleteScreen.classList.remove('active');

        enemies.forEach(enemy => enemy.element.remove());
        enemies.length = 0;
        if (boss && boss.element) boss.element.remove();
        boss = null;
        if (boss2 && boss2.element) boss2.element.remove();
        boss2 = null;
        if (stickItem && stickItem.element) stickItem.element.remove();
        stickItem = null;
        if (apple && apple.element) apple.element.remove();
        apple = null;

        updateBackground();
        spawnEnemiesForCurrentLevel();
        spawnApple();
        updateHUD();
        gameOver = false;
    }

    // --- Movimento original: direção contínua ---
    function updatePlayerPosition() {
        let newX = playerX;
        let newY = playerY;

        switch (playerDirection) {
            case 'up': newY -= PLAYER_SPEED; break;
            case 'down': newY += PLAYER_SPEED; break;
            case 'left': newX -= PLAYER_SPEED; break;
            case 'right': newX += PLAYER_SPEED; break;
        }

        newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
        newY = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

        playerX = newX;
        playerY = newY;
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
    }

    function checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    // --- Maçã ---
    function spawnApple() {
        if (apple && apple.element) apple.element.remove();

        let appleX, appleY, collisionDetected;
        do {
            collisionDetected = false;
            appleX = Math.random() * (GAME_WIDTH - APPLE_SIZE);
            appleY = Math.random() * (GAME_HEIGHT - APPLE_SIZE);

            if (checkCollision({x: appleX, y: appleY, width: APPLE_SIZE, height: APPLE_SIZE},
                               {x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE})) {
                collisionDetected = true;
            } else {
                for (const enemy of enemies) {
                    if (checkCollision({x: appleX, y: appleY, width: APPLE_SIZE, height: APPLE_SIZE},
                                       {x: enemy.x, y: enemy.y, width: ENEMY_SIZE, height: ENEMY_SIZE})) {
                        collisionDetected = true;
                        break;
                    }
                }
                if (currentBoss && currentBoss.element &&
                    checkCollision({x: appleX, y: appleY, width: APPLE_SIZE, height: APPLE_SIZE},
                                   {x: currentBoss.x, y: currentBoss.y, width: currentBoss.width, height: currentBoss.height})) {
                    collisionDetected = true;
                }
            }
        } while (collisionDetected);

        const appleElement = document.createElement('div');
        appleElement.classList.add('apple');
        appleElement.style.width = APPLE_SIZE + 'px';
        appleElement.style.height = APPLE_SIZE + 'px';
        appleElement.style.left = appleX + 'px';
        appleElement.style.top = appleY + 'px';
        gameArea.appendChild(appleElement);
        apple = { element: appleElement, x: appleX, y: appleY };
    }

    // --- Bastão/taco: sprite original + congelamento do v0.03 ---
    function spawnStickItem() {
        if (stickItem && stickItem.element) stickItem.element.remove();
        if (hasStickItem || stickUsesRemaining >= MAX_STICK_USES) return;

        let itemX, itemY, collisionDetected;
        do {
            collisionDetected = false;
            itemX = Math.random() * (GAME_WIDTH - STICK_ITEM_SIZE);
            itemY = Math.random() * (GAME_HEIGHT - STICK_ITEM_SIZE);

            if (checkCollision({x: itemX, y: itemY, width: STICK_ITEM_SIZE, height: STICK_ITEM_SIZE},
                               {x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE})) {
                collisionDetected = true;
            } else if (apple && checkCollision({x: itemX, y: itemY, width: STICK_ITEM_SIZE, height: STICK_ITEM_SIZE},
                                               {x: apple.x, y: apple.y, width: APPLE_SIZE, height: APPLE_SIZE})) {
                collisionDetected = true;
            } else if (currentBoss && currentBoss.element &&
                       checkCollision({x: itemX, y: itemY, width: STICK_ITEM_SIZE, height: STICK_ITEM_SIZE},
                                      {x: currentBoss.x, y: currentBoss.y, width: currentBoss.width, height: currentBoss.height})) {
                collisionDetected = true;
            }
        } while (collisionDetected);

        const itemElement = document.createElement('div');
        itemElement.classList.add('item-stick');
        itemElement.style.width = STICK_ITEM_SIZE + 'px';
        itemElement.style.height = STICK_ITEM_SIZE + 'px';
        itemElement.style.left = itemX + 'px';
        itemElement.style.top = itemY + 'px';
        gameArea.appendChild(itemElement);
        stickItem = { element: itemElement, x: itemX, y: itemY };
    }

    function clearFreeze() {
        if (freezeInterval) clearInterval(freezeInterval);
        freezeInterval = null;
        enemiesFrozen = false;
        bossParalyzed = false;
        freezeTimeLeft = 0;
        freezeTimer.classList.remove('active');
        document.querySelectorAll('.frozen').forEach(el => el.classList.remove('frozen'));
    }

    function freezeAll() {
        clearFreeze();
        enemiesFrozen = true;
        bossParalyzed = true;
        freezeTimeLeft = PARALYZE_DURATION_MS / 1000;
        freezeTimer.textContent = `❄️ ${freezeTimeLeft} ❄️`;
        freezeTimer.classList.add('active');

        const targets = enemies.map(e => e.element);
        if (currentBoss && currentBoss.element) targets.push(currentBoss.element);
        targets.forEach(el => el.classList.add('frozen'));

        freezeInterval = setInterval(() => {
            freezeTimeLeft--;
            freezeTimer.textContent = `❄️ ${Math.max(0, freezeTimeLeft)} ❄️`;
            if (freezeTimeLeft <= 0) clearFreeze();
        }, 1000);
    }

    function useStickItem() {
        if (phase !== 'playing') return;
        if (!hasStickItem || enemiesFrozen || stickUsesRemaining <= 0) {
            console.log('Não é possível usar o bastão agora.');
            return;
        }
        hasStickItem = false;
        stickUsesRemaining--;
        freezeAll();
        tocar(itemAudio);
        setTimeout(() => parar(itemAudio), PARALYZE_DURATION_MS);
        console.log(`Bastão usado! Usos restantes: ${stickUsesRemaining}.`);
        updateHUD();
    }

    // --- Inimigos ---
    function createEnemy() {
        const enemyElement = document.createElement('div');
        enemyElement.classList.add('enemy');
        enemyElement.style.width = ENEMY_SIZE + 'px';
        enemyElement.style.height = ENEMY_SIZE + 'px';

        let startX, startY;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: startX = Math.random() * (GAME_WIDTH - ENEMY_SIZE); startY = -ENEMY_SIZE; break;
            case 1: startX = GAME_WIDTH; startY = Math.random() * (GAME_HEIGHT - ENEMY_SIZE); break;
            case 2: startX = Math.random() * (GAME_WIDTH - ENEMY_SIZE); startY = GAME_HEIGHT; break;
            case 3: startX = -ENEMY_SIZE; startY = Math.random() * (GAME_HEIGHT - ENEMY_SIZE); break;
        }

        enemyElement.style.left = startX + 'px';
        enemyElement.style.top = startY + 'px';
        gameArea.appendChild(enemyElement);
        enemies.push({ element: enemyElement, x: startX, y: startY });
    }

    function spawnEnemiesForCurrentLevel() {
        enemies.forEach(enemy => enemy.element.remove());
        enemies.length = 0;
        if (isBossLevel || isBoss2Level) return;

        const numEnemiesToSpawn = Math.min(currentLevel, MAX_ENEMIES_PER_LEVEL);
        for (let i = 0; i < numEnemiesToSpawn; i++) createEnemy();
        console.log(`Nível ${currentLevel} - Inimigos em campo: ${numEnemiesToSpawn}`);
    }

    function updateEnemiesPosition() {
        if (isBossLevel || isBoss2Level || enemiesFrozen) return;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                enemy.x += (dx / distance) * enemySpeed;
                enemy.y += (dy / distance) * enemySpeed;
            }
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';

            if (checkCollision({x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE},
                               {x: enemy.x, y: enemy.y, width: ENEMY_SIZE, height: ENEMY_SIZE})) {
                endGame();
                break;
            }
        }
    }

    // --- Chefões ---
    function createBoss() {
        const bossElement = document.createElement('div');
        bossElement.classList.add('boss');
        bossElement.style.width = BOSS_SIZE + 'px';
        bossElement.style.height = BOSS_SIZE + 'px';
        bossElement.style.backgroundImage = `url('../boss.webp')`;
        bossElement.style.backgroundSize = 'cover';
        bossElement.style.position = 'absolute';
        bossElement.style.zIndex = '15';

        let startX, startY;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: startX = Math.random() * (GAME_WIDTH - BOSS_SIZE); startY = -BOSS_SIZE; break;
            case 1: startX = GAME_WIDTH; startY = Math.random() * (GAME_HEIGHT - BOSS_SIZE); break;
            case 2: startX = Math.random() * (GAME_WIDTH - BOSS_SIZE); startY = GAME_HEIGHT; break;
            case 3: startX = -BOSS_SIZE; startY = Math.random() * (GAME_HEIGHT - BOSS_SIZE); break;
        }

        bossElement.style.left = startX + 'px';
        bossElement.style.top = startY + 'px';
        gameArea.appendChild(bossElement);
        boss = { element: bossElement, x: startX, y: startY, width: BOSS_SIZE, height: BOSS_SIZE };
        currentBoss = boss;
        console.log('Primeiro Boss apareceu!');
    }

    function createBoss2() {
        const boss2Element = document.createElement('div');
        boss2Element.classList.add('boss');
        boss2Element.style.width = BOSS2_SIZE + 'px';
        boss2Element.style.height = BOSS2_SIZE + 'px';
        boss2Element.style.backgroundImage = `url('../boss2.jpeg')`;
        boss2Element.style.backgroundSize = 'cover';
        boss2Element.style.position = 'absolute';
        boss2Element.style.zIndex = '15';

        let startX, startY;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: startX = Math.random() * (GAME_WIDTH - BOSS2_SIZE); startY = -BOSS2_SIZE; break;
            case 1: startX = GAME_WIDTH; startY = Math.random() * (GAME_HEIGHT - BOSS2_SIZE); break;
            case 2: startX = Math.random() * (GAME_WIDTH - BOSS2_SIZE); startY = GAME_HEIGHT; break;
            case 3: startX = -BOSS2_SIZE; startY = Math.random() * (GAME_HEIGHT - BOSS2_SIZE); break;
        }

        boss2Element.style.left = startX + 'px';
        boss2Element.style.top = startY + 'px';
        gameArea.appendChild(boss2Element);
        boss2 = { element: boss2Element, x: startX, y: startY, width: BOSS2_SIZE, height: BOSS2_SIZE };
        currentBoss = boss2;
        console.log('Segundo Boss apareceu!');
    }

    function updateBossPosition() {
        if (!currentBoss || !currentBoss.element || bossParalyzed) return;

        const dx = playerX - currentBoss.x;
        const dy = playerY - currentBoss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const speedToUse = isBossLevel ? bossSpeed : boss2Speed;
            currentBoss.x += (dx / distance) * speedToUse;
            currentBoss.y += (dy / distance) * speedToUse;
        }
        currentBoss.element.style.left = currentBoss.x + 'px';
        currentBoss.element.style.top = currentBoss.y + 'px';

        if (checkCollision({x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE},
                           {x: currentBoss.x, y: currentBoss.y, width: currentBoss.width, height: currentBoss.height})) {
            endGame();
        }
    }

    // --- HUD ---
    function updateHUD() {
        levelValue.textContent = currentLevel;
        appleValue.textContent = totalApples;
        stickInfo.textContent = `BASTÃO: ${hasStickItem ? 'PRONTO (F)' : stickUsesRemaining + ' usos'}`;

        if (isBossLevel || isBoss2Level) {
            const needed = isBossLevel ? APPLES_TO_DEFEAT_FIRST_BOSS : APPLES_TO_DEFEAT_SECOND_BOSS;
            healthBarTitle.textContent = isBossLevel
                ? 'CHEFE 1 — TUNG SAHUR'
                : 'CHEFE 2 — SKIBIDI TOILET';
            healthBarFill.style.width = Math.max(0, ((needed - appleCountOnBossLevel) / needed) * 100) + '%';
        } else {
            healthBarTitle.textContent = 'GANGUE DE SKIBIDI TOILETS';
            healthBarFill.style.width = Math.max(20, 100 - currentLevel * 4) + '%';
        }
    }

    // --- Fim de jogo / missão completa ---
    function stopAllMusic() {
        allAudio.forEach(parar);
    }

    function endGame() {
        if (gameOver) return;
        gameOver = true;
        phase = 'gameover';
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
        clearFreeze();
        gameOverScreen.classList.add('active');
        stopAllMusic();
        console.log('Game Over!');
    }

    function restartGame() {
        stopAllMusic();
        gameOver = false;
        phase = 'playing';
        initializeGame();
        startGameLoop();
        tocar(backgroundMusic);
    }

    function missionComplete() {
        phase = 'complete';
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
        clearFreeze();
        stopAllMusic();
        missionCompleteScreen.classList.add('active');
    }

    // Após morrer, qualquer tecla ou clique reinicia no nível 1
    function resetOnInput() {
        if (phase === 'gameover') {
            restartGame();
            return true;
        }
        return false;
    }

    function continueInfinite() {
        modeLabel.textContent = 'INFINITE MODE';
        missionCompleteScreen.classList.remove('active');
        phase = 'playing';
        startGameLoop();
        tocar(backgroundMusic);
    }

    // --- Loop da arena ---
    function gameLoop() {
        if (gameOver || phase !== 'playing') return;

        updatePlayerPosition();
        updateBackground();

        if (isBossLevel || isBoss2Level) {
            updateBossPosition();
            if (stickItem && !hasStickItem &&
                checkCollision({x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE},
                               {x: stickItem.x, y: stickItem.y, width: STICK_ITEM_SIZE, height: STICK_ITEM_SIZE})) {
                stickItem.element.remove();
                stickItem = null;
                hasStickItem = true;
                console.log('Bastão coletado! Pressione F para congelar tudo.');
                updateHUD();
            }
        } else {
            updateEnemiesPosition();
        }

        if (apple && checkCollision({x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE},
                                   {x: apple.x, y: apple.y, width: APPLE_SIZE, height: APPLE_SIZE})) {
            apple.element.remove();
            apple = null;
            totalApples++;

            if (isBossLevel || isBoss2Level) {
                appleCountOnBossLevel++;
                const applesNeeded = isBossLevel ? APPLES_TO_DEFEAT_FIRST_BOSS : APPLES_TO_DEFEAT_SECOND_BOSS;

                if (isBossLevel) {
                    bossSpeed += 0.5;
                    console.log(`Maçã no Boss 1! Velocidade ${bossSpeed.toFixed(1)}. ${appleCountOnBossLevel}/${applesNeeded}`);
                } else {
                    boss2Speed += 0.5;
                    console.log(`Maçã no Boss 2! Velocidade ${boss2Speed.toFixed(1)}. ${appleCountOnBossLevel}/${applesNeeded}`);
                }

                if (appleCountOnBossLevel >= applesNeeded) {
                    console.log('Boss derrotado!');
                    if (currentBoss && currentBoss.element) {
                        currentBoss.element.remove();
                        currentBoss = null;
                    }
                    const defeatedSecondBoss = isBoss2Level;
                    isBossLevel = false;
                    isBoss2Level = false;
                    currentLevel = defeatedSecondBoss ? SECOND_BOSS_LEVEL + 1 : FIRST_BOSS_LEVEL + 1;
                    appleCountOnBossLevel = 0;
                    bossSpeed = BOSS_SPEED_BASE;
                    boss2Speed = BOSS2_SPEED_BASE;
                    hasStickItem = false;
                    stickUsesRemaining = MAX_STICK_USES;
                    clearFreeze();
                    if (stickItem && stickItem.element) stickItem.element.remove();
                    stickItem = null;

                    parar(bossMusic);
                    parar(boss2Music);
                    tocar(backgroundMusic);
                    updateBackground();
                    spawnEnemiesForCurrentLevel();
                    spawnApple();

                    if (defeatedSecondBoss && modo === 'mission') {
                        missionComplete();
                        return;
                    }
                } else {
                    spawnApple();
                    if (!hasStickItem && !stickItem && stickUsesRemaining < MAX_STICK_USES) spawnStickItem();
                }
            } else {
                currentLevel++;
                console.log(`Você subiu para o Nível ${currentLevel}!`);

                // v0.03: inimigos aceleram nos primeiros níveis
                enemySpeed = ENEMY_SPEED_BASE + Math.min(currentLevel, 5) * 0.5;
                if (enemySpeed > PLAYER_SPEED - 0.7) enemySpeed = PLAYER_SPEED - 0.7;

                if (currentLevel === FIRST_BOSS_LEVEL) {
                    isBossLevel = true;
                    isBoss2Level = false;
                    appleCountOnBossLevel = 0;
                    bossSpeed = BOSS_SPEED_BASE;
                    hasStickItem = false;
                    stickUsesRemaining = MAX_STICK_USES;
                    if (stickItem && stickItem.element) stickItem.element.remove();
                    stickItem = null;

                    parar(backgroundMusic);
                    tocar(bossMusic);
                    spawnEnemiesForCurrentLevel();
                    createBoss();
                    spawnApple();
                    spawnStickItem();
                } else if (currentLevel === SECOND_BOSS_LEVEL) {
                    isBossLevel = false;
                    isBoss2Level = true;
                    appleCountOnBossLevel = 0;
                    boss2Speed = BOSS2_SPEED_BASE;
                    hasStickItem = false;
                    stickUsesRemaining = MAX_STICK_USES;
                    if (stickItem && stickItem.element) stickItem.element.remove();
                    stickItem = null;

                    parar(backgroundMusic);
                    tocar(boss2Music);
                    spawnEnemiesForCurrentLevel();
                    createBoss2();
                    spawnApple();
                    spawnStickItem();
                } else {
                    spawnEnemiesForCurrentLevel();
                    spawnApple();
                }
            }
            updateHUD();
        }
    }

    function startGameLoop() {
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(gameLoop, 1000 / 60);
    }

    // --- Controles ---
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if (phase === 'village') {
            if (key === 'x' || key === 'enter' || key === ' ') {
                e.preventDefault();
                if (dialogueActive) advanceVillageDialogue();
                else if (canInteract) showVillageDialogue('carlinhos');
                return;
            }
            if (!dialogueActive && key in vKeys) vKeys[key] = true;
            return;
        }

        if (e.repeat) return;
        if (resetOnInput()) return;
        if (phase !== 'playing') return;

        switch (e.key) {
            case 'ArrowUp': case 'w': playerDirection = 'up'; break;
            case 'ArrowDown': case 's': playerDirection = 'down'; break;
            case 'ArrowLeft': case 'a': playerDirection = 'left'; break;
            case 'ArrowRight': case 'd': playerDirection = 'right'; break;
            case 'f': useStickItem(); break;
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in vKeys) vKeys[key] = false;
    });

    dialogueBox.addEventListener('click', () => {
        if (phase === 'village') advanceVillageDialogue();
    });
    continueButton.addEventListener('click', continueInfinite);

    document.addEventListener('click', () => resetOnInput());

    // --- Loading inicial ---
    loadingVideo.play().catch(() => {});
    const LOADING_DURATION = 4500;
    const startTime = Date.now();

    const loadingInterval = setInterval(() => {
        const progress = Math.min(((Date.now() - startTime) / LOADING_DURATION) * 100, 100);
        loadingBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingVideo.pause();
                villageScene.classList.add('active');
                phase = 'village';
                setupVillage();
                showVillageDialogue('intro');
            }, 300);
        }
    }, 50);

    loadingVideo.addEventListener('ended', () => {
        if (!loadingScreen.classList.contains('hidden')) {
            loadingVideo.currentTime = 0;
            loadingVideo.play().catch(() => {});
        }
    });

    setInterval(villageLoop, 1000 / 60);
});
