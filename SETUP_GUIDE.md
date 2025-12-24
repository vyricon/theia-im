# Theia Smart Relay Mode - Complete Setup Guide

## 🎯 Overview

This is a production-ready AI-powered iMessage relay system that acts as your personal communication proxy.

## 🏗️ Architecture

### Modern Stack (All Latest Versions)

- **Next.js 16** (canary) - Latest App Router with Turbopack
- **React 19** - Latest React
- **TypeScript 5.7** - Latest TypeScript
- **AI SDK Gateway** (`@ai-sdk/gateway@3.0`) - Official AI provider interface
- **Advanced iMessage Kit** - BlueBubbles Server integration
- **Supabase** - PostgreSQL database
- **Zod 3.24** - Runtime validation

## 📋 Prerequisites

1. **macOS** - Required for iMessage
2. **Node.js 20+** - Latest LTS
3. **BlueBubbles Server** - Download from https://bluebubbles.app
4. **Supabase Account** - Free tier works
5. **AI API Key** - x.ai or OpenAI

## 🚀 Quick Start

### Step 1: Install BlueBubbles Server

1. Download from https://bluebubbles.app
2. Install on your Mac
3. Launch and complete setup
4. Configure iMessage access
5. Set a password in BlueBubbles settings
6. Note the server URL (usually `http://localhost:1234`)

### Step 2: Clone and Install

```bash
git clone https://github.com/vyricon/theia-im.git
cd theia-im
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# BlueBubbles Server (REQUIRED)
BLUEBUBBLES_URL=http://localhost:1234
BLUEBUBBLES_PASSWORD=your-bluebubbles-password

# Your Phone (REQUIRED)
YOUR_PHONE_NUMBER=+1234567890

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (REQUIRED - choose one)
XAI_API_KEY=your-xai-api-key
# OR
OPENAI_API_KEY=your-openai-api-key

# Optional
THEIA_SIGNATURE="— Theia (AI Assistant)"
```

### Step 4: Set Up Database

1. Go to your Supabase project
2. Click **SQL Editor**
3. Create new query
4. Copy all content from `supabase/migrations/001_create_relay_tables.sql`
5. Paste and click **Run**
6. Verify tables created in **Table Editor**

### Step 5: Run the Bot

```bash
# Development (with auto-reload)
npm run bot:dev

# Production
npm run bot
```

You should see:

```
🤖 Theia Smart Relay Bot started...
📱 Your phone: +1234567890
🔵 BlueBubbles: http://localhost:1234
👁️  Watching for messages...
```

## 💬 Usage

### 1. Set Your Status

```
You → Theia: /status away
Theia → You: ✅ Status set to: away
```

**Status Modes:**
- `available` - All messages relayed to you
- `busy` - Only urgent messages relayed
- `away` - All messages auto-responded
- `sleep` - Auto-respond with sleep message
- `dnd` - Only emergencies

### 2. Send Messages via Theia

```
You → Theia: @mom Send: Running late, be there in 20 mins
Theia → Mom: Running late, be there in 20 mins
Theia → You: ✅ Sent to mom
```

### 3. Reply to Last Message

```
Friend → You: Want to grab lunch?
You → Theia: Reply: Yes! 1pm works
Theia → Friend: Yes! 1pm works
```

### 4. Auto-Respond When Away

```
# Set status to away
You → Theia: /status away

# Friend messages
Friend → Theia: Hey, free to chat?

# Theia auto-responds
Theia → Friend: Hey! I'm currently away. I'll get back to you soon.
              Anything urgent? — Theia (AI Assistant)

# You get notified
Theia → You: ✅ Auto-responded to Friend:
            Their message: "Hey, free to chat?"
            My response: "Hey! I'm currently away..."
```

### 5. Urgent Messages (Always Relayed)

```
Friend → Theia: URGENT! Need help ASAP!
Theia → You: 🚨 URGENT from Friend: "URGENT! Need help ASAP!"
```

**Urgency Triggers:**
- Keywords: emergency, urgent, asap, help, 911, critical, hospital
- 3+ exclamation marks
- >50% CAPS text

### 6. Get Message Digest

```
You → Theia: /digest
Theia → You: 📊 Message Digest (last 2 hours):
            Total: 5 messages
            
            • Alice: 2 messages (1 auto-responded)
            • Bob: 1 message (1 urgent)
            • Mom: 2 messages
```

