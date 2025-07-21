import { WebClient } from "@slack/web-api";
import { generateAgentResponse } from "./openai";
import { storage } from "./storage";
import type { AiAgent } from "@shared/schema";

// Optional Slack integration - only throw error if trying to use Slack features
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const slack = SLACK_BOT_TOKEN ? new WebClient(SLACK_BOT_TOKEN) : null;

interface SlackMessage {
  text: string;
  user: string;
  channel: string;
  ts: string;
}

interface AgentSession {
  agentId: number;
  userId: number;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

// Store active agent sessions per Slack user
const activeSessions = new Map<string, AgentSession>();

export async function sendSlackMessage(channel: string, text: string, threadTs?: string) {
  if (!slack) {
    throw new Error('Slack integration not configured - missing bot token');
  }
  
  try {
    const response = await slack.chat.postMessage({
      channel,
      text,
      thread_ts: threadTs
    });
    return { success: true, ts: response.ts };
  } catch (error: any) {
    console.error('Error sending Slack message:', error);
    
    // Provide helpful error messages
    if (error.data?.error === 'not_in_channel') {
      throw new Error('Bot is not added to this channel. Please invite the bot to the channel first.');
    } else if (error.data?.error === 'channel_not_found') {
      throw new Error('Channel not found. Please check the channel ID.');
    } else if (error.data?.error === 'invalid_auth') {
      throw new Error('Invalid bot token. Please check your SLACK_BOT_TOKEN.');
    }
    
    throw error;
  }
}

export async function sendSlackBlocks(channel: string, blocks: any[], threadTs?: string) {
  if (!slack) {
    throw new Error('Slack integration not configured - missing bot token');
  }
  
  try {
    const response = await slack.chat.postMessage({
      channel,
      blocks,
      thread_ts: threadTs
    });
    return { success: true, ts: response.ts };
  } catch (error) {
    console.error('Error sending Slack blocks:', error);
    throw error;
  }
}

export async function handleSlackMessage(message: SlackMessage): Promise<void> {
  if (!slack) {
    console.warn('Slack integration not configured - message not handled');
    return;
  }
  
  const { text, user, channel, ts } = message;
  
  // Ignore bot messages
  if (user === 'USLACKBOT') return;
  
  try {
    // Check if user has an active session
    const session = activeSessions.get(user);
    
    // Handle commands (both / and direct commands)
    if (text.startsWith('/') || text.toLowerCase().startsWith('select ') || ['agents', 'help', 'clear', 'reset'].includes(text.toLowerCase().trim())) {
      await handleSlackCommand(text.startsWith('/') ? text : `/${text}`, user, channel, ts);
      return;
    }
    
    // If no active session, show available agents
    if (!session) {
      await showAvailableAgents(user, channel, ts);
      return;
    }
    
    // Get the agent for this session
    const agent = await storage.getAgent(session.agentId);
    if (!agent) {
      activeSessions.delete(user);
      await sendSlackMessage(channel, "❌ Agent session expired. Please select an agent again.", ts);
      await showAvailableAgents(user, channel, ts);
      return;
    }
    
    // Generate AI response
    await sendSlackMessage(channel, "🤔 Processing your request...", ts);
    
    const response = await generateAgentResponse(
      text,
      agent.template,
      session.conversationHistory,
      agent.systemPrompt
    );
    
    // Update conversation history
    session.conversationHistory.push(
      { role: 'user', content: text, timestamp: Date.now() },
      { role: 'assistant', content: response.content, timestamp: Date.now() }
    );
    
    // Keep only last 10 exchanges to manage memory
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }
    
    // Send AI response
    await sendSlackMessage(channel, `🤖 **${agent.name}** (${agent.template})\n\n${response.content}`, ts);
    
    // Update analytics
    await updateAgentAnalytics(agent.id, response.responseTime);
    
  } catch (error) {
    console.error('Error handling Slack message:', error);
    await sendSlackMessage(channel, "❌ Sorry, I encountered an error processing your request. Please try again.", ts);
  }
}

async function handleSlackCommand(command: string, user: string, channel: string, ts: string): Promise<void> {
  const [cmd, ...args] = command.slice(1).split(' ');
  
  switch (cmd.toLowerCase()) {
    case 'agents':
    case 'list':
      await showAvailableAgents(user, channel, ts);
      break;
      
    case 'select':
      if (args.length === 0) {
        await sendSlackMessage(channel, "❌ Please specify an agent type. Use `/agents` to see available options.", ts);
        return;
      }
      await selectAgent(args[0], user, channel, ts);
      break;
      
    case 'clear':
    case 'reset':
      activeSessions.delete(user);
      await sendSlackMessage(channel, "✅ Session cleared. Use `/agents` to select a new agent.", ts);
      break;
      
    case 'help':
      await showHelp(channel, ts);
      break;
      
    default:
      await sendSlackMessage(channel, `❌ Unknown command: /${cmd}. Use \`/help\` for available commands.`, ts);
  }
}

