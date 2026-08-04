import { IMPACT_SETTINGS, WALL_HIT_SETTINGS, NOTES } from './effects.js';

export function createCueBallImpact(audioCtx, destination, velocity) {
    const time = audioCtx.currentTime;
    
    // Scale gain with velocity (0 to 1)
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = Math.max(0.1, velocity) * 0.8;
    masterGain.connect(destination);

    // Layer 1: Click (Noise)
    const bufferSize = audioCtx.sampleRate * IMPACT_SETTINGS.CLICK_DURATION; // 2-3ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 4500; // 3-6kHz
    noiseFilter.Q.value = IMPACT_SETTINGS.CLICK_Q; // 5
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    // Pitch shift based on velocity (up to 15% higher for harder hits)
    const pitchMod = 1 + (velocity * 0.15);

    // Layer 2: Body (Thud)
    const bodyOsc = audioCtx.createOscillator();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.value = IMPACT_SETTINGS.BODY_FREQ_BASE * pitchMod;
    
    const bodyGain = audioCtx.createGain();
    bodyGain.gain.setValueAtTime(1, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + IMPACT_SETTINGS.BODY_DECAY); // 80ms decay
    
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);

    // Layer 3: Overtone (Ping)
    const overtoneOsc = audioCtx.createOscillator();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.value = IMPACT_SETTINGS.OVERTONE_FREQ * pitchMod;
    
    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.setValueAtTime(0.5, time);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, time + IMPACT_SETTINGS.OVERTONE_DECAY); // 30ms decay
    
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(masterGain);

    // Start and stop all sources
    noiseSource.start(time);
    bodyOsc.start(time);
    overtoneOsc.start(time);
    
    noiseSource.stop(time + IMPACT_SETTINGS.DURATION);
    bodyOsc.stop(time + IMPACT_SETTINGS.DURATION);
    overtoneOsc.stop(time + IMPACT_SETTINGS.DURATION);
}

export function createRollingSound(audioCtx, destination) {
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds loop
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200; // 200Hz cutoff for rumble
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; // Starts silent
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);
    
    noiseSource.start();
    
    return {
        source: noiseSource,
        gainNode: gainNode,
        stop: () => {
            const time = audioCtx.currentTime;
            gainNode.gain.linearRampToValueAtTime(0, time + 0.1);
            noiseSource.stop(time + 0.2);
        },
        updateVelocity: (velocity) => {
            gainNode.gain.setTargetAtTime(velocity * 0.5, audioCtx.currentTime, 0.05);
        }
    };
}

export function createWallHitSound(audioCtx, destination, velocity) {
    const time = audioCtx.currentTime;
    
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = Math.max(0.1, velocity) * 0.6;
    masterGain.connect(destination);

    const pitchMod = 1 + (velocity * 0.1);

    const bodyOsc = audioCtx.createOscillator();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.value = WALL_HIT_SETTINGS.BODY_FREQ * pitchMod;
    
    const bodyGain = audioCtx.createGain();
    bodyGain.gain.setValueAtTime(1, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + WALL_HIT_SETTINGS.BODY_DECAY); // 150ms decay
    
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);

    bodyOsc.start(time);
    bodyOsc.stop(time + WALL_HIT_SETTINGS.BODY_DECAY + 0.05);
}

export function createGoalSound(audioCtx, destination) {
    const time = audioCtx.currentTime;
    const freqs = [NOTES.C5, NOTES.E5, NOTES.G5];
    
    // Simple reverb via delay
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.15;
    const delayGain = audioCtx.createGain();
    delayGain.gain.value = 0.2;
    delay.connect(delayGain);
    delayGain.connect(destination);
    
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.3;
    delayGain.connect(feedback);
    feedback.connect(delay);

    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, time + i * 0.1); // 100ms overlap
        gain.gain.linearRampToValueAtTime(0.5, time + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.1 + 0.2); // 200ms total
        
        osc.connect(gain);
        gain.connect(destination);
        gain.connect(delay); // send to reverb
        
        osc.start(time + i * 0.1);
        osc.stop(time + i * 0.1 + 0.25);
    });
}

export function createUIClick(audioCtx, destination) {
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = NOTES.CLICK_FREQ; // 1000Hz
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.01); // 10ms
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start(time);
    osc.stop(time + 0.015);
}

export function createUIHover(audioCtx, destination) {
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = NOTES.HOVER_FREQ; // 2000Hz
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.005); // 5ms
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start(time);
    osc.stop(time + 0.01);
}

export function createStarChime(audioCtx, destination, starNumber) {
    const time = audioCtx.currentTime;
    const freqs = [NOTES.C5, NOTES.E5, NOTES.G5];
    const baseFreq = freqs[Math.min(starNumber - 1, 2)];
    
    // Chorus effect
    const detunes = [-5, 0, 5];
    
    detunes.forEach(detune => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = baseFreq;
        osc.detune.value = detune;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.02); // 20ms attack
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5); // 500ms decay
        
        osc.connect(gain);
        gain.connect(destination);
        
        osc.start(time);
        osc.stop(time + 0.6);
    });
}

export function createTimerTick(audioCtx, destination, urgency) {
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    
    // Frequency increases with urgency
    osc.frequency.value = 400 + (urgency * 400); 
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05); // Short click
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    
    osc.start(time);
    osc.stop(time + 0.06);
}
