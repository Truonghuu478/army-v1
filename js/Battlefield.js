class Battlefield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        // Fit canvas to parent container or keep fixed size, for now keeping size but handling resize potentially?
        // Let's stick to the current fixed resolution for logic consistency, but maybe high DPI later.
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.units = [];
        this.bases = [];
        this.projectiles = [];

        // Terrain obstacles - let's make them more consistent blocks
        this.obstacles = [];
        this.generateObstacles();
    }

    generateObstacles() {
        this.obstacles = [];
        // Use a grid-based approach for obstacles to match the "Block Warfare" feel
        const cols = 24; // 1200 / 50
        const rows = 14; // 700 / 50

        for (let i = 0; i < 15; i++) {
            const w = Math.floor(Math.random() * 2 + 1) * 50;
            const h = Math.floor(Math.random() * 2 + 1) * 50;
            const x = Math.floor(Math.random() * (this.width - w) / 50) * 50;
            const y = Math.floor(Math.random() * (this.height - h) / 50) * 50;

            // Ensure we don't overlapping too much (simple check)
            this.obstacles.push({ x, y, width: w, height: h });
        }
    }

    addUnit(unit) {
        this.units.push(unit);
    }

    addBase(base) {
        this.bases.push(base);
    }

    removeDeadUnits() {
        this.units = this.units.filter(u => !u.isDead);
    }

    clear() {
        // Clear with the dark background color explicitly or just clear rect if CSS handles bg
        this.ctx.clearRect(0, 0, this.width, this.height);
        // We can draw a background fill to be sure
        // this.ctx.fillStyle = '#0b0e11';
        // this.ctx.fillRect(0, 0, this.width, this.height);
    }

    draw() {
        this.clear();

        // Draw Sim Grid (Subtle Dotted/Linear Gradient feel)
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Add subtle connection points (dots)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x <= this.width; x += 50) {
            for (let y = 0; y <= this.height; y += 50) {
                this.ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }
        this.ctx.restore();

        // Draw Obstacles (Block Style)
        this.ctx.fillStyle = '#1a1d23'; // Surface dark
        this.ctx.strokeStyle = '#2a2f37'; // Border dark
        this.ctx.lineWidth = 2;

        for (const obs of this.obstacles) {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

            // Add a little detail (top highlight)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(obs.x, obs.y, obs.width, 4);
            this.ctx.fillStyle = '#1a1d23';
        }

        // Draw Bases
        for (const base of this.bases) {
            base.draw(this.ctx);
        }

        // Draw Units
        this.units.sort((a, b) => a.y - b.y);
        for (const unit of this.units) {
            unit.draw(this.ctx, this.selectedUnit === unit);
        }

        // Draw Projectiles
        for (const proj of this.projectiles) {
            proj.draw(this.ctx);
        }

        // Draw Explosions
        for (const exp of this.explosions) {
            exp.draw(this.ctx);
        }
    }

    updateAnimations() {
        // Units
        for (const unit of this.units) {
            unit.update();
        }

        // Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();
            if (p.finished) {
                this.explosions.push(new Explosion(p.targetX, p.targetY));
                soundManager.playHit();
                this.projectiles.splice(i, 1);
            }
        }

        // Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const e = this.explosions[i];
            e.update();
            if (e.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }

    checkLineOfSight(x1, y1, x2, y2) {
        for (const obs of this.obstacles) {
            const steps = 10;
            for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const px = x1 + (x2 - x1) * t;
                const py = y1 + (y2 - y1) * t;
                if (px >= obs.x && px <= obs.x + obs.width &&
                    py >= obs.y && py <= obs.y + obs.height) {
                    return false;
                }
            }
        }
        return true;
    }
}