## 🔧 How It Works

### Scenario 1: You Send (Relay OUT)

```
You type: "@Alice Send: Meeting at 3pm"
    ↓
Theia receives via BlueBubbles
    ↓
Parses command: target=Alice, message="Meeting at 3pm"
    ↓
Sends to Alice using Advanced iMessage Kit
    ↓
Confirms to you: "✅ Sent to Alice"
    ↓
Logs to Supabase database
```

### Scenario 2: Contact Sends (Relay IN)

```
Alice messages Theia: "Can we meet today?"
    ↓
Theia checks: Is this urgent?
    ├─ YES → Relay to you immediately (🚨 URGENT)
    └─ NO → Check your status
             ↓
        Available? → Relay to you
        Away? → AI generates response → Sends to Alice → Notifies you
```

## 🧠 AI Auto-Response

The system uses AI SDK Gateway to access x.ai's Grok or OpenAI:

```typescript
import { gateway } from '@ai-sdk/gateway';
import { generateText } from 'ai';

const { text } = await generateText({
  model: gateway('xai/grok-beta'),
  system: `You are Theia, responding for a user who is away...`,
  prompt: message.text,
});
```

The AI:
- ✅ Learns your communication style from database profile
- ✅ Matches your tone, phrases, and emoji usage
- ✅ Keeps responses brief (1-2 sentences)
- ✅ Always signs as "— Theia (AI Assistant)"
- ✅ Never pretends to be you

## 📊 Database Schema

### `theia_user_status`
Tracks your availability status.

### `theia_relay_messages`
Complete audit trail of all relays (manual, auto, urgent).

### `theia_contact_preferences`
Per-contact settings (allow auto-respond, custom messages).

### `theia_user_profile`
Your communication style (tone, phrases, emoji usage).

## 🔐 Security

- ✅ All messages logged for audit
- ✅ Row Level Security (RLS) enabled
- ✅ Environment variables for secrets
- ✅ Service role key for server operations
- ✅ Zod validation on all inputs

## 🐛 Troubleshooting

### Bot Won't Start

**Error: "BLUEBUBBLES_PASSWORD not configured"**
- Install BlueBubbles Server first
- Set password in BlueBubbles settings
- Add to `.env`

**Error: "YOUR_PHONE_NUMBER not configured"**
- Add your phone number to `.env` in E.164 format: `+1234567890`

### Messages Not Received

1. Check BlueBubbles Server is running
2. Verify iMessage is enabled and signed in
3. Check BlueBubbles URL is correct
4. View bot console logs for errors

### Auto-Respond Not Working

1. Verify status is set to `away`, `busy`, `sleep`, or `dnd`
2. Check AI API key is valid
3. Review bot console for AI errors
4. Test with `/status check`

## 📚 API Reference

### GET /api/relay/status
Get current user status.

### POST /api/relay/status
Update user status.

### GET /api/relay/messages
Query relay message history.

## 🎯 Advanced Features

### Contact Preferences (Future)

```sql
-- Allow/disallow auto-respond for specific contacts
INSERT INTO theia_contact_preferences (
  user_phone, contact_phone, allow_auto_respond
) VALUES ('+1234567890', '+0987654321', false);
```

### Custom Away Messages (Future)

```sql
-- Set custom message for specific contact
UPDATE theia_contact_preferences
SET custom_away_message = 'In a meeting, will reply soon!'
WHERE contact_phone = '+0987654321';
```

### Schedule-Based Status (Future)

```json
// Auto-switch status based on time
{
  "work_hours": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

## 🚀 Deployment

### Running as Service (macOS)

Create `~/Library/LaunchAgents/com.theia.relay.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.theia.relay</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/theia-im/node_modules/.bin/tsx</string>
        <string>/path/to/theia-im/scripts/theia-bot.ts</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/theia-im</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/theia-relay.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/theia-relay-error.log</string>
</dict>
</plist>
```

Load:
```bash
launchctl load ~/Library/LaunchAgents/com.theia.relay.plist
```

## 📝 License

MIT

## 🤝 Support

- GitHub Issues: https://github.com/vyricon/theia-im/issues
- BlueBubbles Docs: https://docs.bluebubbles.app
- AI SDK Docs: https://ai-sdk.dev/docs

---

**Built with Next.js 16, AI SDK Gateway, and BlueBubbles** 🚀