async function showAvailableAgents(user: string, channel: string, ts: string): Promise<void> {
  const agents = await storage.getAgentsByUserId(1); // Get demo agents or create a default set
  
  const agentBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🚀 Welcome to TechFlow AI!*\n\nSelect an AI agent to start chatting:"
      }
    },
    {
      type: "divider"
    }
  ];
  
  // Add available agent types
  const agentTypes = [
    { type: "ai-ml-engineer", name: "🧠 AI/ML Engineer", desc: "Machine learning, deep learning, and AI implementation" },
    { type: "fullstack-developer", name: "💻 Full Stack Developer", desc: "End-to-end web development and integration" },
    { type: "devops-engineer", name: "⚙️ DevOps Engineer", desc: "Infrastructure automation and deployment" },
    { type: "software-engineer", name: "🔧 Software Engineer", desc: "Code architecture and software best practices" }
  ];
  
  agentTypes.forEach(agent => {
    agentBlocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${agent.name}*\n${agent.desc}\n\n_Use: \`select ${agent.type}\` (without the slash)_`
      }
    });
  });
  
  agentBlocks.push(
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "💡 *Commands:* `agents` - list agents | `select [type]` - choose agent | `clear` - reset session | `help` - show help"
        }
      ]
    }
  );
  
  await sendSlackBlocks(channel, agentBlocks, ts);
}

async function selectAgent(agentType: string, user: string, channel: string, ts: string): Promise<void> {
  const validTypes = ["ai-ml-engineer", "fullstack-developer", "devops-engineer", "software-engineer"];
  
  if (!validTypes.includes(agentType)) {
    await sendSlackMessage(channel, `❌ Invalid agent type: ${agentType}. Valid types: ${validTypes.join(', ')}`, ts);
    return;
  }
  
  // Create or get existing agent for this type
  let agent = await storage.getAgentByUserIdAndTemplate(1, agentType as any);
  
  if (!agent) {
    // Create a default agent for this type
    agent = await storage.createAgent({
      userId: 1,
      name: getAgentName(agentType),
      description: getAgentDescription(agentType),
      template: agentType as any,
      systemPrompt: getDefaultSystemPrompt(agentType),
      skillLevel: "expert",
      isActive: true
    });
  }
  
  // Create new session
  activeSessions.set(user, {
    agentId: agent.id,
    userId: 1,
    conversationHistory: []
  });
  
  const welcomeBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `✅ *${agent.name}* selected!\n\n${agent.description}\n\n💬 You can now start chatting. I'm here to help with your technical questions!`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "💡 Use `clear` to reset session or `agents` to switch agents"
        }
      ]
    }
  ];
  
  await sendSlackBlocks(channel, welcomeBlocks, ts);
}

async function showHelp(channel: string, ts: string): Promise<void> {
  const helpBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🤖 TechFlow AI Slack Bot - Help*"
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Available Commands:*\n\n• `agents` or `list` - Show available AI agents\n• `select [type]` - Select an agent (ai-ml-engineer, fullstack-developer, devops-engineer, software-engineer)\n• `clear` or `reset` - Clear current session\n• `help` - Show this help message"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*How to use:*\n\n1. Start by selecting an agent with `agents`\n2. Choose your preferred specialist with `select [type]`\n3. Ask technical questions naturally\n4. Get expert-level responses from your AI agent"
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "🚀 Powered by TechFlow AI - Your technical engineering experts"
        }
      ]
    }
  ];
  
  await sendSlackBlocks(channel, helpBlocks, ts);
}

function getAgentName(type: string): string {
  const names: Record<string, string> = {
    "ai-ml-engineer": "AI/ML Engineering Expert",
    "fullstack-developer": "Full Stack Development Expert", 
    "devops-engineer": "DevOps Engineering Expert",
    "software-engineer": "Software Engineering Expert"
  };
  return names[type] || "Technical Expert";
}

function getAgentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    "ai-ml-engineer": "Expert in machine learning, deep learning, MLOps, and AI implementation strategies",
    "fullstack-developer": "Specialist in end-to-end web development, frontend, backend, and database integration",
    "devops-engineer": "Expert in infrastructure automation, CI/CD pipelines, cloud platforms, and deployment strategies", 
    "software-engineer": "Specialist in software architecture, algorithms, system design, and engineering best practices"
  };
  return descriptions[type] || "Technical engineering specialist";
}

function getDefaultSystemPrompt(type: string): string {
  // Use the same system prompts from openai.ts
  const prompts: Record<string, string> = {
    "ai-ml-engineer": "You are a Senior AI/ML Engineer with expertise in production machine learning systems and MLOps. Provide expert guidance on ML models, frameworks, deployment, and best practices.",
    "fullstack-developer": "You are a Senior Full-Stack Developer with expertise across the entire web development stack. Provide comprehensive solutions covering frontend, backend, and database integration.",
    "devops-engineer": "You are a Senior DevOps Engineer with expertise in cloud infrastructure, automation, and deployment strategies. Provide guidance on infrastructure, CI/CD, and operational best practices.",
    "software-engineer": "You are a Senior Software Engineer with expertise in scalable systems and clean code. Provide guidance on architecture, algorithms, and software engineering best practices."
  };
  return prompts[type] || "You are a senior technical expert. Provide detailed, practical guidance.";
}

async function updateAgentAnalytics(agentId: number, responseTime: number): Promise<void> {
  try {
    // Update analytics for the agent
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await storage.updateAnalytics(agentId, today, {
      totalMessages: 1,
      avgResponseTime: responseTime
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

export { activeSessions };