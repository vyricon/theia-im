# Theia Smart Relay Mode 🤖

AI-powered iMessage relay and auto-response system using Advanced iMessage Kit, Next.js 16, and AI SDK Gateway.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Ensure iMessage SDK server is running
# The SDK accesses iMessage database directly on macOS
# Default server URL: http://localhost:1234

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Run database migrations
# Copy SQL from supabase/migrations/001_create_relay_tables.sql
# Run in Supabase SQL editor

# 5. Start the bot
npm run bot
```

## 🏗️ Architecture

- **Next.js 16**: Latest App Router with Turbopack
- **AI SDK Gateway**: Unified access to x.ai Grok and OpenAI
- **Advanced iMessage Kit**: Direct iMessage database integration
- **Supabase**: PostgreSQL database for memory
- **TypeScript**: Full type safety with Zod validation

## ✨ Features

### Message Relay
- Send messages through Theia: `@contact Send: message`
- Reply to last sender: `Reply: message`
- Full audit logging

### Auto-Response
- AI-powered responses using your communication style
- Status-based: available/busy/away/sleep/dnd
- Urgency detection (keywords, CAPS, !!!)

### Commands
- `/status [mode]` - Set availability
- `/status check` - View current status
- `/digest` - Get message summary

## 📋 Requirements

- macOS (for iMessage)
- Node.js 20+
- iMessage configured on your Mac
- Supabase account
- OpenAI or x.ai API key

## 🔧 Setup

### 1. iMessage Setup

1. Ensure iMessage is configured on your Mac
2. The SDK accesses the iMessage database directly
3. Default server URL: `http://localhost:1234`
4. Optional: Set API_KEY if server requires authentication

### 2. Environment Variables

```env
# Advanced iMessage Kit Server
SERVER_URL=http://localhost:1234
API_KEY=  # Optional - only if server requires auth

# Database (REQUIRED - server-only)
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase (REQUIRED - server-only)
# ⚠️ CRITICAL SECURITY: These keys have ADMIN PRIVILEGES
# - NEVER use NEXT_PUBLIC_ prefix for these variables
# - ONLY import src/lib/supabase/client.ts from server-side code
# - Valid server-side contexts: API routes, server components, bot scripts
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase (client-side, optional for browser usage)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI (choose one)
XAI_API_KEY=your-xai-key
# OR
OPENAI_API_KEY=your-openai-key

# Your phone
YOUR_PHONE_NUMBER=+1234567890
```

**⚠️ CRITICAL SECURITY NOTES:**
- `DATABASE_URL` and `SUPABASE_URL` are **server-only** and must NEVER use `NEXT_PUBLIC_` prefix
- `SUPABASE_SERVICE_ROLE_KEY` contains admin privileges - NEVER expose in client code
- Client-side Supabase access (if needed) uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- All environment variables are validated with Zod at runtime in server entry points

### 3. Database Setup

Run the migration in Supabase:
```sql
-- Copy contents of supabase/migrations/001_create_relay_tables.sql
-- Paste into Supabase SQL Editor and run
```

### 4. Run

```bash
# Development
npm run bot:dev

# Production
npm run bot
```

## 📖 Usage

### Relay Messages

```
You: @mom Send: Running late, be there in 20 mins
Theia → Mom: "Running late, be there in 20 mins"
Theia → You: "✅ Sent to mom"
```

### Reply to Last

```
Friend → You: "Want to grab lunch?"
You: Reply: Yes! 1pm works
Theia → Friend: "Yes! 1pm works"
```

### Status Management

```
You: /status away
Theia: "✅ Status set to: away"

Friend → Theia: "Hey, free to chat?"
Theia → Friend: "[AI generated response] — Theia (AI Assistant)"
Theia → You: "✅ Auto-responded to Friend"
```

### Urgency Override

```
Friend: "URGENT! Need help now!"
Theia → You: "🚨 URGENT from Friend: [message]"
```

## 🧠 How It Works

### You Send (Relay OUT)
```
You → "@Alice Send: Meeting at 3pm"
  ↓
Parse command
  ↓
Send to Alice via iMessage SDK
  ↓
Confirm to you
```

### Contact Sends (Relay IN)
```
Alice → "Can we meet?"
  ↓
Check urgency
  ↓
Check your status
  ↓
If away: AI auto-respond
If available: Relay to you
```

## 🛠️ Tech Stack

- **Next.js 16**: App Router, Turbopack
- **@ai-sdk/gateway**: Unified AI provider access
- **@photon-ai/advanced-imessage-kit**: Direct iMessage database access
- **Supabase**: PostgreSQL database
- **Zod**: Runtime validation
- **TypeScript 5.7**: Full type safety

## 📚 Documentation

- [Advanced iMessage Kit](https://github.com/photon-hq/advanced-imessage-kit)
- [AI SDK Gateway](https://ai-sdk.dev/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

## 📝 License

MIT
