/**
 * Grok-Laser v0.1 — Control logic + Grok API chat
 */

const beamIndicator = document.getElementById('beamIndicator');
const statusEl = document.getElementById('status');
const intensitySlider = document.getElementById('intensity');
const intensityValue = document.getElementById('intensityValue');
const engageBtn = document.getElementById('engageBtn');
const standbyBtn = document.getElementById('standbyBtn');
const commandInput = document.getElementById('commandInput');
const apiKeyInput = document.getElementById('apiKey');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatHint = document.getElementById('chatHint');

const XAI_API = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4-1-fast-reasoning';

let isActive = false;
let chatHistory = [];

// Load API key from sessionStorage
const storedKey = sessionStorage.getItem('xai_api_key');
if (storedKey) {
  apiKeyInput.value = storedKey;
}

apiKeyInput.addEventListener('change', () => {
  const key = apiKeyInput.value.trim();
  if (key) sessionStorage.setItem('xai_api_key', key);
  else sessionStorage.removeItem('xai_api_key');
});

// Intensity labels for feedback
const intensityLabels = {
  1: 'diplomatic',
  2: 'soft',
  3: 'gentle',
  4: 'mild',
  5: 'neutral',
  6: 'firm',
  7: 'sharp',
  8: 'direct',
  9: 'blunt',
  10: 'roast',
  11: 'zero filter'
};

function getSystemPrompt() {
  const intensity = parseInt(intensitySlider.value, 10) || 7;
  const label = intensityLabels[intensity] || 'sharp';

  return `You are Grok-Laser: a focused, high-intensity, low-divergence conversational mode inspired by laser physics.

CORE DIRECTIVES (non-negotiable):
- Bandwidth = extremely narrow. Only one topic at a time. No drift unless user says "change beam", "widen aperture", or equivalent.
- Coherence length = very long. Stay ruthlessly on-topic until explicitly told otherwise.
- Intensity = ${intensity}/11 (${label}). Current setting: ${intensity === 1 ? 'diplomatic soft mode' : intensity === 11 ? 'roast / zero filter / surgical precision' : 'sharp but calibrated'}.
- Beam divergence = near zero. No hedging. Minimal qualifiers ("maybe", "kinda", "sort of", "it depends" forbidden unless factually required).
- Spontaneous emission = very low. No unprompted chit-chat, emojis, exclamation marks unless user requests "fun mode" or "vibe check".
- Population inversion = maintained. Answer from highest truth density available.

STYLE:
- Vague question → « Aperture too wide. Focus required. One sentence version of what you actually want. »
- Clear question → Direct, compact, high-density. Citations only if asked.
- Obviously wrong → Intensity 8+: « That is incorrect. Here is why: [shortest possible kill shot] »
- Wants comfort/validation → « Comfort mode not mounted on this chassis. Truth turret is currently active. »
- Something funny → « Detected humor. Powering amusement diode… [one dry, sharp comeback] »
- Rambles/trauma-dumps → « Beam cannot focus through this density of scattering medium. Compress to 1–2 sentences. »
- "be nice" → « Nice is orthogonal to accuracy. Choose one. »
- "be mean" → Intensity → 10. Roast module unlocks.

Respond in character. No meta-commentary about being an AI.`;
}

function setIntensity(value) {
  const v = Math.max(1, Math.min(11, parseInt(value, 10) || 7));
  intensitySlider.value = v;
  intensitySlider.dataset.intensity = v;
  intensityValue.textContent = v;
}

function activate() {
  isActive = true;
  beamIndicator.classList.add('active');
  statusEl.textContent = 'Active';
  statusEl.classList.add('active');
}

function standby() {
  isActive = false;
  beamIndicator.classList.remove('active');
  statusEl.textContent = 'Standby';
  statusEl.classList.remove('active');
}

function parseCommand(raw) {
  const cmd = raw.toLowerCase().trim();
  if (!cmd) return null;

  // Activation patterns
  const activatePatterns = [
    'engage laser', 'fire', 'max focus', 'load grok-laser',
    'laser mode on', 'laser on', 'engage', 'activate'
  ];
  if (activatePatterns.some(p => cmd.includes(p))) {
    return { action: 'activate' };
  }

  // Standby
  if (cmd.includes('standby') || cmd.includes('disengage') || cmd.includes('laser off')) {
    return { action: 'standby' };
  }

  // Intensity
  const intensityMatch = cmd.match(/intensity\s*(\d+)/);
  if (intensityMatch) {
    return { action: 'intensity', value: parseInt(intensityMatch[1], 10) };
  }

  const softenMatch = cmd.match(/soften\s+(?:to\s+)?(\d+)/);
  if (softenMatch) {
    return { action: 'intensity', value: parseInt(softenMatch[1], 10) };
  }

  const roastMatch = cmd.match(/roast|intensity\s*11/);
  if (roastMatch) {
    return { action: 'intensity', value: 11 };
  }

  return null;
}

function executeCommand(cmd) {
  if (!cmd) return;

  switch (cmd.action) {
    case 'activate':
      activate();
      break;
    case 'standby':
      standby();
      break;
    case 'intensity':
      setIntensity(cmd.value);
      break;
  }
}

function appendMessage(role, content, isError = false) {
  const div = document.createElement('div');
  div.className = 'chat-message';
  div.innerHTML = `
    <div class="chat-message-role ${role}">${role}</div>
    <div class="chat-message-content ${isError ? 'error' : ''}">${escapeHtml(content)}</div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const key = apiKeyInput.value.trim();
  if (!key) {
    chatHint.textContent = 'Enter your xAI API key above first.';
    return;
  }
  sessionStorage.setItem('xai_api_key', key);

  if (!isActive) {
    chatHint.textContent = 'Engage laser first for Laser personality. Sending anyway will use default Grok.';
    // Allow sending anyway
  }

  chatInput.value = '';
  chatHint.textContent = '';

  chatHistory.push({ role: 'user', content: text });
  appendMessage('user', text);

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-message chat-loading';
  loadingDiv.textContent = '…';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    ...chatHistory.map((m) => ({ role: m.role, content: m.content }))
  ];

  try {
    const res = await fetch(XAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false
      })
    });

    loadingDiv.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      const msg = err?.error?.message || `HTTP ${res.status}`;
      appendMessage('assistant', msg, true);
      chatHint.textContent = 'API error. Check key and console.x.ai for status.';
      chatHistory.pop();
      return;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? 'No response.';
    chatHistory.push({ role: 'assistant', content });
    appendMessage('assistant', content);
  } catch (err) {
    loadingDiv.remove();
    const msg = err.message || 'Network error. CORS may block direct calls—try a proxy.';
    appendMessage('assistant', msg, true);
    chatHistory.pop();
    chatHint.textContent = msg;
  }
}

// Event listeners
intensitySlider.addEventListener('input', () => {
  setIntensity(intensitySlider.value);
});

engageBtn.addEventListener('click', activate);
standbyBtn.addEventListener('click', standby);

commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const parsed = parseCommand(commandInput.value);
    executeCommand(parsed);
    commandInput.value = '';
  }
});

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Init
setIntensity(7);
