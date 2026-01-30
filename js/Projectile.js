class Projectile {
    constructor(startX, startY, targetX, targetY, type) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.type = type;
        this.progress = 0;
        this.finished = false;

        // Speed adjustments
        if (this.type === UNIT_TYPES.ARTILLERY) {
            this.speed = 0.03; // Slower arc
        } else {
            this.speed = 0.15; // Fast direct fire
        }
    }

    update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
            this.progress = 1;
            this.finished = true;
        }

        if (this.type === UNIT_TYPES.ARTILLERY) {
            // Parabola
            const midX = (this.startX + this.targetX) / 2;
            const midY = Math.min(this.startY, this.targetY) - 150; // Higher arc
            const t = this.progress;
            this.x = (1 - t) * (1 - t) * this.startX + 2 * (1 - t) * t * midX + t * t * this.targetX;
            this.y = (1 - t) * (1 - t) * this.startY + 2 * (1 - t) * t * midY + t * t * this.targetY;
        } else {
            // Linear
            this.x = this.startX + (this.targetX - this.startX) * this.progress;
            this.y = this.startY + (this.targetY - this.startY) * this.progress;
        }
    }

    draw(ctx) {
        if (this.type === UNIT_TYPES.ARTILLERY) {
            // Artilley shell
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Tracer effect (line)
            const dx = this.targetX - this.startX;
            const dy = this.targetY - this.startY;
            const angle = Math.atan2(dy, dx);
            const len = 40; // Tracer length

            ctx.strokeStyle = '#FFFF00'; // Yellow tracer
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            // Draw backward from current pos
            ctx.lineTo(this.x - Math.cos(angle) * len, this.y - Math.sin(angle) * len);
            ctx.stroke();
        }
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1.0;
        this.maxRadius = 30;
    }

    update() {
        this.life -= 0.05;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxRadius * (1 - this.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
