class Game {
    constructor() {
        this.bf = new Battlefield('battlefield');
        this.running = false;

        // Game State
        this.lastTime = 0;
        this.gameTime = 0; // Virtual game time
        this.gold = 100;

        // Settings
        this.speed = 1; // x1, x2, x4
        this.infiniteGold = false;
        this.difficulty = 'EXTREME';
        // Economy
        this.incomeInterval = 1000; // 1 second
        this.lastIncomeTime = 0;
        this.passiveIncome = 5;

        // AI
        this.aiInterval = 2000;
        this.lastAiTime = 0;

        // UI Elements
        this.setupScreen = document.getElementById('setup-screen');
        this.battleScreen = document.getElementById('battle-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.redCountEl = document.getElementById('red-count');
        this.blueCountEl = document.getElementById('blue-count');
        this.winnerText = document.getElementById('winner-text');

        // Add Gold Element dynamically if not exists (Plan said modify index.html but we can also inject/grab here)
        // We need to modify index.html to add #gold-display
        this.goldEl = document.getElementById('gold-display');

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());

        // Mouse Interaction (removed random spawn, click to interact maybe?)
        // this.bf.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));
        this.bf.canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Loop binding
        this.animate = this.animate.bind(this);
    }

    start() {
        // Reset Logic
        this.bf.units = [];
        this.bf.projectiles = [];
        this.bf.explosions = [];
        this.bf.bases = [];

        // Init Bases
        // Blue (Left), Red (Right)
        this.baseBlue = new Base(TEAM_BLUE, 100, BASE_STATS.Y_POSITION);
        this.baseRed = new Base(TEAM_RED, 1100, BASE_STATS.Y_POSITION);

        this.bf.addBase(this.baseBlue);
        this.bf.addBase(this.baseRed);

        // Reset Gold based on setting (or default)
        this.gold = this.infiniteGold ? 999999 : 100;

        this.setupScreen.classList.remove('active');
        this.battleScreen.classList.add('active');
        this.victoryScreen.classList.remove('active');

        this.running = true;
        this.lastTime = performance.now();
        this.gameTime = 0;
        this.lastIncomeTime = 0;
        this.lastAiTime = 0;

        requestAnimationFrame(this.animate);
        if (soundManager.ctx.state === 'suspended') soundManager.ctx.resume();
    }

    reset() {
        this.running = false;
        this.setupScreen.classList.add('active');
        this.battleScreen.classList.remove('active');
        this.victoryScreen.classList.remove('active');
    }

    // Settings
    setSpeed(speed) {
        this.speed = speed;
        // Visual update would be handled by UI calling this, or we update UI here
    }

    setInfiniteGold(enable) {
        this.infiniteGold = enable;
        // Only set Player Gold
        if (this.infiniteGold) {
            this.gold = 999999;
        } else {
            if (this.gold > 999999) this.gold = 100;
        }
        this.updateUI();
    }

    // Called by UI buttons
    buyUnit(type) {
        if (!this.running) return;

        const cost = UNIT_COSTS[type];
        if (this.gold >= cost) {
            if (!this.infiniteGold) {
                this.gold -= cost;
            }
            this.spawnUnit(type, TEAM_BLUE);
            this.updateUI();
        } else {
            // Feedback for not enough gold
            console.log("Not enough gold!");
        }
    }

    buyTurret() {
        if (!this.running) return;

        if (this.gold >= TURRET_COST) {
            // Try to add to Blue Base
            if (this.baseBlue.addTurret()) {
                if (!this.infiniteGold) {
                    this.gold -= TURRET_COST;
                }
                this.updateUI();

                // Wire up callback for new Turret
                const newTurret = this.baseBlue.turrets[this.baseBlue.turrets.length - 1];
                this.setupUnitCallbacks(newTurret); // Re-use unit callback (shoot)

            } else {
                console.log("No turret slots available!");
            }
        } else {
            console.log("Not enough gold for turret!");
        }
    }

    spawnUnit(type, team) {
        // Spawn at Base
        const base = team === TEAM_BLUE ? this.baseBlue : this.baseRed;
        const x = base.x + (team === TEAM_BLUE ? 60 : -60);
        const y = base.y; // Ground level

        const unit = new Unit(performance.now() + Math.random(), type, team, x, y);
        this.setupUnitCallbacks(unit);
        this.bf.addUnit(unit);
        if (team === TEAM_BLUE) soundManager.playMove();
    }

