const crypto = require('crypto');
const { HumanMessage, AIMessage } = require('langchain/schema');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { StateGraph, END, START } = require('@langchain/langgraph');
const { MessagesAnnotation } = require('@langchain/langgraph/annotations');
const { MemorySaver } = require('@langchain/langgraph/checkpoint/memory');

const GEMINI_MODEL = process.env.INTERVIEW_MODEL || 'gemini-2.0-flash-exp';
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

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('gemini', async (state) => {
    const response = await llm.invoke(state.messages);
    return { messages: [response] };
  })
  .addEdge(START, 'gemini')
  .addEdge('gemini', END);

const checkpointer = new MemorySaver();
const interviewGraph = workflow.compile({ checkpointer });

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

function toLangchainMessages(history = []) {
  return history
    .filter((item) => item && item.content)
    .map((item) => {
      if (item.role === 'assistant' || item.role === 'ai') {
        return new AIMessage(item.content);
      }
      return new HumanMessage(item.content);
    });
}

async function runInterviewTurn({ sessionId, history = [], input }) {
  if (!input) {
    throw new Error('Candidate input cannot be empty');
  }
  const threadId = sessionId || crypto.randomUUID();
  const messages = [...toLangchainMessages(history), new HumanMessage(input)];
  const result = await interviewGraph.invoke(
    { messages },
    {
      configurable: {
        thread_id: threadId
      }
    }
  );

  const responseMessage = result.messages[result.messages.length - 1];
  const responseText = messageContentToString(responseMessage);
  const updatedHistory = [...history, { role: 'user', content: input }];
  if (responseText) {
    updatedHistory.push({ role: 'assistant', content: responseText });
  }

  return {
    sessionId: threadId,
    text: responseText,
    history: updatedHistory
  };
}

async function* streamInterviewResponse({ sessionId, history = [], input }) {
  if (!input) {
    throw new Error('Candidate input cannot be empty');
  }
  const threadId = sessionId || crypto.randomUUID();
  const baseMessages = toLangchainMessages(history);
  const stream = await interviewGraph.streamEvents(
    { messages: [...baseMessages, new HumanMessage(input)] },
    {
      version: 'v1',
      configurable: {
        thread_id: threadId
      }
    }
  );

  let finalText = '';

  for await (const event of stream) {
    if (event.event === 'on_chat_model_stream') {
      const chunk = event.data?.chunk;
      const chunkMessage = chunk?.message || chunk?.messages?.[0];
      const delta = messageContentToString(chunkMessage);
      if (delta) {
        finalText += delta;
        yield { type: 'chunk', delta };
      }
    }

    if (event.event === 'on_chat_model_end') {
      const outputMessage = event.data?.output?.message;
      const text = messageContentToString(outputMessage);
      if (text) {
        finalText = text;
      }
    }
  }

  const updatedHistory = [...history, { role: 'user', content: input }];
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
