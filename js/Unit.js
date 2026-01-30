class Unit {
    constructor(id, type, team, x, y) {
        this.id = id;
        this.type = type;
        this.team = team;
        this.x = x;
        this.y = y;

        const stats = UNIT_STATS[type];
        this.range = stats.range;
        this.damage = stats.damage;
        this.maxHp = stats.hp;
        this.hp = stats.hp;
        this.moveSpeed = stats.moveSpeed;
        this.fireRate = stats.fireRate;
        this.width = stats.width;
        this.height = stats.height;
        this.color = stats.color[team] || stats.color; // Handle both structures if changed

        this.lastAttackTime = 0;
        this.isDead = false;

        // Lane Logic: Direction
        this.direction = (team === TEAM_BLUE) ? 1 : -1;
    }

    update(time, enemies, enemyBase) {
        if (this.isDead) return;

        // 1. Find Target
        // Prioritize: Closest Enemy Unit in Range -> Closest Enemy Unit -> Enemy Base
        let target = null;
        let minDist = Infinity;

        // Filter valid enemies
        const validEnemies = enemies.filter(e => !e.isDead);

        // Find closest unit
        for (const enemy of validEnemies) {
            const dist = Math.abs(this.x - enemy.x); // 1D Distance
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        // Check if Base is closer or valid
        if (!target) {
            target = enemyBase;
            minDist = Math.abs(this.x - enemyBase.x); // Distance to base center
            // Adjust for base width? Base x is center.
            minDist -= enemyBase.width / 2;
        } else {
            // Check if Base is actually closer than the unit (e.g. unit walked past base? Unlikely in 1D but possible)
            // Generally assume units meet first.
        }

        // 2. State Machine: Attack or Move
        // Check Range (center to center approx, or edge to edge)
        // Let's use center-to-center for simplicity initially, maybe subtract widths
        const reach = this.range + this.width / 2 + (target.width || 50) / 2;

        if (minDist <= reach) {
            // Attack
            if (time - this.lastAttackTime > this.fireRate) {
                this.attack(target);
                this.lastAttackTime = time;
            }
        } else {
            // Move
            this.x += this.moveSpeed * this.direction;
        }
    }

    attack(target) {
        // Create Projectile or Instant Hit?
        // Game has Projectile class, let's use callback to Game/Battlefield to spawn it
        if (this.onShoot) {
            this.onShoot(this, target);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    draw(ctx, isSelected) {
        if (this.isDead) return;

        const x = this.x;
        const y = this.y;

        // Draw selection
        if (isSelected) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - this.width / 2 - 2, y - this.height / 2 - 2, this.width + 4, this.height + 4);
        }

        // Draw Body
        ctx.fillStyle = this.color;
        if (!this.color) ctx.fillStyle = '#fff'; // Fallback

        ctx.fillRect(x - this.width / 2, y - this.height / 2, this.width, this.height);

        // HP Bar
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - this.width / 2, y - this.height / 2 - 8, this.width, 4);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x - this.width / 2, y - this.height / 2 - 8, this.width * hpPercent, 4);

        // Debug Range?
        // ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        // ctx.beginPath();
        // ctx.arc(x, y, this.range, 0, Math.PI*2);
        // ctx.stroke();
    }
}
