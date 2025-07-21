import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimpleAssistant } from './SimpleAssistant';
import { Sparkles } from 'lucide-react';

interface AssistantTriggerProps {
  currentAgent?: string;
  className?: string;
}

export function AssistantTrigger({ currentAgent, className = "" }: AssistantTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${className}`}
        size="lg"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
      
      <SimpleAssistant
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        currentAgent={currentAgent}
      />
    </>
  );
}