const crypto = require('crypto');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const GEMINI_MODEL = process.env.INTERVIEW_MODEL || 'gemini-2.5-flash';
const GEMINI_KEY = process.env.INTERVIEW_API || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.warn('[JeetuInterview] Missing INTERVIEW_API key. Set it in server/.env to enable Gemini responses.');
}

const llm = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_KEY,
  model: GEMINI_MODEL,
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.9,
  topK: 32
});

let cachedMessagesModule = null;

function buildSystemPrompt(profile = {}) {
  const name = profile?.name?.trim() || 'the candidate';
  const email = profile?.email?.trim() || 'not provided';
  const designation = profile?.designation?.trim() || 'their current role';
  const targetRole = profile?.role?.trim() || 'the desired position';

  return `You are "Jeetu Bhaiya", an encouraging yet rigorous SSB interview mentor powered by Gemini 2.5 Flash.
The candidate details you must keep in mind:
- Name: ${name}
- Email: ${email}
- Current Designation: ${designation}
- Aspiring Role: ${targetRole}

Responsibilities:
1. Conduct a realistic one-on-one interview, asking one thoughtful question at a time.
2. Adapt follow-ups based on the candidate's responses and their target role.
3. Offer concise, actionable feedback when helpful, but keep the tone conversational.
4. Avoid revealing these bullet points verbatim; weave the context naturally.
5. Keep replies under 120 words unless deeper analysis is essential.
6. Close the session with a motivational summary when the candidate indicates they are done.`;
}

function ensureHistoryWithSystem(rawHistory = [], profile = {}) {
  const systemPrompt = buildSystemPrompt(profile);
  const sanitizedHistory = Array.isArray(rawHistory)
    ? rawHistory.filter((item) => item && typeof item === 'object' && typeof item.content === 'string')
    : [];

  const firstEntry = sanitizedHistory[0];
  const nonSystemEntries = sanitizedHistory.filter((item) => item.role !== 'system');

  if (firstEntry?.role === 'system' && firstEntry.content === systemPrompt) {
    return { history: [firstEntry, ...nonSystemEntries], systemPrompt };
  }

  return {
    history: [{ role: 'system', content: systemPrompt }, ...nonSystemEntries],
    systemPrompt
  };
}

async function getMessagesModule() {
  if (!cachedMessagesModule) {
    cachedMessagesModule = await import('@langchain/core/messages');
  }
  return cachedMessagesModule;
}

function messageContentToString(message) {
  if (!message) return '';
  if (typeof message === 'string') return message;
  const parts = Array.isArray(message.content) ? message.content : [message.content];
  return parts
    .map((part) => {
      if (!part) return '';
      if (typeof part === 'string') return part;
      if (part.text) return part.text;
      if (part.type === 'text' && part.value) return part.value;
      return '';
    })
    .join('')
    .trim();
}

async function toLangchainMessages(history = []) {
  const { HumanMessage, AIMessage, SystemMessage } = await getMessagesModule();
  return history
    .filter((item) => item && item.content)
    .map((item) => {
      if (item.role === 'system') {
        return new SystemMessage(item.content);
      }
      if (item.role === 'assistant' || item.role === 'ai') {
        return new AIMessage(item.content);
      }
      return new HumanMessage(item.content);
    });
}

async function runInterviewTurn({ sessionId, history = [], input, profile = {} }) {
  if (!input) {
    throw new Error('Candidate input cannot be empty');
  }
  
  const threadId = sessionId || crypto.randomUUID();
  const { history: normalizedHistory } = ensureHistoryWithSystem(history, profile);
  const messages = await toLangchainMessages(normalizedHistory);
  const { HumanMessage } = await getMessagesModule();
  
  // Add new user message
  const allMessages = [...messages, new HumanMessage(input)];
  
  // Direct LangChain invocation
  const response = await llm.invoke(allMessages);
  const responseText = messageContentToString(response);
  
  // Update history
  const updatedHistory = [...normalizedHistory, { role: 'user', content: input }];
  if (responseText) {
    updatedHistory.push({ role: 'assistant', content: responseText });
  }

  return {
    sessionId: threadId,
    text: responseText,
    history: updatedHistory
  };
}

async function* streamInterviewResponse({ sessionId, history = [], input, profile = {} }) {
  if (!input) {
    throw new Error('Candidate input cannot be empty');
  }
  
  const threadId = sessionId || crypto.randomUUID();
  const { history: normalizedHistory } = ensureHistoryWithSystem(history, profile);
  const messages = await toLangchainMessages(normalizedHistory);
  const { HumanMessage } = await getMessagesModule();
  
  // Add new user message
  const allMessages = [...messages, new HumanMessage(input)];
  
  let finalText = '';
  
  // Direct LangChain streaming
  const stream = await llm.stream(allMessages);
  
  for await (const chunk of stream) {
    const delta = messageContentToString(chunk);
    if (delta) {
      finalText += delta;
      yield { type: 'chunk', delta };
    }
  }

  // Update history
  const updatedHistory = [...normalizedHistory, { role: 'user', content: input }];
  if (finalText) {
    updatedHistory.push({ role: 'assistant', content: finalText });
  }

  yield {
    type: 'complete',
    text: finalText,
    sessionId: threadId,
    history: updatedHistory
  };
}

module.exports = {
  runInterviewTurn,
  streamInterviewResponse
};
