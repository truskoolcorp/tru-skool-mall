/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Voice Narration
   MiniMAX TTS integration for AI persona voice guide
   ═══════════════════════════════════════════════════════════ */

const VoiceNarration = {

  // ─── Configuration ───
  apiBase: 'https://api.minimax.io',
  model: 'speech-2.8-turbo',  // Fast for real-time, use speech-2.8-hd for published content

  // Voice IDs per persona (configure these after voice design/clone)
  voiceIds: {
    laviche: 'Calm_Woman',           // MiniMAX system voice (replace with cloned ID)
    ginger:  'Energetic_Woman',      // Replace with Ginger's cloned/designed voice ID
    ahnika:  'Sweet_Girl_2',         // Replace with Ahnika's designed voice ID
  },

  // Laviche Hume voice IDs (for reference — not used in MiniMAX)
  // Primary: cb46ab2d-1606-45e5-b7db-633636e53c84
  // Secondary: 9ab35d50-0ca1-461f-af4a-2a1978f7db26

  // Voice tuning per persona
  voiceSettings: {
    laviche: { speed: 0.95, pitch: 0, emotion: 'happy' },
    ginger:  { speed: 1.1,  pitch: 0, emotion: 'happy' },
    ahnika:  { speed: 1.0,  pitch: 1, emotion: 'happy' },
  },

  // State
  _audioContext: null,
  _currentAudio: null,
  _queue: [],
  _speaking: false,

  // ─── Speak ───
  async speak(text, persona = 'laviche') {
    if (!window.MallState.voiceEnabled) return;

    // Clean text for speech (remove emojis and special chars)
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')  // Remove emojis
      .replace(/[💎🌹🦋👑🌍☕🎤]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Check if API key is available
    const apiKey = this.getAPIKey();
    if (!apiKey || apiKey === 'YOUR_MINIMAX_KEY_HERE') {
      console.log(`[Voice] Would speak (${persona}): "${cleanText.substring(0, 60)}..."`);
      this.showVoiceUI(persona);
      // Simulate speaking duration
      setTimeout(() => this.hideVoiceUI(), Math.min(cleanText.length * 60, 5000));
      return;
    }

    // Queue if already speaking
    if (this._speaking) {
      this._queue.push({ text: cleanText, persona });
      return;
    }

    this._speaking = true;
    this.showVoiceUI(persona);

    try {
      const voice = this.voiceIds[persona] || this.voiceIds.laviche;
      const settings = this.voiceSettings[persona] || this.voiceSettings.laviche;

      const response = await fetch(`${this.apiBase}/v1/t2a_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          text: cleanText,
          voice_setting: {
            voice_id: voice,
            speed: settings.speed,
            pitch: settings.pitch,
            emotion: settings.emotion,
            vol: 1.0,
          },
          audio_setting: {
            format: 'mp3',
            sample_rate: 24000,
          },
        }),
      });

      if (!response.ok) throw new Error(`TTS ${response.status}`);

      const data = await response.json();

      if (data.data?.audio) {
        // Decode hex audio to binary
        const audioHex = data.data.audio;
        const audioBytes = new Uint8Array(audioHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play
        await this.playAudio(audioUrl);
      }

    } catch (err) {
      console.error('[Voice] TTS error:', err);
    } finally {
      this._speaking = false;
      this.hideVoiceUI();

      // Process queue
      if (this._queue.length > 0) {
        const next = this._queue.shift();
        this.speak(next.text, next.persona);
      }
    }
  },

  // ─── Audio Playback ───
  async playAudio(url) {
    return new Promise((resolve) => {
      // Stop current audio
      if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio = null;
      }

      const audio = new Audio(url);
      this._currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = () => {
        console.error('[Voice] Audio playback error');
        resolve();
      };

      audio.play().catch(err => {
        console.warn('[Voice] Autoplay blocked — user interaction needed:', err);
        resolve();
      });
    });
  },

  // ─── Stop ───
  stop() {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio = null;
    }
    this._queue = [];
    this._speaking = false;
    this.hideVoiceUI();
  },

  // ─── Voice UI ───
  showVoiceUI(persona) {
    const status = document.getElementById('voice-status');
    const textEl = document.getElementById('voice-text');
    if (!status || !textEl) return;

    const name = GuideSystem.personas[persona]?.name || 'Guide';
    textEl.textContent = `${name} is speaking...`;
    status.classList.remove('hidden');
  },

  hideVoiceUI() {
    const status = document.getElementById('voice-status');
    if (status) status.classList.add('hidden');
  },

  // ─── API Key ───
  getAPIKey() {
    return localStorage.getItem('MINIMAX_API_KEY') || 'YOUR_MINIMAX_KEY_HERE';
  },

  // ─── Configure (call from console to set up) ───
  configure(options = {}) {
    if (options.minimaxKey) {
      localStorage.setItem('MINIMAX_API_KEY', options.minimaxKey);
      console.log('[Voice] MiniMAX API key saved');
    }
    if (options.anthropicKey) {
      localStorage.setItem('ANTHROPIC_API_KEY', options.anthropicKey);
      console.log('[Voice] Anthropic API key saved');
    }
    if (options.voiceIds) {
      Object.assign(this.voiceIds, options.voiceIds);
      console.log('[Voice] Voice IDs updated:', this.voiceIds);
    }
  },
};

window.VoiceNarration = VoiceNarration;

// ─── Quick setup helper ───
// Run in browser console:
// VoiceNarration.configure({ minimaxKey: 'your-key', anthropicKey: 'your-key' })
console.log('%c[Tru Skool Mall] Voice Narration loaded', 'color: #c9a84c');
console.log('%cTo enable voice: VoiceNarration.configure({ minimaxKey: "your-key" })', 'color: #888');
console.log('%cTo enable chat AI: ChatEngine.useDirectAPI = true; localStorage.setItem("ANTHROPIC_API_KEY", "your-key")', 'color: #888');
