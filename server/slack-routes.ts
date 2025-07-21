import { Express } from "express";
import { handleSlackMessage, sendSlackMessage } from "./slack";
import { testSlackConnection, sendDirectMessage } from "./slack-test";

export function registerSlackRoutes(app: Express): void {
  // Slack Events API endpoint
  app.post("/api/slack/events", async (req, res) => {
    const { type, challenge, event } = req.body;

    // Handle URL verification challenge
    if (type === "url_verification") {
      return res.json({ challenge });
    }

    // Handle events
    if (type === "event_callback" && event) {
      try {
        // Only handle messages in channels/DMs, ignore bot messages and message changes
        if (
          event.type === "message" && 
          !event.bot_id && 
          !event.subtype &&
          event.text &&
          event.user !== (process.env.SLACK_BOT_USER_ID || 'BOT_USER_ID')
        ) {
          // Process message asynchronously to avoid timeout
          setImmediate(async () => {
            try {
              await handleSlackMessage({
                text: event.text,
                user: event.user,
                channel: event.channel,
                ts: event.ts
              });
            } catch (error) {
              console.error("Error processing Slack message:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error handling Slack event:", error);
      }
    }

    // Always respond quickly to avoid timeouts
    res.status(200).json({ status: "ok" });
  });

  // Slack slash commands endpoint
  app.post("/api/slack/commands", async (req, res) => {
    const { command, text, user_id, channel_id, response_url } = req.body;

    try {
      if (command === "/techflow") {
        // Handle /techflow slash command
        const args = text?.trim().split(" ") || [];
        const subcommand = args[0]?.toLowerCase();

        switch (subcommand) {
          case "agents":
          case "list":
            // Send immediate response
            res.json({
              response_type: "ephemeral",
              text: "Fetching available agents..."
            });
            
            // Send detailed response to response_url
            setTimeout(async () => {
              await handleSlackMessage({
                text: "/agents",
                user: user_id,
                channel: channel_id,
                ts: Date.now().toString()
              });
            }, 100);
            return;

          case "help":
            return res.json({
              response_type: "ephemeral",
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "*TechFlow AI Slash Commands:*\n\n• `/techflow agents` - Show available AI agents\n• `/techflow select [type]` - Select an agent\n• `/techflow clear` - Clear current session\n• `/techflow help` - Show this help"
                  }
                }
              ]
            });

          default:
            return res.json({
              response_type: "ephemeral",
              text: `Unknown command: ${subcommand}. Use \`/techflow help\` for available options.`
            });
        }
      }
    } catch (error) {
      console.error("Error handling slash command:", error);
      return res.json({
        response_type: "ephemeral",
        text: "Sorry, I encountered an error processing your command."
      });
    }

    res.status(200).json({ status: "ok" });
  });

  // Slack health check endpoint
  app.get("/api/slack/health", async (req, res) => {
    try {
      const isConfigured = !!(process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET);
      res.json({
        slack_integration: isConfigured ? "active" : "inactive",
        timestamp: new Date().toISOString(),
        bot_configured: !!process.env.SLACK_BOT_TOKEN,
        signing_secret_configured: !!process.env.SLACK_SIGNING_SECRET
      });
    } catch (error) {
      console.error("Error checking Slack health:", error);
      res.status(500).json({ error: "Failed to check Slack status" });
    }
  });

  // Slack connection test endpoint
  app.get("/api/slack/test", async (req, res) => {
    try {
      if (!process.env.SLACK_BOT_TOKEN) {
        return res.status(400).json({ 
          error: "Slack bot token not configured",
          success: false 
        });
      }

      const { testSlackConnection } = await import("./slack-test");
      const result = await testSlackConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing Slack connection:", error);
      res.status(500).json({ 
        error: "Failed to test Slack connection",
        success: false 
      });
    }
  });

  // Slack analytics endpoint
  app.get("/api/slack/analytics", async (req, res) => {
    try {
      // Return mock analytics data for now
      res.json({
        totalMessages: 0,
        activeUsers: 0,
        averageResponseTime: 0,
        successRate: 0,
        recentActivity: []
      });
    } catch (error) {
      console.error("Error fetching Slack analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Send test message endpoint
  app.post("/api/slack/send", async (req, res) => {
    try {
      const { channel, text, isDM } = req.body;
      
      if (!process.env.SLACK_BOT_TOKEN) {
        return res.status(400).json({ 
          error: "Slack bot token not configured" 
        });
      }

      const { sendDirectMessage } = await import("./slack-test");
      const { sendSlackMessage } = await import("./slack");
      
      if (isDM) {
        const result = await sendDirectMessage(channel, text);
        res.json(result);
      } else {
        const result = await sendSlackMessage(channel, text);
        res.json(result);
      }
    } catch (error: any) {
      console.error("Error sending test message:", error);
      
      // Return more helpful error messages
      if (error.message?.includes('not added to this channel')) {
        res.status(400).json({ 
          error: "Bot not in channel", 
          message: "The bot needs to be invited to this channel first. Please add @techflowai to the channel and try again.",
          code: "not_in_channel"
        });
      } else if (error.message?.includes('Channel not found')) {
        res.status(400).json({ 
          error: "Invalid channel", 
          message: "Channel not found. Please check the channel ID or name.",
          code: "channel_not_found"
        });
      } else if (error.message?.includes('missing_scope')) {
        res.status(400).json({
          error: "Missing permissions",
          message: "The bot needs additional permissions. Please add these scopes in your Slack app settings: channels:write, groups:write, mpim:write, im:write",
          code: "missing_scope",
          required_scopes: ["channels:write", "groups:write", "mpim:write", "im:write"]
        });
      } else if (error.message?.includes('cannot_dm_bot')) {
        res.status(400).json({
          error: "Cannot DM bot",
          message: "You cannot send a DM to the bot itself. Use your own user ID (not U0930QME8QZ) or test with a channel ID instead.",
          code: "cannot_dm_bot"
        });
      } else {
        res.status(500).json({ 
          error: "Failed to send message",
          message: error.message || "Unknown error occurred"
        });
      }
    }
  });

  // Interactive components endpoint (for buttons, menus, etc.)
  app.post("/api/slack/interactive", async (req, res) => {
    try {
      const payload = JSON.parse(req.body.payload);
      const { type, user, channel, actions } = payload;

      if (type === "block_actions" && actions?.[0]) {
        const action = actions[0];
        
        if (action.action_id?.startsWith("select_agent_")) {
          const agentType = action.action_id.replace("select_agent_", "");
          
          // Handle agent selection
          await handleSlackMessage({
            text: `/select ${agentType}`,
            user: user.id,
            channel: channel.id,
            ts: Date.now().toString()
          });
        }
      }
    } catch (error) {
      console.error("Error handling interactive component:", error);
    }

    res.status(200).json({ status: "ok" });
  });

  // Health check endpoint for Slack
  app.get("/api/slack/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      slack_integration: "active"
    });
  });

  // Slack analytics endpoint
  app.get("/api/slack/analytics", (req, res) => {
    try {
      // This would normally come from your analytics database
      // For now, returning sample data structure
      const analytics = {
        totalMessages: 156,
        activeUsers: 23,
        avgResponseTime: 850,
        successRate: 98,
        agentUsage: {
          "ai-ml-engineer": 45,
          "fullstack-developer": 32,
          "devops-engineer": 23,
          "software-engineer": 38
        },
        dailyStats: [
          { date: "2024-01-01", messages: 12, users: 4 },
          { date: "2024-01-02", messages: 18, users: 6 },
          { date: "2024-01-03", messages: 25, users: 8 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching Slack analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Test Slack connection and list available channels
  app.get("/api/slack/test", async (req, res) => {
    try {
      const result = await testSlackConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing Slack connection:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Manual message endpoint for testing
  app.post("/api/slack/send", async (req, res) => {
    try {
      const { channel, text, threadTs, isDM } = req.body;
      
      if (!channel || !text) {
        return res.status(400).json({ error: "Missing channel or text" });
      }

      let messageTs;
      if (isDM) {
        messageTs = await sendDirectMessage(channel, text);
      } else {
        messageTs = await sendSlackMessage(channel, text, threadTs);
      }
      
      res.json({ 
        success: true, 
        message_ts: messageTs,
        channel,
        text 
      });
    } catch (error: any) {
      console.error("Error sending manual Slack message:", error);
      res.status(500).json({ 
        error: error.message || "Failed to send message",
        details: error.data 
      });
    }
  });
}