    setupUnitCallbacks(unit) {
        unit.onShoot = (attacker, target) => {
            // Target can be Unit or Base
            // If target has x,y, likely Unit. specific handling in Projectile might be needed if Base logic differs
            this.bf.projectiles.push(new Projectile(attacker.x, attacker.y, target.x, target.y, attacker.type));
            soundManager.playShoot(attacker.type);
            target.takeDamage(attacker.damage);
        };
    }

    updateUI() {
        this.redCountEl.textContent = this.bf.units.filter(u => u.team === TEAM_RED && !u.isDead).length;
        this.blueCountEl.textContent = this.bf.units.filter(u => u.team === TEAM_BLUE && !u.isDead).length;

        if (this.goldEl) {
            this.goldEl.textContent = this.infiniteGold ? "GOLD: ∞" : `GOLD: ${Math.floor(this.gold)}`;
        }
    }

    animate(realTime) {
        if (!this.running) return;

        // Decouple Logic Loop
        // We run the logic X times per frame depending on speed
        // Basic step is 16.6ms (60fps)
        const step = 1000 / 60;

        for (let i = 0; i < this.speed; i++) {
            this.gameTime += step;
            this.updateLogic(this.gameTime);
        }

        // Draw once per frame
        this.bf.draw();
        this.updateUI();

        requestAnimationFrame(this.animate);
    }

    updateLogic(time) {
        // Economy
        if (time - this.lastIncomeTime > this.incomeInterval) {
            if (!this.infiniteGold) {
                this.gold += this.passiveIncome;
            }
            this.lastIncomeTime = time;
        }

        // AI Logic
        if (time - this.lastAiTime > this.aiInterval) {
            // Difficulty Logic
            let chance = 0.3; // Normal
            let baseInterval = 2000;
            let intervalOffset = 2000;

            if (this.infiniteGold) {
                // Chaos Mode: Continuous spawning
                chance = 0.9;
                baseInterval = 300;
                intervalOffset = 200;
            } else {
                if (this.difficulty === 'HARD') {
                    chance = 0.4;
                    baseInterval = 1500;
                } else if (this.difficulty === 'EXTREME') {
                    chance = 0.5;
                    baseInterval = 1000;
                }
            }

            if (Math.random() < chance) {
                const types = Object.values(UNIT_TYPES);
                const type = types[Math.floor(Math.random() * types.length)];
                this.spawnUnit(type, TEAM_RED);
            }

            this.lastAiTime = time;
            this.aiInterval = baseInterval + Math.random() * intervalOffset;
        }

        // 1. Update Units
        const redUnits = this.bf.units.filter(u => u.team === TEAM_RED && !u.isDead);
        const blueUnits = this.bf.units.filter(u => u.team === TEAM_BLUE && !u.isDead);

        // Include Bases in targets
        // Blue units target Red Units OR Red Base
        // Red units target Blue Units OR Blue Base

        this.bf.units.forEach(unit => {
            const enemies = unit.team === TEAM_RED ? blueUnits : redUnits;
            const enemyBase = unit.team === TEAM_RED ? this.baseBlue : this.baseRed;

            unit.update(time, enemies, enemyBase);
        });

        // Update Bases (Turrets)
        this.baseBlue.update(time, redUnits);
        this.baseRed.update(time, blueUnits);

        // 2. Update Projectiles
        for (let i = this.bf.projectiles.length - 1; i >= 0; i--) {
            const p = this.bf.projectiles[i];
            p.update();
            if (p.finished) {
                this.bf.explosions.push(new Explosion(p.targetX, p.targetY));
                soundManager.playHit();
                this.bf.projectiles.splice(i, 1);
            }
        }

        // 3. Update Explosions
        for (let i = this.bf.explosions.length - 1; i >= 0; i--) {
            const e = this.bf.explosions[i];
            e.update();
            if (e.life <= 0) {
                this.bf.explosions.splice(i, 1);
            }
        }

        // 4. Cleanup Dead
        this.bf.removeDeadUnits();

        // Remove Dead Bases? No, dead base = Game Over.

        // 5. Stats & Victory
        // updateUI is called once per frame in animate

        if (this.baseBlue.isDead()) {
            this.endGame("RED");
            return;
        } else if (this.baseRed.isDead()) {
            this.endGame("BLUE");
            return;
        }
    }

    endGame(winner) {
        this.running = false;
        const color = winner === "RED" ? "#FF4444" : "#4488FF";
        this.winnerText.innerHTML = `VICTORY: <span style="color:${color}">${winner}</span>`;
        this.victoryScreen.classList.add('active');
    }
}
