import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Code, 
  Terminal, 
  FileText, 
  Zap, 
  Clock,
  User,
  Bot,
  Copy,
  Check,
  Settings,
  Database,
  Cloud
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiAgent, ChatMessageData } from "@shared/schema";

interface TechnicalChatProps {
  agent: AiAgent;
  sessionId: string;
  messages: ChatMessageData[];
  onSendMessage: (message: string, context?: TechnicalContext) => void;
  isLoading: boolean;
}

interface TechnicalContext {
  codeSnippet?: string;
  technologies?: string[];
  architecture?: string;
  environment?: string;
  errorLogs?: string;
}

export function TechnicalChat({ 
  agent, 
  sessionId, 
  messages, 
  onSendMessage, 
  isLoading 
}: TechnicalChatProps) {
  const [message, setMessage] = useState("");
  const [technicalContext, setTechnicalContext] = useState<TechnicalContext>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message, technicalContext);
    setMessage("");
    setTechnicalContext({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = content.split(codeBlockRegex);
    
    return parts.map((part, index) => {
      if (index % 3 === 1) {
        // Language identifier
        return null;
      } else if (index % 3 === 2) {
        // Code content
        const language = parts[index - 1] || 'text';
        return (
          <div key={index} className="my-4">
            <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-t-md">
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(part, index)}
                className="h-6 w-6 p-0"
              >
                {copiedIndex === index ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-b-md overflow-x-auto text-sm">
              <code>{part}</code>
            </pre>
          </div>
        );
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  const getAgentIcon = () => {
    switch (agent.template) {
      case 'devops-engineer':
        return <Settings className="h-5 w-5" />;
      case 'ai-ml-engineer':
        return <Zap className="h-5 w-5" />;
      case 'software-engineer':
        return <Code className="h-5 w-5" />;
      case 'fullstack-developer':
        return <Database className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getAgentIcon()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline">{agent.template.replace('-', ' ')}</Badge>
              {agent.specialization && (
                <Badge variant="secondary" className="ml-2">
                  {agent.specialization}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-4">
                  <Cloud className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <h3 className="font-medium mb-2">Ready to assist with technical challenges</h3>
                <p className="text-sm">
                  Ask about architecture, code review, debugging, best practices, or any technical question.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex space-x-3",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getAgentIcon()}
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  )}>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {formatCodeBlocks(msg.content)}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(msg.content, index + 1000)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedIndex === index + 1000 ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex space-x-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  {getAgentIcon()}
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area with Technical Context */}
        <div className="p-4">
          <Tabs defaultValue="message" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="message" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Message</span>
              </TabsTrigger>
              <TabsTrigger value="context" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Technical Context</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="message" className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${agent.name} about technical challenges, architecture, code review, or best practices...`}
                  className="flex-1 min-h-[80px] resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || isLoading}
                  size="lg"
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {Object.keys(technicalContext).some(key => technicalContext[key as keyof TechnicalContext]) && (
                <div className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2">
                    <Terminal className="h-3 w-3 mr-1" />
                    Technical context attached
                  </Badge>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="context" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Code Snippet</label>
                  <Textarea
                    value={technicalContext.codeSnippet || ''}
                    onChange={(e) => setTechnicalContext(prev => ({ ...prev, codeSnippet: e.target.value }))}
                    placeholder="Paste code for review or debugging..."
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Error Logs</label>
                  <Textarea
                    value={technicalContext.errorLogs || ''}
                    onChange={(e) => setTechnicalContext(prev => ({ ...prev, errorLogs: e.target.value }))}
                    placeholder="Paste error logs or stack traces..."
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Technologies</label>
                  <input
                    type="text"
                    value={technicalContext.technologies?.join(', ') || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalContext(prev => ({ 
                      ...prev, 
                      technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }))}
                    placeholder="React, Node.js, PostgreSQL..."
                    className="mt-1 w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Architecture</label>
                  <input
                    type="text"
                    value={technicalContext.architecture || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalContext(prev => ({ ...prev, architecture: e.target.value }))}
                    placeholder="Microservices, Monolith, Serverless..."
                    className="mt-1 w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}