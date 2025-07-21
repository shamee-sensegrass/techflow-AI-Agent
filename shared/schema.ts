import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  plan: text("plan").notNull().default("starter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(), // devops-engineer, ai-ml-engineer, software-engineer, fullstack-developer
  systemPrompt: text("system_prompt").notNull(),
  skillLevel: text("skill_level").notNull().default("intermediate"), // beginner, intermediate, expert
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => aiAgents.id),
  userId: integer("user_id"), // optional, for anonymous chats
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => aiAgents.id),
  date: timestamp("date").defaultNow().notNull(),
  conversationsCount: integer("conversations_count").notNull().default(0),
  messagesCount: integer("messages_count").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // in milliseconds
  satisfactionScore: integer("satisfaction_score").notNull().default(0), // 1-5 scale
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
});

export const agentTemplateSchema = z.enum([
  'devops-engineer',
  'ai-ml-engineer', 
  'software-engineer',
  'fullstack-developer'
]);

export const skillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'expert'
]);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type AgentTemplate = z.infer<typeof agentTemplateSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;

export interface ChatMessageData {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentConfig {
  template: AgentTemplate;
  name: string;
  description: string;
  systemPrompt: string;
  specialization?: string;
  skillLevel: SkillLevel;
}

export interface DashboardStats {
  totalAgents: number;
  activeConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  recentActivity: Array<{
    agentName: string;
    action: string;
    timestamp: number;
  }>;
}
