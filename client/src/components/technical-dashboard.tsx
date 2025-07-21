import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Server,
  Brain,
  Code2,
  Globe,
  Zap,
  Database,
  GitBranch,
  BarChart3
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats, AiAgent } from "@shared/schema";

export function TechnicalDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: agents, isLoading: agentsLoading } = useQuery<AiAgent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 60000 // Refresh every minute
  });

  const getAgentIcon = (template: string) => {
    switch (template) {
      case 'devops-engineer':
        return <Server className="h-5 w-5" />;
      case 'ai-ml-engineer':
        return <Brain className="h-5 w-5" />;
      case 'software-engineer':
        return <Code2 className="h-5 w-5" />;
      case 'fullstack-developer':
        return <Globe className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'devops-engineer':
        return 'bg-blue-500';
      case 'ai-ml-engineer':
        return 'bg-purple-500';
      case 'software-engineer':
        return 'bg-green-500';
      case 'fullstack-developer':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (statsLoading || agentsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded w-32 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeAgents = agents?.filter(agent => agent.isActive) || [];
  const agentsByTemplate = agents?.reduce((acc, agent) => {
    acc[agent.template] = (acc[agent.template] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AI Engineers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Specialized technical coworkers ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing technical consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Technical questions answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatResponseTime(stats?.avgResponseTime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fast technical assistance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">AI Engineers</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Technical AI Team</CardTitle>
              <CardDescription>
                Manage your specialized AI engineers and their capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAgents.map((agent) => (
                  <Card key={agent.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTemplateColor(agent.template)}`}>
                          {getAgentIcon(agent.template)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {agent.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {agent.skillLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {agent.template.replace('-', ' ')}
                          </Badge>
                          {agent.specialization && (
                            <Badge variant="secondary" className="text-xs">
                              {agent.specialization}
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Engineering Specializations</CardTitle>
              <CardDescription>
                Distribution of your technical AI team by domain expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(agentsByTemplate).map(([template, count]) => {
                  const percentage = ((count / (agents?.length || 1)) * 100);
                  return (
                    <div key={template} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAgentIcon(template)}
                          <span className="font-medium">
                            {template.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count} engineer{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Technical Activity</CardTitle>
              <CardDescription>
                Latest interactions with your AI engineering team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity?.length ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.agentName}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto opacity-50 mb-4" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start a conversation with your AI engineers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Technical assistance quality indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Quality</span>
                  <Badge variant="secondary">Excellent</Badge>
                </div>
                <Progress value={92} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Solution Accuracy</span>
                  <Badge variant="secondary">High</Badge>
                </div>
                <Progress value={88} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Code Quality</span>
                  <Badge variant="secondary">Production Ready</Badge>
                </div>
                <Progress value={95} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
                <CardDescription>
                  How your team leverages AI engineering expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Database className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Architecture Reviews</p>
                    <p className="text-sm text-muted-foreground">35% of interactions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Code2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Code Reviews</p>
                    <p className="text-sm text-muted-foreground">28% of interactions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Debugging Help</p>
                    <p className="text-sm text-muted-foreground">23% of interactions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Best Practices</p>
                    <p className="text-sm text-muted-foreground">14% of interactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency Analysis</CardTitle>
              <CardDescription>
                Savings compared to hiring senior engineers (industry average $150K/year)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">97%</div>
                  <p className="text-sm text-muted-foreground">Cost Reduction</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <p className="text-sm text-muted-foreground">Expert Domains</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}