# AI Chat Bot Interview - System Message Fix

**Issue Fixed:** October 4, 2025 @ 1:04 PM IST  
**Error:** "System message should be the first one"

## Problem

The "System message should be the first one" error occurred on **second and subsequent messages** in the interview conversation.

### Root Cause
1. Client normalizes history to include system message at position 0
2. Client sends this full history (with system message) to server
3. Server's `ensureHistoryWithSystem()` tries to add ANOTHER system message
4. Google Gemini API receives history with system message NOT at position 0
5. Error: "System message should be the first one"

### Why First Message Worked
- Initial prompt sends empty `history: []`
- Server adds system message correctly
- Returns history with system message at position 0

### Why Subsequent Messages Failed
```javascript
// CLIENT STATE (after first response)
history = [
  { role: 'system', content: '...' },    // Position 0
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi!' }
]

// CLIENT SENDS TO SERVER
{
  sessionId: '...',
  history: history,  // ❌ Includes system message
  prompt: 'Tell me more'
}

// SERVER RECEIVES AND PROCESSES
ensureHistoryWithSystem(history) {
  // Tries to add system message at position 0
  // But system message already exists elsewhere
  // Results in malformed message array
}

// LANGCHAIN SENDS TO GEMINI
[
  { role: 'system', ... },
  { role: 'user', ... },
  { role: 'assistant', ... },
  { role: 'system', ... },  // ❌ System message not at position 0!
  { role: 'user', ... }
]
```

## Solution

### Client-Side Fix
Filter out system messages before sending to server:

```javascript
// Before
const response = await sendInterviewPrompt({
  sessionId,
  history: previousHistory,  // ❌ Contains system message
  prompt: trimmed,
  profile
});

// After
const historyWithoutSystem = previousHistory.filter(
  msg => msg.role !== 'system'
);

const response = await sendInterviewPrompt({
  sessionId,
  history: historyWithoutSystem,  // ✅ No system messages
  prompt: trimmed,
  profile
});
```

### Why This Works
1. **Client maintains system message locally** for display/state
2. **Server always gets history WITHOUT system** messages
3. **Server adds system message once** at position 0
4. **Gemini always receives correct format**: system → user → assistant → user...

## Code Changes

### File: `src/pages/ai-features/AIChatBotInterview.jsx`

#### Change 1: Initial Message (Line ~223)
```javascript
// Server will add system message, so send empty history
const response = await sendInterviewPrompt({
  sessionId: newSessionId,
  history: [],  // ✅ Empty is correct
  prompt: initialPrompt,
  profile: candidateProfile
});
```

#### Change 2: Subsequent Messages (Line ~273)
```javascript
// Remove system messages before sending to server
const historyWithoutSystem = previousHistory.filter(
  msg => msg.role !== 'system'
);

const response = await sendInterviewPrompt({
  sessionId,
  history: historyWithoutSystem,  // ✅ Filtered
  prompt: trimmed,
  profile
});
```

## Message Flow (After Fix)

### First Message
```
CLIENT → SERVER
{
  history: [],
  prompt: "I'm Rahul, Software Engineer, interviewing for SSB"
}

SERVER PROCESSES
- ensureHistoryWithSystem([]) → [{ role: 'system', ... }]
- Adds user message
- Calls Gemini with: [system, user]

SERVER → CLIENT
{
  history: [
    { role: 'system', ... },
    { role: 'user', ... },
    { role: 'assistant', ... }
  ]
}
```

### Second Message
```
CLIENT STATE
history = [system, user1, assistant1]

CLIENT → SERVER
{
  history: [user1, assistant1],  // ✅ System filtered out
  prompt: "Tell me about leadership"
}

SERVER PROCESSES
- ensureHistoryWithSystem([user1, assistant1])
- Adds system at position 0
- Adds new user message
- Calls Gemini with: [system, user1, assistant1, user2]

SERVER → CLIENT
{
  history: [
    { role: 'system', ... },
    { role: 'user', ... },
    { role: 'assistant', ... },
    { role: 'user', ... },
    { role: 'assistant', ... }
  ]
}
```

## Testing Checklist

- [x] First message works
- [x] Second message works (previously failed)
- [x] Third message works
- [x] Multiple back-and-forth exchanges work
- [x] System message always at position 0 in server
- [x] Client maintains system message for state
- [x] Profile changes respected throughout conversation
- [x] TTS still works with filtered history
- [x] Session reset works
- [x] Build succeeds

## Verification Commands

### Check Server Logs
```bash
# Should see successful 200 responses
::1 - - [04/Oct/2025:07:33:15 +0000] "POST /api/interview/chat HTTP/1.1" 200 1856
::1 - - [04/Oct/2025:07:33:49 +0000] "POST /api/interview/chat HTTP/1.1" 200 2234
```

### Monitor Console
```javascript
// In browser console during interview
// Should NOT see system messages in network payload

// Monitor outgoing requests
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/interview'))
  .forEach(r => console.log(r.name, r.duration));
```

## Related Files
- `src/pages/ai-features/AIChatBotInterview.jsx` - Client-side filter
- `server/services/interviewAgent.js` - Server-side normalization
- `server/routes/interviewRoutes.js` - API endpoint

## Deployment Notes

### No Server Changes Needed
- Server code already handles missing/existing system messages correctly
- Only client code changed
- No database migrations required
- No environment variable changes

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to hosting
```

### Rollback Plan
If issues occur, revert to commit before this fix and restart servers.

## Prevention

### Future Guidelines
1. **Server owns system message injection** - never send from client
2. **Client filters role='system'** before all API calls
3. **Server normalizes every request** with `ensureHistoryWithSystem()`
4. **Test conversation depth** - always test 3+ exchanges minimum

### Code Review Checklist
- [ ] Does API call filter system messages?
- [ ] Does server add system message at position 0?
- [ ] Are multi-turn conversations tested?
- [ ] Is profile threaded through all turns?

---

**Status:** ✅ RESOLVED  
**Build:** Successful (11.30s)  
**Next:** Deploy and test in production
