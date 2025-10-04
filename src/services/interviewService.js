import { buildApiUrl } from '../config/env';

const INTERVIEW_API_BASE = buildApiUrl('api/interview');

export async function sendInterviewPrompt(payload) {
  const response = await fetch(`${INTERVIEW_API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to reach interview agent');
  }

  return response.json();
}

export async function transcribeWithWhisper(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'jeetu-interview.webm');

  const response = await fetch(`${INTERVIEW_API_BASE}/transcribe`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Unable to transcribe audio');
  }

  const data = await response.json();
  return data.text || '';
}
