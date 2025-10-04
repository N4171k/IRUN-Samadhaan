const express = require('express');
const { runInterviewTurn } = require('../services/interviewAgent');

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { sessionId, history = [], prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await runInterviewTurn({ sessionId, history, input: prompt });
    res.json(result);
  } catch (error) {
    console.error('[JeetuInterview] /api/interview/chat failed', error);
    res.status(500).json({
      error: 'Unable to contact interview mentor right now. Please retry in a moment.'
    });
  }
});

router.post('/transcribe', async (req, res) => {
  const transcript = req.body?.transcript;
  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }
  res.json({ text: transcript });
});

module.exports = router;
