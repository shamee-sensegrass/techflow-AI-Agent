import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { AssistantTrigger } from "@/components/AssistantTrigger";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  Activity,
  BarChart3,
  Zap,
  Target
} from "lucide-react";

export default function Analytics() {
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: () => api.get('/api/agents'),
  });

  // Mock analytics data for demo purposes
  const conversationData = [
    { date: '2024-01-01', conversations: 45 },
    { date: '2024-01-02', conversations: 52 },
    { date: '2024-01-03', conversations: 38 },
    { date: '2024-01-04', conversations: 65 },
    { date: '2024-01-05', conversations: 72 },
    { date: '2024-01-06', conversations: 58 },
    { date: '2024-01-07', conversations: 81 },
  ];

  const agentPerformanceData = [
    { name: 'DevOps Engineer', conversations: 245, satisfaction: 96 },
    { name: 'AI/ML Engineer', conversations: 189, satisfaction: 94 },
    { name: 'Software Engineer', conversations: 156, satisfaction: 98 },
    { name: 'Full Stack Developer', conversations: 134, satisfaction: 92 },
  ];

  const responseTimeData = [
    { hour: '00:00', avgTime: 1.2 },
    { hour: '04:00', avgTime: 0.8 },
    { hour: '08:00', avgTime: 1.5 },
    { hour: '12:00', avgTime: 2.1 },
    { hour: '16:00', avgTime: 1.8 },
    { hour: '20:00', avgTime: 1.3 },
  ];

  const satisfactionData = [
    { name: 'Excellent (5 stars)', value: 65, color: '#8b5cf6' },
    { name: 'Good (4 stars)', value: 25, color: '#3b82f6' },
    { name: 'Average (3 stars)', value: 8, color: '#f59e0b' },
    { name: 'Poor (1-2 stars)', value: 2, color: '#ef4444' },
  ];

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

  if (agentsLoading) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        {/* Loading animation particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: [null, Math.random() * window.innerWidth],
                y: [null, Math.random() * window.innerHeight],
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 relative z-10">
          <motion.div 
            className="animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-8 glass rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 glass rounded-lg"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const totalConversations = agentPerformanceData.reduce((sum, agent) => sum + agent.conversations, 0);
  const avgSatisfaction = Math.round(agentPerformanceData.reduce((sum, agent) => sum + agent.satisfaction, 0) / agentPerformanceData.length);
  const avgResponseTime = 1.4; // seconds

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-500/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 25 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-8">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Analytics
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Dashboard</span>
            </h1>
            <p className="text-gray-300">Monitor your AI agents' performance and insights</p>
          </motion.div>

          {/* Overview Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Agents</p>
                      <p className="text-3xl font-bold text-white">{agents?.length || 0}</p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/40"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Bot className="h-6 w-6 text-blue-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Conversations</p>
                      <p className="text-3xl font-bold text-white">{totalConversations}</p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/40"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Avg. Satisfaction</p>
                      <p className="text-3xl font-bold text-white">{avgSatisfaction}%</p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Star className="h-6 w-6 text-purple-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Avg. Response Time</p>
                      <p className="text-3xl font-bold text-white">{avgResponseTime}s</p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Clock className="h-6 w-6 text-amber-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Conversations Over Time */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                    Conversations Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conversationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="conversations" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent Performance */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                    Agent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Bar 
                        dataKey="conversations" 
                        fill="url(#greenGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Response Time Trends */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-400" />
                    Response Time Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Satisfaction Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-amber-400" />
                    Satisfaction Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="glass-card border-0 card-3d">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {[
                    { agent: 'DevOps Engineer', action: 'Completed infrastructure setup consultation', time: '2 minutes ago', type: 'success' },
                    { agent: 'AI/ML Engineer', action: 'Provided model optimization recommendations', time: '5 minutes ago', type: 'info' },
                    { agent: 'Software Engineer', action: 'Reviewed code architecture proposal', time: '8 minutes ago', type: 'warning' },
                    { agent: 'Full Stack Developer', action: 'Assisted with API integration', time: '12 minutes ago', type: 'success' },
                  ].map((activity, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-lg glass border-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'success' ? 'bg-green-400' :
                        activity.type === 'info' ? 'bg-blue-400' :
                        'bg-amber-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.agent}</p>
                        <p className="text-gray-300 text-sm">{activity.action}</p>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* AI Assistant Trigger */}
      <AssistantTrigger />
    </div>
  );
}