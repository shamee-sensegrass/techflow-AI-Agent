import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  MessageSquare,
  Bot,
  Headphones,
  TrendingUp,
  UserPlus,
  Laptop,
  Megaphone,
  Settings as SettingsIcon,
  Activity,
  Zap,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface Agent {
  id: number;
  name: string;
  description?: string;
  template: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentCardProps {
  agent: Agent;
}

const templateIcons: Record<string, any> = {
  "customer-service": Headphones,
  "sales-assistant": TrendingUp,
  "hr-assistant": UserPlus,
  "it-support": Laptop,
  "marketing-assistant": Megaphone,
  "operations-manager": SettingsIcon,
  "devops-engineer": Laptop,
  "software-engineer": Bot,
  "ai-ml-engineer": Bot,
  "fullstack-developer": Bot,
};

const templateGradients: Record<string, string> = {
  "customer-service": "from-blue-500/20 to-cyan-500/20",
  "sales-assistant": "from-green-500/20 to-emerald-500/20",
  "hr-assistant": "from-purple-500/20 to-pink-500/20",
  "it-support": "from-orange-500/20 to-red-500/20",
  "marketing-assistant": "from-pink-500/20 to-rose-500/20",
  "operations-manager": "from-gray-500/20 to-slate-500/20",
  "devops-engineer": "from-indigo-500/20 to-blue-500/20",
  "software-engineer": "from-violet-500/20 to-purple-500/20",
  "ai-ml-engineer": "from-cyan-500/20 to-teal-500/20",
  "fullstack-developer": "from-amber-500/20 to-orange-500/20",
};

export function AgentCard({ agent }: AgentCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const TemplateIcon = templateIcons[agent.template] || Bot;
  const templateGradient = templateGradients[agent.template] || "from-gray-500/20 to-slate-500/20";

  const toggleAgentMutation = useMutation({
    mutationFn: () => 
      api.put(`/api/agents/${agent.id}`, { isActive: !agent.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: `Agent ${agent.isActive ? 'deactivated' : 'activated'}`,
        description: `${agent.name} has been ${agent.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent status.",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: () => api.delete(`/api/agents/${agent.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent deleted",
        description: `${agent.name} has been deleted successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete agent.",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = () => {
    setIsLoading(true);
    toggleAgentMutation.mutate();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}? This action cannot be undone.`)) {
      deleteAgentMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTemplate = (template: string) => {
    return template.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="glass-card card-3d card-smooth relative overflow-hidden border-0 scan-lines">
        {/* Holographic effect overlay */}
        <div className="absolute inset-0 holographic opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Animated status indicator */}
        <motion.div 
          className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
            agent.isActive ? 'bg-green-400' : 'bg-gray-500'
          }`}
        />
        
        {/* Background gradient effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${templateGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/40 backdrop-blur-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <TemplateIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors duration-300">
                  {agent.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className="mt-1 text-xs border-purple-500/50 text-purple-300 bg-purple-500/20 backdrop-blur-sm"
                >
                  {formatTemplate(agent.template)}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 neomorphic border-0 text-white hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-purple-500/30">
                <DropdownMenuItem onClick={handleToggleActive} disabled={isLoading}>
                  {agent.isActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-400 focus:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {agent.description && (
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {agent.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span>24/7 Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span>Ready</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(agent.createdAt)}
            </span>
          </div>

          {/* Quick Actions - Hidden by default, shown on hover */}
          <motion.div 
            className="flex space-x-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
          >
            <Button 
              size="sm" 
              className="neomorphic hover:glow-accent border-0 text-blue-300 flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              className="neomorphic hover:glow-accent border-0 text-purple-300 flex-1"
            >
              <SettingsIcon className="h-3 w-3 mr-1" />
              Config
            </Button>
            <Button 
              size="sm" 
              className={`neomorphic border-0 flex-1 ${
                agent.isActive 
                  ? 'hover:glow-gold text-amber-300' 
                  : 'hover:glow-primary text-green-300'
              }`}
              onClick={handleToggleActive}
              disabled={isLoading}
            >
              {agent.isActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              {agent.isActive ? 'Pause' : 'Start'}
            </Button>
          </motion.div>
          
          {/* Main action buttons */}
          <div className="flex space-x-2">
            <Link href={`/chat/${agent.id}`} className="flex-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full btn-futuristic"
                  disabled={!agent.isActive}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </motion.div>
            </Link>
            <Link href={`/analytics`} className="flex-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="w-full neomorphic border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  Analytics
                </Button>
              </motion.div>
            </Link>
          </div>
        </CardContent>
        
        {/* Animated border glow */}
        <motion.div 
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"
          animate={{ 
            background: [
              "linear-gradient(0deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
              "linear-gradient(90deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
              "linear-gradient(180deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
              "linear-gradient(270deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </Card>
    </motion.div>
  );
}