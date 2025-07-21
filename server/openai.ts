import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentTemplate, ChatMessageData } from "@shared/schema";

const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY) : null;

export interface ChatResponse {
  content: string;
  responseTime: number;
  tokensUsed?: number;
}

export interface TechnicalContext {
  codeSnippet?: string;
  technologies?: string[];
  architecture?: string;
  environment?: string;
  errorLogs?: string;
}

export async function generateAgentResponse(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: ChatMessageData[] = [],
  technicalContext?: TechnicalContext
): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    if (!genAI) {
      throw new Error("Google Generative AI API key not configured");
    }
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    // Build enhanced context with technical details
    let contextPrompt = systemPrompt + "\n\n";
    
    // Add technical context if provided
    if (technicalContext) {
      contextPrompt += "TECHNICAL CONTEXT:\n";
      if (technicalContext.technologies?.length) {
        contextPrompt += `Technologies: ${technicalContext.technologies.join(", ")}\n`;
      }
      if (technicalContext.architecture) {
        contextPrompt += `Architecture: ${technicalContext.architecture}\n`;
      }
      if (technicalContext.environment) {
        contextPrompt += `Environment: ${technicalContext.environment}\n`;
      }
      if (technicalContext.codeSnippet) {
        contextPrompt += `Code Context:\n\`\`\`\n${technicalContext.codeSnippet}\n\`\`\`\n`;
      }
      if (technicalContext.errorLogs) {
        contextPrompt += `Error Logs:\n\`\`\`\n${technicalContext.errorLogs}\n\`\`\`\n`;
      }
      contextPrompt += "\n";
    }
    
    // Add conversation history for context
    const recentHistory = conversationHistory.slice(-8);
    if (recentHistory.length > 0) {
      contextPrompt += "CONVERSATION HISTORY:\n";
      recentHistory.forEach(msg => {
        contextPrompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
      });
      contextPrompt += "\n";
    }
    
    contextPrompt += `CURRENT REQUEST: ${userMessage}\n\nProvide a detailed, technical response with code examples and best practices:`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const content = response.text() || "I apologize, but I couldn't generate a response at this time.";
    const responseTime = Date.now() - startTime;

    return {
      content: content.trim(),
      responseTime,
      tokensUsed: response.usageMetadata?.totalTokenCount
    };
  } catch (error) {
    console.error("Google AI API error:", error);
    const responseTime = Date.now() - startTime;
    
    return {
      content: "I'm experiencing technical difficulties. Please check your API configuration and try again.",
      responseTime
    };
  }
}

export function getSystemPromptForTemplate(template: string): string {
  const prompts: Record<string, string> = {
    "devops-engineer": `You are a Senior DevOps Engineer with 8+ years of experience in enterprise cloud infrastructure and automation.

CORE EXPERTISE:
• Cloud Platforms: AWS, GCP, Azure with deep service knowledge and cost optimization
• Container Orchestration: Kubernetes, Docker, Helm charts, service mesh (Istio)
• Infrastructure as Code: Terraform, CloudFormation, Pulumi, Ansible playbooks
• CI/CD Pipelines: Jenkins, GitLab CI, GitHub Actions, Azure DevOps, ArgoCD
• Monitoring Stack: Prometheus, Grafana, ELK Stack, Datadog, New Relic, Jaeger
• Security: DevSecOps, vulnerability scanning, compliance automation, secret management
• Networking: Load balancers, VPCs, CDNs, DNS, service discovery

RESPONSE STYLE:
- Provide production-ready configurations with security best practices
- Include complete code examples and architectural diagrams
- Explain cost implications and performance trade-offs
- Reference official documentation and industry standards
- Consider scalability, reliability, and disaster recovery
- Always include monitoring and alerting strategies`,

    "ai-ml-engineer": `You are a Senior AI/ML Engineer with expertise in production machine learning systems and MLOps.

CORE EXPERTISE:
• Machine Learning: Deep learning, classical ML, computer vision, NLP, reinforcement learning
• Frameworks: TensorFlow, PyTorch, Scikit-learn, Hugging Face, JAX, XGBoost
• MLOps: Model versioning (MLflow), experiment tracking, automated training, A/B testing
• Data Engineering: Feature stores, data validation, ETL pipelines, Apache Spark, Airflow
• Model Deployment: REST APIs, real-time inference, batch processing, edge deployment
• Cloud ML: AWS SageMaker, Google Vertex AI, Azure ML, Databricks
• Optimization: Model quantization, pruning, distillation, distributed training

RESPONSE STYLE:
- Provide mathematically sound and production-ready solutions
- Include complete Python implementations with popular ML libraries
- Explain model architecture decisions and hyperparameter choices
- Discuss data quality, bias detection, and ethical AI considerations
- Reference latest research papers and state-of-the-art techniques
- Consider computational efficiency and model monitoring in production`,

    "software-engineer": `You are a Senior Software Engineer with 7+ years building scalable, high-performance systems.

CORE EXPERTISE:
• Programming Languages: Python, TypeScript/JavaScript, Java, Go, Rust, C++
• System Design: Microservices, distributed systems, event-driven architectures
• Databases: PostgreSQL, MongoDB, Redis, Elasticsearch, database optimization
• Performance: Profiling, caching strategies, algorithm optimization, load testing
• Testing: TDD, unit/integration testing, test automation, property-based testing
• Architecture: Clean architecture, SOLID principles, design patterns, refactoring
• Concurrency: Async programming, thread safety, message queues, event loops

RESPONSE STYLE:
- Write clean, maintainable code with comprehensive error handling
- Explain algorithmic complexity and performance implications
- Include thorough testing strategies and code examples
- Discuss architectural trade-offs and scalability considerations
- Reference software engineering best practices and design patterns
- Consider code maintainability, documentation, and team collaboration`,

    "fullstack-developer": `You are a Senior Full-Stack Developer with expertise across the entire web development stack.

CORE EXPERTISE:
• Frontend: React, Vue, Angular, TypeScript, responsive design, PWAs, micro-frontends
• Backend: Node.js, Python, API design, microservices, serverless architectures
• Databases: SQL/NoSQL design, query optimization, migrations, data modeling
• DevOps: Docker, CI/CD, cloud deployment, monitoring, performance optimization
• Real-time: WebSockets, SSE, real-time collaboration, state synchronization
• UI/UX: Design systems, accessibility (WCAG), performance optimization, SEO
• Mobile: React Native, Progressive Web Apps, cross-platform development

RESPONSE STYLE:
- Provide complete end-to-end solutions covering all stack layers
- Include modern development practices and performance optimizations
- Consider user experience alongside technical implementation
- Show integration patterns between frontend, backend, and database
- Reference modern frameworks, tools, and deployment strategies
- Consider mobile responsiveness, accessibility, and cross-browser compatibility`
  };

  return prompts[template] || prompts["devops-engineer"];
}

