import { Request, Response } from 'express';
import { ConversationModel } from '../models/ConversationModel';
import { AgentModel } from '../models/AgentModel';
import { AnalyticsModel } from '../models/AnalyticsModel';
import { generateAgentResponse } from '../openai';
import { insertConversationSchema, chatMessageSchema, type ChatMessageData } from '../../shared/schema';
import { z } from 'zod';

export class ConversationController {
  // Get conversations for authenticated user
  static async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const conversations = await ConversationModel.findByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get recent conversations
  static async getRecentConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const conversations = await ConversationModel.getRecentByUserId(userId, limit);
      res.json(conversations);
    } catch (error) {
      console.error('Get recent conversations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get conversation by session ID
  static async getConversation(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const conversation = await ConversationModel.findBySessionId(sessionId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Verify ownership
      if (conversation.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(conversation);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new conversation
  static async createConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const conversationData = { ...req.body, userId };
      const validatedData = insertConversationSchema.parse(conversationData);

      // Verify agent exists and belongs to user
      const agent = await AgentModel.findById(validatedData.agentId);
      if (!agent || agent.userId !== userId) {
        return res.status(400).json({ error: 'Invalid agent' });
      }

      const conversation = await ConversationModel.create(validatedData);
      
      // Track analytics
      await AnalyticsModel.incrementConversations(validatedData.agentId);
      
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send message in conversation
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { message, sessionId } = chatMessageSchema.parse(req.body);

      // Verify conversation exists and belongs to user
      const conversation = await ConversationModel.findBySessionId(sessionId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Get agent details
      const agent = await AgentModel.findById(conversation.agentId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Add user message
      const userMessage: ChatMessageData = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };

      await ConversationModel.addMessage(sessionId, userMessage);

      // Generate AI response
      const startTime = Date.now();
      const aiResponse = await generateAgentResponse(
        message,
        agent.template,
        agent.systemPrompt || '',
        agent.specialization
      );
      const responseTime = Date.now() - startTime;

      // Add AI message
      const aiMessage: ChatMessageData = {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: Date.now()
      };

      await ConversationModel.addMessage(sessionId, aiMessage);

      // Update analytics
      await AnalyticsModel.incrementMessages(conversation.agentId);
      await AnalyticsModel.updateResponseTime(conversation.agentId, responseTime);

      res.json({
        userMessage,
        aiMessage,
        responseTime: aiResponse.responseTime
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get conversation messages
  static async getMessages(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Verify conversation exists and belongs to user
      const conversation = await ConversationModel.findBySessionId(sessionId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await ConversationModel.getMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete conversation
  static async deleteConversation(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Verify conversation exists and belongs to user
      const conversation = await ConversationModel.findBySessionId(sessionId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const deleted = await ConversationModel.delete(sessionId);
      if (!deleted) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get conversations by agent
  static async getConversationsByAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Verify agent belongs to user
      const agent = await AgentModel.findById(parseInt(agentId));
      if (!agent || agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const conversations = await ConversationModel.findByAgentId(parseInt(agentId));
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations by agent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search conversations
  static async searchConversations(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const conversations = await ConversationModel.searchByContent(userId, query);
      res.json(conversations);
    } catch (error) {
      console.error('Search conversations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}