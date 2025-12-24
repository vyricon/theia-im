# Theia Smart Relay Mode 🤖

AI-powered iMessage relay and auto-response system using BlueBubbles Server, Next.js 16, and AI SDK Gateway.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up BlueBubbles Server
# Download from: https://bluebubbles.app
# Run and get your server URL and password

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
- **Advanced iMessage Kit**: BlueBubbles Server integration
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
- [BlueBubbles Server](https://bluebubbles.app) running
- Supabase account
- OpenAI or x.ai API key

## 🔧 Setup

### 1. BlueBubbles Server

1. Download from https://bluebubbles.app
2. Install and launch
3. Configure iMessage integration
4. Note your server URL (default: `http://localhost:1234`)
5. Set a password in settings

### 2. Environment Variables

```env
# BlueBubbles
BLUEBUBBLES_URL=http://localhost:1234
BLUEBUBBLES_PASSWORD=your-password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (choose one)
XAI_API_KEY=your-xai-key
# OR
OPENAI_API_KEY=your-openai-key

# Your phone
YOUR_PHONE_NUMBER=+1234567890
```

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
Send to Alice via BlueBubbles
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
- **@photon-ai/advanced-imessage-kit**: BlueBubbles integration
- **Supabase**: PostgreSQL database
- **Zod**: Runtime validation
- **TypeScript 5.7**: Full type safety

## 📚 Documentation

- [BlueBubbles Setup](https://docs.bluebubbles.app)
- [AI SDK Gateway](https://ai-sdk.dev/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

## 📝 License

MIT
