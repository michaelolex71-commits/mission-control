# API Reference

Complete backend API documentation for Mission Control.

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

Currently no authentication required. Add your own auth middleware as needed.

## Response Format

All responses follow this format:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
```

---

## Endpoints

### Tasks

#### GET /tasks

List all tasks with optional filters.

**Query Parameters:**
- `status` — Filter by status (NEW, ASSIGNED, IN_PROGRESS, BLOCKED, COMPLETED)
- `priority` — Filter by priority (HIGH, MEDIUM, LOW)
- `assignee` — Filter by assignee
- `category` — Filter by category

**Example:**
```bash
curl http://localhost:3001/api/v1/tasks?status=IN_PROGRESS&priority=HIGH
```

**Response:**
```json
{
  "data": {
    "tasks": [
      {
        "id": "T001",
        "title": "Build dashboard",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "assignee": "olex",
        "created_at": "2026-02-27T10:00:00Z",
        "updated_at": "2026-02-27T15:30:00Z"
      }
    ],
    "total": 1
  },
  "status": 200
}
```

#### GET /tasks/:id

Get single task by ID.

**Example:**
```bash
curl http://localhost:3001/api/v1/tasks/T001
```

#### POST /tasks

Create new task.

**Body:**
```json
{
  "title": "New task",
  "description": "Task description",
  "priority": "HIGH",
  "assignee": "olex",
  "category": "development"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New task","priority":"HIGH"}'
```

#### PATCH /tasks/:id

Update task.

**Body:**
```json
{
  "status": "COMPLETED",
  "completed_at": "2026-02-27T16:00:00Z"
}
```

#### DELETE /tasks/:id

Delete task.

---

### Memory

#### GET /memory/search

Full-text search across memory entries.

**Query Parameters:**
- `q` — Search query (required)
- `category` — Filter by category
- `limit` — Max results (default: 50)

**Example:**
```bash
curl "http://localhost:3001/api/v1/memory/search?q=michael&limit=10"
```

**Response:**
```json
{
  "data": {
    "results": [
      {
        "id": 1,
        "path": "memory/2026-02-27.md",
        "title": "Daily Log",
        "snippet": "... Michael said ...",
        "category": "daily-log",
        "created_at": "2026-02-27T00:00:00Z"
      }
    ],
    "total": 1
  },
  "status": 200
}
```

#### GET /memory/:id

Get single memory entry.

---

### Agents

#### GET /agents

List all agents with current status.

**Example:**
```bash
curl http://localhost:3001/api/v1/agents
```

**Response:**
```json
{
  "data": {
    "agents": [
      {
        "name": "olex",
        "state": "available",
        "current_task": null,
        "card_path": "/agents/olex.md"
      },
      {
        "name": "sparky",
        "state": "busy",
        "current_task": "T045",
        "card_path": "/agents/sparky.md"
      }
    ]
  },
  "status": 200
}
```

#### GET /agents/:name

Get single agent details.

#### PATCH /agents/:name

Update agent status.

**Body:**
```json
{
  "state": "busy",
  "current_task": "T045"
}
```

---

### System

#### GET /system/status

Get system health status.

**Example:**
```bash
curl http://localhost:3001/api/v1/system/status
```

**Response:**
```json
{
  "data": {
    "timestamp": "2026-02-27T16:00:00Z",
    "tasks": {
      "active": 15,
      "total": 116
    },
    "memory": {
      "entries": 56
    },
    "agents": {
      "available": 2,
      "busy": 1,
      "offline": 0
    }
  },
  "status": 200
}
```

---

### Sync

#### POST /sync/tasks

Sync tasks from external source (e.g., TASK-QUEUE.md).

**Body:**
```json
{
  "source": "task-queue",
  "path": "/path/to/TASK-QUEUE.md"
}
```

#### POST /sync/agents

Sync agents from agent cards.

**Body:**
```json
{
  "source": "agent-cards",
  "directory": "/path/to/agents/"
}
```

---

### Calendar

#### GET /calendar/events

Get calendar events.

**Query Parameters:**
- `start` — Start date (ISO 8601)
- `end` — End date (ISO 8601)

#### POST /calendar/events

Create calendar event.

---

### Cron

#### GET /cron/jobs

List all cron jobs with status.

#### GET /cron/jobs/:id/runs

Get job execution history.

---

## Error Handling

### Error Response Format

```json
{
  "error": "Task not found",
  "status": 404
}
```

### Common Status Codes

- `200` — Success
- `201` — Created
- `400` — Bad Request
- `404` — Not Found
- `500` — Internal Server Error

---

## Rate Limiting

Default: 100 requests per 15 minutes per IP.

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## WebSocket (Coming Soon)

Real-time updates via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

---

## TypeScript Client

Use the included TypeScript client:

```typescript
import { api } from '@/lib/api-client';

// Get tasks
const response = await api.getTasks({ status: 'IN_PROGRESS' });
console.log(response.data.tasks);

// Create task
const newTask = await api.createTask({
  title: 'New task',
  priority: 'HIGH',
});

// Search memory
const results = await api.searchMemory('michael');
```

---

## Next Steps

- [Setup Guide](./SETUP.md) — Installation instructions
- [Customization Guide](./CUSTOMIZATION.md) — Add widgets and themes
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute
