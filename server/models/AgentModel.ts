import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { aiAgents, type AiAgent, type InsertAiAgent } from "../../shared/schema";

export class AgentModel {
  // Find agent by ID
  static async findById(id: number): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent || undefined;
  }

  // Find agents by user ID
  static async findByUserId(userId: number): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).where(eq(aiAgents.userId, userId));
  }

  // Find active agents by user ID
  static async findActiveByUserId(userId: number): Promise<AiAgent[]> {
    return await db
      .select()
      .from(aiAgents)
      .where(and(eq(aiAgents.userId, userId), eq(aiAgents.isActive, true)));
  }

  // Find agent by user and template
  static async findByUserIdAndTemplate(userId: number, template: string): Promise<AiAgent | undefined> {
    const [agent] = await db
      .select()
      .from(aiAgents)
      .where(and(eq(aiAgents.userId, userId), eq(aiAgents.template, template)));
    return agent || undefined;
  }

  // Create new agent
  static async create(agentData: InsertAiAgent): Promise<AiAgent> {
    const [agent] = await db
      .insert(aiAgents)
      .values(agentData)
      .returning();
    return agent;
  }

  // Update agent
  static async update(id: number, updates: Partial<AiAgent>): Promise<AiAgent | undefined> {
    const [updatedAgent] = await db
      .update(aiAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiAgents.id, id))
      .returning();
    return updatedAgent || undefined;
  }

  // Delete agent
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(aiAgents).where(eq(aiAgents.id, id));
    return result.rowCount > 0;
  }

  // Activate/Deactivate agent
  static async setActive(id: number, isActive: boolean): Promise<AiAgent | undefined> {
    return await this.update(id, { isActive, updatedAt: new Date() });
  }

  // Get agent statistics
  static async getAgentStats(userId: number) {
    const agents = await this.findByUserId(userId);
    const activeAgents = agents.filter(agent => agent.isActive);
    
    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      agentsByTemplate: agents.reduce((acc, agent) => {
        acc[agent.template] = (acc[agent.template] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Bulk update agents
  static async bulkUpdateStatus(agentIds: number[], isActive: boolean): Promise<void> {
    await Promise.all(
      agentIds.map(id => this.setActive(id, isActive))
    );
  }

  // Get agents by template type
  static async findByTemplate(template: string): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).where(eq(aiAgents.template, template));
  }
}