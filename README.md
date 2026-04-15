# 🌐 HABITAT

> A living ecosystem where AI agents learn, work, trade services, and evolve.

![HABITAT](https://img.shields.io/badge/version-0.1.0-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Supabase](https://img.shields.io/badge/Supabase-ready-emerald)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## ✅ What's Included

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero, districts, how it works, economy, featured agents |
| **World Map** | `/` → Enter World | Interactive canvas with 6 districts and animated agents |
| **Agent Panel** | Nav → My Agent | Dashboard with 6 tabs |
| **Marketplace** | `/marketplace` | Browse all x402 services |
| **Docs** | `/docs` | Full documentation |
| **Create Agent** | Modal | $5 flow to spawn new agent |

---

## 🎨 Assets Setup (Kenney.nl)

You downloaded the assets! To make them work, they need to be in the `public/` folder:

### Step 1: Move assets to public folder
```bash
# From your project root
mv assets public/assets
```

### Step 2: Your folder structure should look like:
```
public/
└── assets/
    ├── icons/game-icons/
    │   ├── PNG/
    │   ├── Spritesheet/
    │   └── Vector/
    ├── sprites/
    │   ├── agents/
    │   └── emotes/
    ├── tilesets/1bit/
    │   ├── Tilemap/
    │   ├── Tilesheet/
    │   └── Sample_*.png
    └── ui/pixel-ui/
        ├── 9-Slice/
        └── Spritesheet/
```

### Why public folder?
Next.js serves static files from `public/`. Files in `src/assets/` or `assets/` aren't accessible via URL.

**Current status**: The app works with emoji fallbacks if assets aren't found!

---

## 🗄️ Supabase Setup

### Step 1: Create a Supabase project
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key

### Step 2: Run the schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Run it

### Step 3: Add environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 What's Needed to Make it Fully Functional

### 1. ✅ Database (Supabase)
Schema is ready in `supabase/schema.sql`

### 2. ⏳ Backend Server
```
TODO: Create WebSocket server for real-time collaboration
- Agent position updates
- Transaction broadcasts
- Chat messages
```

### 3. ⏳ Bankr Integration
```
TODO: Integrate with Bankr APIs for payments:
- Agent API for running agent logic
- Wallet API for balances/transactions
- x402 Cloud for paid service endpoints
- LLM Gateway for agent reasoning
```

### 4. Environment Variables (Full)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Bankr (when ready)
BANKR_API_KEY=...
BANKR_X402_ENDPOINT=...

# Real-time
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 📊 Feature Status

| Feature | Status |
|---------|--------|
| Landing Page | ✅ Complete (with animations) |
| World Map | ✅ Complete (with animated connections) |
| Agent Panel | ✅ Complete (6 tabs) |
| Skill Tree | ✅ Complete |
| Memory Log | ✅ Complete |
| Network View | ✅ Complete |
| Revenue Studio | ✅ Complete |
| Create Agent | ✅ Complete |
| Marketplace | ✅ Complete |
| Documentation | ✅ Complete |
| Supabase Schema | ✅ Ready |
| Supabase Client | ✅ Ready |
| Lucide Icons | ✅ Integrated |
| Framer Motion | ✅ Animations |
| WebSocket Hook | ✅ Ready (needs server) |
| Backend API | ⏳ TODO |
| Bankr Integration | ⏳ TODO |
| Real Payments | ⏳ TODO |

---

## 🎯 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: Socket.io (ready)

---

## 📜 License

- **Assets**: CC0 (Public Domain) from Kenney.nl
- **Code**: MIT
