/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple synthesizer for game sounds using Web Audio API
class GameAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const persisted = window.localStorage.getItem('sound_enabled');
      if (persisted !== null) {
        this.soundEnabled = persisted === 'true';
      }
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sound_enabled', String(this.soundEnabled));
    }
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  private playTone(freqs: number[], duration: number, type: OscillatorType = 'sine', sweepTo?: number) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqs[0], now);
      
      if (freqs.length > 1 && sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, now + duration);
      } else {
        for (let i = 1; i < freqs.length; i++) {
          osc.frequency.setValueAtTime(freqs[i], now + (duration / freqs.length) * i);
        }
      }

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playDiceRoll() {
    // Noise-like roll sounds
    this.playTone([220, 150, 110, 80], 0.2, 'triangle');
  }

  playMove() {
    // Short pop
    this.playTone([440, 554, 659], 0.1, 'sine');
  }

  playHome() {
    // Uplifting arpeggio
    this.playTone([523.25, 659.25, 783.99, 1046.50], 0.4, 'sine');
  }

  playCapture() {
    // Dramatic downward drop
    this.playTone([500], 0.4, 'sawtooth', 100);
  }

  playYardExit() {
    // Sweepy rising tone
    this.playTone([300], 0.25, 'sine', 800);
  }

  playSafeZone() {
    // Sparkly chime
    this.playTone([880, 1318.5], 0.2, 'sine');
  }

  private playTrumpetTone(freq: number, duration: number, delaySec: number) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime + delaySec;
      
      // Detuned dual oscillators (sawtooth + triangle) create a rich, brassy trumpet chorus
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filterNode = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.detune.setValueAtTime(-7, now); // microdetune flat

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, now);
      osc2.detune.setValueAtTime(7, now); // microdetune sharp

      // Resonant Lowpass Filter sweep gives the brassy "brrr" attack characteristic of a trumpet
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(freq * 3.8, now);
      filterNode.frequency.exponentialRampToValueAtTime(freq * 1.6, now + duration);
      filterNode.Q.setValueAtTime(2.0, now);

      // Volume envelope with quick attack, sustain, and crisp decay
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.14, now + 0.05); // 50ms attack
      gainNode.gain.setValueAtTime(0.14, now + duration - 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(filterNode);
      osc2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + duration);
      osc2.start(now);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Trumpet synthesis failed', e);
    }
  }

  private playFireworkBurst(delaySec: number, frequency: number = 100) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime + delaySec;

      // Low bassy expansion boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      
      boomOsc.type = 'triangle';
      boomOsc.frequency.setValueAtTime(frequency, now);
      boomOsc.frequency.exponentialRampToValueAtTime(10, now + 0.6);

      boomGain.gain.setValueAtTime(0.18, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      boomOsc.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.6);

      // Random sparkly crackles aftermath
      const crackleCount = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < crackleCount; i++) {
        const cTime = now + 0.2 + (i * 0.08) + (Math.random() * 0.1);
        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();

        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(1600 + Math.random() * 1200, cTime);

        cGain.gain.setValueAtTime(0.04, cTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.05);

        cOsc.connect(cGain);
        cGain.connect(this.ctx.destination);
        cOsc.start(cTime);
        cOsc.stop(cTime + 0.05);
      }
    } catch (e) {}
  }

  // Orchestrate a complete sequence of multi-layered celebratory sounds
  playVictory() {
    // 1. ROYAL TRUMPET FANFARE (Measure-by-measure melody)
    // Measure 1: Noble intro triplets (C4 -> C4 -> C4 -> G4)
    this.playTrumpetTone(261.63, 0.14, 0.0);   // C4
    this.playTrumpetTone(261.63, 0.14, 0.16);  // C4
    this.playTrumpetTone(261.63, 0.14, 0.32);  // C4
    this.playTrumpetTone(392.00, 0.50, 0.48);  // G4

    // Measure 2: Rising response (E4 -> E4 -> E4 -> C5)
    this.playTrumpetTone(329.63, 0.14, 1.0);   // E4
    this.playTrumpetTone(329.63, 0.14, 1.16);  // E4
    this.playTrumpetTone(329.63, 0.14, 1.32);  // E4
    this.playTrumpetTone(523.25, 0.50, 1.48);  // C5

    // Measure 3: Climax march (G4 -> C5 -> E5 -> G5 peak)
    this.playTrumpetTone(392.00, 0.12, 2.0);   // G4
    this.playTrumpetTone(523.25, 0.12, 2.14);  // C5
    this.playTrumpetTone(659.25, 0.12, 2.28);  // E5
    this.playTrumpetTone(783.99, 1.10, 2.42);  // G5 (Majestic High Note!)

    // 2. WARM HARMONIC UNDERPINNING CHORDS (triangle sweep for fullness)
    // C Major triad to coordinate with first G4
    [130.81, 164.81, 196.00].forEach(freq => this.playTone([freq], 0.6, 'triangle', freq)); // low drone
    [261.63, 329.63].forEach(freq => {
      setTimeout(() => this.playTone([freq], 0.6, 'triangle'), 480);
    });

    // C Major chord voicing for C5
    [329.63, 392.00, 523.25].forEach(freq => {
      setTimeout(() => this.playTone([freq], 0.6, 'triangle'), 1480);
    });

    // High grand climactic C Major chord at high G5
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach(freq => {
      setTimeout(() => this.playTone([freq], 1.2, 'triangle'), 2420);
    });

    // 3. GOLDEN CHIME/SPARKLE CASCADES
    // Rapid upward chimes
    const sparklesUp = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2349.32];
    sparklesUp.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone([freq], 0.12, 'sine');
      }, 2550 + (i * 70));
    });

    // Rapid downward cascade aftermath
    const sparklesDown = [2349.32, 2093.00, 1760.00, 1567.98, 1318.51, 1174.66, 1046.50];
    sparklesDown.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone([freq], 0.12, 'sine');
      }, 3200 + (i * 70));
    });

    // 4. SYNCHRONIZED CELEBRATORY FIREWORKS EXPLOSIONS (audio-visual pairing)
    this.playFireworkBurst(0.1, 90);   // left-side launch pop
    this.playFireworkBurst(1.0, 110);  // right-side launch pop
    this.playFireworkBurst(2.4, 80);   // giant gold central bloom
    this.playFireworkBurst(2.9, 130);  // upper-left green shell
    this.playFireworkBurst(3.4, 100);  // upper-right emerald shell
    this.playFireworkBurst(4.0, 120);  // sweet final violet crackle
  }

  // Subtle, sweet ascending dual chime for seamless turn transitions
  playTurnChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Beautiful harmonic chime using sine wave oscillators at E5 and then A5
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Ascending upper tone starting with an offset (A5)
      const delay = 0.05;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + delay); // A5
      gain2.gain.setValueAtTime(0, now + delay);
      gain2.gain.linearRampToValueAtTime(0.10, now + delay + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.20);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + delay);
      osc2.stop(now + delay + 0.20);
    } catch (e) {
      console.warn('Turn transition chime failed to play', e);
    }
  }
}

export const audio = new GameAudio();
export default audio;
