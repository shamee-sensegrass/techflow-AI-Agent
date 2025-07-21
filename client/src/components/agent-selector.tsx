import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Brain, 
  Code2, 
  Globe,
  Settings,
  Zap,
  Database,
  Cloud
} from "lucide-react";
import type { AgentTemplate, AiAgent } from "@shared/schema";

interface AgentSelectorProps {
  agents: AiAgent[];
  onSelectAgent: (agent: AiAgent) => void;
  onCreateAgent: (template: AgentTemplate) => void;
}

const agentTemplates = [
  {
    template: "devops-engineer" as AgentTemplate,
    title: "DevOps Engineer",
    description: "Cloud infrastructure, CI/CD, and automation specialist",
    icon: Server,
    specializations: ["Kubernetes", "Terraform", "AWS", "Docker", "Jenkins"],
    color: "bg-blue-500"
  },
  {
    template: "ai-ml-engineer" as AgentTemplate,
    title: "AI/ML Engineer", 
    description: "Machine learning systems and MLOps expert",
    icon: Brain,
    specializations: ["PyTorch", "TensorFlow", "Computer Vision", "NLP", "MLOps"],
    color: "bg-purple-500"
  },
  {
    template: "software-engineer" as AgentTemplate,
    title: "Software Engineer",
    description: "System design and high-performance software development",
    icon: Code2,
    specializations: ["Python", "Go", "Java", "System Design", "Algorithms"],
    color: "bg-green-500"
  },
  {
    template: "fullstack-developer" as AgentTemplate,
    title: "Full-Stack Developer",
    description: "Modern web development across the entire stack",
    icon: Globe,
    specializations: ["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL"],
    color: "bg-orange-500"
  }
];

export function AgentSelector({ agents, onSelectAgent, onCreateAgent }: AgentSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const getAgentByTemplate = (template: AgentTemplate) => {
    return agents.find(agent => agent.template === template);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Technical AI Coworker</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select from our specialized AI engineers with deep expertise in their respective technical domains.
          Each agent provides production-ready solutions and architectural guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agentTemplates.map((template) => {
          const existingAgent = getAgentByTemplate(template.template);
          const IconComponent = template.icon;
          
          return (
            <Card 
              key={template.template} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedTemplate === template.template 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedTemplate(template.template)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  {existingAgent && (
                    <Badge variant="secondary" className="ml-auto">
                      <Settings className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      Core Specializations
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {template.specializations.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    {existingAgent ? (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAgent(existingAgent);
                        }}
                        className="w-full"
                        size="sm"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Start Conversation
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateAgent(template.template);
                        }}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Cloud className="h-4 w-4 mr-2" />
                        Deploy Agent
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">
              Ready to deploy your {agentTemplates.find(t => t.template === selectedTemplate)?.title}?
            </h3>
            <p className="text-muted-foreground">
              This agent will provide expert-level guidance, code reviews, architecture recommendations,
              and hands-on solutions for your technical challenges.
            </p>
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={() => {
                  const existing = getAgentByTemplate(selectedTemplate);
                  if (existing) {
                    onSelectAgent(existing);
                  } else {
                    onCreateAgent(selectedTemplate);
                  }
                }}
                size="lg"
              >
                {getAgentByTemplate(selectedTemplate) ? 'Start Working' : 'Deploy Now'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                size="lg"
              >
                Browse More
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}