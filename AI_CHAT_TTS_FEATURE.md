# AI Chat Bot Interview - Text-to-Speech Feature

## ✅ Feature: Automatic Male Voice Playback

**Added:** October 4, 2025

### Overview
The AI Chat Bot Interview now includes automatic text-to-speech (TTS) functionality that reads out the AI interviewer's responses in a male voice, creating a more immersive interview experience.

### Features

#### 1. Automatic Voice Playback
- **Auto-play**: Every new AI response is automatically spoken
- **Male Voice**: System selects male voice with these preferences:
  1. Indian English male voice (for regional accent)
  2. Generic English male voice
  3. Any available male voice
  4. Fallback to default English voice
- **Voice Characteristics**:
  - Lower pitch (0.8) for masculine tone
  - Slightly slower rate (0.95) for authoritative delivery
  - Full volume (1.0)

#### 2. Voice Controls
Three interactive buttons in the chat session header:

**Voice Toggle** (🔉/🔇)
- Turn TTS on/off anytime
- Default: ON
- Active state shows 🔉 (sound on)
- Inactive state shows 🔇 (sound off)
- Shows 🔊 when currently speaking

**Stop Speaking** (⏸)
- Only appears when AI is speaking
- Immediately stops current playback
- Animated pulse effect to indicate active speech

**Restart**
- Resets the interview
- Automatically stops any ongoing speech

### Technical Implementation

#### Browser Compatibility
- Uses Web Speech API (`SpeechSynthesis`)
- Supported on:
  - ✅ Chrome/Edge 33+
  - ✅ Firefox 49+
  - ✅ Safari 7+
  - ✅ Opera 21+

#### Voice Selection Algorithm
```javascript
// Preference hierarchy:
1. Indian English male (e.g., "Google हिन्दी Male")
2. English male (e.g., "Microsoft David", "Google UK English Male")
3. Any voice with "male" in name
4. Default English voice
```

#### Smart Playback
- Only plays NEW messages (prevents re-reading on re-render)
- Cancels previous speech before starting new one
- Doesn't play while AI is "thinking"
- Cleans up on component unmount

### User Experience

#### Session Flow
1. **Start Interview** → Fill form → Submit
2. **AI Greets** → Response automatically spoken in male voice
3. **User Responds** → Type and send message
4. **AI Replies** → New response auto-plays
5. **Control Voice** → Toggle or stop anytime

#### Visual Feedback
- 🔉 = Voice enabled, not speaking
- 🔊 = Currently speaking
- 🔇 = Voice disabled
- ⏸ = Stop button (pulsing animation)

### Styling

#### Button States
```css
.tts-toggle {
  /* Blue theme for voice control */
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.35);
}

.tts-toggle.active {
  /* Brighter when active */
  background: rgba(59, 130, 246, 0.25);
}

.stop-speaking {
  /* Red theme for stop */
  background: rgba(239, 68, 68, 0.15);
  animation: pulse-speaking 1.5s infinite;
}
```

### Code Locations

**Frontend Component**
- `src/pages/ai-features/AIChatBotInterview.jsx`
  - State: `isSpeaking`, `ttsEnabled`
  - Functions: `getMaleVoice()`, `speakText()`, `stopSpeaking()`
  - Hooks: `useEffect` for auto-play and cleanup

**Styling**
- `src/App.css`
  - Classes: `.tts-toggle`, `.stop-speaking`
  - Animation: `@keyframes pulse-speaking`

### Usage Tips

#### For Users
1. **Test Voice First**: Start interview and listen to greeting
2. **Adjust Volume**: Use system volume controls
3. **Mute Anytime**: Click 🔉 button to disable
4. **Stop Mid-Sentence**: Click ⏸ to interrupt

#### For Developers
1. **Voice Selection**: Runs once on mount (voices load async)
2. **Memory Management**: Speech cancelled on unmount
3. **State Tracking**: `lastSpokenMessageRef` prevents re-reading
4. **Error Handling**: Silent fallback if TTS unavailable

### Future Enhancements (Optional)

- [ ] Voice speed control slider
- [ ] Voice selection dropdown
- [ ] Pitch adjustment
- [ ] Save TTS preferences
- [ ] Highlight text being spoken
- [ ] Transcript download with timestamps
- [ ] Voice emotion detection

### Troubleshooting

**No Voice Heard?**
1. Check system volume
2. Verify browser supports Web Speech API
3. Try different browser (Chrome recommended)
4. Check if voice is enabled (🔉 icon)

**Wrong Voice/Accent?**
- Browser uses system-installed voices
- Install language packs in OS settings
- Indian English voices available via:
  - Windows: Settings → Time & Language → Speech
  - macOS: System Settings → Accessibility → Spoken Content
  - Linux: Install `espeak` or `festival` with language packs

**Voice Cuts Off?**
- Web Speech API has length limits (~32KB)
- Long responses may be truncated by browser
- This is a browser limitation, not a code issue

### Testing Checklist

- [x] Auto-play on new AI message
- [x] Male voice selection
- [x] Toggle button works
- [x] Stop button appears when speaking
- [x] Voice stops on session reset
- [x] No re-reading on re-render
- [x] Cleanup on component unmount
- [x] Proper pitch/rate settings
- [x] Visual feedback (icons)
- [x] Button animations

---

## Quick Demo Script

```javascript
// In browser console after starting interview:

// Check if TTS is enabled
console.log('TTS Enabled:', speechSynthesis.getVoices().length > 0);

// List available voices
speechSynthesis.getVoices().forEach((voice, i) => {
  console.log(`${i}: ${voice.name} (${voice.lang})`);
});

// Manually test TTS
const utterance = new SpeechSynthesisUtterance('Hello, candidate!');
utterance.pitch = 0.8;
utterance.rate = 0.95;
speechSynthesis.speak(utterance);
```

## Related Documentation
- [AI_CHAT_INTERVIEW_STATUS.md](./AI_CHAT_INTERVIEW_STATUS.md) - Overall feature status
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Browser documentation
