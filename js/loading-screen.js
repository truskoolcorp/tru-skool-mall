/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Loading Screen
   Branded loading experience with progress indicators
   ═══════════════════════════════════════════════════════════ */

const LoadingScreen = {

  init() {
    this.createDOM();
    this.trackProgress();
  },

  createDOM() {
    const loader = document.createElement('div');
    loader.id = 'loading-screen';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo">
          <div class="loader-mark">TSE</div>
          <div class="loader-text">TRU SKOOL MALL</div>
        </div>
        <div class="loader-bar-track">
          <div class="loader-bar-fill" id="loader-fill"></div>
        </div>
        <div class="loader-status" id="loader-status">Initializing experience...</div>
        <div class="loader-brands">
          <span style="color:#c94060">Concrete Rose</span>
          <span style="color:#d4c0a8">BiJaDi</span>
          <span style="color:#FFADED">Faithfully Faded</span>
          <span style="color:#e8c060">H.O.E.</span>
          <span style="color:#60c890">Wanderlust</span>
          <span style="color:#c09060">Café Sativa</span>
          <span style="color:#a060e0">Verse Alkemist</span>
        </div>
      </div>
    `;
    document.body.appendChild(loader);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #loading-screen {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(ellipse at 50% 40%, #14101e, #060408);
        transition: opacity 0.8s ease;
      }
      #loading-screen.fade-out { opacity: 0; pointer-events: none; }
      .loader-content { text-align: center; max-width: 400px; padding: 40px; }
      .loader-logo { margin-bottom: 48px; }
      .loader-mark {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 64px; font-weight: 700; color: #c9a84c;
        letter-spacing: 0.15em;
        text-shadow: 0 0 60px rgba(201,168,76,0.25);
        animation: loaderPulse 2s ease-in-out infinite;
      }
      .loader-text {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 14px; letter-spacing: 0.4em; color: #d4c8b8;
        text-transform: uppercase; margin-top: 8px;
      }
      .loader-bar-track {
        width: 100%; height: 3px; background: rgba(255,255,255,0.06);
        border-radius: 2px; overflow: hidden; margin-bottom: 16px;
      }
      .loader-bar-fill {
        width: 0%; height: 100%; background: linear-gradient(90deg, #c9a84c, #e8d8a8);
        border-radius: 2px; transition: width 0.3s ease;
      }
      .loader-status {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 12px; color: #8880a0; letter-spacing: 0.05em;
      }
      .loader-brands {
        display: flex; flex-wrap: wrap; justify-content: center;
        gap: 12px 20px; margin-top: 40px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
        opacity: 0.5;
      }
      @keyframes loaderPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
  },

  trackProgress() {
    const fill = document.getElementById('loader-fill');
    const status = document.getElementById('loader-status');
    if (!fill || !status) return;

    const steps = [
      { pct: 15, msg: 'Loading 3D engine...' },
      { pct: 30, msg: 'Building mall structure...' },
      { pct: 45, msg: 'Setting up storefronts...' },
      { pct: 60, msg: 'Placing product displays...' },
      { pct: 75, msg: 'Initializing AI guides...' },
      { pct: 90, msg: 'Preparing ambient audio...' },
      { pct: 100, msg: 'Welcome to the mall.' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx >= steps.length) {
        clearInterval(interval);
        return;
      }
      fill.style.width = steps[stepIdx].pct + '%';
      status.textContent = steps[stepIdx].msg;
      stepIdx++;
    }, 400);

    // Listen for A-Frame scene loaded
    const scene = document.querySelector('a-scene');
    if (scene) {
      const onLoaded = () => {
        // Jump to 100%
        clearInterval(interval);
        fill.style.width = '100%';
        status.textContent = 'Welcome to the mall.';

        // Fade out after brief pause
        setTimeout(() => {
          const screen = document.getElementById('loading-screen');
          if (screen) {
            screen.classList.add('fade-out');
            setTimeout(() => screen.remove(), 1000);
          }
        }, 800);
      };

      if (scene.hasLoaded) {
        onLoaded();
      } else {
        scene.addEventListener('loaded', onLoaded);
      }
    } else {
      // No scene — just fade after steps
      setTimeout(() => {
        const screen = document.getElementById('loading-screen');
        if (screen) {
          screen.classList.add('fade-out');
          setTimeout(() => screen.remove(), 1000);
        }
      }, steps.length * 400 + 800);
    }
  },
};

// Auto-init immediately
LoadingScreen.init();

window.LoadingScreen = LoadingScreen;
