# 🎤 Speech-to-Text User Guide

## Overview
The AI Chat Bot Interview now supports **voice input** alongside text input, enabling you to speak your answers naturally during the interview practice.

---

## 🚀 Quick Start

### 1. Start an Interview
1. Navigate to: **AI-Run** → **AI Chat Bot Interview**
2. Fill out the form:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Current Designation**: Your current role
   - **Interviewing For**: Target position (e.g., "Assistant Commandant")
3. Click **"Start Interview"**

### 2. Using Voice Input

#### Method 1: Voice Only
1. Wait for AI to ask a question (it will auto-play via speaker 🔊)
2. Click the **🎤 Voice** button (green)
3. Button turns red with "🎤 Recording..."
4. Speak your answer clearly
5. Stop speaking - transcription appears in text box
6. Review the transcribed text
7. Click **"Send"**

#### Method 2: Voice + Text (Hybrid)
1. Click **🎤 Voice** and speak part of your answer
2. Edit or add more text by typing
3. Click **🎤 Voice** again to add more via voice
4. Click **"Send"** when ready

#### Method 3: Text Only
- Type your response as usual
- No need to use voice if you prefer typing

---

## 🎯 Visual Indicators

| State | Button Appearance | Description |
|-------|------------------|-------------|
| Ready | 🎤 Voice (Green) | Click to start recording |
| Recording | 🎤 Recording... (Red with pulse) | Speak now! |
| Processing | Button disabled | AI is thinking |
| Error | Red error message below | Check microphone permissions |

---

## 🔧 First-Time Setup

### Grant Microphone Permission
**When you first click 🎤 Voice:**
1. Browser will show: "Allow [site] to use your microphone?"
2. Click **"Allow"** or **"Permit"**
3. If denied, you'll see: "Microphone access denied. Please enable microphone permissions."

**To Fix Denied Permissions:**
- **Chrome/Edge**: 
  - Click 🔒 padlock in address bar
  - Set "Microphone" to "Allow"
  - Reload page
- **Safari**: 
  - Safari menu → Settings → Websites → Microphone
  - Allow for localhost

---

## ✅ Best Practices

### For Clear Transcription
1. **Quiet Environment**: Minimize background noise
2. **Clear Speech**: Speak at normal pace, enunciate words
3. **Good Mic**: Use quality microphone if possible
4. **Review Text**: Always check transcription before sending
5. **Edit as Needed**: Fix any mistakes before submitting

### Interview Tips
- **Think First**: Organize thoughts before clicking 🎤
- **Natural Pace**: Don't rush, speak conversationally
- **Punctuation**: Say "period" or "comma" if needed
- **Edit Freely**: Transcription is editable text
- **Mix Methods**: Use voice for long answers, text for corrections

---

## 🎤 Voice Button States

```
🎤 Voice        → Ready to record (green button)
🎤 Recording... → Currently recording (red, pulsing)
(grayed out)    → Disabled during AI processing
```

---

## 🔊 Audio Features Combined

| Feature | Direction | Technology | Button |
|---------|-----------|------------|--------|
| **Text-to-Speech** | AI → You | Voice playback | 🔉 (toggle) |
| **Speech-to-Text** | You → AI | Voice input | 🎤 (record) |

### Full Voice Experience
1. **Listen**: AI question plays automatically (🔊)
2. **Think**: Formulate your response
3. **Speak**: Click 🎤 and answer verbally
4. **Edit**: Review transcribed text
5. **Send**: Submit your response
6. **Repeat**: Continue the conversation

---

## ⚠️ Troubleshooting

### "No speech detected"
**Causes:**
- Spoke too quietly
- Background noise too loud
- Microphone not working
- Recording stopped too quickly

**Solutions:**
- Check microphone icon in browser tab (should show active)
- Test mic in system settings
- Speak louder and clearer
- Click 🎤 again to retry

### "Microphone access denied"
**Cause:** Browser blocked microphone permissions

**Solution:**
1. Click 🔒 in address bar
2. Change Microphone to "Allow"
3. Refresh page
4. Try 🎤 Voice again

