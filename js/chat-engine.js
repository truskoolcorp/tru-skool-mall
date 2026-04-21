/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Chat Engine
   Wires the 3D mall chat panel to the shared concierge API at
   cafe-sativa.com. Same endpoint powers /ask on the web surface,
   so a visitor continues the same conversation across surfaces.
   ═══════════════════════════════════════════════════════════ */

const ChatEngine = {

  // ─── Configuration ───
  // Single source of truth for the concierge API. If the Railway
  // orchestrator at agents.truskool.net comes online, change this
  // one URL and nothing else about the chat UI breaks.
  conciergeEndpoint: 'https://www.cafe-sativa.com/api/concierge',

  // Local UI history — used only for rendering recent turns in the
  // chat panel if the page reloads. The server owns the real memory
  // via host_conversations / host_messages keyed by conversation_id.
  history: [],
  maxHistory: 20,

  // ─── localStorage keys (shared shape with /ask page) ───
  // The mall and /ask use DIFFERENT keys on purpose: a logged-in
  // user's server-side conversation is scoped by user_id and will
  // merge both surfaces automatically. An anonymous user gets two
  // separate threads until they sign in. That's correct — we don't
  // want to tie a mall visit to /ask history for someone who hasn't
  // consented to that level of tracking.
  SESSION_KEY: 'mall:concierge:session-id',
  CONV_KEY_PREFIX: 'mall:concierge:conv-id:',

  // ─── Session/conversation persistence ───
  ensureSessionId() {
    let id = localStorage.getItem(this.SESSION_KEY);
    if (!id) {
      // Prefer crypto.randomUUID(); fall back to a timestamp+random
      // shape on older browsers. UUID format isn't required by the
      // API — any stable opaque string works.
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `mall-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(this.SESSION_KEY, id);
    }
    return id;
  },

  getConversationId(hostId) {
    return localStorage.getItem(this.CONV_KEY_PREFIX + hostId);
  },

  setConversationId(hostId, convId) {
    if (convId) localStorage.setItem(this.CONV_KEY_PREFIX + hostId, convId);
  },

  // ─── Send Message ───
  async send(userMessage) {
    if (!userMessage.trim()) return;

    // Resolve current host BEFORE any async work so we render the
    // correct avatar even if the user switches rooms mid-flight.
    const hostId = GuideSystem._currentGuide;
    const roomId = window.MallState && window.MallState.currentZone
      ? window.MallState.currentZone
      : null;

    // Add user message to UI
    addUserMessage(userMessage);

    // Add to local UI history (server does its own server-side memory)
    this.history.push({ role: 'user', content: userMessage });
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    try {
      this.showTyping();
      const { text: responseText, conversationId } = await this.callConcierge({
        hostId,
        message: userMessage,
        roomId,
      });

      this.hideTyping();

      if (conversationId) this.setConversationId(hostId, conversationId);

      if (responseText) {
        addChatMessage(hostId, responseText);
        this.history.push({ role: 'assistant', content: responseText });

        if (window.MallState && window.MallState.voiceEnabled && typeof VoiceNarration !== 'undefined') {
          VoiceNarration.speak(responseText, hostId);
        }
      }
    } catch (err) {
      this.hideTyping();
      console.error('[ChatEngine] Concierge call failed', err);
      this.fallbackResponse(userMessage);
    }
  },

  // ─── Concierge API Call ───
  // POST to cafe-sativa.com/api/concierge. This is the same endpoint
  // /ask on the web surface hits. Signed-in users get cross-surface
  // memory (server joins on user_id); anonymous users stay scoped to
  // their per-surface session_id, which is the right default.
  async callConcierge({ hostId, message, roomId }) {
    const sessionId = this.ensureSessionId();
    const conversationId = this.getConversationId(hostId);

    const res = await fetch(this.conciergeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // No credentials: 'include'. The concierge doesn't use cookies
      // for anonymous callers, so keeping this off lets the response
      // echo a specific allow-origin without forcing credentials mode.
      body: JSON.stringify({
        host: hostId,
        message,
        session_id: sessionId,
        conversation_id: conversationId || undefined,
        surface: 'mall-3d',
        room_id: roomId || undefined,
      }),
    });

    // Special cases the fallback handler should NOT swallow. We
    // render the server's copy-edited message directly, then throw
    // with a tagged error so send()'s catch block doesn't ALSO fire
    // the keyword fallback on top of it.
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      addChatMessage(hostId, data.error || 'Take a breath — try again in a bit.');
      throw new Error('rate_limited');
    }
    if (res.status === 503) {
      const data = await res.json().catch(() => ({}));
      if (data.code === 'not_configured') {
        addChatMessage(hostId, 'The host is stepping away for a moment. Try again in a bit.');
        throw new Error('not_configured');
      }
    }
    if (!res.ok) {
      throw new Error(`concierge_${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.message || '',
      conversationId: data.conversation_id || null,
    };
  },

  // ─── Fallback Response (offline/error) ───
  // When the concierge is unreachable or returns an error we haven't
  // already handled (network drop, Vercel cold-start 502, etc), the
  // chat panel still feels alive via keyword matching. Better to
  // degrade gracefully than to show a spinner and then silence.
  fallbackResponse(userMessage) {
    const guide = GuideSystem._currentGuide;
    const zone = (window.MallState && window.MallState.currentZone) || 'the mall';
    const msg = userMessage.toLowerCase();

    let response;

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
    if (!container) return;

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

    if (!document.getElementById('typing-style')) {
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
