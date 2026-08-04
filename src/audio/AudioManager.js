import {
    createCueBallImpact,
    createRollingSound,
    createWallHitSound,
    createGoalSound,
    createUIClick,
    createUIHover,
    createStarChime,
    createTimerTick
} from './SoundSynthesizer.js';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.muted = false;
        this.masterVolume = 0.7;
        
        this.rollingSound = null;
        this.timerInterval = null;
        
        this.lastImpactTime = 0;
    }
    
    init() {
        if (this.ctx) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        
        // Prevent audio clipping with a compressor node
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
    }
    
    resumeIfNeeded() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    playImpact(velocity) {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        
        // Manage concurrent sounds (prevent too many impact sounds at once)
        const now = this.ctx.currentTime;
        if (now - this.lastImpactTime < 0.05) return;
        this.lastImpactTime = now;
        
        createCueBallImpact(this.ctx, this.masterGain, velocity);
    }
    
    startRolling(velocity) {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        
        if (!this.rollingSound) {
            this.rollingSound = createRollingSound(this.ctx, this.masterGain);
        }
        this.rollingSound.updateVelocity(velocity);
    }
    
    stopRolling() {
        if (this.rollingSound) {
            this.rollingSound.stop();
            this.rollingSound = null;
        }
    }
    
    playWallHit(velocity) {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        createWallHitSound(this.ctx, this.masterGain, velocity);
    }
    
    playGoalScored() {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        createGoalSound(this.ctx, this.masterGain);
    }
    
    playUIClick() {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        createUIClick(this.ctx, this.masterGain);
    }
    
    playUIHover() {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        createUIHover(this.ctx, this.masterGain);
    }
    
    playStarChime(starNum) {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        createStarChime(this.ctx, this.masterGain, starNum);
    }
    
    startTimerTick(urgency) {
        if (!this.ctx) this.init();
        this.resumeIfNeeded();
        
        this.stopTimerTick();
        
        // Calculate interval based on urgency (e.g. 1000ms down to 250ms)
        const interval = 1000 - (urgency * 750);
        
        createTimerTick(this.ctx, this.masterGain, urgency);
        this.timerInterval = setInterval(() => {
            if (this.ctx.state === 'running') {
                createTimerTick(this.ctx, this.masterGain, urgency);
            }
        }, interval);
    }
    
    stopTimerTick() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
        return this.muted;
    }
    
    setVolume(v) {
        this.masterVolume = Math.max(0, Math.min(1, v));
        if (this.masterGain && !this.muted) {
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        }
    }
}

export const audioManager = new AudioManager();
