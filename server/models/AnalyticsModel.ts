import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { analytics, type Analytics } from "../../shared/schema";

export class AnalyticsModel {
  // Find analytics by agent ID
  static async findByAgentId(agentId: number): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.agentId, agentId));
  }

  // Create analytics record
  static async create(analyticsData: Omit<Analytics, 'id'>): Promise<Analytics> {
    const [analyticsRecord] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return analyticsRecord;
  }

  // Update analytics for specific agent and date
  static async updateByAgentAndDate(
    agentId: number, 
    date: Date, 
    updates: Partial<Analytics>
  ): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await db
      .update(analytics)
      .set(updates)
      .where(
        and(
          eq(analytics.agentId, agentId),
          gte(analytics.date, startOfDay),
          lte(analytics.date, endOfDay)
        )
      );
  }

  // Get analytics for date range
  static async findByDateRange(
    agentId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.agentId, agentId),
          gte(analytics.date, startDate),
          lte(analytics.date, endDate)
        )
      );
  }

  // Get today's analytics for agent
  static async getTodayAnalytics(agentId: number): Promise<Analytics | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [analyticsRecord] = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.agentId, agentId),
          gte(analytics.date, today),
          lte(analytics.date, tomorrow)
        )
      );
    
    return analyticsRecord || undefined;
  }

  // Increment conversation count
  static async incrementConversations(agentId: number): Promise<void> {
    const todayAnalytics = await this.getTodayAnalytics(agentId);
    
    if (todayAnalytics) {
      await this.updateByAgentAndDate(agentId, new Date(), {
        conversationsCount: todayAnalytics.conversationsCount + 1
      });
    } else {
      await this.create({
        agentId,
        date: new Date(),
        conversationsCount: 1,
        messagesCount: 0,
        avgResponseTime: 0,
        satisfactionScore: 0
      });
    }
  }

  // Increment message count
  static async incrementMessages(agentId: number): Promise<void> {
    const todayAnalytics = await this.getTodayAnalytics(agentId);
    
    if (todayAnalytics) {
      await this.updateByAgentAndDate(agentId, new Date(), {
        messagesCount: todayAnalytics.messagesCount + 1
      });
    } else {
      await this.create({
        agentId,
        date: new Date(),
        conversationsCount: 0,
        messagesCount: 1,
        avgResponseTime: 0,
        satisfactionScore: 0
      });
    }
  }

  // Update response time
  static async updateResponseTime(agentId: number, responseTime: number): Promise<void> {
    const todayAnalytics = await this.getTodayAnalytics(agentId);
    
    if (todayAnalytics) {
      const newAvg = (todayAnalytics.avgResponseTime + responseTime) / 2;
      await this.updateByAgentAndDate(agentId, new Date(), {
        avgResponseTime: newAvg
      });
    } else {
      await this.create({
        agentId,
        date: new Date(),
        conversationsCount: 0,
        messagesCount: 0,
        avgResponseTime: responseTime,
        satisfactionScore: 0
      });
    }
  }

  // Update user satisfaction
  static async updateSatisfaction(agentId: number, satisfaction: number): Promise<void> {
    const todayAnalytics = await this.getTodayAnalytics(agentId);
    
    if (todayAnalytics) {
      const newSatisfaction = (todayAnalytics.satisfactionScore + satisfaction) / 2;
      await this.updateByAgentAndDate(agentId, new Date(), {
        satisfactionScore: newSatisfaction
      });
    } else {
      await this.create({
        agentId,
        date: new Date(),
        conversationsCount: 0,
        messagesCount: 0,
        avgResponseTime: 0,
        satisfactionScore: satisfaction
      });
    }
  }

  // Get aggregated analytics for user's agents
  static async getAggregatedAnalytics(agentIds: number[]): Promise<{
    totalConversations: number;
    totalMessages: number;
    avgResponseTime: number;
    avgSatisfaction: number;
  }> {
    if (agentIds.length === 0) {
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        avgSatisfaction: 0
      };
    }

    const allAnalytics = await Promise.all(
      agentIds.map(agentId => this.findByAgentId(agentId))
    );

    const flatAnalytics = allAnalytics.flat();

    const totals = flatAnalytics.reduce(
      (acc, record) => {
        acc.totalConversations += record.conversationsCount;
        acc.totalMessages += record.messagesCount;
        acc.responseTimeSum += record.avgResponseTime;
        acc.satisfactionSum += record.satisfactionScore;
        acc.recordCount += 1;
        return acc;
      },
      {
        totalConversations: 0,
        totalMessages: 0,
        responseTimeSum: 0,
        satisfactionSum: 0,
        recordCount: 0
      }
    );

    return {
      totalConversations: totals.totalConversations,
      totalMessages: totals.totalMessages,
      avgResponseTime: totals.recordCount > 0 ? totals.responseTimeSum / totals.recordCount : 0,
      avgSatisfaction: totals.recordCount > 0 ? totals.satisfactionSum / totals.recordCount : 0
    };
  }
}