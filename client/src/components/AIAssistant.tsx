import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { 
  Bot, 
  Search, 
  Languages, 
  Mail, 
  Calendar, 
  ListTodo, 
  Lightbulb,
  Copy,
  Send,
  Sparkles,
  Globe,
  MessageSquare,
  RefreshCw,
  X
} from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAgent?: string;
}

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'prompt' | 'search' | 'translation' | 'email' | 'productivity';
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  category: 'coding' | 'design' | 'research' | 'business' | 'creative';
}

const promptTemplates: PromptTemplate[] = [
  {
    id: '1',
    title: 'Code Review Request',
    description: 'Get detailed code review feedback',
    template: 'Please review this code for best practices, performance, and security:\n\n```\n[Your code here]\n```\n\nFocus on: [specific areas]',
    category: 'coding'
  },
  {
    id: '2',
    title: 'System Architecture Design',
    description: 'Design scalable system architecture',
    template: 'Design a system architecture for [application type] that handles [requirements]. Consider: scalability, security, performance, and cost optimization.',
    category: 'coding'
  },
  {
    id: '3',
    title: 'Research Summary',
    description: 'Summarize complex research topics',
    template: 'Provide a comprehensive summary of [topic] including: key concepts, current trends, challenges, and practical applications.',
    category: 'research'
  },
  {
    id: '4',
    title: 'Business Strategy Analysis',
    description: 'Analyze business strategies and opportunities',
    template: 'Analyze the business strategy for [company/product] in [market]. Include: competitive analysis, market opportunities, and recommendations.',
    category: 'business'
  },
  {
    id: '5',
    title: 'Creative Content Ideas',
    description: 'Generate creative content concepts',
    template: 'Generate creative content ideas for [platform/medium] targeting [audience] about [topic]. Include: tone, format, and engagement strategies.',
    category: 'creative'
  }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

const emailIntents = [
  { value: 'apology', label: 'Apology' },
  { value: 'inquiry', label: 'Job Inquiry' },
  { value: 'meeting', label: 'Meeting Request' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'proposal', label: 'Business Proposal' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'thank-you', label: 'Thank You' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'invitation', label: 'Invitation' },
  { value: 'update', label: 'Status Update' }
];

export function AIAssistant({ isOpen, onOpenChange, currentAgent }: AIAssistantProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [emailIntent, setEmailIntent] = useState('inquiry');
  const [emailContext, setEmailContext] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const assistantMutation = useMutation({
    mutationFn: async ({ message, type }: { message: string; type?: string }) => {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type, currentAgent })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get assistant response');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get assistant response",
        variant: "destructive"
      });
    }
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/assistant/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Search failed' }));
        throw new Error(errorData.error || 'Search failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const searchMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.summary,
        timestamp: Date.now(),
        type: 'search'
      };
      setMessages(prev => [...prev, searchMessage]);
      setSearchQuery('');
    },
    onError: (error: Error) => {
      toast({
        title: "Search Error",
        description: error.message || "Search failed",
        variant: "destructive"
      });
    }
  });

  const translateMutation = useMutation({
    mutationFn: async ({ text, targetLang }: { text: string; targetLang: string }) => {
      const response = await fetch('/api/assistant/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: targetLang })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Translation failed' }));
        throw new Error(errorData.error || 'Translation failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const translationMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Translation to ${languages.find(l => l.code === targetLanguage)?.name}:\n\n${data.translation}`,
        timestamp: Date.now(),
        type: 'translation'
      };
      setMessages(prev => [...prev, translationMessage]);
      setTranslationText('');
    },
    onError: (error: Error) => {
      toast({
        title: "Translation Error",
        description: error.message || "Translation failed",
        variant: "destructive"
      });
    }
  });

  const emailMutation = useMutation({
    mutationFn: async ({ intent, context }: { intent: string; context: string }) => {
      const response = await fetch('/api/assistant/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, context })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Email generation failed' }));
        throw new Error(errorData.error || 'Email generation failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const emailMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Draft Email (${emailIntents.find(e => e.value === emailIntent)?.label}):\n\n${data.email}`,
        timestamp: Date.now(),
        type: 'email'
      };
      setMessages(prev => [...prev, emailMessage]);
      setEmailContext('');
    },
    onError: (error: Error) => {
      toast({
        title: "Email Generation Error", 
        description: error.message || "Email generation failed",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    assistantMutation.mutate({ message: input });
    setInput('');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Search: ${searchQuery}`,
      timestamp: Date.now(),
      type: 'search'
    };
    
    setMessages(prev => [...prev, userMessage]);
    searchMutation.mutate(searchQuery);
  };

  const handleTranslate = () => {
    if (!translationText.trim()) return;
    
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Translate to ${languages.find(l => l.code === targetLanguage)?.name}: ${translationText}`,
      timestamp: Date.now(),
      type: 'translation'
    };
    
    setMessages(prev => [...prev, userMessage]);
    translateMutation.mutate({ text: translationText, targetLang: targetLanguage });
  };

  const handleGenerateEmail = () => {
    if (!emailContext.trim()) return;
    
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Generate ${emailIntents.find(e => e.value === emailIntent)?.label} email: ${emailContext}`,
      timestamp: Date.now(),
      type: 'email'
    };
    
    setMessages(prev => [...prev, userMessage]);
    emailMutation.mutate({ intent: emailIntent, context: emailContext });
  };

  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    setTodos(prev => [...prev, todoInput]);
    setTodoInput('');
    toast({
      title: "Todo Added",
      description: "Your task has been added to the list"
    });
  };

  const handleRemoveTodo = (index: number) => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard"
    });
  };

  const usePromptTemplate = (template: PromptTemplate) => {
    setInput(template.template);
    setActiveTab('chat');
    setSelectedPrompt(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  TensorFlow AI Assistant
                </DialogTitle>
                <p className="text-sm text-purple-200">
                  {currentAgent ? `Working with ${currentAgent}` : 'Your intelligent productivity companion'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-purple-500/20">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="translate" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="productivity" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="h-[500px] flex flex-col mt-4">
              <ScrollArea className="flex-1 p-4 bg-slate-800/30 rounded-lg border border-purple-500/20">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                      <p>Start a conversation with your AI assistant!</p>
                      <p className="text-sm mt-2">Ask questions, get help, or use the specialized tools above.</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'bg-slate-700/50 text-gray-100 border border-purple-500/20'
                      }`}>
                        {message.type && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {message.type}
                          </Badge>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="mt-2 h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !assistantMutation.isPending && input.trim()) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="bg-slate-800/50 border-purple-500/20 text-white"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={assistantMutation.isPending || !input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {assistantMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="h-[500px] mt-4">
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    💡 Ready-to-use prompt templates for different AI agent scenarios. Click "Use Template" to load into chat.
                  </p>
                </div>
                <ScrollArea className="h-[420px]">
                  <div className="grid gap-4 pr-4">
                    {promptTemplates.map((template) => (
                      <Card key={template.id} className="bg-slate-800/30 border-purple-500/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg text-white">{template.title}</CardTitle>
                              <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                            </div>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-slate-900/50 p-3 rounded border border-purple-500/20 mb-3 max-h-24 overflow-y-auto">
                            <code className="text-xs text-gray-300 whitespace-pre-wrap">
                              {template.template}
                            </code>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => usePromptTemplate(template)}
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Use Template
                            </Button>
                            <Button
                              onClick={() => copyToClipboard(template.template)}
                              variant="outline"
                              size="sm"
                              className="border-purple-500/50"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="search" className="h-[500px] mt-4">
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="h-5 w-5" />
                    Google-Powered Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Search query:</label>
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for current information..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !searchMutation.isPending && searchQuery.trim()) {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className="bg-slate-800/50 border-purple-500/20 text-white"
                      />
                      <Button 
                        onClick={handleSearch}
                        disabled={searchMutation.isPending || !searchQuery.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {searchMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                      💡 Get real-time information, current events, latest research, and up-to-date facts on any topic.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="translate" className="h-[500px] mt-4">
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Languages className="h-5 w-5" />
                    Language Translation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Text to translate:</label>
                    <Textarea
                      value={translationText}
                      onChange={(e) => setTranslationText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="bg-slate-800/50 border-purple-500/20 text-white min-h-[120px] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Target language:</label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-500/20">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleTranslate}
                        disabled={translateMutation.isPending || !translationText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {translateMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4" />
                        )}
                        Translate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="h-[500px] mt-4">
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="h-5 w-5" />
                    Smart Email Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email type:</label>
                    <Select value={emailIntent} onValueChange={setEmailIntent}>
                      <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/20">
                        {emailIntents.map((intent) => (
                          <SelectItem key={intent.value} value={intent.value}>
                            {intent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email context:</label>
                    <Textarea
                      value={emailContext}
                      onChange={(e) => setEmailContext(e.target.value)}
                      placeholder="Provide context for the email (recipient, situation, key points)..."
                      className="bg-slate-800/50 border-purple-500/20 text-white min-h-[140px] resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateEmail}
                    disabled={emailMutation.isPending || !emailContext.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {emailMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Generate Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity" className="h-[500px] mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <Card className="bg-slate-800/30 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <ListTodo className="h-5 w-5" />
                      Todo List
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Add new task:</label>
                      <div className="flex gap-2">
                        <Input
                          value={todoInput}
                          onChange={(e) => setTodoInput(e.target.value)}
                          placeholder="Enter task description..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && todoInput.trim()) {
                              e.preventDefault();
                              handleAddTodo();
                            }
                          }}
                          className="bg-slate-800/50 border-purple-500/20 text-white"
                        />
                        <Button 
                          onClick={handleAddTodo} 
                          size="sm"
                          disabled={!todoInput.trim()}
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Your tasks:</label>
                      <ScrollArea className="h-[180px]">
                        <div className="space-y-2">
                          {todos.map((todo, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-purple-500/20">
                              <span className="text-white text-sm">{todo}</span>
                              <Button
                                onClick={() => handleRemoveTodo(index)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {todos.length === 0 && (
                            <p className="text-gray-400 text-center py-4 text-sm">No tasks yet - add your first task above</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Lightbulb className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => {
                        const motivation = [
                          "You're doing great! Keep pushing forward!",
                          "Every expert was once a beginner. You've got this!",
                          "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                          "The only way to do great work is to love what you do.",
                          "Innovation distinguishes between a leader and a follower."
                        ];
                        const quote = motivation[Math.floor(Math.random() * motivation.length)];
                        const motivationMessage: AssistantMessage = {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: `💪 Motivation: ${quote}`,
                          timestamp: Date.now(),
                          type: 'productivity'
                        };
                        setMessages(prev => [...prev, motivationMessage]);
                        setActiveTab('chat');
                      }}
                      variant="outline"
                      className="w-full border-purple-500/50"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Motivation
                    </Button>
                    <Button
                      onClick={() => {
                        const jokes = [
                          "Why do programmers prefer dark mode? Because light attracts bugs!",
                          "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
                          "Why did the developer go broke? Because he used up all his cache!",
                          "What's a programmer's favorite hangout place? Foo Bar!",
                          "Why do Java developers wear glasses? Because they don't C#!"
                        ];
                        const joke = jokes[Math.floor(Math.random() * jokes.length)];
                        const jokeMessage: AssistantMessage = {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: `😄 Tech Joke: ${joke}`,
                          timestamp: Date.now(),
                          type: 'productivity'
                        };
                        setMessages(prev => [...prev, jokeMessage]);
                        setActiveTab('chat');
                      }}
                      variant="outline"
                      className="w-full border-purple-500/50"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Tech Joke
                    </Button>
                    <Button
                      onClick={() => {
                        const now = new Date();
                        const scheduleMessage: AssistantMessage = {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: `📅 Current Time: ${now.toLocaleString()}\n\nSuggested Schedule:\n• Take a 5-minute break every hour\n• Plan your most important task for tomorrow\n• Review your goals for this week\n• Don't forget to stay hydrated!`,
                          timestamp: Date.now(),
                          type: 'productivity'
                        };
                        setMessages(prev => [...prev, scheduleMessage]);
                        setActiveTab('chat');
                      }}
                      variant="outline"
                      className="w-full border-purple-500/50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Reminder
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}