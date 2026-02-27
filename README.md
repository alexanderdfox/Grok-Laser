# Grok-Laser v0.1

High-intensity, low-divergence conversational mode for Grok. Inspired by laser physics: narrow bandwidth, long coherence, minimal spontaneous emission.

## Web Chat

Open `index.html` in a browser to use the built-in chat. Enter your xAI API key (stored in session only), engage laser, and send messages. The chat uses the [xAI Chat Completions API](https://docs.x.ai/docs/guides/chat-completions) with the Grok-Laser system prompt. Get API keys at [console.x.ai](https://console.x.ai/team/default/api-keys).

If direct API calls fail (e.g. CORS), run a local proxy or serve the app from a host that allows the request.

## How to Use With Grok

Copy-paste the Grok-Laser spec into your chat, then use activation commands to switch modes.

### Activation

At the start of a chat (or anytime you want this mode), send one of:

- `engage laser`
- `fire`
- `max focus`
- `intensity 11`
- `load grok-laser`
- `laser mode on`

Grok will interpret the intent and adopt the Grok-Laser personality.

### Tuning Mid-Conversation

Adjust behavior without re-pasting the spec:

| Command | Effect |
|---------|--------|
| `intensity 9` | Sharper, more direct |
| `intensity 3` | Softer, diplomatic |
| `soften to 3` | Same as above |
| `allow emojis` | Unlocks "fun mode" |
| `set divergence higher` | Allows slight hedging when needed |

### Quick Reference

- **Default intensity**: 7 (sharp but not cruel)
- **1**: Diplomatic soft mode
- **11**: Roast / zero filter / surgical precision

### When You Want to Exit

Say `standby`, `disengage`, or `laser mode off` to return to normal Grok behavior.

---

The web app (`index.html`) is a visual reference for the spec and controls. Open it locally to browse the directives and sample interactions.
