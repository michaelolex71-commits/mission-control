const express = require('express');
const router = express.Router();
const os = require('os');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'mission-control.db');
const db = new Database(DB_PATH);

// GET /api/v1/system/health - System health check
router.get('/health', (req, res) => {
  try {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const dbStatus = db.prepare('PRAGMA integrity_check').get();
    
    res.json({
      status: 'ok',
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime)
      },
      memory: {
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss_mb: Math.round(memUsage.rss / 1024 / 1024)
      },
      database: {
        status: dbStatus.integrity_check,
        path: DB_PATH
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        free_mem_gb: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100,
        total_mem_gb: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/system/metrics - Database metrics
router.get('/metrics', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    const metrics = {};
    
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      metrics[table.name] = count.count;
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      tables: metrics,
      total_tables: tables.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/system/status - Quick status overview
router.get('/status', (req, res) => {
  try {
    const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'COMPLETED'").get();
    const memoryCount = db.prepare('SELECT COUNT(*) as count FROM memory').get();
    
    res.json({
      timestamp: new Date().toISOString(),
      tasks: {
        active: taskCount.count
      },
      memory: {
        entries: memoryCount.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  
  return parts.join(' ') || '<1m';
}

module.exports = router;
