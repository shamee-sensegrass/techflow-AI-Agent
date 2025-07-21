import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { AssistantTrigger } from "@/components/AssistantTrigger";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Bot, 
  Users, 
  Activity, 
  Send, 
  Settings, 
  CheckCircle, 
  XCircle,
  Zap,
  Clock,
  TrendingUp
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SlackIntegration() {
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState("");
  const [testChannel, setTestChannel] = useState("");

  // Fetch Slack integration status
  const { data: slackStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/slack/health"],
    queryFn: () => api.get("/api/slack/health"),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch Slack connection test
  const { data: slackTest, isLoading: testLoading, refetch: retestConnection } = useQuery({
    queryKey: ["/api/slack/test"],
    queryFn: () => api.get("/api/slack/test"),
    retry: false
  });

  // Fetch Slack analytics
  const { data: slackAnalytics } = useQuery({
    queryKey: ["/api/slack/analytics"],
    queryFn: () => api.get("/api/slack/analytics"),
    refetchInterval: 60000 // Refresh every minute
  });

  // Send test message mutation
  const sendTestMessage = useMutation({
    mutationFn: (data: any) => api.post("/api/slack/send", data),
    onSuccess: () => {
      toast({
        title: "Test Message Sent",
        description: "Your test message was successfully sent to Slack.",
      });
      setTestMessage("");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      const title = errorData?.code === "not_in_channel" ? "Bot Not in Channel" : "Failed to Send Message";
      const description = errorData?.message || errorData?.error || "Could not send test message";
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  });

  const handleSendTest = () => {
    if (!testMessage.trim() || !testChannel.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both channel ID and test message",
        variant: "destructive",
      });
      return;
    }

    const isDM = testChannel.startsWith('U');
    
    sendTestMessage.mutate({
      channel: testChannel,
      text: `🧪 Test message from TechFlow AI: ${testMessage}`,
      isDM
    });
  };

  const isHealthy = slackStatus?.slack_integration === "active";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Slack Integration
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect your TechFlow AI agents with Slack for seamless team collaboration
            </p>
          </motion.div>

          {/* Status Overview */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-blue-400" />
                  Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      {statusLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-400" />
                      ) : isHealthy ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Connection Status</p>
                      <Badge variant={isHealthy ? "default" : "destructive"} className="mt-1">
                        {isHealthy ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <Zap className="h-8 w-8 text-yellow-500 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-400">Bot Status</p>
                      <Badge variant="outline" className="mt-1">
                        {isHealthy ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <Activity className="h-8 w-8 text-purple-500 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-400">Last Check</p>
                      <p className="text-sm text-white mt-1">
                        {slackStatus?.timestamp ? new Date(slackStatus.timestamp).toLocaleTimeString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="test">Test Bot</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-white">
                        {slackAnalytics?.totalMessages || 0}
                      </h3>
                      <p className="text-sm text-gray-400">Total Messages</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-green-400 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-white">
                        {slackAnalytics?.activeUsers || 0}
                      </h3>
                      <p className="text-sm text-gray-400">Active Users</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-white">
                        {slackAnalytics?.avgResponseTime || 0}ms
                      </h3>
                      <p className="text-sm text-gray-400">Avg Response</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-white">
                        {slackAnalytics?.successRate || 0}%
                      </h3>
                      <p className="text-sm text-gray-400">Success Rate</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Agent Usage */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle>Agent Usage in Slack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "AI/ML Engineer", usage: 45, color: "purple" },
                        { name: "Full Stack Developer", usage: 32, color: "blue" },
                        { name: "DevOps Engineer", usage: 23, color: "green" },
                        { name: "Software Engineer", usage: 38, color: "amber" }
                      ].map((agent, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{agent.name}</span>
                            <span className="text-gray-400">{agent.usage} interactions</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-600`}
                              style={{ width: `${Math.min(agent.usage, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Test Bot Tab */}
            <TabsContent value="test" className="space-y-6">
              {/* Connection Test */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Connection Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {testLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto" />
                        <p className="text-gray-400 mt-2">Testing connection...</p>
                      </div>
                    ) : slackTest?.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span>Connected successfully</span>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                          <p className="text-sm text-gray-300">
                            <strong>Bot:</strong> {slackTest.botInfo?.user}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Team:</strong> {slackTest.botInfo?.team}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Available Channels:</strong> {slackTest.availableChannels?.length || 0}
                          </p>
                        </div>
                        {slackTest.availableChannels && slackTest.availableChannels.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-gray-300">Channels bot can access:</Label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {slackTest.availableChannels.map((channel: any, index: number) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between bg-gray-700/30 rounded px-3 py-2 text-sm"
                                >
                                  <span className="text-gray-300">
                                    #{channel.name || channel.id}
                                  </span>
                                  <Badge variant={channel.is_member ? "default" : "secondary"}>
                                    {channel.is_member ? "Member" : "Not Member"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle className="h-5 w-5" />
                          <span>Connection failed</span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <p className="text-red-400 text-sm">
                            <strong>Error:</strong> {slackTest?.error || "Unknown error"}
                          </p>
                          {slackTest?.details && (
                            <p className="text-red-300 text-xs mt-2">
                              {JSON.stringify(slackTest.details)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => retestConnection()}
                      disabled={testLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {testLoading ? "Testing..." : "Test Connection"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Send Test Message */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-green-400" />
                      Send Test Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="testChannel" className="text-gray-300">Channel ID or User ID</Label>
                      <Input
                        id="testChannel"
                        value={testChannel}
                        onChange={(e) => setTestChannel(e.target.value)}
                        placeholder="Enter channel ID (C123...) or user ID (U123...)"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">
                          For DMs: Use user ID (U123...). For channels: Use channel ID (C123...) and ensure bot is added to channel.
                        </p>
                        {slackTest?.availableChannels && (
                          <div className="text-xs text-blue-400">
                            Try these channels: {slackTest.availableChannels.filter((ch: any) => ch.name).map((ch: any) => `${ch.id} (#${ch.name})`).join(', ')}
                          </div>
                        )}
                        <div className="text-xs text-orange-400 mt-1">
                          For DMs: Use YOUR user ID (not the bot's ID U0930QME8QZ). Find it in Slack: Profile → More → Copy member ID
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="testMessage" className="text-gray-300">Test Message</Label>
                      <Textarea
                        id="testMessage"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Enter a test message to send to Slack..."
                        className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSendTest} 
                      disabled={sendTestMessage.isPending || !testChannel || !testMessage}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendTestMessage.isPending ? "Sending..." : "Send Test Message"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle>Detailed Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-center py-8">
                      Detailed analytics will be available here once you start using the Slack integration.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Setup Guide Tab */}
            <TabsContent value="setup" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-blue-400" />
                      Slack Integration Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-green-400 mb-2">✅ Bot Ready</h4>
                        <p className="text-green-300 text-sm">
                          Your Slack bot is now fully configured and operational! You can send messages to channels and DMs.
                        </p>
                        <p className="text-green-300 text-xs mt-2">
                          Next: Add bot events in Event Subscriptions to enable automatic responses.
                        </p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white">Complete Setup Steps:</h3>
                      
                      <div className="space-y-3 text-gray-300">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">1</Badge>
                          <div>
                            <p className="font-medium">Fix Slack app permissions</p>
                            <p className="text-sm text-gray-400">Go to <a href="https://api.slack.com/apps" className="text-blue-400 underline" target="_blank">api.slack.com/apps</a> → Your app → OAuth & Permissions → Add missing scopes listed above</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">2</Badge>
                          <div>
                            <p className="font-medium">Configure Event Subscriptions</p>
                            <p className="text-sm text-gray-400">Enable events and add bot events: app_mention, message.channels, message.groups, message.im, message.mpim</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">3</Badge>
                          <div>
                            <p className="font-medium">Invite the bot to your channel</p>
                            <p className="text-sm text-gray-400">Type <code className="bg-gray-700 px-2 py-1 rounded">/invite @techflowai</code> in any channel or DM the bot directly</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">1</Badge>
                          <div>
                            <p className="font-medium">Start a conversation</p>
                            <p className="text-sm text-gray-400">Send any message to the bot or use <code className="bg-gray-700 px-2 py-1 rounded">/agents</code> to see available experts</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">3</Badge>
                          <div>
                            <p className="font-medium">Select an AI agent</p>
                            <p className="text-sm text-gray-400">Choose from AI/ML Engineer, Full Stack Developer, DevOps Engineer, or Software Engineer</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">4</Badge>
                          <div>
                            <p className="font-medium">Ask technical questions</p>
                            <p className="text-sm text-gray-400">Get expert-level responses on code, architecture, deployment, and more</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-400 mb-2">Available Commands:</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li><code className="bg-gray-700 px-2 py-1 rounded">/techflow agents</code> - Show available AI agents</li>
                          <li><code className="bg-gray-700 px-2 py-1 rounded">/techflow select [type]</code> - Select specific agent (ai-ml-engineer, fullstack-developer, etc.)</li>
                          <li><code className="bg-gray-700 px-2 py-1 rounded">/techflow clear</code> - Reset your session</li>
                          <li><code className="bg-gray-700 px-2 py-1 rounded">/techflow help</code> - Show help information</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      
      {/* AI Assistant Trigger */}
      <AssistantTrigger />
    </div>
  );
}