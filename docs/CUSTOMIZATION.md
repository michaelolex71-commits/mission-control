# Customization Guide

Learn how to customize Mission Control with your own widgets, themes, and integrations.

## Table of Contents

- [Adding Custom Widgets](#adding-custom-widgets)
- [Custom Themes](#custom-themes)
- [Integrations](#integrations)
- [Advanced Customization](#advanced-customization)

## Adding Custom Widgets

### Widget Structure

Widgets are React components that receive data from the Mission Control API.

**Basic widget:**

```typescript
// frontend/components/CustomWidget.tsx
import { Agent, Task } from '@/lib/api-client';

interface CustomWidgetProps {
  agents: Agent[];
  tasks: Task[];
  onRefresh: () => void;
}

export function CustomWidget({ agents, tasks, onRefresh }: CustomWidgetProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Custom Widget
      </h2>
      
      {/* Your content here */}
      <p className="text-gray-400">
        Active agents: {agents.filter(a => a.state === 'available').length}
      </p>
      
      <button
        onClick={onRefresh}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
```

### Adding to Dashboard

**1. Create your widget:**

```bash
# Create component file
touch frontend/components/MyWidget.tsx
```

**2. Import and use in dashboard:**

```typescript
// frontend/app/page.tsx
import { MyWidget } from '@/components/MyWidget';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Existing widgets */}
      <AgentStatusGrid agents={agents} />
      
      {/* Your custom widget */}
      <MyWidget 
        agents={agents} 
        tasks={tasks} 
        onRefresh={loadData}
      />
    </div>
  );
}
```

### Widget Examples

**Status Badge Widget:**

```typescript
export function StatusBadge({ agent }: { agent: Agent }) {
  const color = agent.state === 'available' ? 'green' : 'red';
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-${color}-900`}>
      <div className={`w-2 h-2 rounded-full bg-${color}-500 mr-2`} />
      <span className="text-sm text-white">{agent.state}</span>
    </div>
  );
}
```

**Task Counter Widget:**

```typescript
export function TaskCounter({ tasks }: { tasks: Task[] }) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Total</p>
        <p className="text-3xl font-bold text-white">{stats.total}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Completed</p>
        <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">In Progress</p>
        <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
      </div>
    </div>
  );
}
```

## Custom Themes

### Tailwind Configuration

Edit `frontend/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom colors
        'brand': {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

### Dark Mode Toggle

```typescript
// frontend/components/ThemeToggle.tsx
import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}
```

### CSS Variables

```css
/* frontend/app/globals.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --background: #030718;
  --surface: #1a1a1a;
  --text: #ffffff;
}

body {
  background: var(--background);
  color: var(--text);
}
```

## Integrations

### Slack Integration

```typescript
// frontend/lib/integrations/slack.ts
export async function sendSlackNotification(message: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}
```

### Discord Integration

```typescript
// frontend/lib/integrations/discord.ts
export async function sendDiscordAlert(agent: string, status: string) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `Agent Status Update`,
        description: `${agent} is now ${status}`,
        color: status === 'available' ? 0x00ff00 : 0xff0000,
      }],
    }),
  });
}
```

### Custom API Integration

```typescript
// frontend/lib/api/custom.ts
export async function fetchCustomData(endpoint: string) {
  const response = await fetch(`/api/custom/${endpoint}`);
  return response.json();
}
```

## Advanced Customization

### Custom Layouts

Create custom page layouts:

```typescript
// frontend/app/custom/page.tsx
export default function CustomLayout() {
  return (
    <div className="flex h-screen">
      {/* Custom sidebar */}
      <aside className="w-64 bg-gray-900">
        {/* Custom navigation */}
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Your custom dashboard */}
      </main>
    </div>
  );
}
```

### Custom Routes

Add new pages in `frontend/app/`:

```
frontend/app/
├── page.tsx           # Dashboard (/
├── tasks/page.tsx     # Tasks (/tasks)
├── agents/page.tsx    # Agents (/agents)
└── custom/page.tsx    # Custom (/custom)
```

### Widget API

Extend the widget API:

```typescript
// frontend/lib/widget-api.ts
export interface WidgetConfig {
  id: string;
  type: 'chart' | 'counter' | 'list' | 'custom';
  refreshInterval?: number;
  dataSource?: string;
}

export function registerWidget(config: WidgetConfig) {
  // Register custom widget
}
```

## Examples

See the `/examples` folder for:

- **Custom Charts** — Data visualizations
- **Agent Timelines** — Activity history
- **Metric Widgets** — KPI tracking
- **Integration Examples** — Slack, Discord, webhooks

## Contributing Widgets

Built a cool widget? Share it!

1. Create widget in `/examples/widgets/your-widget/`
2. Add documentation
3. Submit PR with `[Widget]` prefix

## Next Steps

- [API Reference](./API.md) — Backend API documentation
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute
- [Examples](../examples/) — Sample widgets and integrations
