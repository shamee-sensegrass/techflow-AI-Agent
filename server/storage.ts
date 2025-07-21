import { users, aiAgents, conversations, analytics, contacts, type User, type InsertUser, type AiAgent, type InsertAiAgent, type Conversation, type InsertConversation, type Analytics, type Contact, type InsertContact, type ChatMessageData, type DashboardStats } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, avg, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // AI Agents
  getAgentsByUserId(userId: number): Promise<AiAgent[]>;
  getAgent(id: number): Promise<AiAgent | undefined>;
  getAgentByUserIdAndTemplate(userId: number, template: string): Promise<AiAgent | undefined>;
  createAgent(agent: InsertAiAgent): Promise<AiAgent>;
  updateAgent(id: number, updates: Partial<AiAgent>): Promise<AiAgent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  getActiveAgentsByUserId(userId: number): Promise<AiAgent[]>;
  
  // Conversations
  getConversation(sessionId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationMessages(sessionId: string, messages: ChatMessageData[]): Promise<void>;
  getConversationsByAgentId(agentId: number): Promise<Conversation[]>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  getRecentConversations(userId: number, limit?: number): Promise<Conversation[]>;
  
  // Analytics
  getAnalyticsByAgentId(agentId: number): Promise<Analytics[]>;
  createAnalytics(analytics: Omit<Analytics, 'id'>): Promise<Analytics>;
  updateAnalytics(agentId: number, date: Date, updates: Partial<Analytics>): Promise<void>;
  getDashboardStats(userId: number): Promise<DashboardStats>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private aiAgents: Map<number, AiAgent>;
  private conversations: Map<string, Conversation>;
  private analytics: Map<number, Analytics>;
  private contacts: Map<number, Contact>;
  private currentUserId: number;
  private currentAgentId: number;
  private currentAnalyticsId: number;
  private currentContactId: number;

  constructor() {
    this.users = new Map();
    this.aiAgents = new Map();
    this.conversations = new Map();
    this.analytics = new Map();
    this.contacts = new Map();
    this.currentUserId = 1;
    this.currentAgentId = 1;
    this.currentAnalyticsId = 1;
    this.currentContactId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      company: insertUser.company || null,
      plan: insertUser.plan || "starter",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // AI Agents
  async getAgentsByUserId(userId: number): Promise<AiAgent[]> {
    return Array.from(this.aiAgents.values()).filter(agent => agent.userId === userId);
  }

  async getAgent(id: number): Promise<AiAgent | undefined> {
    return this.aiAgents.get(id);
  }

  async createAgent(insertAgent: InsertAiAgent): Promise<AiAgent> {
    const id = this.currentAgentId++;
    const now = new Date();
    const agent: AiAgent = { 
      ...insertAgent, 
      id, 
      description: insertAgent.description || null,
      isActive: insertAgent.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.aiAgents.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, updates: Partial<AiAgent>): Promise<AiAgent | undefined> {
    const agent = this.aiAgents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { 
      ...agent, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.aiAgents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<boolean> {
    return this.aiAgents.delete(id);
  }

  // Conversations
  async getConversation(sessionId: string): Promise<Conversation | undefined> {
    return this.conversations.get(sessionId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentUserId++;
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      userId: insertConversation.userId || null,
      isActive: insertConversation.isActive ?? true,
      messages: insertConversation.messages || [],
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(insertConversation.sessionId, conversation);
    return conversation;
  }

  async updateConversationMessages(sessionId: string, messages: ChatMessageData[]): Promise<void> {
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.messages = messages as any;
      conversation.updatedAt = new Date();
      this.conversations.set(sessionId, conversation);
    }
  }

  async getConversationsByAgentId(agentId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.agentId === agentId);
  }

  // Analytics
  async getAnalyticsByAgentId(agentId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.agentId === agentId);
  }

  async createAnalytics(analyticsData: Omit<Analytics, 'id'>): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analytics: Analytics = { ...analyticsData, id };
    this.analytics.set(id, analytics);
    return analytics;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      company: insertContact.company || null,
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAgentsByUserId(userId: number): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).where(eq(aiAgents.userId, userId));
  }

  async getAgent(id: number): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent || undefined;
  }

  async getAgentByUserIdAndTemplate(userId: number, template: string): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(
      and(eq(aiAgents.userId, userId), eq(aiAgents.template, template))
    );
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAiAgent): Promise<AiAgent> {
    const [agent] = await db
      .insert(aiAgents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async getActiveAgentsByUserId(userId: number): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).where(
      and(eq(aiAgents.userId, userId), eq(aiAgents.isActive, true))
    );
  }

  async updateAgent(id: number, updates: Partial<AiAgent>): Promise<AiAgent | undefined> {
    const [agent] = await db
      .update(aiAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiAgents.id, id))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(aiAgents).where(eq(aiAgents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getConversation(sessionId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.sessionId, sessionId));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversationMessages(sessionId: string, messages: ChatMessageData[]): Promise<void> {
    await db
      .update(conversations)
      .set({ 
        messages: messages,
        updatedAt: new Date()
      })
      .where(eq(conversations.sessionId, sessionId));
  }

  async getConversationsByAgentId(agentId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.agentId, agentId));
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async getRecentConversations(userId: number, limit: number = 10): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(limit);
  }

  async getAnalyticsByAgentId(agentId: number): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.agentId, agentId));
  }

  async createAnalytics(analyticsData: Omit<Analytics, 'id'>): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return analytic;
  }

  async updateAnalytics(agentId: number, date: Date, updates: Partial<Analytics>): Promise<void> {
    await db
      .update(analytics)
      .set(updates)
      .where(and(eq(analytics.agentId, agentId), eq(analytics.date, date)));
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const userAgents = await this.getAgentsByUserId(userId);
    const agentIds = userAgents.map(agent => agent.id);
    
    if (agentIds.length === 0) {
      return {
        totalAgents: 0,
        activeConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        recentActivity: []
      };
    }

    // Get conversation counts and message statistics
    const conversationStats = await db
      .select({
        agentId: conversations.agentId,
        count: count(conversations.id)
      })
      .from(conversations)
      .where(sql`${conversations.agentId} = ANY(${agentIds})`)
      .groupBy(conversations.agentId);

    // Get analytics for response time
    const analyticsData = await db
      .select({
        avgResponseTime: avg(analytics.avgResponseTime)
      })
      .from(analytics)
      .where(sql`${analytics.agentId} = ANY(${agentIds})`);

    // Get recent activity
    const recentConversations = await db
      .select({
        agentName: aiAgents.name,
        createdAt: conversations.createdAt
      })
      .from(conversations)
      .innerJoin(aiAgents, eq(conversations.agentId, aiAgents.id))
      .where(sql`${conversations.agentId} = ANY(${agentIds})`)
      .orderBy(desc(conversations.createdAt))
      .limit(5);

    return {
      totalAgents: userAgents.length,
      activeConversations: conversationStats.reduce((sum, stat) => sum + stat.count, 0),
      totalMessages: conversationStats.reduce((sum, stat) => sum + stat.count * 2, 0), // Estimate messages
      avgResponseTime: Number(analyticsData[0]?.avgResponseTime) || 0,
      recentActivity: recentConversations.map(conv => ({
        agentName: conv.agentName,
        action: 'New conversation started',
        timestamp: conv.createdAt.getTime()
      }))
    };
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
}

export const storage = new DatabaseStorage();
