import { Request, Response } from 'express';
import { AnalyticsModel } from '../models/AnalyticsModel';
import { AgentModel } from '../models/AgentModel';
import { ConversationModel } from '../models/ConversationModel';

export class AnalyticsController {
  // Get analytics for specific agent
  static async getAgentAnalytics(req: Request, res: Response) {
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

      const analytics = await AnalyticsModel.findByAgentId(parseInt(agentId));
      res.json(analytics);
    } catch (error) {
      console.error('Get agent analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's agents
      const agents = await AgentModel.findByUserId(userId);
      const agentIds = agents.map(agent => agent.id);

      // Get aggregated analytics
      const analytics = await AnalyticsModel.getAggregatedAnalytics(agentIds);
      
      // Get conversation stats
      const conversationStats = await ConversationModel.getConversationStats(userId);
      
      // Get agent stats
      const agentStats = await AgentModel.getAgentStats(userId);

      // Get recent activity
      const recentConversations = await ConversationModel.getRecentByUserId(userId, 5);
      const recentActivity = recentConversations.map(conv => {
        const agent = agents.find(a => a.id === conv.agentId);
        return {
          agentName: agent?.name || 'Unknown Agent',
          action: 'New conversation',
          timestamp: new Date(conv.createdAt).getTime()
        };
      });

      const dashboardStats = {
        totalAgents: agentStats.totalAgents,
        activeConversations: conversationStats.activeConversations,
        totalMessages: analytics.totalMessages,
        avgResponseTime: analytics.avgResponseTime,
        recentActivity
      };

      res.json(dashboardStats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get analytics for date range
  static async getAnalyticsByDateRange(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      // Verify agent belongs to user
      const agent = await AgentModel.findById(parseInt(agentId));
      if (!agent || agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const analytics = await AnalyticsModel.findByDateRange(
        parseInt(agentId),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(analytics);
    } catch (error) {
      console.error('Get analytics by date range error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update satisfaction score
  static async updateSatisfaction(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { satisfaction } = req.body;
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (typeof satisfaction !== 'number' || satisfaction < 1 || satisfaction > 5) {
        return res.status(400).json({ error: 'Satisfaction score must be between 1 and 5' });
      }

      // Verify agent belongs to user
      const agent = await AgentModel.findById(parseInt(agentId));
      if (!agent || agent.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await AnalyticsModel.updateSatisfaction(parseInt(agentId), satisfaction);
      
      res.json({ message: 'Satisfaction score updated successfully' });
    } catch (error) {
      console.error('Update satisfaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's agents
      const agents = await AgentModel.findByUserId(userId);
      const agentIds = agents.map(agent => agent.id);

      if (agentIds.length === 0) {
        return res.json({
          totalConversations: 0,
          totalMessages: 0,
          avgResponseTime: 0,
          avgSatisfaction: 0,
          agentPerformance: []
        });
      }

      // Get aggregated analytics
      const aggregated = await AnalyticsModel.getAggregatedAnalytics(agentIds);

      // Get performance by agent
      const agentPerformance = await Promise.all(
        agents.map(async (agent) => {
          const agentAnalytics = await AnalyticsModel.findByAgentId(agent.id);
          const totalConversations = agentAnalytics.reduce((sum, a) => sum + a.conversationsCount, 0);
          const totalMessages = agentAnalytics.reduce((sum, a) => sum + a.messagesCount, 0);
          const avgResponseTime = agentAnalytics.length > 0 
            ? agentAnalytics.reduce((sum, a) => sum + a.avgResponseTime, 0) / agentAnalytics.length 
            : 0;
          const avgSatisfaction = agentAnalytics.length > 0 
            ? agentAnalytics.reduce((sum, a) => sum + a.satisfactionScore, 0) / agentAnalytics.length 
            : 0;

          return {
            agentId: agent.id,
            agentName: agent.name,
            template: agent.template,
            totalConversations,
            totalMessages,
            avgResponseTime,
            avgSatisfaction
          };
        })
      );

      res.json({
        ...aggregated,
        agentPerformance
      });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}