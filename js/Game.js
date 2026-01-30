class Game {
    constructor() {
        this.bf = new Battlefield('battlefield');
        this.round = 1;
        this.phase = PHASES.RED_MOVE;
        this.running = false;
        this.isAuto = false;
        this.processingPhase = false;

        // UI
        this.setupScreen = document.getElementById('setup-screen');
        this.battleScreen = document.getElementById('battle-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.redCountEl = document.getElementById('red-count');
        this.blueCountEl = document.getElementById('blue-count');
        this.roundEl = document.getElementById('round-counter');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.winnerText = document.getElementById('winner-text');

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('next-turn-btn').addEventListener('click', () => this.triggerNextPhaseByUser());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());

        this.autoBtn = document.getElementById('auto-btn');
        this.autoBtn.addEventListener('click', () => this.toggleAuto());

        // Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    toggleAuto() {
        this.isAuto = !this.isAuto;
        this.autoBtn.textContent = this.isAuto ? "AUTO: ON" : "AUTO: OFF";
        this.autoBtn.style.background = this.isAuto ? "linear-gradient(135deg, #44FF44, #22AA22)" : "#555";

        if (this.isAuto && !this.processingPhase) {
            // Resume context if needed
            if (soundManager.ctx.state === 'suspended') soundManager.ctx.resume();
            this.nextPhase();
        }
    }

    start() {
        const redSize = parseInt(document.getElementById('red-size').value);
        const blueSize = parseInt(document.getElementById('blue-size').value);

        this.spawnArmy(TEAM_RED, redSize);
        this.spawnArmy(TEAM_BLUE, blueSize);

        this.updateStats();

        this.setupScreen.classList.remove('active');
        this.battleScreen.classList.add('active');
        this.victoryScreen.classList.remove('active');
        this.running = true;
        this.round = 1;
        this.phase = PHASES.RED_MOVE;
        this.updateUI();

        if (this.isAuto) {
            if (soundManager.ctx.state === 'suspended') soundManager.ctx.resume();
            this.nextPhase();
        }
    }

    reset() {
        this.bf.units = [];
        this.bf.projectiles = [];
        this.bf.explosions = [];
        this.running = false;
        this.processingPhase = false;

        this.setupScreen.classList.add('active');
        this.battleScreen.classList.remove('active');
        this.victoryScreen.classList.remove('active');
    }

    spawnArmy(team, size) {
        for (let i = 0; i < size; i++) {
            const types = Object.values(UNIT_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];

            const minX = team === TEAM_RED ? 50 : 950;
            const maxX = team === TEAM_RED ? 250 : 1150;
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * (this.bf.height - 100) + 50;

            this.bf.addUnit(new Unit(i, type, team, x, y));
        }
    }

    updateStats() {
        this.redCountEl.textContent = this.bf.units.filter(u => u.team === TEAM_RED && !u.isDead).length;
        this.blueCountEl.textContent = this.bf.units.filter(u => u.team === TEAM_BLUE && !u.isDead).length;
    }

    updateUI() {
        this.roundEl.textContent = this.round;
        this.turnIndicator.textContent = this.phase;

        if (this.phase.startsWith('BLUE')) {
            this.turnIndicator.classList.add('blue');
        } else {
            this.turnIndicator.classList.remove('blue');
        }
    }

    checkVictory() {
        const redAlive = this.bf.units.some(u => u.team === TEAM_RED && !u.isDead);
        const blueAlive = this.bf.units.some(u => u.team === TEAM_BLUE && !u.isDead);

        if (!redAlive) {
            this.endGame("BLUE");
            return true;
        } else if (!blueAlive) {
            this.endGame("RED");
            return true;
        }
        return false;
    }

    endGame(winner) {
        this.running = false;
        this.isAuto = false;
        this.autoBtn.textContent = "AUTO: OFF";
        this.autoBtn.style.background = "#555";

        const color = winner === "RED" ? "#FF4444" : "#4488FF";
        this.winnerText.innerHTML = `VICTORY: <span style="color:${color}">${winner}</span>`;
        this.victoryScreen.classList.add('active');
    }

    triggerNextPhaseByUser() {
        if (!this.processingPhase && this.running && !this.isAuto) {
            this.nextPhase();
        }
    }

    async nextPhase() {
        if (this.processingPhase || !this.running) return;
        this.processingPhase = true;

        await this.executePhase();

        if (!this.running) return; // Game over check

        // Advance phase
        switch (this.phase) {
            case PHASES.RED_MOVE:
                this.phase = PHASES.RED_ATTACK;
                break;
            case PHASES.RED_ATTACK:
                this.phase = PHASES.BLUE_MOVE;
                break;
            case PHASES.BLUE_MOVE:
                this.phase = PHASES.BLUE_ATTACK;
                break;
            case PHASES.BLUE_ATTACK:
                this.phase = PHASES.RED_MOVE;
                this.round++;
                this.bf.units.forEach(u => {
                    u.hasMoved = false;
                    u.hasAttacked = false;
                });
                break;
        }

        this.updateUI();
        this.processingPhase = false;

        // Auto-loop
        if (this.isAuto && this.running) {
            setTimeout(() => this.nextPhase(), 500); // Small pause between phases
        }
    }

    async executePhase() {
        const actingTeam = this.phase.includes('RED') ? TEAM_RED : TEAM_BLUE;
        const isAttackPhase = this.phase.includes('ATTACK');

        const myUnits = this.bf.units.filter(u => u.team === actingTeam && !u.isDead);
        const enemyUnits = this.bf.units.filter(u => u.team !== actingTeam && !u.isDead);

        if (enemyUnits.length === 0) return;

        // Sort units to make action order consistent
        myUnits.sort((a, b) => a.id - b.id);

        const sleep = ms => new Promise(r => setTimeout(r, ms));

        if (isAttackPhase) {
            // Simultaneous-ish attacks? Or sequential? Sequential is easier to follow.
            for (const unit of myUnits) {
                if (this.checkVictory()) return;
                if (unit.isDead) continue;

                // Find nearest enemy
                let nearestEnemy = null;
                let minDist = Infinity;
                // Re-fetch living enemies
                const currentEnemies = this.bf.units.filter(u => u.team !== actingTeam && !u.isDead);

                for (const enemy of currentEnemies) {
                    const dist = unit.distanceTo(enemy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestEnemy = enemy;
                    }
                }

                if (nearestEnemy && minDist <= unit.range) {
                    // Check LOS for direct fire units
                    let hasLOS = true;
                    if (unit.type !== UNIT_TYPES.ARTILLERY) {
                        hasLOS = this.bf.checkLineOfSight(unit.x, unit.y, nearestEnemy.x, nearestEnemy.y);
                    }

                    if (hasLOS) {
                        this.bf.selectedUnit = unit;
                        this.attack(unit, nearestEnemy);
                        await sleep(300); // Visual pause for shot
                        this.bf.selectedUnit = null;
                    }
                }
            }
        } else {
            // MOVE PHASE
            // Move all units nicely
            for (const unit of myUnits) {
                if (this.checkVictory()) return;
                // Find nearest enemy
                let nearestEnemy = null;
                let minDist = Infinity;
                const currentEnemies = this.bf.units.filter(u => u.team !== actingTeam && !u.isDead);
                for (const enemy of currentEnemies) {
                    const dist = unit.distanceTo(enemy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestEnemy = enemy;
                    }
                }

                if (nearestEnemy) {
                    // Logic to decide move
                    // If Artillery, stay if in range
                    let shouldMove = true;
                    if (unit.type === UNIT_TYPES.ARTILLERY && minDist <= unit.range) {
                        shouldMove = false;
                    }
                    // Infantry/Tank: If in optimal range, stay. optimal is e.g. 50% of range
                    if (minDist < unit.range * 0.5) {
                        shouldMove = false;
                    }

                    if (shouldMove) {
                        this.bf.selectedUnit = unit;
                        this.moveUnitTowards(unit, nearestEnemy);
                        // Wait for move to finish visually?
                        // Simple wait based on distance, or just fixed time
                        await sleep(100);
                        this.bf.selectedUnit = null;
                    }
                }
            }
            // Allow time for all moves to settle if we used animation targets
            // Since we set unit.targetX/Y, we should wait until they arrive?
            // For simplicity, we just set target and let them glide. 
            // But we don't want to start Attack phase until they arrive.
            // Let's add a "waitForMoves" check.
            await this.waitForAllMoves();
        }

        this.bf.removeDeadUnits();
        this.updateStats();
        this.checkVictory();
    }

    waitForAllMoves() {
        return new Promise(resolve => {
            const check = () => {
                const moving = this.bf.units.some(u => u.targetX !== null);
                if (!moving) resolve();
                else requestAnimationFrame(check);
            };
            check();
        });
    }

    moveUnitTowards(unit, target) {
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        let moveDist = unit.moveRange;
        // Move to appropriate distance
        // Don't collide exactly
        const idealDist = Math.max(50, unit.range * 0.4);

        let travel = Math.min(moveDist, dist - idealDist);
        if (travel < 0) travel = 0; // Already too close

        const destX = unit.x + Math.cos(angle) * travel;
        const destY = unit.y + Math.sin(angle) * travel;

        // Boundaries
        const finalX = Math.max(20, Math.min(this.bf.width - 20, destX));
        const finalY = Math.max(20, Math.min(this.bf.height - 20, destY));

        // Trigger animation
        unit.targetX = finalX;
        unit.targetY = finalY;

        soundManager.playMove();

        // Logic position updates immediately for calculations? 
        // No, update logic pos after arrival? 
        // For turn logic: Update 'x' and 'y' immediately so next unit knows where I am?
        // Actually, if we update x,y immediately, the draw function uses currentX/Y for animation.
        // Let's do that.
        unit.x = finalX;
        unit.y = finalY;
    }

    attack(attacker, defender) {
        this.bf.projectiles.push(new Projectile(attacker.currentX, attacker.currentY, defender.currentX, defender.currentY, attacker.type));
        soundManager.playShoot(attacker.type);
        defender.takeDamage(attacker.damage);
    }

    animate() {
        if (this.running) {
            this.bf.updateAnimations();
            this.bf.draw();
        }
        requestAnimationFrame(this.animate);
    }
}
