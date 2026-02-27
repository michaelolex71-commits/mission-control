const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const rateLimit = require('express-rate-limit');
const MissionControlWebSocket = require('./websocket');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database path
const DB_PATH = path.join(__dirname, 'data', 'mission-control.db');

// API versioning
const API_VERSION = 'v1';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use(`/api/${API_VERSION}`, limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    websocket: wsServer ? 'active' : 'inactive'
  });
});

// API routes
const tasksRouter = require('./routes/tasks');
const memoryRouter = require('./routes/memory');
const agentsRouter = require('./routes/agents');
const systemRouter = require('./routes/system');
const calendarRouter = require('./routes/calendar');
const cronRouter = require('./routes/cron');
const syncRouter = require('./routes/sync');

app.use(`/api/${API_VERSION}/tasks`, tasksRouter);
app.use(`/api/${API_VERSION}/memory`, memoryRouter);
app.use(`/api/${API_VERSION}/agents`, agentsRouter);
app.use(`/api/${API_VERSION}/system`, systemRouter);
app.use(`/api/${API_VERSION}/calendar`, calendarRouter);
app.use(`/api/${API_VERSION}/cron`, cronRouter);
app.use(`/api/${API_VERSION}/sync`, syncRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
let wsServer;
try {
  wsServer = new MissionControlWebSocket(server);
  console.log('WebSocket server initialized');
} catch (error) {
  console.error('Failed to initialize WebSocket server:', error);
}

// Make WebSocket server available to routes
app.set('ws', wsServer);

// Start server
server.listen(PORT, () => {
  console.log(`Mission Control API running on port ${PORT}`);
  console.log(`API version: ${API_VERSION}`);
  console.log(`Database: ${DB_PATH}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});

module.exports = { app, wsServer };
