import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  Search, 
  Languages, 
  Mail, 
  ListTodo, 
  Lightbulb,
  Copy,
  Send,
  Sparkles,
  RefreshCw,
  X,
  MessageSquare,
  Zap,
  Globe,
  Star
} from 'lucide-react';

interface SimpleAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAgent?: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' }
];

const emailIntents = [
  { value: 'inquiry', label: 'Job Inquiry' },
  { value: 'meeting', label: 'Meeting Request' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'apology', label: 'Apology' },
  { value: 'thank-you', label: 'Thank You' }
];

export function SimpleAssistant({ isOpen, onOpenChange, currentAgent }: SimpleAssistantProps) {
  const [chatInput, setChatInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [translateInput, setTranslateInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [emailIntent, setEmailIntent] = useState('inquiry');
  const [todos, setTodos] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, currentAgent })
      });
      if (!response.ok) throw new Error('Failed to get response');
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.response);
      setChatInput('');
      toast({ 
        title: "✨ Response Generated", 
        description: "AI assistant has provided a response",
        variant: "default"
      });
    },
    onError: () => {
      toast({ 
        title: "🚫 Chat Error", 
        description: "Failed to get AI response. Please try again.", 
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
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.summary);
      setSearchInput('');
      toast({ 
        title: "🔍 Search Complete", 
        description: "Found relevant information from the web",
        variant: "default"
      });
    },
    onError: () => {
      toast({ 
        title: "🚫 Search Error", 
        description: "Unable to search for information. Please try again.", 
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
      if (!response.ok) throw new Error('Translation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setResult(`Translation: ${data.translation}`);
      setTranslateInput('');
      toast({ 
        title: "🌍 Translation Complete", 
        description: "Text successfully translated",
        variant: "default"
      });
    },
    onError: () => {
      toast({ 
        title: "🚫 Translation Error", 
        description: "Unable to translate text. Please try again.", 
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
      if (!response.ok) throw new Error('Email generation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.email);
      setEmailInput('');
      toast({ 
        title: "📧 Email Generated", 
        description: "Professional email draft is ready",
        variant: "default"
      });
    },
    onError: () => {
      toast({ 
        title: "🚫 Email Error", 
        description: "Unable to generate email. Please try again.", 
        variant: "destructive" 
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-black via-slate-900 to-purple-950 border-0 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-lg"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,69,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(219,39,119,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI Assistant
                </DialogTitle>
                <p className="text-sm text-gray-400">Powered by advanced AI technology</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative z-10">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-1">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="search"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger 
                value="translate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger 
                value="email"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <ListTodo className="h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4 mt-6">
              <Card className="bg-black/20 backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Intelligent Conversation</span>
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Advanced AI-powered chat with contextual understanding</p>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="relative">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me anything... I can help with coding, research, analysis, and more"
                      className="min-h-[120px] bg-black/40 border border-white/10 text-white placeholder:text-gray-500 rounded-xl resize-none focus:border-purple-500/50 transition-all duration-300"
                    />
                    <div className="absolute bottom-3 right-3">
                      <Zap className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <Button 
                    onClick={() => chatMutation.mutate(chatInput)}
                    disabled={chatMutation.isPending || !chatInput.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl h-12 font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    {chatMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Send className="h-5 w-5 mr-2" />
                    )}
                    {chatMutation.isPending ? 'Thinking...' : 'Send Message'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-4 mt-6">
              <Card className="bg-black/20 backdrop-blur-md border border-blue-500/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Global Information Search</span>
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Real-time search powered by advanced AI technology</p>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="relative">
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search for current events, research, trends, or any topic..."
                      className="bg-black/40 border border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12 px-4 focus:border-blue-500/50 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchInput.trim() && !searchMutation.isPending) {
                          e.preventDefault();
                          searchMutation.mutate(searchInput);
                        }
                      }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <Button 
                    onClick={() => searchMutation.mutate(searchInput)}
                    disabled={searchMutation.isPending || !searchInput.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl h-12 font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    {searchMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    {searchMutation.isPending ? 'Searching...' : 'Search Now'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="translate" className="space-y-4 mt-6">
              <Card className="bg-black/20 backdrop-blur-md border border-green-500/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Languages className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Universal Translator</span>
                  </CardTitle>
                  <p className="text-gray-400 text-sm">High-accuracy translation across 12+ languages</p>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="relative">
                    <Textarea
                      value={translateInput}
                      onChange={(e) => setTranslateInput(e.target.value)}
                      placeholder="Enter text to translate into any language..."
                      className="min-h-[100px] bg-black/40 border border-white/10 text-white placeholder:text-gray-500 rounded-xl resize-none focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="bg-black/40 border border-white/10 text-white rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-md border border-white/20">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-white/10">
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => translateMutation.mutate({ text: translateInput, targetLang: targetLanguage })}
                    disabled={translateMutation.isPending || !translateInput.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl h-12 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    {translateMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Languages className="h-5 w-5 mr-2" />
                    )}
                    {translateMutation.isPending ? 'Translating...' : 'Translate Now'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-6">
              <Card className="bg-black/20 backdrop-blur-md border border-orange-500/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Professional Email Writer</span>
                  </CardTitle>
                  <p className="text-gray-400 text-sm">AI-crafted emails for any professional situation</p>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <Select value={emailIntent} onValueChange={setEmailIntent}>
                    <SelectTrigger className="bg-black/40 border border-white/10 text-white rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-md border border-white/20">
                      {emailIntents.map((intent) => (
                        <SelectItem key={intent.value} value={intent.value} className="text-white hover:bg-white/10">
                          {intent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Textarea
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Describe the email context, recipient, and key points you want to include..."
                      className="min-h-[100px] bg-black/40 border border-white/10 text-white placeholder:text-gray-500 rounded-xl resize-none focus:border-orange-500/50 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    onClick={() => emailMutation.mutate({ intent: emailIntent, context: emailInput })}
                    disabled={emailMutation.isPending || !emailInput.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl h-12 font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                  >
                    {emailMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-5 w-5 mr-2" />
                    )}
                    {emailMutation.isPending ? 'Crafting Email...' : 'Generate Email'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              <Card className="bg-black/20 backdrop-blur-md border border-indigo-500/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <ListTodo className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Smart Task Manager</span>
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Organize and track your productivity goals</p>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="flex gap-3">
                    <Input
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      placeholder="Add a new task or goal..."
                      className="bg-black/40 border border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12 focus:border-indigo-500/50 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && todoInput.trim()) {
                          e.preventDefault();
                          setTodos(prev => [...prev, todoInput]);
                          setTodoInput('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        if (todoInput.trim()) {
                          setTodos(prev => [...prev, todoInput]);
                          setTodoInput('');
                        }
                      }}
                      disabled={!todoInput.trim()}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl px-6 h-12 font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                    >
                      Add
                    </Button>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {todos.map((todo, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                          <span className="text-white">{todo}</span>
                          <Button
                            onClick={() => setTodos(prev => prev.filter((_, i) => i !== index))}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {todos.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No tasks yet. Add your first task above!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {result && (
            <Card className="bg-black/20 backdrop-blur-md border border-green-500/20 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">AI Response</span>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      toast({ 
                        title: "📋 Copied to Clipboard", 
                        description: "AI response has been copied successfully",
                        variant: "default"
                      });
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <ScrollArea className="h-40">
                  <div className="text-gray-200 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-medium text-white mb-1">{children}</h3>,
                        p: ({ children }) => <p className="text-gray-200 mb-2 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-100">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside text-gray-200 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside text-gray-200 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-200">{children}</li>,
                        code: ({ children }) => <code className="bg-slate-700 text-green-300 px-1 py-0.5 rounded text-sm">{children}</code>,
                        pre: ({ children }) => <pre className="bg-slate-800 p-3 rounded-lg overflow-x-auto text-sm text-green-300 mb-2">{children}</pre>
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}