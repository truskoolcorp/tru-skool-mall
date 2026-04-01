/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Music Player Component
   Click headphones/speakers to play Verse Alkemist tracks
   ═══════════════════════════════════════════════════════════ */

AFRAME.registerComponent('music-player', {
  schema: {
    track: { type: 'string', default: '' },
    label: { type: 'string', default: 'Listen Now' },
    color: { type: 'string', default: '#a060e0' },
  },

  init: function() {
    this.playing = false;
    this.audio = null;
    this.el.classList.add('clickable');

    // Glow effect
    var self = this;

    // Hover hint
    var hint = document.createElement('a-text');
    hint.setAttribute('value', '🎧 ' + this.data.label);
    hint.setAttribute('position', '0 0.5 0');
    hint.setAttribute('align', 'center');
    hint.setAttribute('color', this.data.color);
    hint.setAttribute('width', '3');
    hint.setAttribute('visible', false);
    this.el.appendChild(hint);
    this.hint = hint;

    // Show hint on hover
    this.el.addEventListener('mouseenter', function() {
      hint.setAttribute('visible', true);
    });
    this.el.addEventListener('mouseleave', function() {
      if (!self.playing) hint.setAttribute('visible', false);
    });

    // Click to play/pause
    this.el.addEventListener('click', function() {
      if (self.playing) {
        self.stop();
      } else {
        self.play();
      }
    });
  },

  play: function() {
    if (!this.data.track) return;

    // Stop any other playing music
    document.querySelectorAll('[music-player]').forEach(el => {
      var comp = el.components['music-player'];
      if (comp && comp.playing && comp !== this) comp.stop();
    });

    if (!this.audio) {
      this.audio = new Audio(this.data.track);
      this.audio.loop = true;
      this.audio.volume = 0.6;
    }

    this.audio.play().catch(e => console.warn('[MusicPlayer] Playback blocked:', e));
    this.playing = true;
    this.hint.setAttribute('value', '⏸ Playing...');
    this.hint.setAttribute('visible', true);

    // Show now-playing banner
    this.showBanner(this.data.label);
  },

  stop: function() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.playing = false;
    this.hint.setAttribute('value', '🎧 ' + this.data.label);
    this.hint.setAttribute('visible', false);
    this.hideBanner();
  },

  showBanner: function(text) {
    var banner = document.getElementById('music-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'music-banner';
      banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(10,10,20,0.9);color:#a060e0;padding:10px 24px;border-radius:20px;font-family:system-ui;font-size:14px;z-index:999;border:1px solid #a060e040;backdrop-filter:blur(8px);transition:opacity 0.3s;';
      document.body.appendChild(banner);
    }
    banner.textContent = '🎵 Now Playing: ' + text;
    banner.style.opacity = '1';
  },

  hideBanner: function() {
    var banner = document.getElementById('music-banner');
    if (banner) banner.style.opacity = '0';
  },
});
