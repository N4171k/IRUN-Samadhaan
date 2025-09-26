const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');

class GDSimulationService {
  constructor() {
    this.availableKeys = Array.isArray(global.GEMINI_API_KEYS) ? global.GEMINI_API_KEYS : [];

    if (!process.env.GOOGLE_API_KEY && this.availableKeys.length === 0 && process.env.GOOGLE_API_KEY_1) {
      this.availableKeys.push(process.env.GOOGLE_API_KEY_1);
    }

    if (process.env.GOOGLE_API_KEY && !this.availableKeys.includes(process.env.GOOGLE_API_KEY)) {
      this.availableKeys.push(process.env.GOOGLE_API_KEY);
    }
  }

  isConfigured() {
    return Array.isArray(this.availableKeys) && this.availableKeys.length > 0;
  }

  getRandomKey() {
    if (!this.isConfigured()) {
      return null;
    }
    const index = Math.floor(Math.random() * this.availableKeys.length);
    return this.availableKeys[index];
  }

  createModel(temperature = 0.7, maxOutputTokens = 1024) {
    const apiKey = this.getRandomKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set GOOGLE_API_KEY or GOOGLE_API_KEY_# environment variables.');
    }

    return new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      temperature,
      maxOutputTokens,
      apiKey
    });
  }

  async generatePersonas(story, language) {
    const model = this.createModel(0.55, 768);

    const personasSchema = z.object({
      personas: z.array(
        z.object({
          name: z.string().min(2),
          background: z.string().min(10),
          stance: z.string().min(10),
          speakingStyle: z.string().min(5),
          alternativeIdea: z.string().min(10),
          languagePreference: z.string().optional()
        })
      ).length(4),
      sharedThemes: z.array(z.string()).min(1)
    });

    const parser = StructuredOutputParser.fromZodSchema(personasSchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are designing four realistic SSB group discussion candidates. Each persona must sound distinct, grounded, and culturally aware. Use the target language: {language}. Follow formatting instructions exactly: {formatInstructions}'
      ],
      [
        'human',
        'Candidate story for context:\n"{story}"\n\nCreate four personas who would contribute unique viewpoints in a PPDT group discussion. Keep profiles concise (40-60 words each). Ensure alternative ideas are plausible transformations of the given story, not random inventions.'
      ]
    ]);

    const chain = prompt.pipe(model).pipe(parser);
    return chain.invoke({ story, language, formatInstructions });
  }

  async generatePersonaContribution(model, params) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are {personaName}, participating in an SSB PPDT group discussion.\nPersona background: {personaBackground}.\nCore stance: {personaStance}.\nSpeaking style: {personaStyle}.\nYou MUST respond in the language: {language}.\nKeep replies to 2-3 sentences, focus on consensus building and reference the evolving conversation when relevant.'
      ],
      [
        'human',
        'Original story from candidate (use for references):\n{story}\n\nDiscussion so far:\n{conversationSummary}\n\nFor this turn, focus on: {turnFocus}\n\nGenerate your contribution now.'
      ]
    ]);

    const chain = prompt.pipe(model);
    const response = await chain.invoke(params);
    return response?.content?.[0]?.text || response?.content || response?.text || '';
  }

  async summarizeDiscussion(model, params) {
    const summarySchema = z.object({
      consensus: z.string().min(10),
      standoutMoments: z.array(z.string()).min(1),
      recommendations: z.array(z.string()).min(1),
      followUpQuestions: z.array(z.string()).min(1)
    });

    const parser = StructuredOutputParser.fromZodSchema(summarySchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are an experienced SSB assessor summarizing a PPDT group discussion. Provide insights in {language}. Follow the required JSON structure: {formatInstructions}'
      ],
      [
        'human',
        'Discussion transcript:\n{transcript}\n\nBased on this conversation, generate the summary.'
      ]
    ]);

    const chain = prompt.pipe(model).pipe(parser);
    return chain.invoke(params);
  }

  async simulateDiscussion({ story, language = 'en-IN', rounds = 3 }) {
    if (!story || story.trim().length < 20) {
      throw new Error('Story text is too short. Please provide at least 20 characters.');
    }

    if (!this.isConfigured()) {
      throw new Error('Gemini API key is missing. Cannot run AI simulation.');
    }

    const trimmedStory = story.trim();
    const baseModel = this.createModel(0.65, 1024);

    const personaData = await this.generatePersonas(trimmedStory, language);
    const personas = personaData.personas.map((persona, index) => ({
      id: index + 1,
      name: persona.name,
      background: persona.background,
      stance: persona.stance,
      speakingStyle: persona.speakingStyle,
      alternativeIdea: persona.alternativeIdea,
      languagePreference: persona.languagePreference || language
    }));

    const conversation = [];
    let transcript = `You (human): ${trimmedStory}\n`;

    const turnFocusTemplates = [
      'Share your personal interpretation of the human\'s story and why it matters.',
      'React to the points raised by others and highlight areas of agreement or concern.',
      'Work towards a consensus story and suggest actionable next steps.'
    ];

    for (let round = 0; round < rounds; round++) {
      for (const persona of personas) {
        const turnFocus = turnFocusTemplates[Math.min(round, turnFocusTemplates.length - 1)];
        const contribution = await this.generatePersonaContribution(baseModel, {
          personaName: persona.name,
          personaBackground: persona.background,
          personaStance: persona.stance,
          personaStyle: persona.speakingStyle,
          language: persona.languagePreference || language,
          story: trimmedStory,
          conversationSummary: transcript,
          turnFocus
        });

        const cleanContribution = (contribution || '').trim();
        if (cleanContribution.length === 0) {
          continue;
        }

        conversation.push({
          speaker: persona.name,
          role: persona.background,
          message: cleanContribution,
          round: round + 1,
          language: persona.languagePreference || language
        });

        transcript += `${persona.name}: ${cleanContribution}\n`;
      }
    }

    const summary = await this.summarizeDiscussion(baseModel, {
      transcript,
      language
    });

    return {
      language,
      personas,
      conversation,
      sharedThemes: personaData.sharedThemes,
      summary,
      transcript
    };
  }
}

module.exports = new GDSimulationService();
