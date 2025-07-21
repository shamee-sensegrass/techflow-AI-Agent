import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, MessageSquare } from "lucide-react";
import { nanoid } from "nanoid";
import { api } from "@/lib/api";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  agentId: number;
  agentName: string;
  agentDescription?: string;
  systemPrompt?: string;
  className?: string;
}

export function ChatInterface({ 
  agentId, 
  agentName, 
  agentDescription,
  className = "" 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(() => nanoid());
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{agentName}</h3>
            <p className="text-blue-100 text-sm">
              {agentDescription || "Online • Typically replies instantly"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-slate-600 text-sm">
              Hi! I'm {agentName}. How can I help you today?
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white text-slate-900 shadow-sm border border-slate-200 rounded-tl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!inputValue.trim() || chatMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
