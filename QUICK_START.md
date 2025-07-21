# TechFlow AI - Quick Start

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Setup
1. Extract zip file
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` file with:
   - Your PostgreSQL database URL
   - Google Gemini API key from https://aistudio.google.com/app/apikey

5. Initialize database:
   ```bash
   npm run db:push
   ```

6. Start application:
   ```bash
   npm run dev
   ```

7. Open http://localhost:5000

## Features
- 4 AI Agents (DevOps, AI/ML, Software, Full-Stack)
- Interactive AI Assistant
- Modern UI with glassmorphism design
- Real-time chat interface
- Slack integration (optional)

## Required Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/techflow_ai
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
SESSION_SECRET=your_random_session_secret
```