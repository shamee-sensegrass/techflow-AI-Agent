import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAiAgentSchema, insertContactSchema, loginSchema, chatMessageSchema, type ChatMessageData } from "@shared/schema";
import { generateAgentResponse, getSystemPromptForTemplate } from "./openai";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session management (simplified for demo)
  const sessions = new Map<string, { userId: number }>();

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? sessions.get(sessionId) : null;
    
    if (!session) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    req.userId = session.userId;
    next();
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const sessionId = nanoid();
      sessions.set(sessionId, { userId: user.id });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token: sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const sessionId = nanoid();
      sessions.set(sessionId, { userId: user.id });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token: sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User profile update endpoints
  app.put("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const { username, email, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Check if username is already taken by another user
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== req.userId) {
          return res.status(400).json({ message: "Username already in use" });
        }
      }

      const updatedUser = await storage.updateUser(req.userId, {
        username,
        email,
        firstName,
        lastName
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...updatedUser, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/auth/password", requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const updatedUser = await storage.updateUser(req.userId, {
        password: newPassword
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Agents routes
  app.get("/api/agents", requireAuth, async (req: any, res) => {
    try {
      const agents = await storage.getAgentsByUserId(req.userId);
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/agents", requireAuth, async (req: any, res) => {
    try {
      const agentData = insertAiAgentSchema.parse({
        ...req.body,
        userId: req.userId,
        systemPrompt: req.body.systemPrompt || getSystemPromptForTemplate(req.body.template)
      });
      
      const agent = await storage.createAgent(agentData);
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const agent = await storage.getAgent(parseInt(req.params.id));
      if (!agent || agent.userId !== req.userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const agent = await storage.getAgent(parseInt(req.params.id));
      if (!agent || agent.userId !== req.userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const updatedAgent = await storage.updateAgent(parseInt(req.params.id), req.body);
      res.json(updatedAgent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const agent = await storage.getAgent(parseInt(req.params.id));
      if (!agent || agent.userId !== req.userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      await storage.deleteAgent(parseInt(req.params.id));
      res.json({ message: "Agent deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.post("/api/chat/:agentId", async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const { message, sessionId } = chatMessageSchema.parse(req.body);
      
      const agent = await storage.getAgent(agentId);
      if (!agent || !agent.isActive) {
        return res.status(404).json({ message: "Agent not found or inactive" });
      }
      
      // Get or create conversation
      let conversation = await storage.getConversation(sessionId);
      if (!conversation) {
        conversation = await storage.createConversation({
          agentId,
          sessionId,
          messages: [],
          isActive: true,
          userId: null
        });
      }
      
      // Get conversation history
      const messages = (conversation.messages as ChatMessageData[]) || [];
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Generate AI response
      const aiResponse = await generateAgentResponse(
        agent.systemPrompt,
        message,
        conversationHistory
      );
      
      // Update conversation with new messages
      const updatedMessages: ChatMessageData[] = [
        ...messages,
        { role: 'user', content: message, timestamp: Date.now() },
        { role: 'assistant', content: aiResponse.content, timestamp: Date.now() }
      ];
      
      await storage.updateConversationMessages(sessionId, updatedMessages);
      
      res.json({
        response: aiResponse.content,
        responseTime: aiResponse.responseTime
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/conversations/:sessionId", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.sessionId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/agent/:agentId", requireAuth, async (req: any, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const agent = await storage.getAgent(agentId);
      
      if (!agent || agent.userId !== req.userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const analytics = await storage.getAnalyticsByAgentId(agentId);
      const conversations = await storage.getConversationsByAgentId(agentId);
      
      // Calculate current stats
      const totalConversations = conversations.length;
      const totalMessages = conversations.reduce((sum, conv) => {
        const messages = (conv.messages as ChatMessageData[]) || [];
        return sum + messages.length;
      }, 0);
      
      res.json({
        analytics,
        stats: {
          totalConversations,
          totalMessages,
          activeToday: conversations.filter(conv => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return conv.updatedAt >= today;
          }).length
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ message: "Contact form submitted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const agents = await storage.getAgentsByUserId(req.userId);
      const activeAgents = agents.filter(agent => agent.isActive).length;
      
      let totalConversations = 0;
      let averageSatisfaction = 0;
      
      for (const agent of agents) {
        const conversations = await storage.getConversationsByAgentId(agent.id);
        totalConversations += conversations.length;
      }
      
      // Mock satisfaction score for demo
      averageSatisfaction = 96;
      
      res.json({
        activeAgents,
        totalConversations,
        averageSatisfaction
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assistant endpoints
  app.post("/api/assistant", async (req, res) => {
    try {
      const { message, type, currentAgent } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

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
  });

  app.post("/api/assistant/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query?.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const searchPrompt = `Please provide comprehensive information about: "${query}"

Include:
- Key facts and current status
- Recent developments or updates
- Relevant statistics or data
- Context and background information

Focus on accuracy and helpful details.`;

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
  });

  app.post("/api/assistant/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text?.trim() || !targetLanguage) {
        return res.status(400).json({ error: 'Text and target language are required' });
      }

      const languageNames: Record<string, string> = {
        'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
        'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
        'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi'
      };

      const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
      const translationPrompt = `Translate the following text to ${targetLanguageName}. Provide only the translation, maintaining the original tone and context:

"${text}"`;

      const response = await generateAgentResponse(
        translationPrompt,
        "You are a professional translator. Translate text accurately while preserving meaning, tone, and cultural context.",
        [],
        undefined
      );

      res.json({ translation: response.content });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
    }
  });

  app.post("/api/assistant/email", async (req, res) => {
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
  });

  const httpServer = createServer(app);
  return httpServer;
}
