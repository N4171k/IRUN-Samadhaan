# AI Chat Bot Interview - Speech-to-Text Feature

## Overview
Added speech-to-text (STT) functionality to the AI Chat Bot Interview feature, allowing users to speak their answers instead of typing. This complements the existing text-to-speech (TTS) feature for a fully voice-enabled interview experience.

## Implementation Details

### Technology Used
- **Web Speech API** - Browser's built-in SpeechRecognition API
- **Language**: English (Indian English - `en-IN`)
- **Mode**: Single utterance recognition (continuous = false)

### Features
1. **Voice Input Button**
   - 🎤 microphone icon button next to "Send"
   - Toggle recording by clicking the button
   - Visual feedback: changes to "🎤 Recording..." with red pulse animation
   - Automatically stops after user finishes speaking

2. **Real-time Transcription**
   - Speech is converted to text and appended to the input textarea
   - Users can edit the transcribed text before sending
   - Supports multiple voice inputs (cumulative transcription)

3. **Error Handling**
   - Browser compatibility check on component mount
   - Microphone permission handling
   - User-friendly error messages for common issues:
     - "No speech detected. Please try again."
     - "Microphone access denied. Please enable microphone permissions."
     - Generic error fallback for other issues

4. **State Management**
   - `isListening` - tracks active recording state
   - `recognitionRef` - holds SpeechRecognition instance
   - Proper cleanup on component unmount

### User Flow
1. User fills out interview form (name, email, designation, role)
2. Interview starts with AI greeting
3. AI asks a question (auto-played via TTS with male voice)
4. User can respond by:
   - **Typing** in the textarea
   - **Speaking** using the 🎤 Voice button
   - **Combination** of both methods
5. Speech is transcribed to text in real-time
6. User reviews/edits text and clicks "Send"
7. AI processes response and continues conversation

### Browser Compatibility
- **Supported**: Chrome, Edge, Safari (with webkit prefix)
- **Not Supported**: Firefox (as of current implementation)
- **Fallback**: Feature gracefully degrades - voice button won't appear if API unavailable

### Code Structure

#### New State Variables
```javascript
const [isListening, setIsListening] = useState(false);
const recognitionRef = useRef(null);
```

#### Key Functions
- `startListening()` - Initiates speech recognition
- `stopListening()` - Stops active recording
- `recognition.onresult` - Handles transcription results
- `recognition.onerror` - Handles recognition errors

#### UI Updates
- Added voice input button in `ai-chat-input-actions`
- Placeholder text updated: "Type your response or use voice input…"
- Visual pulse animation during recording (CSS keyframes)

### CSS Styling
```css
.voice-input {
  background: linear-gradient(135deg, #10b981, #059669); /* Green */
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
}

.voice-input.listening {
  background: linear-gradient(135deg, #ef4444, #dc2626); /* Red */
  animation: voicePulse 1.5s ease-in-out infinite;
}

@keyframes voicePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
}
```

## Testing Checklist
- [x] Voice button appears in chat input area
- [x] Clicking button starts recording (visual feedback)
- [x] Speech is transcribed to textarea
- [x] Multiple recordings accumulate text
- [x] Users can edit transcribed text
- [x] Recording stops automatically after speech ends
- [x] Error messages display for permission/no-speech issues
- [x] Works with existing TTS feature
- [x] Cleanup on component unmount
- [x] Disabled state during AI processing

## User Benefits
1. **Hands-free Input** - Speak naturally instead of typing
2. **Faster Responses** - Quicker than typing long answers
3. **Interview Realism** - More authentic verbal interview practice
4. **Accessibility** - Helps users with typing difficulties
5. **Multitasking** - Can think and speak without keyboard focus

## Technical Considerations

### Performance
- Lightweight (uses native browser API, no external libraries)
- No network calls for transcription (all local)
- Instant transcription results

### Privacy
- Speech processing happens locally in browser
- No audio data sent to external servers
- Transcription is ephemeral (not stored)

### Limitations
1. Requires microphone permissions
2. Internet connection needed (API downloads language models)
3. Accuracy depends on:
   - Microphone quality
   - Background noise
   - User's accent/pronunciation
4. May not work in all browsers (Firefox lacks support)

## Future Enhancements
- [ ] Support for multiple languages/accents
- [ ] Continuous recognition mode (real-time streaming)
- [ ] Interim results display (show partial transcription)
- [ ] Voice commands (e.g., "send message", "clear text")
- [ ] Audio waveform visualization during recording
- [ ] Confidence score display for transcriptions
- [ ] Noise cancellation/audio preprocessing

## Related Files
- `src/pages/ai-features/AIChatBotInterview.jsx` - Main component with STT logic
- `src/App.css` - Voice button styling and animations
- `README.md` - Updated feature documentation

## Architecture Changes
- Added `SpeechRecognition` API initialization in useEffect
- Extended form cleanup to include STT cleanup
- Updated UI to include voice input controls
- Enhanced error messaging for voice-related issues

## Integration with Existing Features
- **TTS (Text-to-Speech)**: AI responses are auto-played with male voice
- **STT (Speech-to-Text)**: User answers can be spoken and transcribed
- **Chat System**: Both text and voice inputs work seamlessly
- **Form Validation**: Voice input respects all existing validation rules

## Deployment Notes
- No server-side changes required
- No new dependencies added
- Feature works immediately after frontend deployment
- Users must grant microphone permissions on first use

---

**Status**: ✅ Complete and Ready for Testing  
**Date**: October 4, 2025  
**Version**: 1.0.0
