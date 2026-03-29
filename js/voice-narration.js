/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Voice Narration
   MiniMAX TTS via server-side proxy (/api/tts)
   ═══════════════════════════════════════════════════════════ */

const VoiceNarration = {

  // Voice IDs per persona
  voiceIds: {
    laviche: 'moss_audio_15d1d287-2b81-11f1-9471-ba789c2c93f8',
    ginger:  'moss_audio_2d1fd811-2819-11f1-8a04-b60a20904c95',
    ahnika:  'moss_audio_9ea095c1-2b81-11f1-bc09-de09dc3c9ac4',
  },

  // Voice tuning per persona
  voiceSettings: {
    laviche: { speed: 0.95, pitch: 0, emotion: 'happy' },
    ginger:  { speed: 1.1,  pitch: 0, emotion: 'happy' },
    ahnika:  { speed: 1.0,  pitch: 1, emotion: 'happy' },
  },

  // State
  _currentAudio: null,
  _queue: [],
  _speaking: false,
  _enabled: true,
  _userInteracted: false,

  // ─── Init: unlock audio on first user interaction ───
  init() {
    const unlock = () => {
      this._userInteracted = true;
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      console.log('[Voice] Audio unlocked by user interaction');
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
  },

  // ─── Speak via /api/tts proxy ───
  async speak(text, persona = 'laviche') {
    if (!window.MallState || !window.MallState.voiceEnabled) return;
    if (!this._enabled) return;

    // Clean text for speech (remove emojis)
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[💎🌹🦋👑🌍☕🎤🏛]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 3) return;

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

      console.log(`[Voice] Requesting TTS for ${persona}: "${cleanText.substring(0, 50)}..."`);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice_id: voice,
          speed: settings.speed,
          pitch: settings.pitch,
          emotion: settings.emotion,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('[Voice] TTS proxy error:', response.status, errData);
        throw new Error('TTS proxy error ' + response.status);
      }

      const data = await response.json();

      if (data.audio) {
        // Decode hex audio to binary
        const audioHex = data.audio;
        const audioBytes = new Uint8Array(
          audioHex.match(/.{1,2}/g).map(function(b) { return parseInt(b, 16); })
        );
        const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play audio
        await this.playAudio(audioUrl);
        console.log('[Voice] Playback complete');
      } else {
        console.warn('[Voice] No audio data in response');
      }

    } catch (err) {
      console.error('[Voice] TTS error:', err.message);
    } finally {
      this._speaking = false;
      this.hideVoiceUI();

      // Process queue
      if (this._queue.length > 0) {
        const next = this._queue.shift();
        setTimeout(function() {
          VoiceNarration.speak(next.text, next.persona);
        }, 300);
      }
    }
  },

  // ─── Audio Playback ───
  playAudio(url) {
    var self = this;
    return new Promise(function(resolve) {
      // Stop current audio
      if (self._currentAudio) {
        self._currentAudio.pause();
        self._currentAudio = null;
      }

      var audio = new Audio(url);
      self._currentAudio = audio;

      audio.onended = function() {
        URL.revokeObjectURL(url);
        self._currentAudio = null;
        resolve();
      };

      audio.onerror = function(e) {
        console.error('[Voice] Audio playback error:', e);
        self._currentAudio = null;
        resolve();
      };

      audio.play().catch(function(err) {
        console.warn('[Voice] Autoplay blocked — click anywhere first:', err.message);
        self._currentAudio = null;
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

  // ─── Voice UI indicators ───
  showVoiceUI(persona) {
    var status = document.getElementById('voice-status');
    var textEl = document.getElementById('voice-text');
    if (!status || !textEl) return;

    var personas = {
      laviche: 'Laviche Cárdenas',
      ginger: 'Ginger Pelirroja',
      ahnika: 'Ahnika Merlot',
    };
    textEl.textContent = (personas[persona] || 'Guide') + ' is speaking...';
    status.classList.remove('hidden');
  },

  hideVoiceUI() {
    var status = document.getElementById('voice-status');
    if (status) status.classList.add('hidden');
  },

  // ─── Configure custom voice IDs (call from console) ───
  configure(options) {
    if (options && options.voiceIds) {
      var self = this;
      Object.keys(options.voiceIds).forEach(function(key) {
        self.voiceIds[key] = options.voiceIds[key];
      });
      console.log('[Voice] Voice IDs updated:', this.voiceIds);
    }
  },
};

// Auto-init
VoiceNarration.init();

window.VoiceNarration = VoiceNarration;
console.log('%c[Tru Skool Mall] Voice system loaded — uses /api/tts proxy', 'color: #c9a84c');
