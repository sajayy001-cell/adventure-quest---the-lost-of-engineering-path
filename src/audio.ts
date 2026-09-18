/**
 * Web Audio API procedural sound engine for ambient trials, UI clicks, puzzle solves,
 * boss attacks, resource blasts, and victory fanfare.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isSoundEnabled(): boolean {
    return this.enabled;
  }

  public playFootstep() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90 + Math.random() * 20, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playPuzzleRotate() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playPuzzleSuccess() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.12);

      const startTime = this.ctx.currentTime + index * 0.12;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  public playFailure() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playDialogueChime() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playResourceAttack(type: 1 | 2 | 3) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 1) {
      // Aether Core pulse
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    } else if (type === 2) {
      // Resonant Crystal Prism
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    } else {
      // Titan Overdrive
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(88, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public playBossHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playBossAttack() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // --- 30-SECOND CINEMATIC INTRO AUDIO SUITE ---
  private ambientDroneOsc: OscillatorNode | null = null;
  private ambientDroneGain: GainNode | null = null;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientNoiseGain: GainNode | null = null;
  private isCinematicAudioRunning = false;
  private lastTriggeredScene: number = -1;

  public startCinematicAudio() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.isCinematicAudioRunning) return;
    this.isCinematicAudioRunning = true;

    try {
      // 1. Deep Sub-bass Cinematic Pad
      this.ambientDroneOsc = this.ctx.createOscillator();
      this.ambientDroneGain = this.ctx.createGain();
      this.ambientDroneOsc.type = 'sawtooth';
      this.ambientDroneOsc.frequency.setValueAtTime(48, this.ctx.currentTime); // C1/G1 fundamental

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.Q.setValueAtTime(2, this.ctx.currentTime);

      this.ambientDroneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientDroneGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);

      this.ambientDroneOsc.connect(filter);
      filter.connect(this.ambientDroneGain);
      this.ambientDroneGain.connect(this.ctx.destination);
      this.ambientDroneOsc.start();

      // 2. Atmospheric Ethereal Wind / Mist
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.ambientNoiseSource = this.ctx.createBufferSource();
      this.ambientNoiseSource.buffer = noiseBuffer;
      this.ambientNoiseSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.ambientNoiseGain = this.ctx.createGain();
      this.ambientNoiseGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientNoiseGain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 1.0);

      this.ambientNoiseSource.connect(windFilter);
      windFilter.connect(this.ambientNoiseGain);
      this.ambientNoiseGain.connect(this.ctx.destination);
      this.ambientNoiseSource.start();
    } catch {
      // Audio fallback
    }
  }

  public stopCinematicAudio() {
    this.isCinematicAudioRunning = false;
    this.lastTriggeredScene = -1;
    if (this.ambientDroneGain && this.ctx) {
      this.ambientDroneGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        try {
          this.ambientDroneOsc?.stop();
          this.ambientDroneOsc?.disconnect();
          this.ambientDroneOsc = null;
        } catch {}
      }, 350);
    }
    if (this.ambientNoiseGain && this.ctx) {
      this.ambientNoiseGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        try {
          this.ambientNoiseSource?.stop();
          this.ambientNoiseSource?.disconnect();
          this.ambientNoiseSource = null;
        } catch {}
      }, 350);
    }
  }

  /**
   * Called during cinematic playback loop with current timestamp (0 to 30)
   */
  public handleCinematicTimestamp(time: number, isPlaying: boolean) {
    if (!this.enabled || !isPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    if (!this.isCinematicAudioRunning) {
      this.startCinematicAudio();
    }

    const currentScene = time < 6 ? 1 : time < 12 ? 2 : time < 18 ? 3 : time < 24 ? 4 : 5;

    if (currentScene !== this.lastTriggeredScene) {
      this.lastTriggeredScene = currentScene;
      this.triggerSceneSoundtrack(currentScene, time);
    }

    // Special sub-events within scenes:
    // At t = 18.2s: Magical Gate Activation Burst!
    if (time >= 18.0 && time <= 18.4 && !this.activatedGateSoundTriggered) {
      this.activatedGateSoundTriggered = true;
      this.playGateActivationBurst();
    } else if (time < 17.5 || time > 23.5) {
      this.activatedGateSoundTriggered = false;
    }

    // At t = 19.2s: Colossal Door Grinding rumble
    if (time >= 19.0 && time <= 19.5 && !this.doorRumbleTriggered) {
      this.doorRumbleTriggered = true;
      this.playDoorGrindRumble();
    } else if (time < 18.5 || time > 23.5) {
      this.doorRumbleTriggered = false;
    }

    // At t = 28.0s: "THE ADVENTURE BEGINS" Climax hit!
    if (time >= 28.0 && time <= 28.5 && !this.titleFanfareTriggered) {
      this.titleFanfareTriggered = true;
      this.playTitleFanfare();
    } else if (time < 27.5) {
      this.titleFanfareTriggered = false;
    }
  }

  private activatedGateSoundTriggered = false;
  private doorRumbleTriggered = false;
  private titleFanfareTriggered = false;

  public triggerSceneSoundtrack(sceneId: number, _currentTime: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    switch (sceneId) {
      case 1:
        // Scene 1: Arrival - Deep brass gong impact, mysterious low chords
        this.playScene1ArrivalSound();
        break;
      case 2:
        // Scene 2: The Guide - Ethereal celestial choral chords & speech synthesis
        this.playScene2GuideSound();
        break;
      case 3:
        // Scene 3: Grand Gateway - Ominous suspense pulse & tension strings
        this.playScene3GatewaySound();
        break;
      case 4:
        // Scene 4: Gate Opens - Hand activation & rumbling stone
        // Handled dynamically at t = 18.2s and t = 19.2s
        break;
      case 5:
        // Scene 5: Bridge Reveal - Majestic adventure brass theme!
        this.playScene5BridgeRevealTheme();
        break;
    }
  }

  // SCENE 1: ARRIVAL
  public playScene1ArrivalSound() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant orchestral gong
    const gong = this.ctx.createOscillator();
    const gongGain = this.ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(65, now);
    gong.frequency.exponentialRampToValueAtTime(32, now + 3.0);
    gongGain.gain.setValueAtTime(0.35, now);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    gong.connect(gongGain);
    gongGain.connect(this.ctx.destination);
    gong.start(now);
    gong.stop(now + 3.2);

    // Minor horn drone chord (D, F, A)
    [146.83, 174.61, 220.0].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 4.5);
    });
  }

  // SCENE 2: THE GUIDE
  public playScene2GuideSound() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Celestial glistening arpeggio / angel choir chords
    const chord = [293.66, 369.99, 440.0, 587.33, 880.0]; // D major with 9th shimmer
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.001, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.15 + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 3.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 3.8);
    });

    // Voiceover for the Guide's dialogue:
    this.speakGuideDialogue();
  }

  private speakGuideDialogue() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = "The journey has begun, wanderer. You must overcome several challenges to reach the final battle.";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.88;
        utterance.pitch = 0.85; // Majestic, deep divine tone
        utterance.volume = 0.95;

        // Pick a dignified English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('Google')));
        if (preferred) {
          utterance.voice = preferred;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis blocked or unavailable, procedural sound already plays
      }
    }
  }

  // SCENE 3: GRAND GATEWAY
  public playScene3GatewaySound() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Rhythmic suspense heartbeat / kettle drum pulse
    for (let i = 0; i < 4; i++) {
      const pulseTime = now + i * 1.3;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, pulseTime);
      osc.frequency.exponentialRampToValueAtTime(35, pulseTime + 0.35);

      gain.gain.setValueAtTime(0.2, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(pulseTime);
      osc.stop(pulseTime + 0.35);
    }
  }

  // SCENE 4: GATE ACTIVATION & OPENING
  public playGateActivationBurst() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Runic energy charge-up swell
    const swell = this.ctx.createOscillator();
    const swellGain = this.ctx.createGain();
    swell.type = 'sine';
    swell.frequency.setValueAtTime(120, now);
    swell.frequency.exponentialRampToValueAtTime(780, now + 0.8);

    swellGain.gain.setValueAtTime(0.01, now);
    swellGain.gain.linearRampToValueAtTime(0.25, now + 0.75);
    swellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    swell.connect(swellGain);
    swellGain.connect(this.ctx.destination);
    swell.start(now);
    swell.stop(now + 1.2);

    // Magical flash impact
    setTimeout(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const flash = this.ctx.createOscillator();
      const flashGain = this.ctx.createGain();
      flash.type = 'triangle';
      flash.frequency.setValueAtTime(940, t);
      flash.frequency.exponentialRampToValueAtTime(220, t + 0.6);

      flashGain.gain.setValueAtTime(0.3, t);
      flashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      flash.connect(flashGain);
      flashGain.connect(this.ctx.destination);
      flash.start(t);
      flash.stop(t + 0.6);
    }, 750);
  }

  public playDoorGrindRumble() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Massive stone grinding noise filter
    const bufferSize = this.ctx.sampleRate * 3.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.9;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, now);
    filter.frequency.linearRampToValueAtTime(220, now + 1.5);
    filter.frequency.linearRampToValueAtTime(90, now + 3.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.24, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 3.5);

    // Deep sub foundation quake
    const quake = this.ctx.createOscillator();
    const quakeGain = this.ctx.createGain();
    quake.type = 'sine';
    quake.frequency.setValueAtTime(42, now);
    quakeGain.gain.setValueAtTime(0.3, now);
    quakeGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    quake.connect(quakeGain);
    quakeGain.connect(this.ctx.destination);
    quake.start(now);
    quake.stop(now + 3.5);
  }

  // SCENE 5: BRIDGE REVEAL THEME
  public playScene5BridgeRevealTheme() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Heroic brass adventure fanfare melody: D4 -> F4 -> G4 -> A4 -> high D5!
    const melody = [
      { freq: 293.66, delay: 0.0, dur: 0.6 },  // D4
      { freq: 349.23, delay: 0.6, dur: 0.6 },  // F4
      { freq: 392.00, delay: 1.2, dur: 0.8 },  // G4
      { freq: 440.00, delay: 2.0, dur: 1.2 },  // A4
      { freq: 587.33, delay: 3.2, dur: 2.5 },  // D5 (climactic peak!)
    ];

    melody.forEach((note) => {
      if (!this.ctx) return;
      const noteTime = now + note.delay;

      // Brass lead
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, noteTime);

      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(800, noteTime);
      f.frequency.exponentialRampToValueAtTime(400, noteTime + note.dur);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.dur);

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + note.dur);

      // Sub harmony
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(note.freq / 2, noteTime);
      subGain.gain.setValueAtTime(0.12, noteTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.dur);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(noteTime);
      sub.stop(noteTime + note.dur);
    });
  }

  // FINAL TEXT: "THE ADVENTURE BEGINS" FANFARE HIT
  public playTitleFanfare() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant orchestral strike + chime swell
    const strike = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strike.type = 'sawtooth';
    strike.frequency.setValueAtTime(220, now);
    strike.frequency.exponentialRampToValueAtTime(55, now + 1.8);

    strikeGain.gain.setValueAtTime(0.35, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(400, now);

    strike.connect(f);
    f.connect(strikeGain);
    strikeGain.connect(this.ctx.destination);
    strike.start(now);
    strike.stop(now + 2.0);

    // High crystalline shimmer
    [880, 1174.66, 1318.51, 1760].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 2.2);
    });
  }
}

export const sound = new SoundEngine();
