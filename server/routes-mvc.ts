import type { Express } from "express";
import { createServer, type Server } from "http";
import { requireAuth, optionalAuth } from "./middleware/auth";
import { 
  AuthController, 
  UserController, 
  AgentController, 
  ConversationController, 
  AnalyticsController, 
  ContactController 
} from "./controllers";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/signup", AuthController.register);
  app.post("/api/auth/login", AuthController.login);
  app.post("/api/auth/logout", AuthController.logout);
  app.get("/api/auth/me", AuthController.getCurrentUser);
  app.get("/api/auth/check", AuthController.checkAuth);

  // User Routes (Protected)
  app.get("/api/user/profile", requireAuth, UserController.getProfile);
  app.put("/api/user/profile", requireAuth, UserController.updateProfile);
  app.post("/api/user/change-password", requireAuth, UserController.changePassword);
  app.delete("/api/user/account", requireAuth, UserController.deleteAccount);

  // Agent Routes (Protected)
  app.get("/api/agents", requireAuth, AgentController.getAgents);
  app.get("/api/agents/active", requireAuth, AgentController.getActiveAgents);
  app.get("/api/agents/stats", requireAuth, AgentController.getAgentStats);
  app.get("/api/agents/template/:template", requireAuth, AgentController.getAgentsByTemplate);
  app.get("/api/agents/:id", requireAuth, AgentController.getAgent);
  app.post("/api/agents", requireAuth, AgentController.createAgent);
  app.put("/api/agents/:id", requireAuth, AgentController.updateAgent);
  app.delete("/api/agents/:id", requireAuth, AgentController.deleteAgent);
  app.patch("/api/agents/:id/status", requireAuth, AgentController.toggleAgentStatus);

  // Conversation Routes (Protected)
  app.get("/api/conversations", requireAuth, ConversationController.getConversations);
  app.get("/api/conversations/recent", requireAuth, ConversationController.getRecentConversations);
  app.get("/api/conversations/search", requireAuth, ConversationController.searchConversations);
  app.get("/api/conversations/agent/:agentId", requireAuth, ConversationController.getConversationsByAgent);
  app.get("/api/conversations/:sessionId", requireAuth, ConversationController.getConversation);
  app.get("/api/conversations/:sessionId/messages", requireAuth, ConversationController.getMessages);
  app.post("/api/conversations", requireAuth, ConversationController.createConversation);
  app.post("/api/conversations/message", requireAuth, ConversationController.sendMessage);
  app.delete("/api/conversations/:sessionId", requireAuth, ConversationController.deleteConversation);

  // Analytics Routes (Protected)
  app.get("/api/analytics/dashboard", requireAuth, AnalyticsController.getDashboardStats);
  app.get("/api/analytics/performance", requireAuth, AnalyticsController.getPerformanceMetrics);
  app.get("/api/analytics/agent/:agentId", requireAuth, AnalyticsController.getAgentAnalytics);
  app.get("/api/analytics/agent/:agentId/daterange", requireAuth, AnalyticsController.getAnalyticsByDateRange);
  app.post("/api/analytics/agent/:agentId/satisfaction", requireAuth, AnalyticsController.updateSatisfaction);

  // Contact Routes (Public)
  app.post("/api/contact", ContactController.createContact);
  app.get("/api/contact", ContactController.getContacts); // In production, this would be admin-only
  app.get("/api/contact/recent", ContactController.getRecentContacts); // In production, this would be admin-only

  // Legacy compatibility routes (can be removed once frontend is updated)
  // These map old endpoints to new MVC structure
  app.post("/api/register", AuthController.register);
  app.post("/api/login", AuthController.login);
  app.post("/api/logout", AuthController.logout);
  app.get("/api/user", requireAuth, UserController.getProfile);

  const httpServer = createServer(app);
  return httpServer;
}