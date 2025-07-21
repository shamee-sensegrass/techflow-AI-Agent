import { WebClient } from "@slack/web-api";

// Test Slack connection and bot permissions
export async function testSlackConnection() {
  if (!process.env.SLACK_BOT_TOKEN) {
    return { success: false, error: "SLACK_BOT_TOKEN not configured" };
  }

  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

  try {
    // Test auth
    const authResult = await slack.auth.test();
    console.log("Bot auth successful:", authResult);

    // List conversations the bot has access to
    const conversations = await slack.conversations.list({
      types: "public_channel,private_channel,im"
    });

    return {
      success: true,
      botInfo: {
        user: authResult.user,
        team: authResult.team,
        url: authResult.url
      },
      availableChannels: conversations.channels?.map(c => ({
        id: c.id,
        name: c.name,
        is_member: c.is_member
      }))
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.data?.error || error.message,
      details: error.data
    };
  }
}

// Send a direct message to a user
export async function sendDirectMessage(userId: string, text: string) {
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  
  try {
    // Open a DM with the user
    const dm = await slack.conversations.open({
      users: userId
    });

    if (dm.channel?.id) {
      const response = await slack.chat.postMessage({
        channel: dm.channel.id,
        text
      });
      return response.ts;
    }
    
    throw new Error("Could not open DM channel");
  } catch (error) {
    console.error('Error sending DM:', error);
    throw error;
  }
}