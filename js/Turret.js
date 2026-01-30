class Turret {
    constructor(parentBase, xOffset, yOffset) {
        this.base = parentBase;
        this.team = parentBase.team;
        // Absolute position based on Base position + offset
        this.x = parentBase.x + xOffset;
        this.y = parentBase.y + yOffset;

        this.range = TURRET_STATS.RANGE;
        this.damage = TURRET_STATS.DAMAGE;
        this.fireRate = TURRET_STATS.FIRE_RATE;
        this.width = TURRET_STATS.WIDTH;
        this.height = TURRET_STATS.HEIGHT;
        this.color = TURRET_STATS.COLOR[this.team];

        this.lastAttackTime = 0;
    }

    update(time, enemies) {
        // Simple targeting similar to Unit
        if (time - this.lastAttackTime < this.fireRate) return;

        let target = null;
        let minDist = this.range;

        // Filter valid enemies
        const validEnemies = enemies.filter(e => !e.isDead);

        for (const enemy of validEnemies) {
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        if (target) {
            this.attack(target);
            this.lastAttackTime = time;
        }
    }

    attack(target) {
        // Callback to bubble up to Game -> Battlefield
        if (this.onShoot) {
            // Duck-type ourselves as an attacker with x,y,type
            const attacker = {
                x: this.x,
                y: this.y,
                type: 'turret', // Explicit type for Projectile
                damage: this.damage
            };
            this.onShoot(attacker, target);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;

        // Draw Turret Base/Stand
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Draw 'Barrel' (visual only)
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}