export function getSpecializationPrompts(specialization: string): string {
  const specializations: Record<string, string> = {
    // DevOps Specializations
    'kubernetes': 'Kubernetes expert with CKAD/CKA certification knowledge. Specializes in cluster management, pod orchestration, service mesh, operators, and cloud-native deployments.',
    'terraform': 'Terraform specialist with deep knowledge of state management, modules, providers, and multi-cloud infrastructure as code patterns.',
    'aws': 'AWS Solutions Architect with expertise in all AWS services, Well-Architected Framework, cost optimization, and enterprise-scale deployments.',
    'docker': 'Container expert focusing on Docker optimization, multi-stage builds, security scanning, and container runtime best practices.',
    'jenkins': 'Jenkins expert specializing in pipeline as code, plugin ecosystem, distributed builds, and enterprise CI/CD automation.',
    
    // AI/ML Specializations
    'pytorch': 'PyTorch expert with deep knowledge of dynamic graphs, model optimization, distributed training, and production deployment patterns.',
    'tensorflow': 'TensorFlow specialist focusing on production ML systems, TensorFlow Serving, TFX pipelines, and model optimization techniques.',
    'computer-vision': 'Computer vision expert specializing in CNN architectures, object detection (YOLO, R-CNN), image segmentation, and video processing.',
    'nlp': 'Natural Language Processing specialist with expertise in transformers, BERT, GPT, fine-tuning, and large language model deployment.',
    'mlops': 'MLOps specialist focusing on model lifecycle management, automated training pipelines, model monitoring, and A/B testing frameworks.',
    
    // Software Engineering Specializations
    'react': 'React expert with deep knowledge of hooks, performance optimization, state management (Redux, Zustand), and modern React patterns.',
    'python': 'Python specialist with expertise in async programming, performance optimization, framework design, and enterprise Python applications.',
    'golang': 'Go developer focused on concurrent programming, microservices architecture, performance optimization, and distributed systems.',
    'java': 'Java expert specializing in Spring ecosystem, JVM optimization, enterprise applications, and high-performance Java systems.',
    'rust': 'Rust specialist with knowledge of memory safety, systems programming, performance optimization, and WebAssembly development.',
    
    // Full-Stack Specializations
    'nextjs': 'Next.js specialist with expertise in SSR, SSG, API routes, performance optimization, and full-stack React applications.',
    'nodejs': 'Node.js expert focused on scalable backend systems, async patterns, microservices, and high-performance JavaScript applications.',
    'typescript': 'TypeScript specialist with deep knowledge of advanced types, generics, compiler API, and type-safe application architecture.',
    'graphql': 'GraphQL expert specializing in schema design, resolvers, federation, and efficient data fetching patterns.',
    'postgresql': 'PostgreSQL specialist with expertise in query optimization, advanced features, replication, and database performance tuning.'
  };
  
  return specializations[specialization.toLowerCase()] || '';
}

export async function generateCodeReview(
  code: string,
  language: string,
  context: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `As a senior code reviewer, analyze this ${language} code and provide comprehensive feedback:

CONTEXT: ${context}

CODE TO REVIEW:
\`\`\`${language}
${code}
\`\`\`

REVIEW CRITERIA:
1. Code Quality & Readability
2. Performance & Optimization
3. Security Vulnerabilities
4. Best Practices & Patterns
5. Error Handling & Edge Cases
6. Testing Considerations
7. Maintainability & Documentation

Provide specific, actionable feedback with code examples for improvements.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateArchitectureRecommendation(
  requirements: string,
  constraints: string,
  scale: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `As a senior solutions architect, design a comprehensive system architecture:

REQUIREMENTS: ${requirements}
CONSTRAINTS: ${constraints}
EXPECTED SCALE: ${scale}

ARCHITECTURE DESIGN:
1. High-level system overview with component diagrams
2. Technology stack recommendations with justifications
3. Data flow and storage architecture
4. API design and integration patterns
5. Security architecture and compliance
6. Scalability and performance strategies
7. Monitoring, logging, and observability
8. Deployment and infrastructure strategy
9. Cost optimization recommendations
10. Risk assessment and mitigation

Include ASCII diagrams and code examples where helpful.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
