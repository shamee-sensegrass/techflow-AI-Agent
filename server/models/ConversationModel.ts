import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { conversations, type Conversation, type InsertConversation, type ChatMessageData } from "../../shared/schema";

export class ConversationModel {
  // Find conversation by session ID
  static async findBySessionId(sessionId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.sessionId, sessionId));
    return conversation || undefined;
  }

  // Find conversations by agent ID
  static async findByAgentId(agentId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.agentId, agentId))
      .orderBy(desc(conversations.createdAt));
  }

  // Find conversations by user ID
  static async findByUserId(userId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  }

  // Get recent conversations
  static async getRecentByUserId(userId: number, limit: number = 10): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);
  }

  // Create new conversation
  static async create(conversationData: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  // Update conversation messages
  static async updateMessages(sessionId: string, messages: ChatMessageData[]): Promise<void> {
    await db
      .update(conversations)
      .set({ 
        messages: JSON.stringify(messages),
        updatedAt: new Date()
      })
      .where(eq(conversations.sessionId, sessionId));
  }

  // Add message to conversation
  static async addMessage(sessionId: string, message: ChatMessageData): Promise<void> {
    const conversation = await this.findBySessionId(sessionId);
    if (!conversation) {
      throw new Error(`Conversation with session ID ${sessionId} not found`);
    }

    const currentMessages: ChatMessageData[] = conversation.messages 
      ? JSON.parse(conversation.messages as string)
      : [];
    
    currentMessages.push(message);
    await this.updateMessages(sessionId, currentMessages);
  }

  // Get conversation messages
  static async getMessages(sessionId: string): Promise<ChatMessageData[]> {
    const conversation = await this.findBySessionId(sessionId);
    if (!conversation || !conversation.messages) {
      return [];
    }
    
    return JSON.parse(conversation.messages as string) as ChatMessageData[];
  }

  // Delete conversation
  static async delete(sessionId: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.sessionId, sessionId));
    return (result.rowCount || 0) > 0;
  }

  // Get conversation statistics
  static async getConversationStats(userId: number) {
    const userConversations = await this.findByUserId(userId);
    
    const totalMessages = userConversations.reduce((sum, conv) => {
      if (!conv.messages) return sum;
      const messages = JSON.parse(conv.messages as string) as ChatMessageData[];
      return sum + messages.length;
    }, 0);

    const activeConversations = userConversations.filter(conv => {
      if (!conv.messages) return false;
      const messages = JSON.parse(conv.messages as string) as ChatMessageData[];
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return false;
      
      // Consider active if last message was within 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return lastMessage.timestamp > oneDayAgo;
    });

    return {
      totalConversations: userConversations.length,
      activeConversations: activeConversations.length,
      totalMessages,
      avgMessagesPerConversation: userConversations.length > 0 
        ? Math.round(totalMessages / userConversations.length) 
        : 0
    };
  }

  // Search conversations by content
  static async searchByContent(userId: number, searchTerm: string): Promise<Conversation[]> {
    const userConversations = await this.findByUserId(userId);
    
    return userConversations.filter(conv => {
      if (!conv.messages) return false;
      const messages = JSON.parse(conv.messages as string) as ChatMessageData[];
      return messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  // Get conversations by date range
  static async findByDateRange(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          // Note: This would need proper date filtering in a real implementation
        )
      )
      .orderBy(desc(conversations.createdAt));
  }
}