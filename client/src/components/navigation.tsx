import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Coworker-AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <a 
                  href="#features" 
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Features
                </a>
                <a 
                  href="#agents" 
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  AI Agents
                </a>
                <Link href="/pricing">
                  <span className={`font-medium transition-colors cursor-pointer ${
                    isActive('/pricing') 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Pricing
                  </span>
                </Link>
                <a 
                  href="#contact" 
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <span className={`font-medium transition-colors cursor-pointer ${
                    isActive('/dashboard') 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Dashboard
                  </span>
                </Link>
                <Link href="/agents">
                  <span className={`font-medium transition-colors cursor-pointer ${
                    isActive('/agents') 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Agents
                  </span>
                </Link>
                <Link href="/analytics">
                  <span className={`font-medium transition-colors cursor-pointer ${
                    isActive('/analytics') 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Analytics
                  </span>
                </Link>
                <Link href="/pricing">
                  <span className={`font-medium transition-colors cursor-pointer ${
                    isActive('/pricing') 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Pricing
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-600">
                  {user.firstName} {user.lastName}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-slate-600 hover:text-blue-600"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="text-slate-600 hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-4">
              {!user ? (
                <>
                  <a 
                    href="#features" 
                    className="text-slate-600 hover:text-blue-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#agents" 
                    className="text-slate-600 hover:text-blue-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    AI Agents
                  </a>
                  <Link href="/pricing">
                    <span 
                      className="text-slate-600 hover:text-blue-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </span>
                  </Link>
                  <a 
                    href="#contact" 
                    className="text-slate-600 hover:text-blue-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <span 
                      className="text-slate-600 hover:text-blue-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/agents">
                    <span 
                      className="text-slate-600 hover:text-blue-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Agents
                    </span>
                  </Link>
                  <Link href="/analytics">
                    <span 
                      className="text-slate-600 hover:text-blue-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Analytics
                    </span>
                  </Link>
                  <Link href="/pricing">
                    <span 
                      className="text-slate-600 hover:text-blue-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </span>
                  </Link>
                  <div className="pt-4 border-t border-slate-200">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-slate-600"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
