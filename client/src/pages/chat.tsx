import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { AssistantTrigger } from "@/components/AssistantTrigger";
import { api } from "@/lib/api";
import { 
  Bot, 
  User, 
  Send, 
  MessageSquare, 
  Sparkles,
  Zap,
  Server,
  Brain,
  Code,
  Monitor,
  Activity,
  Circle
} from "lucide-react";
import { nanoid } from "nanoid";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const getAgentIcon = (template: string) => {
  switch (template) {
    case 'devops-engineer':
      return Server;
    case 'ai-ml-engineer':
      return Brain;
    case 'software-engineer':
      return Code;
    case 'fullstack-developer':
      return Monitor;
    default:
      return Bot;
  }
};

const getAgentGradient = (template: string) => {
  switch (template) {
    case 'devops-engineer':
      return 'from-blue-500/30 to-cyan-500/30';
    case 'ai-ml-engineer':
      return 'from-purple-500/30 to-pink-500/30';
    case 'software-engineer':
      return 'from-green-500/30 to-emerald-500/30';
    case 'fullstack-developer':
      return 'from-amber-500/30 to-orange-500/30';
    default:
      return 'from-purple-500/30 to-blue-500/30';
  }
};

const getAgentColor = (template: string) => {
  switch (template) {
    case 'devops-engineer':
      return 'text-blue-400';
    case 'ai-ml-engineer':
      return 'text-purple-400';
    case 'software-engineer':
      return 'text-green-400';
    case 'fullstack-developer':
      return 'text-amber-400';
    default:
      return 'text-purple-400';
  }
};

export default function Chat() {
  const { agentId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(() => nanoid());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['/api/agents', agentId],
    queryFn: () => api.get(`/api/agents/${agentId}`),
  });

  const { data: conversation } = useQuery({
    queryKey: ['/api/conversations', sessionId],
    queryFn: () => api.get(`/api/conversations/${sessionId}`),
    enabled: !!sessionId,
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => 
      api.post(`/api/chat/${agentId}`, { message, sessionId }),
    onSuccess: async (response) => {
      const data = await response.json();
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue("");
    
    chatMutation.mutate(messageToSend);
  };

  if (agentLoading) {
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
            <div className="h-96 glass rounded-lg"></div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 relative z-10">
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mx-auto mb-4 border-0">
              <Bot className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Agent not found</h1>
            <p className="text-gray-300">The agent you're looking for doesn't exist.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const AgentIcon = getAgentIcon(agent.template);
  const agentGradient = getAgentGradient(agent.template);
  const agentColor = getAgentColor(agent.template);

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
      
      <div className="flex-1 md:ml-64 flex flex-col relative z-10">
        {/* Chat Header */}
        <motion.div 
          className="glass border-b border-purple-500/20 backdrop-blur-xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className={`p-3 rounded-xl bg-gradient-to-br ${agentGradient} border border-purple-500/40`}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <AgentIcon className={`h-6 w-6 ${agentColor}`} />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{agent.name}</h1>
              <p className="text-gray-300">
                {agent.description || `${agent.template.replace('-', ' ')} specialist`}
              </p>
            </div>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Circle className={`h-3 w-3 ${agent.isActive ? 'text-green-400 fill-current' : 'text-red-400 fill-current'}`} />
              <span className={`px-3 py-1 text-sm rounded-full glass border-0 ${
                agent.isActive ? 'text-green-300' : 'text-red-300'
              }`}>
                {agent.isActive ? 'Online' : 'Offline'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                >
                  <motion.div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${agentGradient} border border-purple-500/40`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MessageSquare className={`h-8 w-8 ${agentColor}`} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
                  <p className="text-gray-300">Send a message to begin chatting with {agent.name}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {message.role === 'assistant' && (
                    <motion.div 
                      className={`p-2 rounded-full bg-gradient-to-br ${agentGradient} border border-purple-500/40 flex-shrink-0`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <AgentIcon className={`h-5 w-5 ${agentColor}`} />
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-white rounded-tr-sm glass border-0' 
                        : 'glass border-0 text-white rounded-tl-sm'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-purple-300">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-200">{children}</li>,
                            code: ({ children }) => <code className="bg-gray-700/50 px-1 py-0.5 rounded text-blue-300 text-sm">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-800/50 p-3 rounded-lg overflow-x-auto my-2 border border-gray-600/30">{children}</pre>,
                            h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-300 my-2">{children}</blockquote>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>

                  {message.role === 'user' && (
                    <motion.div 
                      className="p-2 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-500/30 border border-gray-500/40 flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <User className="h-5 w-5 text-gray-300" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {chatMutation.isPending && (
                <motion.div 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div 
                    className={`p-2 rounded-full bg-gradient-to-br ${agentGradient} border border-purple-500/40 flex-shrink-0`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <AgentIcon className={`h-5 w-5 ${agentColor}`} />
                  </motion.div>
                  <div className="glass border-0 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 0.8, 
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <motion.div 
          className="glass border-t border-purple-500/20 backdrop-blur-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message ${agent.name}...`}
                  className="glass border-purple-500/30 text-white placeholder-gray-400 h-12"
                  disabled={chatMutation.isPending}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="btn-futuristic h-12 px-6"
                >
                  {chatMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {/* AI Assistant Trigger */}
      <AssistantTrigger currentAgent={agent?.name} />
    </div>
  );
}