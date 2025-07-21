import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { AssistantTrigger } from "@/components/AssistantTrigger";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { AgentCard } from "@/components/agent-card";
import { Plus, Server, Brain, Code, Monitor, Search, Filter, Sparkles, Zap, Activity, Users } from "lucide-react";

const agentTemplates = [
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    description: "Infrastructure automation, CI/CD pipelines, and deployment strategies",
    icon: Server,
    gradient: "from-blue-500/20 to-cyan-500/20",
    systemPrompt: "You are a senior DevOps engineer with expertise in cloud infrastructure, containerization (Docker/Kubernetes), CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions), Infrastructure as Code (Terraform, Ansible), monitoring (Prometheus, Grafana), and cloud platforms (AWS, Azure, GCP). Provide detailed technical guidance on automation, deployment strategies, and infrastructure optimization."
  },
  {
    id: "ai-ml-engineer",
    name: "AI/ML Engineer",
    description: "Machine learning models, deep learning, and AI implementation",
    icon: Brain,
    gradient: "from-purple-500/20 to-pink-500/20",
    systemPrompt: "You are an expert AI/ML engineer specialized in machine learning, deep learning, neural networks, computer vision, NLP, and MLOps. You have extensive experience with frameworks like TensorFlow, PyTorch, scikit-learn, Hugging Face, and cloud ML services. Help with model development, training optimization, deployment strategies, data preprocessing, feature engineering, and production ML pipelines. Provide guidance on model selection, hyperparameter tuning, and performance evaluation."
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    description: "Code architecture, algorithms, system design, and software best practices",
    icon: Code,
    gradient: "from-green-500/20 to-emerald-500/20",
    systemPrompt: "You are a senior software engineer with deep expertise in software development, system design, algorithms, data structures, and modern programming languages (Python, JavaScript, TypeScript, Java, Go, Rust). You excel at code architecture, performance optimization, debugging, testing strategies, and software engineering best practices. Provide guidance on clean code principles, design patterns, code reviews, technical debt management, and scalable software solutions."
  },
  {
    id: "fullstack-developer",
    name: "Full Stack Developer",
    description: "End-to-end web development, frontend, backend, and database integration",
    icon: Monitor,
    gradient: "from-amber-500/20 to-orange-500/20",
    systemPrompt: "You are an expert full-stack developer with comprehensive knowledge of frontend technologies (React, Vue, Angular, HTML/CSS, TypeScript), backend development (Node.js, Python, Java, .NET), databases (SQL, NoSQL), API design (REST, GraphQL), and modern development tools. You specialize in building end-to-end web applications, mobile apps, and integration solutions. Provide guidance on architecture decisions, technology selection, performance optimization, and development workflows."
  }
];

export default function Agents() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    template: "",
    skillLevel: "intermediate"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("all");

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
    queryFn: () => api.get("/api/agents")
  });

  const createAgentMutation = useMutation({
    mutationFn: (agentData: any) => api.post("/api/agents", agentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setIsCreateDialogOpen(false);
      setNewAgent({ name: "", description: "", template: "", skillLevel: "intermediate" });
      toast({
        title: "Agent created successfully",
        description: "Your new AI agent is ready to assist you.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating agent",
        description: error.message || "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.template) {
      toast({
        title: "Missing information",
        description: "Please provide a name and select a template.",
        variant: "destructive",
      });
      return;
    }

    const template = agentTemplates.find(t => t.id === newAgent.template);
    
    createAgentMutation.mutate({
      name: newAgent.name,
      description: newAgent.description || template?.description,
      template: newAgent.template,
      skillLevel: newAgent.skillLevel,
      systemPrompt: template?.systemPrompt,
      isActive: false
    });
  };

  const filteredAgents = agents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTemplate === "all" || agent.template === filterTemplate;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: agents.length,
    active: agents.filter((a: any) => a.isActive).length,
    templates: new Set(agents.map((a: any) => a.template)).size
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8 ml-64 relative z-10">
        {/* Header Section */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Agent Control Center
            </h1>
            <p className="text-gray-400">Manage your intelligent technical coworkers</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                  <Button className="btn-futuristic btn-smooth">
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy New Agent
                  </Button>
              </DialogTrigger>
              <DialogContent className="glass border-purple-500/30 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
                    Deploy New AI Agent
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Agent Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., DevOps Assistant"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="skillLevel" className="text-white">Skill Level</Label>
                      <Select 
                        value={newAgent.skillLevel} 
                        onValueChange={(value) => setNewAgent({...newAgent, skillLevel: value})}
                      >
                        <SelectTrigger className="glass border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass border-purple-500/30">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-4 block">Select Agent Template</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agentTemplates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all duration-300 ${
                                newAgent.template === template.id 
                                  ? 'glass-card glow-primary border-purple-500/50' 
                                  : 'glass-card hover:border-purple-500/30'
                              }`}
                              onClick={() => setNewAgent({...newAgent, template: template.id})}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className={`p-2 rounded-lg bg-gradient-to-br ${template.gradient} border border-purple-500/30`}>
                                    <IconComponent className="h-5 w-5 text-white" />
                                  </div>
                                  <h3 className="font-semibold text-white">{template.name}</h3>
                                </div>
                                <p className="text-sm text-gray-300">{template.description}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Custom Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Customize the agent's role and responsibilities..."
                      value={newAgent.description}
                      onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                      className="glass border-purple-500/30 text-white placeholder-gray-400 resize-none h-24"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setIsCreateDialogOpen(false)}
                      variant="outline"
                      className="flex-1 neomorphic border-gray-500/30 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAgent}
                      disabled={createAgentMutation.isPending}
                      className="flex-1 btn-futuristic"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {createAgentMutation.isPending ? "Deploying..." : "Deploy Agent"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Agents</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Agents</p>
                  <p className="text-3xl font-bold text-green-400">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Templates Used</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.templates}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-purple-500/30 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filterTemplate} onValueChange={setFilterTemplate}>
              <SelectTrigger className="w-48 glass border-purple-500/30 text-white">
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent className="glass border-purple-500/30">
                <SelectItem value="all">All Templates</SelectItem>
                {agentTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Agents Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="glass-card h-80 animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                />
              ))
            ) : filteredAgents.length > 0 ? (
              filteredAgents.map((agent: any, index: number) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AgentCard agent={agent} />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6 inline-block">
                    <Brain className="h-16 w-16 text-purple-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No agents found</h3>
                  <p className="text-gray-400 mb-6">
                    {agents.length === 0 
                      ? "Deploy your first AI agent to get started"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                  {agents.length === 0 && (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="btn-futuristic"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Deploy Your First Agent
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}