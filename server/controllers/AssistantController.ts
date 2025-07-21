import { Request, Response } from 'express';
import { generateAgentResponse } from '../openai';

export class AssistantController {
  static async chat(req: Request, res: Response) {
    try {
      const { message, type, currentAgent } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Enhanced system prompt for the assistant
      const systemPrompt = `You are TensorFlow AI Assistant, an intelligent productivity companion integrated into the TechFlow AI platform. You help users with:

1. Prompt Creation - Help craft effective prompts for AI agents
2. Information Retrieval - Provide current, accurate information  
3. Language Translation - Assist with translation needs
4. Email Drafting - Create professional emails
5. Productivity - Help with todos, scheduling, and motivation

Current context: ${currentAgent ? `User is working with ${currentAgent} agent` : 'General assistance'}

Be helpful, concise, and professional. Provide actionable responses.`;

      const response = await generateAgentResponse(
        message,
        systemPrompt,
        [],
        undefined
      );

      res.json({ response: response.content });
    } catch (error) {
      console.error('Assistant chat error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { query } = req.body;

      if (!query?.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      // Use Google Gemini to search and summarize information
      const searchPrompt = `Please search for current information about: "${query}"

Provide a comprehensive summary including:
- Key facts and current status
- Recent developments or updates
- Relevant statistics or data
- Credible sources when possible

Focus on accuracy and recent information.`;

      const response = await generateAgentResponse(
        searchPrompt,
        "You are a research assistant that provides accurate, up-to-date information from reliable sources.",
        [],
        undefined
      );

      res.json({ summary: response.content });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  static async translate(req: Request, res: Response) {
    try {
      const { text, targetLanguage } = req.body;

      if (!text?.trim() || !targetLanguage) {
        return res.status(400).json({ error: 'Text and target language are required' });
      }

      const languageNames: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish', 
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
      };

      const targetLanguageName = languageNames[targetLanguage] || targetLanguage;

      const translationPrompt = `Translate the following text to ${targetLanguageName}. Provide only the translation, maintaining the original tone and context:

"${text}"`;

      const response = await generateAgentResponse(
        translationPrompt,
        `You are a professional translator. Translate text accurately while preserving meaning, tone, and cultural context.`,
        [],
        undefined
      );

      res.json({ translation: response.content });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
    }
  }

  static async generateEmail(req: Request, res: Response) {
    try {
      const { intent, context } = req.body;

      if (!intent || !context?.trim()) {
        return res.status(400).json({ error: 'Intent and context are required' });
      }

      const emailPrompts: Record<string, string> = {
        'apology': 'Write a sincere apology email that acknowledges the issue, takes responsibility, and offers a solution.',
        'inquiry': 'Write a professional job inquiry email that highlights qualifications and expresses genuine interest.',
        'meeting': 'Write a clear meeting request email with purpose, proposed times, and agenda.',
        'follow-up': 'Write a polite follow-up email that references previous communication and requests an update.',
        'proposal': 'Write a compelling business proposal email that outlines value proposition and next steps.',
        'complaint': 'Write a professional complaint email that states the issue clearly and requests resolution.',
        'thank-you': 'Write a heartfelt thank you email that expresses genuine appreciation.',
        'introduction': 'Write a warm introduction email that establishes context and purpose.',
        'invitation': 'Write an engaging invitation email with clear details and compelling reasons to attend.',
        'update': 'Write a clear status update email that summarizes progress and next steps.'
      };

      const promptGuidance = emailPrompts[intent] || 'Write a professional email';

      const emailPrompt = `${promptGuidance}

Context: ${context}

Include:
- Appropriate subject line
- Professional greeting
- Clear body with proper structure
- Professional closing
- Maintain appropriate tone for the intent`;

      const response = await generateAgentResponse(
        emailPrompt,
        "You are a professional email writing assistant. Create well-structured, appropriate emails for business and personal communication.",
        [],
        undefined
      );

      res.json({ email: response.content });
    } catch (error) {
      console.error('Email generation error:', error);
      res.status(500).json({ error: 'Email generation failed' });
    }
  }
}