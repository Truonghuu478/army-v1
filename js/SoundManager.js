// --- SOUND MANAGER ---
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, vol = 0.1) {
        if (!this.enabled) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    playShoot(type) {
        if (type === UNIT_TYPES.INFANTRY) {
            this.playTone(600, 'square', 0.1, 0.05); // Pew
        } else if (type === UNIT_TYPES.TANK) {
            this.playTone(150, 'sawtooth', 0.15, 0.1); // Boom/Pew
        } else if (type === UNIT_TYPES.ARTILLERY) {
            this.playTone(100, 'sawtooth', 0.3, 0.15); // Big Boom intro
        }
    }

    playHit() {
        this.playNoise(0.2, 0.1); // Explosion
    }

    playMove() {
        this.playTone(300, 'sine', 0.05, 0.02); // Blip
    }
}

const soundManager = new SoundManager();
