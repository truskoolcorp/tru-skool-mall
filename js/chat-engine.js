/* Mall chat is an anonymous, session-isolated Café client. Mall sign-in does
 * not send Café cookies or grant shared signed-in conversation memory.
 */
const ChatEngine = {
  SESSION_KEY: 'mall:concierge:session-id',
  CONV_KEY_PREFIX: 'mall:concierge:conv-id:v2:',
  history: [],
  maxHistory: 20,
  _busy: false,
  _epoch: 0,
  _sessionEpoch: 0,
  _session: null,
  _transport: null,
  _upgradeRequired: false,
  _waitNotice: 'A message is still being checked. You can keep exploring; text input will reopen when that check finishes.',

  async init() {
    const epoch = this._sessionEpoch;
    try {
      const { createConciergeTransport } = await import('./concierge-transport.mjs');
      this._transport = createConciergeTransport();
      const session = await this.ensureSessionId();
      if (epoch !== this._sessionEpoch || localStorage.getItem(this.SESSION_KEY) !== session) return;
      this._session = session;
      this.refreshUI();
    } catch {
      if (epoch !== this._sessionEpoch) return;
      this.showNotice('Text chat could not be opened safely. Check browser storage and use an up-to-date browser. No message was sent.');
      this.refreshUI();
    }
  },

  async ensureSessionId() {
    // Web Locks prevents racing first-use tabs from overwriting each other's
    // guest session. Existing bounded opaque production sessions are retained.
    if (!navigator.locks?.request) throw Error('Safe tab coordination unavailable');
    return navigator.locks.request('mall:concierge:session-init', async () => {
      let id = localStorage.getItem(this.SESSION_KEY);
      if (id === null) {
        id = crypto.randomUUID();
        localStorage.setItem(this.SESSION_KEY, id);
        if (localStorage.getItem(this.SESSION_KEY) !== id) throw Error('Session not retained');
      }
      if (!id || id.trim() !== id || id.length > 256 || /[\u0000-\u001f\u007f]/.test(id)) throw Error('Invalid session');
      return id;
    });
  },

  conversationKey(host, session) {
    return this.CONV_KEY_PREFIX + encodeURIComponent(session) + ':' + host;
  },
  getConversationId(host, session) {
    // Old host-only IDs have no provable session association. Leave them in
    // storage but never attach them to a newly selected guest session.
    return localStorage.getItem(this.conversationKey(host, session));
  },
  setConversationId(host, session, id) {
    if (id) localStorage.setItem(this.conversationKey(host, session), id);
    else localStorage.removeItem(this.conversationKey(host, session));
  },
  currentScope() {
    return { host: GuideSystem._currentGuide, session: this._session, epoch: this._epoch };
  },
  stillCurrent(scope) {
    try {
      return scope.epoch === this._epoch && scope.host === GuideSystem._currentGuide
        && scope.session === this._session && localStorage.getItem(this.SESSION_KEY) === scope.session;
    } catch { return false; }
  },

  async send(userMessage) {
    const text = userMessage.trim();
    if (!text || this._busy || this._upgradeRequired) return;
    if (text.length > 2000) { this.showNotice('Keep your message under 2,000 characters. Nothing was sent.'); return; }
    if (!this._transport || !this._session) { this.showNotice('Chat is not ready. No message was sent.'); return; }
    const scope = this.currentScope();
    this._busy = true;
    this.refreshUI();
    this.showTyping();
    try {
      const result = await this._transport.send({
        host: scope.host, message: text, session_id: scope.session,
        conversation_id: this.getConversationId(scope.host, scope.session),
        room_id: window.MallState?.currentZone || null,
      }, () => this.stillCurrent(scope), () => {
        if (!this.stillCurrent(scope)) return;
        this.appendMessage('user', text);
        const input = document.getElementById('chat-input');
        if (input?.value.trim() === text) input.value = '';
      });
      if (this.stillCurrent(scope)) this.applyResult(result, scope, text);
    } catch {
      if (this.stillCurrent(scope)) this.showNotice('The message outcome could not be confirmed. Check the original message before sending another.');
    } finally {
      this.finishActivity();
    }
  },

  async recover() {
    if (this._busy || !this._transport || !this._session) return;
    const scope = this.currentScope();
    this._busy = true;
    this.refreshUI();
    try {
      const result = await this._transport.recover(scope.host, scope.session, () => this.stillCurrent(scope));
      if (this.stillCurrent(scope)) this.applyResult(result, scope);
    } finally { this.finishActivity(); }
  },

  finishActivity() {
    this._busy = false;
    this.hideTyping();
    if (document.getElementById('chat-status')?.textContent === this._waitNotice) this.showNotice('');
    this.refreshUI();
  },

  applyResult(result, scope, draft) {
    if (result.kind === 'stale') return;
    if (result.kind === 'reply') {
      // Store a conversation pointer only for its exact original guest scope.
      let storageWarning = '';
      try { this.setConversationId(scope.host, scope.session, result.conversationId); }
      catch { storageWarning = 'The reply arrived, but its conversation pointer could not be saved.'; }
      this.appendMessage('assistant', result.message, scope.host);
      this.showNotice(result.warning || storageWarning);
      if (window.MallState?.voiceEnabled && typeof VoiceNarration !== 'undefined') {
        try {
          Promise.resolve(VoiceNarration.speak(result.message, scope.host)).catch(() => {
            if (this.stillCurrent(scope)) this.showNotice('The text reply arrived, but voice playback is unavailable.');
          });
        } catch { this.showNotice('The text reply arrived, but voice playback is unavailable.'); }
      }
      return;
    }
    if (result.upgradeRequired) this._upgradeRequired = true;
    if (result.clearConversation) {
      try { this.setConversationId(scope.host, scope.session, null); } catch { /* Retained state still controls sending. */ }
    }
    this.showNotice(result.message);
    // A known rejection can restore a draft, but never resubmit automatically.
    const input = document.getElementById('chat-input');
    if (result.resolved && draft && input && !input.value) input.value = draft;
  },

  appendMessage(role, text, host) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const message = document.createElement('div');
    message.className = role === 'user' ? 'msg user' : 'msg guide';
    if (role !== 'user') {
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar ' + (['laviche', 'ginger', 'ahnika'].includes(host) ? host : 'laviche');
      message.appendChild(avatar);
    }
    const content = document.createElement('div');
    content.className = 'msg-body';
    content.textContent = text; // Never execute user/model HTML.
    message.appendChild(content);
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    this.history.push({ role, content: text });
    this.history = this.history.slice(-this.maxHistory);
  },

  showNotice(text) {
    const notice = document.getElementById('chat-status');
    if (notice) { notice.textContent = text; notice.hidden = !text; }
  },
  refreshUI() {
    const scope = this.currentScope();
    const state = this._transport && scope.session
      ? this._transport.inspect(scope.host, scope.session) : { pending: [], blocked: true };
    const input = document.getElementById('chat-input'), send = document.getElementById('chat-send');
    const pending = document.getElementById('chat-pending'), original = document.getElementById('chat-original');
    const recover = document.getElementById('chat-recover'), detail = document.getElementById('chat-pending-detail');
    const disabled = this._busy || state.blocked || state.pending.length > 0 || this._upgradeRequired;
    if (input) input.disabled = !!disabled;
    if (send) send.disabled = !!disabled;
    if (pending) pending.hidden = !state.pending.length;
    if (state.pending.length) {
      const record = state.pending[0];
      if (original) original.textContent = JSON.parse(record.body).message;
      if (detail) detail.textContent = record.outcome
        ? 'The result arrived while you were away. Show it here before starting another message; no network request is needed.'
        : record.mode === 'durable'
        ? 'New messages are paused until this original request is resolved. Checking keeps the same text, session, and request ID.'
        : 'This older request may have been processed. Safe recovery is unavailable; contact support rather than resending it.';
      if (recover) {
        recover.hidden = !record.outcome && record.mode !== 'durable';
        recover.textContent = record.outcome ? 'Show saved result' : 'Check original message';
        recover.disabled = this._busy;
      }
    }
    if (state.blocked && state.message) this.showNotice(state.message);
  },

  scopeChanged({ sessionChanged = false } = {}) {
    this._epoch++;
    this.hideTyping();
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    this.showNotice(this._busy ? this._waitNotice : '');
    if (sessionChanged) {
      this._sessionEpoch++;
      // Do not display another guest's conversation after a storage/session switch.
      this.history = [];
      const messages = document.getElementById('chat-messages');
      if (messages) messages.textContent = '';
      this._session = null;
      this.refreshUI();
      const epoch = this._sessionEpoch;
      void this.ensureSessionId().then(id => {
        if (epoch !== this._sessionEpoch || localStorage.getItem(this.SESSION_KEY) !== id) return;
        this._session = id;
        this.refreshUI();
      }).catch(() => {
        if (epoch === this._sessionEpoch) this.showNotice('The chat session changed and could not be verified. Retained messages were not moved or resent.');
      });
    } else this.refreshUI();
  },

  showTyping() {
    this.hideTyping();
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.setAttribute('role', 'status');
    indicator.textContent = 'Checking your message…';
    container.appendChild(indicator);
  },
  hideTyping() { document.getElementById('typing-indicator')?.remove(); },
};

function sendChat() {
  const input = document.getElementById('chat-input');
  if (input && !input.disabled) return ChatEngine.send(input.value);
}
window.ChatEngine = ChatEngine;
window.sendChat = sendChat;
window.addEventListener('mall-guide-change', () => ChatEngine.scopeChanged());
// Mall auth events (including token refresh) do not change this credential-omitting
// guest client. Never treat them as a new requester or discard its valid reply.
window.addEventListener('storage', event => {
  if (event.key === ChatEngine.SESSION_KEY || event.key === null) ChatEngine.scopeChanged({ sessionChanged: true });
  else if (event.key?.startsWith('tru-skool:concierge:pending:')) ChatEngine.refreshUI();
});
window.addEventListener('pageshow', () => {
  try {
    if (localStorage.getItem(ChatEngine.SESSION_KEY) !== ChatEngine._session) ChatEngine.scopeChanged({ sessionChanged: true });
    else ChatEngine.refreshUI();
  } catch { ChatEngine.refreshUI(); }
});
void ChatEngine.init();
