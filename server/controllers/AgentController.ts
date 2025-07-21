import { Request, Response } from 'express';
import { AgentModel } from '../models/AgentModel';
import { AnalyticsModel } from '../models/AnalyticsModel';
import { insertAiAgentSchema } from '../../shared/schema';
import { z } from 'zod';

export class AgentController {
  // Get all agents for authenticated user
  static async getAgents(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agents = await AgentModel.findByUserId(userId);
      res.json(agents);
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get active agents for authenticated user
  static async getActiveAgents(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agents = await AgentModel.findActiveByUserId(userId);
      res.json(agents);
    } catch (error) {
      console.error('Get active agents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get specific agent by ID
  static async getAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agent = await AgentModel.findById(parseInt(id));
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Verify ownership
      if (agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(agent);
    } catch (error) {
      console.error('Get agent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new agent
  static async createAgent(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agentData = { ...req.body, userId };
      const validatedData = insertAiAgentSchema.parse(agentData);

      // Check if agent with this template already exists for user
      const existingAgent = await AgentModel.findByUserIdAndTemplate(userId, validatedData.template);
      if (existingAgent) {
        return res.status(400).json({ error: 'Agent with this template already exists' });
      }

      const agent = await AgentModel.create(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Create agent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update agent
  static async updateAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agent = await AgentModel.findById(parseInt(id));
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Verify ownership
      if (agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedAgent = await AgentModel.update(parseInt(id), req.body);
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json(updatedAgent);
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete agent
  static async deleteAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agent = await AgentModel.findById(parseInt(id));
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Verify ownership
      if (agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const deleted = await AgentModel.delete(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
      console.error('Delete agent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Toggle agent active status
  static async toggleAgentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agent = await AgentModel.findById(parseInt(id));
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Verify ownership
      if (agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedAgent = await AgentModel.setActive(parseInt(id), isActive);
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json(updatedAgent);
    } catch (error) {
      console.error('Toggle agent status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get agent statistics
  static async getAgentStats(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const stats = await AgentModel.getAgentStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Get agent stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get agents by template
  static async getAgentsByTemplate(req: Request, res: Response) {
    try {
      const { template } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const agents = await AgentModel.findByTemplate(template);
      // Filter to only user's agents
      const userAgents = agents.filter(agent => agent.userId === userId);
      
      res.json(userAgents);
    } catch (error) {
      console.error('Get agents by template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}