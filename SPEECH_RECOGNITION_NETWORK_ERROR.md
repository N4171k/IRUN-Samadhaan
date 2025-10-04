# Speech Recognition Network Error - Troubleshooting Guide

## Error Description
```
Speech recognition error: network
recognition.onerror @ AIChatBotInterview.jsx:167
```

## What This Error Means
The "network" error occurs when the browser's Speech Recognition API cannot reach Google's speech recognition service. This is a common issue because the Web Speech API requires an internet connection to process speech.

## Root Causes

### 1. Internet Connection Issues
- **Temporary network interruption**
- **Slow or unstable connection**
- **VPN or proxy interference**
- **Firewall blocking Google APIs**

### 2. Google Speech API Access
- **Regional restrictions** (some countries block Google services)
- **Corporate network blocking** external APIs
- **DNS resolution issues**
- **SSL certificate problems**

### 3. Browser/System Issues
- **Browser cache corruption**
- **Outdated browser version**
- **System time/date incorrect** (causes SSL errors)
- **Antivirus/security software blocking** API calls

## Implemented Solutions

### Auto-Retry Mechanism
The code now includes automatic retry logic:
```javascript
if (event.error === 'network') {
  if (retryCount < 1) {
    // Auto-retry once after 1 second
    setErrorMessage('Network issue detected. Retrying...');
    setTimeout(() => {
      recognitionRef.current.start();
    }, 1000);
  } else {
    setErrorMessage('Network error. Please check your internet connection and try again.');
  }
}
```

### Enhanced Error Handling
- **Better error messages** for each error type
- **State tracking** to prevent duplicate starts
- **Graceful degradation** - typing still works
- **Cleanup on errors** to prevent stuck states

### InvalidStateError Prevention
```javascript
if (error.name === 'InvalidStateError') {
  // Recognition already started, stop and restart
  recognitionRef.current.stop();
  setTimeout(() => {
    recognitionRef.current.start();
  }, 100);
}
```

## User Solutions

### Quick Fixes (Try These First)

#### 1. Check Internet Connection
```powershell
# Windows PowerShell - Test connectivity
Test-Connection google.com -Count 4
```
- Open any website to verify connection
- Try a speed test
- Restart router if needed

#### 2. Refresh the Page
- Press `Ctrl + Shift + R` (hard refresh)
- Clears cached scripts
- Reloads Speech API

#### 3. Clear Browser Cache
**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload page

#### 4. Try Again
- Click 🎤 Voice button again
- Auto-retry may have fixed it
- Check error message for updates

### Advanced Fixes

#### 1. Check Firewall Settings
**Windows Firewall:**
1. Open Windows Security
2. Firewall & network protection
3. Allow an app through firewall
4. Ensure browser (Chrome/Edge) is allowed

#### 2. Disable VPN/Proxy
- Temporarily disable VPN
- Test if speech recognition works
- If yes, configure VPN to allow Google APIs

#### 3. Check System Time/Date
- Incorrect time causes SSL errors
- Set to automatic time sync
- **Windows Settings** → **Time & Language** → **Date & Time** → **Sync now**

#### 4. Update Browser
**Chrome:**
- Menu → Help → About Google Chrome
- Updates automatically
- Restart browser

#### 5. Test in Incognito Mode
- `Ctrl + Shift + N` (Chrome/Edge)
- Grants microphone permission again
- Tests without extensions interfering

#### 6. Check DNS Settings
**Use Google DNS:**
1. Control Panel → Network → Network Connections
2. Right-click adapter → Properties
3. Select IPv4 → Properties
4. Use these DNS servers:
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`

#### 7. Disable Extensions
- Extensions may block API calls
- Try disabling ad blockers
- Test in Incognito mode (extensions disabled)

## Regional Issues

### Countries with Google Service Restrictions
If you're in a region where Google services are blocked:

**Alternative Solution: Type Instead**
- Use the textarea to type responses
- Voice input is supplementary, not required
- All interview features work without voice

**VPN Workaround:**
- Use a VPN to access Google Speech API
- Choose a server in US, UK, or EU
- Ensure VPN allows WebRTC/API calls

## Corporate Network Issues

### If Using Company Network
- IT may block external API calls
- Request whitelist for `*.google.com`
- Use personal device/network for practice

## Monitoring & Debugging

### Check Browser Console
**Open DevTools:**
- Press `F12`
- Go to "Console" tab
- Look for additional error details

**Common Console Messages:**
```javascript
// Network timeout
"Failed to fetch speech recognition results"

// Service unavailable
"Speech recognition service not available"

// Quota exceeded (rare)
"Speech recognition quota exceeded"
```

### Test Speech API Directly
**Simple Test Script:**
```javascript
// Run in browser console
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onstart = () => console.log('Started!');
recognition.onerror = (e) => console.error('Error:', e.error);
recognition.start();
// Speak something...
```

## Workarounds

### If Nothing Works

#### Option 1: Use Text Input
- Type your answers instead
- All interview features work without voice
- No functionality loss

#### Option 2: Try Different Browser
- **Chrome** (best support)
- **Edge** (same engine as Chrome)
- **Safari** (Mac/iOS only)
- ❌ **Firefox** (doesn't support Speech Recognition)

#### Option 3: Use Different Device
- Try on another computer
- Test on mobile device
- Use personal network instead of work network

#### Option 4: Different Time
- Network congestion may cause issues
- Try during off-peak hours
- Google API may have temporary outages

## Prevention Tips

### Best Practices
1. **Stable Internet**: Use wired connection if possible
2. **Updated Browser**: Keep Chrome/Edge up to date
3. **Clear Cache**: Regularly clear browser cache
4. **Test First**: Click 🎤 Voice before long responses
5. **Fallback Ready**: Have text input as backup

### Pre-Interview Checklist
- ✅ Internet connection stable
- ✅ Browser updated to latest version
- ✅ Microphone permissions granted
- ✅ Test voice input with short phrase
- ✅ Firewall/VPN not blocking Google APIs

## Code Improvements Made

### 1. State Management
```javascript
const isRecognitionActiveRef = useRef(false);
// Prevents duplicate starts
```

### 2. Retry Logic
```javascript
const [retryCount, setRetryCount] = useState(0);
// Auto-retries network errors once
```

### 3. Error Recovery
```javascript
try {
  recognitionRef.current.start();
} catch (error) {
  if (error.name === 'InvalidStateError') {
    // Handle stuck state
    recognitionRef.current.stop();
    setTimeout(() => recognitionRef.current.start(), 100);
  }
}
```

### 4. Enhanced Error Messages
- "Network issue detected. Retrying..." (auto-retry in progress)
- "Network error. Please check your internet connection..." (after retry fails)
- Clear, actionable messages for users

## When to Contact Support

### Persistent Issues
If the error persists after trying all solutions:
1. **Document the issue**:
   - Browser version
   - Operating system
   - Network type (home/work/mobile)
   - Country/region
2. **Test on another device**
3. **Try different network** (mobile hotspot)
4. **Screenshot error messages**

### Expected Behavior
✅ Voice button should work immediately  
✅ Network errors should auto-retry once  
✅ Clear error message if retry fails  
✅ Text input always works as fallback  

## Summary

The network error is usually **temporary and fixable**. The app now:
- ✅ Auto-retries once
- ✅ Shows clear error messages
- ✅ Prevents stuck states
- ✅ Provides text input fallback

**Most Common Solution**: Refresh the page and try again. The auto-retry will handle transient network issues.

---

**Last Updated**: October 4, 2025  
**Version**: 1.1.0 (with network error handling)
