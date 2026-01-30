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
        this.moveRange = stats.move;
        this.width = stats.width;
        this.height = stats.height;

        this.hasMoved = false;
        this.hasAttacked = false;
        this.isDead = false;

        // Animation props
        this.currentX = x;
        this.currentY = y;
        this.targetX = null;
        this.targetY = null;
        this.moveSpeed = 4; // Pixels per frame
    }

    update() {
        if (this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const dist = Math.hypot(dx, dy);

            if (dist < this.moveSpeed) {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.x = this.targetX;
                this.y = this.targetY;
                this.targetX = null;
                this.targetY = null;
            } else {
                const angle = Math.atan2(dy, dx);
                this.currentX += Math.cos(angle) * this.moveSpeed;
                this.currentY += Math.sin(angle) * this.moveSpeed;
            }
        } else {
            // Sync logic pos
            this.currentX = this.x;
            this.currentY = this.y;
        }
    }

    draw(ctx, isSelected) {
        if (this.isDead) return;

        const color = UNIT_STATS[this.type].color[this.team];
        const x = this.currentX;
        const y = this.currentY;

        // Selection highlight
        if (isSelected) {
            ctx.save();
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(this.width, this.height), 0, Math.PI * 2);
            ctx.stroke();

            // Draw ranges
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            // Move range
            ctx.beginPath();
            ctx.arc(x, y, this.moveRange, 0, Math.PI * 2);
            ctx.stroke();
            // Attack range
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y, this.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Unit body
        ctx.fillStyle = color;
        ctx.fillRect(x - this.width / 2, y - this.height / 2, this.width, this.height);

        // HP Bar
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - this.width / 2, y - this.height / 2 - 10, this.width, 5);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x - this.width / 2, y - this.height / 2 - 10, this.width * hpPercent, 5);

        // Type specifics
        ctx.fillStyle = '#222';
        if (this.type === UNIT_TYPES.TANK) {
            // Turret
            ctx.beginPath();
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.fill();
        } else if (this.type === UNIT_TYPES.ARTILLERY) {
            // Triangle top
            ctx.beginPath();
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.fill();
        }

        // Label
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.substring(0, 3).toUpperCase(), x, y + this.height / 2 + 12);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    distanceTo(otherUnit) {
        return Math.hypot(this.x - otherUnit.x, this.y - otherUnit.y);
    }
}
