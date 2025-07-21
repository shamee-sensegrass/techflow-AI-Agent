import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bot, Zap, Sparkles, ArrowLeft, User, Mail, Building, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        username: formData.username,
        password: formData.password,
        plan: "starter"
      });
      
      toast({
        title: "Account created!",
        description: "Welcome to TechFlow AI. Your account has been created successfully.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
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
        {[...Array(25)].map((_, i) => (
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
              <Link href="/login">
                <Button variant="outline" className="neomorphic border-purple-500/30 text-purple-300">
                  Sign In
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
              className="inline-flex items-center px-4 py-2 rounded-full glass border border-purple-500/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300">Join the AI Revolution</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Create Your
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Account</span>
            </h1>
            <p className="text-gray-300">Deploy intelligent AI agents for your technical challenges</p>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card border-0 card-3d">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-center text-white">Get Started</CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-400" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="John"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-400" />
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

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
                      className="glass border-purple-500/30 text-white placeholder-gray-400"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2 text-green-400" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      className="glass border-purple-500/30 text-white placeholder-gray-400"
                      placeholder="johndoe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white flex items-center">
                      <Building className="h-4 w-4 mr-2 text-amber-400" />
                      Company (Optional)
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="glass border-purple-500/30 text-white placeholder-gray-400"
                      placeholder="Your Company Inc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-red-400" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="glass border-purple-500/30 text-white placeholder-gray-400"
                      placeholder="Create a strong password"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-red-400" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="glass border-purple-500/30 text-white placeholder-gray-400"
                      placeholder="Confirm your password"
                      minLength={6}
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
                        Creating Account...
                      </motion.div>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-300">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-50 -z-10 blur-sm" />
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
                className="inline-flex items-center text-gray-400 hover:text-purple-300 transition-colors"
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