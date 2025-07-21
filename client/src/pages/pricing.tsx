import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { 
  Check, 
  Star, 
  Zap, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Shield, 
  Crown,
  Sparkles,
  Rocket,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Pricing() {
  const { user } = useAuth();

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started with AI agents",
      features: [
        "Up to 3 AI agents",
        "1,000 conversations/month",
        "Basic analytics dashboard",
        "Email support",
        "Pre-built agent templates",
        "Standard response time"
      ],
      popular: false,
      plan: "starter",
      icon: Rocket,
      gradient: "from-blue-500/20 to-cyan-500/20",
      color: "text-blue-400",
      borderColor: "border-blue-500/30"
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month", 
      description: "Ideal for growing businesses with advanced needs",
      features: [
        "Up to 10 AI agents",
        "10,000 conversations/month",
        "Advanced analytics & insights",
        "Priority support",
        "Custom agent configurations",
        "Team collaboration tools",
        "API access",
        "Enhanced response speed"
      ],
      popular: true,
      plan: "professional",
      icon: Crown,
      gradient: "from-purple-500/20 to-pink-500/20",
      color: "text-purple-400",
      borderColor: "border-purple-500/30"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with mission-critical requirements",
      features: [
        "Unlimited AI agents",
        "Unlimited conversations",
        "Custom analytics & reports",
        "Dedicated support manager",
        "On-premise deployment",
        "SLA guarantees",
        "Custom integrations",
        "Advanced security features"
      ],
      popular: false,
      plan: "enterprise",
      icon: Globe,
      gradient: "from-amber-500/20 to-orange-500/20",
      color: "text-amber-400",
      borderColor: "border-amber-500/30"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
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

      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full glass border border-purple-500/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300">Choose Your AI Power Level</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Scale your AI workforce with flexible plans designed for teams of all sizes. 
              From startups to enterprise, we've got you covered.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pricingPlans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <Card 
                    className={`relative glass-card card-smooth border-0 card-3d h-full ${
                      plan.popular ? 'ring-2 ring-purple-500/50' : ''
                    }`}
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-xl`} />
                    
                    {plan.popular && (
                      <motion.div 
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
                          <Star className="h-4 w-4 fill-current" />
                          <span>Most Popular</span>
                        </div>
                      </motion.div>
                    )}
                    
                    <CardContent className="p-8 relative z-10 h-full flex flex-col">
                      <div className="text-center mb-8">
                        <motion.div 
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${plan.gradient} border ${plan.borderColor} mb-4`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <IconComponent className={`h-8 w-8 ${plan.color}`} />
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-gray-300 mb-6">{plan.description}</p>
                        
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold text-white mb-2">
                            {plan.price}
                            {plan.period && <span className="text-lg text-gray-400">{plan.period}</span>}
                          </div>
                          {plan.plan === "enterprise" && (
                            <p className="text-sm text-gray-400">Contact us for pricing</p>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 mb-8">
                        <ul className="space-y-4">
                          {plan.features.map((feature, featureIndex) => (
                            <motion.li 
                              key={featureIndex} 
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: featureIndex * 0.1 }}
                            >
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mt-0.5">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-gray-200 text-sm leading-relaxed">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {plan.plan === "enterprise" ? (
                          <Button 
                            className="w-full btn-futuristic py-3 text-lg"
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Contact Sales
                          </Button>
                        ) : (
                          <Button 
                            className={`w-full py-3 text-lg ${
                              plan.popular 
                                ? 'btn-futuristic' 
                                : 'neomorphic border-purple-500/30 text-purple-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10'
                            }`}
                          >
                            <Zap className="h-5 w-5 mr-2" />
                            {user?.plan === plan.plan ? 'Current Plan' : 'Get Started'}
                          </Button>
                        )}
                      </motion.div>

                      {user?.plan === plan.plan && (
                        <motion.div 
                          className="mt-4 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                            <span className="text-green-300 text-sm">Active Plan</span>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>

                    {/* Animated border glow */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10 blur-sm`} />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Frequently Asked
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Questions</span>
              </h2>
              <p className="text-gray-300">Everything you need to know about our pricing and plans</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Can I change my plan at any time?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
                },
                {
                  question: "What happens if I exceed my conversation limit?",
                  answer: "We'll notify you when you're approaching your limit. You can either upgrade your plan or purchase additional conversation packs as needed."
                },
                {
                  question: "Do you offer annual discounts?",
                  answer: "Yes! Annual subscriptions receive a 20% discount compared to monthly billing. Contact our sales team for enterprise annual pricing."
                },
                {
                  question: "Is there a free trial available?",
                  answer: "We offer a 14-day free trial for all new accounts. No credit card required to get started with your AI agents."
                }
              ].map((faq, index) => (
                <motion.div 
                  key={index}
                  className="glass-card border-0 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="glass-card border-0 card-3d">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl" />
              <CardContent className="p-12 relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Workflow?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of teams already using TechFlow AI to automate their technical processes 
                  and accelerate their development cycles.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/signup">
                      <Button className="btn-futuristic glow-primary px-8 py-4 text-lg">
                        <Rocket className="h-5 w-5 mr-2" />
                        Start Free Trial
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="neomorphic border-blue-500/30 text-blue-300 px-8 py-4 text-lg">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact Sales
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-400" />
                    14-day free trial
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-400" />
                    No setup fees
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                    Cancel anytime
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}