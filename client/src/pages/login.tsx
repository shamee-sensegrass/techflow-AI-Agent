import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bot, Zap, Sparkles, ArrowLeft, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-500/20 rounded-full"
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

      {/* Top Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-500/20 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/40">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  TechFlow AI
                </span>
              </motion.div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/signup">
                <Button className="btn-futuristic">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6 pt-24 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full glass border border-blue-500/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-300">Welcome Back</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Sign Into
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> TechFlow AI</span>
            </h1>
            <p className="text-gray-300">Access your AI agents and continue your technical journey</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card border-0 card-3d">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-400" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="glass border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-purple-400" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="glass border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-futuristic btn-smooth py-3 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        className="flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Signing In...
                      </motion.div>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-300">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-50 -z-10 blur-sm" />
            </Card>
          </motion.div>

          {/* Back to homepage */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/">
              <motion.div 
                className="inline-flex items-center text-gray-400 hover:text-blue-300 transition-colors"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to homepage
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}