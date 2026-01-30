class Base {
    constructor(team, x, y) {
        this.team = team;
        this.x = x;
        this.y = y; // Center Y, or Bottom Y depending on origin. Let's assume center for consistency or bottom.
        // Assuming x,y is center for now to match Units usually, but let's check unit drawing.
        // Unit drawing usually uses center or top-left. Let's stick to standard rect drawing.

        this.width = BASE_STATS.WIDTH;
        this.height = BASE_STATS.HEIGHT;
        this.hp = BASE_STATS.HP;
        this.maxHp = BASE_STATS.HP;

        this.color = BASE_STATS.COLOR[team];

        // Turret Slots (Relative positions)
        this.turrets = [];
        this.slots = [
            { x: 0, y: -this.height / 2 - 20, occupied: false }, // Top
            { x: -30, y: -this.height / 2 + 10, occupied: false }, // Left-ish
            { x: 30, y: -this.height / 2 + 10, occupied: false },   // Right-ish
            { x: 0, y: -this.height / 2 - 50, occupied: false }    // Very Top (4th slot)
        ];
    }

    addTurret() {
        // Find empty slot
        const slot = this.slots.find(s => !s.occupied);
        if (slot) {
            slot.occupied = true;
            const turret = new Turret(this, slot.x, slot.y);
            this.turrets.push(turret);
            return true;
        }
        return false;
    }

    update(time, enemies) {
        this.turrets.forEach(t => t.update(time, enemies));
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }

    isDead() {
        return this.hp <= 0;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        // Draw Turrets
        this.turrets.forEach(t => t.draw(ctx));

        ctx.fillStyle = this.color;
        // Draw main building
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        ctx.fillRect(this.x - halfW, this.y - halfH, this.width, this.height);

        // Draw HP Bar
        const barWidth = 100;
        const barHeight = 10;
        const hpPercent = this.hp / this.maxHp;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 2, this.y - halfH - 20, barWidth, barHeight);

        // HP
        ctx.fillStyle = '#0f0';
        if (hpPercent < 0.5) ctx.fillStyle = '#ff0';
        if (hpPercent < 0.2) ctx.fillStyle = '#f00';

        ctx.fillRect(this.x - barWidth / 2, this.y - halfH - 20, barWidth * hpPercent, barHeight);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, this.y - halfH - 20, barWidth, barHeight);
    }
}
