import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { AssistantTrigger } from "@/components/AssistantTrigger";
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Plus, 
  BarChart3, 
  Activity,
  Zap,
  Clock,
  Target,
  Cpu,
  Globe,
  ArrowUp,
  Sparkles,
  ChevronRight
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

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => api.get('/api/dashboard/stats'),
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: () => api.get('/api/agents'),
  });

  const recentAgents = agents?.slice(0, 3) || [];
  const activeAgents = agents?.filter((agent: any) => agent.isActive) || [];
  
  const quickStats = {
    totalAgents: agents?.length || 0,
    activeAgents: activeAgents.length,
    totalConversations: stats?.totalConversations || 0,
    avgResponseTime: stats?.avgResponseTime || 0.8
  };

  if (statsLoading || agentsLoading) {
    return (
      <div className="flex min-h-screen relative">
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
        <div className="flex-1 ml-64 p-8">
          <motion.div 
            className="animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-8 glass rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  className="h-32 glass-card"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <motion.div 
                  key={i} 
                  className="h-64 glass-card"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.4 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
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
      
      <main className="flex-1 ml-64 overflow-auto relative z-10">
        <div className="p-6 lg:p-8">
          {/* Header Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Mission Control Center
                </h1>
                <p className="text-gray-400 text-lg">
                  Welcome back, {user?.username}. Your AI agents are standing by.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/agents">
                  <Button className="btn-futuristic btn-smooth">
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy Agent
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="glass-card card-3d border-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Agents</p>
                      <motion.p 
                        className="text-3xl font-bold text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {quickStats.totalAgents}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Bot className="h-8 w-8 text-blue-400" />
                    </motion.div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-green-400">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>12% from last week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card card-3d border-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Active Now</p>
                      <motion.p 
                        className="text-3xl font-bold text-green-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        {quickStats.activeAgents}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Activity className="h-8 w-8 text-green-400" />
                    </motion.div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-green-400">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>All systems operational</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card card-3d border-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Conversations</p>
                      <motion.p 
                        className="text-3xl font-bold text-purple-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: "spring" }}
                      >
                        {quickStats.totalConversations}
                      </motion.p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <MessageSquare className="h-8 w-8 text-purple-400" />
                    </motion.div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-purple-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>24% increase today</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card card-3d border-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-all duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Avg Response</p>
                      <motion.p 
                        className="text-3xl font-bold text-amber-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                      >
                        {quickStats.avgResponseTime}s
                      </motion.p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Clock className="h-8 w-8 text-amber-400" />
                    </motion.div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-amber-400">
                    <Target className="h-4 w-4 mr-1" />
                    <span>Within target range</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Agents */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass-card border-0 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                      Recent Agents
                    </CardTitle>
                    <Link href="/agents">
                      <Button variant="outline" size="sm" className="neomorphic border-purple-500/30 text-purple-300">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {recentAgents.length > 0 ? (
                        recentAgents.map((agent: any, index: number) => (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-4 rounded-lg hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                                  <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{agent.name}</p>
                                  <p className="text-gray-400 text-sm capitalize">{agent.template.replace('-', ' ')}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                                <span className={`text-xs ${agent.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                  {agent.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-8"
                        >
                          <Bot className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400">No agents deployed yet</p>
                          <Link href="/agents">
                            <Button className="btn-futuristic mt-4" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Deploy First Agent
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="glass-card border-0 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-blue-400" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* CPU Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">CPU Usage</span>
                        <span className="text-green-400">42%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "42%" }}
                          transition={{ delay: 1.2, duration: 1 }}
                        />
                      </div>
                    </div>

                    {/* Memory Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Memory Usage</span>
                        <span className="text-blue-400">68%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "68%" }}
                          transition={{ delay: 1.4, duration: 1 }}
                        />
                      </div>
                    </div>

                    {/* Network */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Network</span>
                        <span className="text-purple-400">84%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "84%" }}
                          transition={{ delay: 1.6, duration: 1 }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/analytics">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full neomorphic border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </Button>
                          </motion.div>
                        </Link>
                        <Link href="/chat">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full neomorphic border-green-500/30 text-green-300 hover:bg-green-500/10">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}