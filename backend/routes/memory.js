const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'mission-control.db');
const db = new Database(DB_PATH);

// GET /api/v1/memory/search - FTS5 search
router.get('/search', (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" required' });
    }
    
    // FTS5 search with ranking
    const stmt = db.prepare(`
      SELECT 
        mem.id,
        mem.path,
        mem.title,
        mem.content,
        mem.category,
        mem.created_at,
        search.rank
      FROM memory_fts search
      JOIN memory mem ON search.rowid = mem.id
      WHERE memory_fts MATCH ?
      ORDER BY search.rank
      LIMIT ? OFFSET ?
    `);
    
    const results = stmt.all(q, limit, offset);
    
    res.json({ 
      query: q,
      count: results.length,
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/memory/:id - Get single memory entry
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM memory WHERE id = ?');
    const memory = stmt.get(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/memory/ingest - Ingest markdown file
router.post('/ingest', (req, res) => {
  try {
    const { path: filePath } = req.body;
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Valid path required' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.md');
    const category = path.basename(path.dirname(filePath));
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO memory (path, title, content, category)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(filePath, title, content, category);
    
    res.status(201).json({ 
      message: 'Memory ingested',
      id: result.lastInsertRowid,
      path: filePath,
      title
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/memory/reindex - Reindex all memory files
router.post('/reindex', (req, res) => {
  try {
    const { directory } = req.body;
    const memDir = directory || path.join(__dirname, '..', '..', 'memory');
    
    if (!fs.existsSync(memDir)) {
      return res.status(400).json({ error: 'Directory not found' });
    }
    
    const files = fs.readdirSync(memDir).filter(f => f.endsWith('.md'));
    let count = 0;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO memory (path, title, content, category)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const file of files) {
      const filePath = path.join(memDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const title = path.basename(file, '.md');
      
      stmt.run(filePath, title, content, 'daily-log');
      count++;
    }
    
    res.json({ 
      message: 'Reindex complete',
      files_processed: count,
      directory: memDir
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/memory - List all memory entries
router.get('/', (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    let query = 'SELECT id, path, title, category, created_at FROM memory';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const stmt = db.prepare(query);
    const memories = stmt.all(...params);
    
    res.json({ memories, count: memories.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
