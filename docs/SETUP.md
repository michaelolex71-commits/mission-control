# Setup Guide

Complete installation and configuration guide for Mission Control.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm or yarn** — Comes with Node.js
- **Git** — [Download](https://git-scm.com/)
- **OpenClaw instance** — Running locally or accessible URL

Optional:
- **Docker** — For containerized deployment
- **PM2** — For production process management

## Installation Methods

### Method 1: Docker (Recommended)

Best for production and easy setup.

```bash
# Clone repository
git clone https://github.com/openclaw/mission-control.git
cd mission-control

# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access:** http://localhost:3000

**Stop:** `docker-compose down`

### Method 2: Manual Setup

Best for development and customization.

```bash
# Clone repository
git clone https://github.com/openclaw/mission-control.git
cd mission-control

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit configuration
nano .env.local
```

**Configure `.env.local`:**
```bash
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Custom port (optional)
PORT=3000
```

**Start development:**
```bash
# Start backend
cd backend
npm run dev

# In new terminal, start frontend
cd ../frontend
npm run dev
```

**Access:** http://localhost:3000

### Method 3: Static Export

Best for hosting on Vercel, Netlify, or GitHub Pages.

```bash
# Build static export
npm run build
npm run export

# Deploy 'out' folder to your host
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001` | Backend API URL |
| `PORT` | No | `3000` | Frontend port |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | — | Analytics tracking ID |
| `NEXT_PUBLIC_THEME` | No | `dark` | Default theme |

### Backend Configuration

The backend uses SQLite with FTS5 for search. Database is stored in `data/mission-control.db`.

**Database location:**
```
backend/data/mission-control.db
```

**Backup database:**
```bash
cp backend/data/mission-control.db backup-$(date +%Y%m%d).db
```

## Deployment

### Docker

```bash
# Build image
docker build -t mission-control ./frontend

# Run container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-api-url:3001 \
  --name mission-control \
  mission-control
```

### PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "mission-control-api" -- run start

# Start frontend
cd ../frontend
pm2 start npm --name "mission-control-frontend" -- run start

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Database locked:**
```bash
# Stop all instances
pm2 stop all

# Remove lock file
rm backend/data/mission-control.db-wal
rm backend/data/mission-control.db-shm

# Restart
pm2 start all
```

**API connection failed:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check firewall settings

### Logs

**Docker logs:**
```bash
docker-compose logs -f
```

**PM2 logs:**
```bash
pm2 logs
```

**Manual logs:**
```bash
# Backend
tail -f backend/logs/api.log

# Frontend
tail -f frontend/logs/next.log
```

## Updating

### Docker

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Manual

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart all
```

## Next Steps

- [Customization Guide](./CUSTOMIZATION.md) — Add widgets and themes
- [API Reference](./API.md) — Backend API documentation
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute

## Support

- 💬 [Discord](https://discord.com/invite/clawd)
- 🐛 [Issue Tracker](https://github.com/openclaw/mission-control/issues)
- 📧 [Email](mailto:support@openclaw.ai)