### "Speech recognition error"
**Generic error - possible causes:**
- Browser not supported (try Chrome/Edge)
- No internet connection (needed for first use)
- Microphone disconnected
- System permissions blocked

**Solutions:**
- Use Chrome, Edge, or Safari
- Check internet connection
- Verify microphone is connected
- Check system privacy settings

### Transcription Inaccurate
**Causes:**
- Accent/pronunciation differences
- Technical terminology
- Background noise
- Poor microphone quality

**Solutions:**
- Speak more clearly
- Use phonetic pronunciation for tricky words
- Move to quieter location
- Use better quality microphone
- **Always review and edit text before sending**

### Button Not Appearing
**Cause:** Browser doesn't support Speech Recognition API

**Browsers Supported:**
- ✅ Chrome (Windows, Mac, Linux, Android)
- ✅ Microsoft Edge
- ✅ Safari (Mac, iOS)
- ❌ Firefox (not supported)

**Solution:** Switch to Chrome or Edge

---

## 💡 Pro Tips

### Efficient Voice Input
- **Long Answers**: Voice is faster than typing
- **Short Fixes**: Type small edits instead of re-recording
- **Punctuation**: Add manually after transcription
- **Names**: Spell out unusual names in text

### Multi-Turn Conversations
- Use voice for initial answer
- Type quick follow-ups
- Mix methods based on comfort
- Save time on verbose responses

### Practice Sessions
- Simulate real verbal interviews
- Build confidence speaking answers
- Practice articulation
- Get comfortable with voice tech

---

## 📱 Device Compatibility

| Device | Voice Input | Notes |
|--------|-------------|-------|
| Desktop/Laptop | ✅ Full support | Best experience |
| Android Phone | ✅ Chrome/Edge | Works well |
| iPhone/iPad | ✅ Safari | Requires permission |
| Tablet | ✅ Chrome/Safari | Same as phones |

---

## 🔐 Privacy & Security

### Your Voice Data
- ✅ **Processed locally** in your browser
- ✅ **Not stored** anywhere
- ✅ **Not sent to servers** (except Google's Speech API for recognition)
- ✅ **Ephemeral** - discarded after transcription
- ✅ **No recordings saved**

### What Gets Stored
- ✅ Transcribed **text** (like typed messages)
- ❌ Audio files (never stored)
- ❌ Voice recordings (not saved)

---

## 🎓 Example Session

### Sample Voice Interaction

**AI (Auto-plays):** 
> "Good morning! I see you're interviewing for Assistant Commandant. Can you tell me about a time when you demonstrated leadership under pressure?"

**You (Click 🎤, speak):**
> "During my tenure as Operations Analyst, our team faced a critical system failure affecting multiple departments. I immediately assembled a cross-functional team, delegated tasks based on expertise, and maintained clear communication with stakeholders throughout the incident resolution."

**Result in text box:**
```
During my tenure as Operations Analyst, our team faced a 
critical system failure affecting multiple departments. I 
immediately assembled a cross-functional team, delegated 
tasks based on expertise, and maintained clear communication 
with stakeholders throughout the incident resolution.
```

**You:** Review, edit any errors, click **Send**

**AI (Auto-plays):**
> "That's a strong example. What specific challenges did you encounter during this incident?"

**Continue...**

---

## 🌟 Benefits

### Time Savings
- **3-5x faster** than typing long answers
- Immediate transcription
- No need to hunt for keys

### Interview Realism
- Practice **verbal responses** (closer to real interviews)
- Build **speaking confidence**
- Natural conversation flow

### Accessibility
- Alternative to typing
- Hands-free operation
- Supports various input methods

---

## 📞 Support

### Need Help?
If voice input isn't working:
1. Check this guide's troubleshooting section
2. Verify browser compatibility (use Chrome/Edge)
3. Test microphone in system settings
4. Grant browser permissions
5. Try typing as fallback method

### Feature Requests
This is version 1.0 of voice input. Future enhancements:
- Multi-language support
- Real-time transcription preview
- Voice commands
- Audio waveform visualization

---

**Happy Voice Interviewing! 🎤🎯**

*Remember: Voice input is a tool to help you practice. Always review transcriptions before sending, and feel free to mix voice and text methods for the best experience.*
