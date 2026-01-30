class Battlefield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.units = [];
        this.projectiles = [];
        this.explosions = [];
        this.selectedUnit = null;

        // Terrain obstacles
        this.obstacles = [];
        for (let i = 0; i < 10; i++) {
            this.obstacles.push({
                x: Math.random() * (this.width - 100) + 50,
                y: Math.random() * (this.height - 100) + 50,
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20
            });
        }
    }

    addUnit(unit) {
        this.units.push(unit);
    }

    removeDeadUnits() {
        this.units = this.units.filter(u => !u.isDead);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    draw() {
        this.clear();

        // Draw Grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Draw Obstacles
        this.ctx.fillStyle = '#444';
        for (const obs of this.obstacles) {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
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
                // Determine checking for hit could be here, but we applied dmg instantly in logic.
                // Just visual explosion:
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
        // Simple ray casting against AABB obstacles
        for (const obs of this.obstacles) {
            // Check intersection of line segment (x1,y1)-(x2,y2) with rectangle obs
            // We can approximate by checking sample points or using standard line-rect intersection
            // For simplicity, we sample a few points along the line
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
