/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Chat Engine
   Claude API integration for conversational AI guide
   ═══════════════════════════════════════════════════════════ */

const ChatEngine = {

  // ─── Configuration ───
  // Set your API key in environment or replace below for development
  // For production, use a backend proxy to protect the key
  apiEndpoint: '/api/chat',  // Proxy endpoint (recommended)
  directEndpoint: 'https://api.anthropic.com/v1/messages',

  // Set to true to use direct API (dev only — exposes key in browser)
  useDirectAPI: false,

  // Conversation history (last N messages for context)
  history: [],
  maxHistory: 20,

  // ─── Send Message ───
  async send(userMessage) {
    if (!userMessage.trim()) return;

    // Add user message to UI
    addUserMessage(userMessage);

    // Add to history
    this.history.push({ role: 'user', content: userMessage });
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    // Get current guide context
    const systemPrompt = GuideSystem.getSystemPrompt();
    const currentZone = window.MallState.currentZone;

    // Build context-enriched system prompt
    const enrichedPrompt = `${systemPrompt}

Current location in mall: ${currentZone}
Available stores: Concrete Rose, BiJaDi, Faithfully Faded, H.O.E., Wanderlust, Cafe Sativa, The Verse Alkemist.
The visitor can teleport to any store by asking. If they ask to go somewhere, tell them to click the map icon (🗺) or press T.`;

    try {
      // Show typing indicator
      this.showTyping();

      let responseText;

      if (this.useDirectAPI) {
        responseText = await this.callDirectAPI(enrichedPrompt);
      } else {
        responseText = await this.callProxyAPI(enrichedPrompt);
      }

      // Remove typing indicator
      this.hideTyping();

      if (responseText) {
        const guide = GuideSystem._currentGuide;

        // Add to UI
        addChatMessage(guide, responseText);

        // Add to history
        this.history.push({ role: 'assistant', content: responseText });

        // Trigger voice
        if (window.MallState.voiceEnabled && typeof VoiceNarration !== 'undefined') {
          VoiceNarration.speak(responseText, guide);
        }
      }

    } catch (err) {
      this.hideTyping();
      console.error('[Chat] API error:', err);

      // Fallback response
      this.fallbackResponse(userMessage);
    }
  },

  // ─── Direct API Call (development only) ───
  async callDirectAPI(systemPrompt) {
    const response = await fetch(this.directEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.getAPIKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: this.history,
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    return data.content?.[0]?.text || '';
  },

  // ─── Proxy API Call (production) ───
  async callProxyAPI(systemPrompt) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: this.history,
        zone: window.MallState.currentZone,
        guide: GuideSystem._currentGuide,
      }),
    });

    if (!response.ok) throw new Error(`Proxy ${response.status}`);

    const data = await response.json();
    return data.response || data.content?.[0]?.text || '';
  },

  // ─── API Key (dev only — use env/proxy in production) ───
  getAPIKey() {
    // Check for key in localStorage (set via console for dev testing)
    return localStorage.getItem('ANTHROPIC_API_KEY') || 'YOUR_KEY_HERE';
  },

  // ─── Fallback Response (offline/error) ───
  fallbackResponse(userMessage) {
    const guide = GuideSystem._currentGuide;
    const zone = window.MallState.currentZone;
    const msg = userMessage.toLowerCase();

    let response;

    // Simple keyword matching for offline mode
    if (msg.includes('concrete rose') || msg.includes('streetwear')) {
      response = 'Concrete Rose is just ahead on the left, darling — luxury streetwear that speaks volumes. The Rose Emblem Bomber at $185 is the featured piece right now. Press T to teleport. 🌹';
    } else if (msg.includes('bijadi') || msg.includes('luxury') || msg.includes('family')) {
      response = 'BiJaDi is on your right near the entrance — "Beyond Enough." The Family Series hoodie is a must-see, and Little B.E. has the cutest pieces for the little ones. 💎';
    } else if (msg.includes('faithfully') || msg.includes('faded') || msg.includes('ahnika')) {
      response = 'Faithfully Faded is mid-corridor on the left. The Hooded Baseball Jersey Dress is the statement piece — Ahnika says it runs oversized, so size down one. Just be Blunt. 🦋';
    } else if (msg.includes('hoe') || msg.includes('crown') || msg.includes('bold')) {
      response = 'H.O.E. is across from Faithfully Faded — the Crown Royal Jacket at $210 is everything. Bold, regal, unapologetic. 👑';
    } else if (msg.includes('wanderlust') || msg.includes('travel') || msg.includes('ginger')) {
      response = 'Wanderlust is down the corridor on the left. The Globe Trotter Pack is perfect for your next adventure — weather-resistant with a padded laptop sleeve. Ginger approved. 🌍';
    } else if (msg.includes('cafe') || msg.includes('sativa') || msg.includes('coffee') || msg.includes('vibe')) {
      response = 'Café Sativa is across from Wanderlust — the Cloud Nine blend is our signature. Try the Smoke Ring candle too — tobacco flower and cedar. Sip. Smoke. Vibe. ☕';
    } else if (msg.includes('verse') || msg.includes('music') || msg.includes('hip hop') || msg.includes('alkemist')) {
      response = 'The Verse Alkemist studio is at the end of the mall — the Walls of the World EP is available for digital download. Pure lyrical alchemy. 🎤';
    } else if (msg.includes('browse') || msg.includes('shop') || msg.includes('buy') || msg.includes('product')) {
      response = `Click on any store's "TAP TO BROWSE" sign to see their full product lineup, darling. Every brand has featured pieces waiting for you. 💎`;
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      response = `Welcome, darling! You're currently at ${zone}. I can guide you to any store — just ask, or press T to see the full map. 💎`;
    } else {
      response = `I'd love to help with that, darling. Try asking about any of our stores, or press T to see the full mall map. You're currently at ${zone}. 💎`;
    }

    addChatMessage(guide, response);
  },

  // ─── Typing Indicator ───
  showTyping() {
    const container = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'msg guide';
    indicator.innerHTML = `
      <div class="msg-avatar ${GuideSystem._currentGuide}"></div>
      <div class="msg-body" style="display:flex;gap:4px;padding:14px 18px;">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;

    // Add typing dot animation
    const style = document.createElement('style');
    style.id = 'typing-style';
    style.textContent = `
      .typing-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--gold); opacity: 0.4;
        animation: typingBounce 1.2s ease-in-out infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce {
        0%, 100% { opacity: 0.3; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-4px); }
      }
    `;
    if (!document.getElementById('typing-style')) {
      document.head.appendChild(style);
    }
  },

  hideTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  },
};

// ─── Global chat send function ───
function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  ChatEngine.send(message);
}

window.ChatEngine = ChatEngine;
window.sendChat = sendChat;
