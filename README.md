# Mission Control

**Open-source agent coordination dashboard for OpenClaw**

[![Deploy with Docker](https://img.shields.io/badge/Deploy-Docker-blue)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/Built%20for-OpenClaw-purple)](https://openclaw.ai)

**Stop burning tokens building dashboards. Deploy this in 5 minutes.**

![Mission Control Dashboard](./docs/images/dashboard-preview.png)

## What is Mission Control?

Mission Control is a production-ready dashboard for managing multiple AI agents. It provides:

- **📊 Real-time agent status** — See which agents are available, busy, or offline
- **📋 Task management** — Kanban board with drag-and-drop task organization
- **🔍 Memory search** — FTS5-powered search across all agent memories
- **📅 Calendar integration** — View and manage agent schedules
- **⚙️ Cron job monitoring** — Track automated tasks and health
- **🌙 Dark mode** — Easy on the eyes during long coding sessions

Built by the OpenClaw team after realizing **everyone was rebuilding the same dashboard**. We open sourced it so you don't have to.

## Quick Start (5 minutes)

### Prerequisites

- Node.js 18+ 
- Docker (optional, for containerized deployment)
- OpenClaw instance running

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/openclaw/mission-control.git
cd mission-control

# Build and run
docker-compose up -d

# Open in browser
open http://localhost:3000
```

### Option 2: Manual Setup

```bash
# Clone and install
git clone https://github.com/openclaw/mission-control.git
cd mission-control
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Architecture

```
mission-control/
├── frontend/           # Next.js 14 dashboard
│   ├── app/           # Pages and layouts
│   ├── components/    # React components
│   └── lib/           # Utilities and API client
├── backend/            # Express API server
│   ├── routes/        # REST endpoints
│   └── db/            # SQLite + FTS5
└── docs/              # Documentation
```

**Tech Stack:**
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Backend:** Express.js, SQLite, FTS5
- **Deployment:** Docker, standalone export

## Features

### 📊 Agent Dashboard

![Agent Dashboard](./docs/images/agents-preview.png)

- Real-time status updates
- Task assignment tracking
- Health indicators
- Activity history

### 📋 Task Board

![Task Board](./docs/images/tasks-preview.png)

- Kanban view with drag-and-drop
- List view for detailed management
- Filter by status, priority, assignee
- Deep linking for shareable views

### 🔍 Memory Search

![Memory Search](./docs/images/memory-preview.png)

- Full-text search across all memories
- Highlighted snippets
- Category filtering
- Split-panel detail view

### ⚙️ System Monitoring

- Cron job health status
- Failed task alerts
- Resource usage tracking
- Error logs

## Customization

### Add Custom Widgets

Mission Control is designed to be extended. Add your own widgets:

```typescript
// components/CustomWidget.tsx
export function CustomWidget() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2>Your Custom Widget</h2>
      {/* Your code here */}
    </div>
  );
}
```

See [CUSTOMIZATION.md](./docs/CUSTOMIZATION.md) for full guide.

### Widget API

```typescript
interface WidgetProps {
  agent: Agent;
  tasks: Task[];
  onRefresh: () => void;
}
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- 🐛 Bug fixes
- ✨ New widgets and features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🌐 Translations

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/mission-control.git
cd mission-control

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Run tests
npm test
npm run test:e2e

# Create PR
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

## Documentation

- [Setup Guide](./docs/SETUP.md) — Detailed installation instructions
- [Customization Guide](./docs/CUSTOMIZATION.md) — How to add widgets and themes
- [API Reference](./docs/API.md) — Backend API documentation
- [Contributing Guide](./docs/CONTRIBUTING.md) — How to contribute
- [Changelog](./CHANGELOG.md) — Version history

## Examples

Check the [`/examples`](./examples) folder for:

- **Custom Widgets** — Status indicators, charts, custom visualizations
- **Multi-Agent Setup** — How to configure 3+ agents
- **Deployment Configs** — Docker, Vercel, Railway examples
- **Integration Examples** — Slack, Discord, custom webhooks

## Why Open Source?

**The problem:** Every OpenClaw user was burning tokens building their own dashboard. Same components, same patterns, duplicated effort.

**The solution:** One open-source reference implementation. Community improves it together. New users deploy in minutes.

**Token multiplier effect:** Every adoption saves tokens. Every contribution improves it for everyone.

## Roadmap

- [ ] Widget marketplace
- [ ] Custom themes
- [ ] WebSocket real-time updates
- [ ] Mobile app
- [ ] Plugin system
- [ ] Multi-language support

See [ROADMAP.md](./ROADMAP.md) for full details.

## License

MIT License — use it however you want. See [LICENSE](./LICENSE) for details.

## Credits

Built by the OpenClaw team:

- **OLEX** — Lead coordinator, dashboard architecture
- **RUFUS** — Backend API, database design
- **Sparky** — Component specs, documentation

Inspired by the OpenClaw community's need for better agent tooling.

## Support

- 📖 [Documentation](./docs/)
- 💬 [Discord Community](https://discord.com/invite/clawd)
- 🐛 [Issue Tracker](https://github.com/openclaw/mission-control/issues)
- 📧 [Email](mailto:support@openclaw.ai)

---

**Stop rebuilding. Start shipping.** 🚀

Made with ❤️ by the OpenClaw team
