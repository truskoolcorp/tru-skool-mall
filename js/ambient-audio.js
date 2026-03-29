/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Ambient Audio System
   Zone-based background music with smooth crossfading
   Uses MiniMAX Music 2.0/2.5 generated tracks or fallback
   Web Audio API oscillator-based ambience as placeholder
   ═══════════════════════════════════════════════════════════ */

const AmbientAudio = {

  // ─── Configuration ───
  masterVolume: 0.25,
  crossfadeDuration: 2000,  // ms
  enabled: true,

  // ─── Zone Audio Profiles ───
  // Each zone has a mood that the synthesizer creates
  // Replace 'synth' entries with 'url' entries pointing to MiniMAX-generated tracks
  zones: {
    'Grand Entrance': {
      type: 'synth',
      mood: 'elegant',
      bpm: 72,
      key: 'Dm',
      description: 'Luxurious ambient pad — platinum energy',
    },
    'Concrete Rose': {
      type: 'synth',
      mood: 'gritty',
      bpm: 90,
      key: 'Am',
      description: 'Dark lo-fi beat with subtle bass — streetwear energy',
    },
    'BiJaDi': {
      type: 'synth',
      mood: 'elegant',
      bpm: 68,
      key: 'C',
      description: 'Warm ambient chords — luxury family lifestyle',
    },
    'Faithfully Faded': {
      type: 'synth',
      mood: 'chill',
      bpm: 85,
      key: 'Fm',
      description: 'Hazy lo-fi with vinyl texture — blunt vibes',
    },
    'H.O.E.': {
      type: 'synth',
      mood: 'regal',
      bpm: 95,
      key: 'Gm',
      description: 'Bold, regal trap-adjacent beat — crown energy',
    },
    'Wanderlust': {
      type: 'synth',
      mood: 'adventure',
      bpm: 110,
      key: 'G',
      description: 'Uplifting world music fusion — exploration vibes',
    },
    'Cafe Sativa': {
      type: 'synth',
      mood: 'cafe',
      bpm: 75,
      key: 'Eb',
      description: 'Warm jazz-lounge with cafe ambience — Sip. Smoke. Vibe.',
    },
    'The Verse Alkemist': {
      type: 'synth',
      mood: 'hiphop',
      bpm: 92,
      key: 'Cm',
      description: 'Boom bap beat with vinyl crackle — real hip hop',
    },
  },

  // ─── Audio Context ───
  _ctx: null,
  _masterGain: null,
  _activeNodes: [],
  _currentZone: null,
  _fadeInterval: null,

  // ─── Initialize ───
  init() {
    // Create audio context on user interaction (browser policy)
    const startAudio = () => {
      if (this._ctx) return;

      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this.masterVolume;
      this._masterGain.connect(this._ctx.destination);

      console.log('[Audio] Ambient audio system initialized');

      // Start with current zone
      const zone = window.MallState?.currentZone || 'Grand Entrance';
      this.transitionTo(zone);

      // Remove listeners after first interaction
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
  },

  // ─── Transition to Zone ───
  transitionTo(zoneName) {
    if (!this._ctx || !this.enabled) return;
    if (zoneName === this._currentZone) return;

    const zoneConfig = this.zones[zoneName];
    if (!zoneConfig) return;

    console.log(`[Audio] Transitioning to: ${zoneName} (${zoneConfig.mood})`);

    // Fade out current
    this.fadeOutCurrent();

    // Create new ambient
    this._currentZone = zoneName;

    if (zoneConfig.type === 'synth') {
      setTimeout(() => {
        this.playSynthAmbient(zoneConfig);
      }, this.crossfadeDuration / 2);
    } else if (zoneConfig.type === 'url' && zoneConfig.url) {
      setTimeout(() => {
        this.playTrack(zoneConfig.url);
      }, this.crossfadeDuration / 2);
    }
  },

  // ─── Synthesized Ambient Generator ───
  playSynthAmbient(config) {
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;
    const nodes = [];

    // Note frequencies for different keys
    const keys = {
      'C':  [261.63, 329.63, 392.00, 523.25],
      'Dm': [293.66, 349.23, 440.00, 587.33],
      'Am': [220.00, 261.63, 329.63, 440.00],
      'Fm': [174.61, 220.00, 261.63, 349.23],
      'Gm': [196.00, 233.08, 293.66, 392.00],
      'G':  [196.00, 246.94, 293.66, 392.00],
      'Eb': [155.56, 196.00, 233.08, 311.13],
      'Cm': [130.81, 155.56, 196.00, 261.63],
    };

    const freqs = keys[config.key] || keys['C'];

    // Create ambient pad based on mood
    switch (config.mood) {
      case 'elegant':
      case 'regal':
        // Warm pad with slow LFO
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq * 0.5; // One octave lower for warmth
          lfo.type = 'sine';
          lfo.frequency.value = 0.1 + i * 0.05; // Slow modulation
          lfoGain.gain.value = freq * 0.01;

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(gain);

          // Fade in
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.06 / freqs.length, now + 2);

          gain.connect(this._masterGain);
          osc.start(now);
          lfo.start(now);

          nodes.push({ osc, gain, lfo, lfoGain });
        });
        break;

      case 'gritty':
      case 'hiphop':
        // Dark pad with subtle distortion feel
        freqs.slice(0, 2).forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.value = freq * 0.25;

          // Filter for warmth
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          filter.Q.value = 2;

          osc.connect(filter);
          filter.connect(gain);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 2);
          gain.connect(this._masterGain);
          osc.start(now);

          nodes.push({ osc, gain, filter });
        });

        // Sub bass pulse
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.value = freqs[0] * 0.25;
        sub.connect(subGain);
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.08, now + 2);
        subGain.connect(this._masterGain);
        sub.start(now);
        nodes.push({ osc: sub, gain: subGain });
        break;

      case 'chill':
        // Lo-fi warm tones
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.value = freq * 0.5;

          osc.connect(gain);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04 / freqs.length, now + 3);
          gain.connect(this._masterGain);
          osc.start(now);

          nodes.push({ osc, gain });
        });
        break;

      case 'adventure':
        // Bright, uplifting tones
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();

          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = freq;
          lfo.type = 'sine';
          lfo.frequency.value = 0.2 + i * 0.1;
          lfoGain.gain.value = 3;

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(gain);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04 / freqs.length, now + 2);
          gain.connect(this._masterGain);
          osc.start(now);
          lfo.start(now);

          nodes.push({ osc, gain, lfo, lfoGain });
        });
        break;

      case 'cafe':
        // Warm jazz-like tones with gentle movement
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq * 0.5;

          // Warm filter
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          filter.Q.value = 0.5;

          osc.connect(filter);
          filter.connect(gain);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.05 / freqs.length, now + 3);
          gain.connect(this._masterGain);
          osc.start(now);

          nodes.push({ osc, gain, filter });
        });
        break;

      default:
        // Generic ambient
        const defOsc = ctx.createOscillator();
        const defGain = ctx.createGain();
        defOsc.type = 'sine';
        defOsc.frequency.value = freqs[0] * 0.5;
        defOsc.connect(defGain);
        defGain.gain.setValueAtTime(0, now);
        defGain.gain.linearRampToValueAtTime(0.05, now + 2);
        defGain.connect(this._masterGain);
        defOsc.start(now);
        nodes.push({ osc: defOsc, gain: defGain });
    }

    this._activeNodes = nodes;
  },

  // ─── Play Audio Track (for MiniMAX-generated music) ───
  async playTrack(url) {
    if (!this._ctx) return;

    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const audioBuffer = await this._ctx.decodeAudioData(buffer);

      const source = this._ctx.createBufferSource();
      const gain = this._ctx.createGain();

      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(gain);

      const now = this._ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + 2);
      gain.connect(this._masterGain);

      source.start(0);
      this._activeNodes = [{ source, gain }];

    } catch (err) {
      console.warn('[Audio] Track load failed, using synth fallback:', err);
      const zoneConfig = this.zones[this._currentZone];
      if (zoneConfig) this.playSynthAmbient(zoneConfig);
    }
  },

  // ─── Fade Out Current ───
  fadeOutCurrent() {
    if (!this._ctx || this._activeNodes.length === 0) return;

    const now = this._ctx.currentTime;
    const fadeDuration = this.crossfadeDuration / 1000;

    const oldNodes = [...this._activeNodes];
    this._activeNodes = [];

    oldNodes.forEach(node => {
      if (node.gain) {
        node.gain.gain.linearRampToValueAtTime(0, now + fadeDuration);
      }
    });

    // Stop oscillators after fade
    setTimeout(() => {
      oldNodes.forEach(node => {
        try {
          if (node.osc) node.osc.stop();
          if (node.lfo) node.lfo.stop();
          if (node.source) node.source.stop();
        } catch (e) { /* already stopped */ }
      });
    }, this.crossfadeDuration + 100);
  },

  // ─── Toggle ───
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.fadeOutCurrent();
    } else if (this._ctx) {
      const zone = window.MallState?.currentZone || 'Grand Entrance';
      this._currentZone = null; // Force re-trigger
      this.transitionTo(zone);
    }
    return this.enabled;
  },

  // ─── Set Volume ───
  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this._masterGain) {
      this._masterGain.gain.value = this.masterVolume;
    }
  },

  // ─── Generate Zone Track via MiniMAX ───
  // Call this from console to generate proper background music:
  // AmbientAudio.generateTrack('Cafe Sativa')
  async generateTrack(zoneName) {
    const zone = this.zones[zoneName];
    if (!zone) { console.error('Unknown zone:', zoneName); return; }

    const apiKey = localStorage.getItem('MINIMAX_API_KEY');
    if (!apiKey) { console.error('Set MINIMAX_API_KEY first'); return; }

    console.log(`[Audio] Generating track for "${zoneName}": ${zone.description}`);

    const prompt = `Create a ${zone.bpm} BPM ambient background track in ${zone.key}. Style: ${zone.description}. This is background music for a luxury virtual mall store — keep it subtle, loopable, and atmospheric. No vocals. 2 minutes.`;

    try {
      const response = await fetch('https://api.minimax.io/v1/music_generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'music-2.0',
          prompt: prompt,
          lyrics: '[inst]',  // Instrumental only
        }),
      });

      const data = await response.json();

      if (data.data?.audio) {
        // Decode hex to binary
        const audioHex = data.data.audio;
        const audioBytes = new Uint8Array(audioHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const blob = new Blob([audioBytes], { type: 'audio/mp3' });

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mall-ambient-${zoneName.toLowerCase().replace(/\s+/g, '-')}.mp3`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`[Audio] Track generated and downloaded for "${zoneName}". Cost: ~$0.03`);
        console.log(`[Audio] Add to assets/audio/ and update zone config with: type: 'url', url: 'assets/audio/${a.download}'`);
      }
    } catch (err) {
      console.error('[Audio] Generation failed:', err);
    }
  },
};

window.AmbientAudio = AmbientAudio;
