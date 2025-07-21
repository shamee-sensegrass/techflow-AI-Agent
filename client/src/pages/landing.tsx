import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Puzzle, 
  Zap, 
  Shield, 
  Users, 
  Server,
  Brain,
  Cloud,
  Code,
  Database,
  Monitor,
  Mail,
  Phone,
  MessageCircle,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
  Globe,
  ChevronRight,
  Play
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: ""
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('POST', '/api/contact', contactForm);
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      icon: Server,
      title: "DevOps Engineering",
      description: "Infrastructure automation, CI/CD pipelines, and cloud deployment strategies",
      gradient: "from-blue-500/20 to-cyan-500/20",
      color: "text-blue-400"
    },
    {
      icon: Brain,
      title: "AI/ML Engineering",
      description: "Machine learning models, deep learning, and AI implementation guidance",
      gradient: "from-purple-500/20 to-pink-500/20",
      color: "text-purple-400"
    },
    {
      icon: Code,
      title: "Software Engineering",
      description: "Code architecture, algorithms, system design, and development best practices",
      gradient: "from-green-500/20 to-emerald-500/20",
      color: "text-green-400"
    },
    {
      icon: Monitor,
      title: "Full Stack Development",
      description: "End-to-end web development, frontend, backend, and database integration",
      gradient: "from-amber-500/20 to-orange-500/20",
      color: "text-amber-400"
    }
  ];

  const stats = [
    { icon: Bot, value: "50+", label: "AI Agents", color: "text-blue-400" },
    { icon: Users, value: "1000+", label: "Active Users", color: "text-green-400" },
    { icon: MessageSquare, value: "10k+", label: "Conversations", color: "text-purple-400" },
    { icon: Zap, value: "99.9%", label: "Uptime", color: "text-amber-400" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
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
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-500/20 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              <ThemeToggle />
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" className="neomorphic border-purple-500/30 text-purple-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-futuristic">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full glass border border-purple-500/30 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-purple-300">Powered by Advanced AI Technology</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your AI-Powered
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Technical Team
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Deploy intelligent AI agents specialized in DevOps, Software Engineering, AI/ML, and Full Stack Development. 
                Get expert technical guidance, code reviews, and architectural insights 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="btn-futuristic glow-primary px-8 py-4 text-lg">
                    <Rocket className="h-5 w-5 mr-2" />
                    Deploy Your First Agent
                  </Button>
                </motion.div>
              </Link>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="neomorphic border-blue-500/30 text-blue-300 px-8 py-4 text-lg">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, index) => (
                <motion.div key={index} variants={itemVariants} className="text-center">
                  <div className="glass-card p-6 border-0">
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Specialized AI
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Agents</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each agent is trained on domain-specific knowledge and best practices, 
              providing expert-level guidance for your technical challenges.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="glass-card card-3d border-0 h-full group cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start space-x-4">
                      <motion.div 
                        className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} border border-white/20`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <feature.icon className={`h-8 w-8 ${feature.color}`} />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {feature.description}
                        </p>
                        
                        <motion.div 
                          className="flex items-center text-purple-400 font-medium group-hover:text-purple-300"
                          whileHover={{ x: 4 }}
                        >
                          <span>Learn More</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> TechFlow AI?</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Enterprise Security",
                    description: "Bank-level security with end-to-end encryption and SOC 2 compliance."
                  },
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description: "Sub-second response times with 99.9% uptime guarantee."
                  },
                  {
                    icon: Target,
                    title: "Domain Expertise",
                    description: "Specialized knowledge in technical domains with continuous learning."
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                      <item.icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 border-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">System Performance</h3>
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Response Time", value: "0.8s", percentage: 95 },
                      { label: "Accuracy Rate", value: "98.5%", percentage: 98 },
                      { label: "User Satisfaction", value: "4.9/5", percentage: 98 }
                    ].map((metric, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{metric.label}</span>
                          <span className="text-white font-medium">{metric.value}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${metric.percentage}%` }}
                            transition={{ delay: index * 0.2, duration: 1 }}
                            viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Started?</span>
            </h2>
            <p className="text-xl text-gray-300">
              Contact us to learn how TechFlow AI can transform your development workflow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-0">
              <CardContent className="p-8">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">First Name</label>
                      <Input
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Last Name</label>
                      <Input
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Company</label>
                      <Input
                        value={contactForm.company}
                        onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                        className="glass border-purple-500/30 text-white placeholder-gray-400"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="glass border-purple-500/30 text-white placeholder-gray-400 resize-none h-32"
                      placeholder="Tell us about your technical challenges and how we can help..."
                      required
                    />
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full btn-futuristic py-4 text-lg">
                      <Mail className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-purple-500/20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/40">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                TechFlow AI
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2024 TechFlow AI. All rights reserved. Powering the future of technical collaboration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}