import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-1 transition-all duration-300 hover:scale-105"
      style={{
        background: theme === "dark" 
          ? "linear-gradient(135deg, hsl(220 30% 12%) 0%, hsl(220 30% 18%) 100%)"
          : "linear-gradient(135deg, hsl(260 85% 65%) 0%, hsl(195 100% 70%) 100%)"
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-lg"
        animate={{
          x: theme === "dark" ? 0 : 28,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {theme === "dark" ? (
          <Moon className="w-3 h-3 text-slate-700" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-50 blur-sm"
        style={{
          background: theme === "dark" 
            ? "linear-gradient(135deg, rgba(120, 119, 198, 0.3), rgba(0, 191, 255, 0.2))"
            : "linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.3))"
        }}
      />
    </motion.button>
  );
}