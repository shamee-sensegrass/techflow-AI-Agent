import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { 
  Zap, 
  LayoutDashboard, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { useState, useMemo, useCallback, memo } from "react";

export const Sidebar = memo(function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
    { name: 'AI Agents', href: '/agents', icon: Bot, color: 'text-purple-400' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-green-400' },
    { name: 'Slack Bot', href: '/slack', icon: MessageSquare, color: 'text-cyan-400' },
    { name: 'Pricing', href: '/pricing', icon: CreditCard, color: 'text-amber-400' },
  ], []);

  const isActive = useCallback((path: string) => {
    if (path === "/dashboard" && location === "/dashboard") return true;
    if (path !== "/dashboard" && location.startsWith(path)) return true;
    return false;
  }, [location]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }), []);

  const SidebarContent = useMemo(() => (
    <motion.div 
      className="h-full flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div 
        className="p-6 border-b border-purple-500/20"
        variants={itemVariants}
      >
        <Link href="/dashboard">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              TechFlow AI
            </span>
          </motion.div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <motion.div className="space-y-2" variants={containerVariants}>
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link href={item.href}>
                  <motion.div 
                    className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                      active
                        ? 'glass-card border-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-gray-700/50 group-hover:bg-white/10'} transition-colors`}>
                      <Icon className={`h-4 w-4 ${active ? item.color : 'text-gray-400 group-hover:' + item.color}`} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {active && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 text-purple-400" />
                      </motion.div>
                    )}
                    
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        style={{ y: '-50%' }}
                      />
                    )}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* User Section */}
      <motion.div 
        className="p-4 border-t border-purple-500/20"
        variants={itemVariants}
      >
        {user && (
          <motion.div 
            className="mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="glass-card border-0 p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center border border-purple-500/40">
                    <span className="text-sm font-bold text-white">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <p className="text-xs text-amber-400 capitalize font-medium">{user.plan} Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div className="space-y-2" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Link href="/settings">
              <motion.div 
                className="group flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-white/10 transition-colors">
                  <Settings className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                </div>
                <span>Settings</span>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start px-4 py-2 h-auto text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 transition-all duration-300"
              >
                <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-white/10 transition-colors mr-3">
                  <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
                </div>
                Sign Out
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Theme Toggle */}
        <motion.div 
          className="mt-4 flex justify-center"
          variants={itemVariants}
        >
          <ThemeToggle />
        </motion.div>
      </motion.div>
    </motion.div>
  ), [user, logout, navigation, isActive, containerVariants, itemVariants]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 glass backdrop-blur-xl border-r border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95" />
        <div className="relative z-10 h-full">
          {SidebarContent}
        </div>
        
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-blue-500/10 opacity-50 -z-10" />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="glass border-purple-500/30 backdrop-blur-xl"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="relative w-64 h-full glass backdrop-blur-xl border-r border-purple-500/20 flex flex-col"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95" />
              <div className="relative z-10 h-full">
                {SidebarContent}
              </div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-blue-500/10 opacity-50 -z-10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});