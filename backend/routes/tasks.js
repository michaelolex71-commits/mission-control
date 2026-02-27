const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'mission-control.db');
const db = new Database(DB_PATH);

// GET /api/v1/tasks - List all tasks with filters
router.get('/', (req, res) => {
  try {
    const { status, priority, assignee, category } = req.query;
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (assignee) {
      query += ' AND assignee = ?';
      params.push(assignee);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const tasks = db.prepare(query).all(...params);
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/tasks/:id - Get single task
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/tasks - Create task
router.post('/', (req, res) => {
  try {
    const { id, title, description, priority, assignee, category, due_date } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, priority, assignee, category, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, title, description, priority || 'MEDIUM', assignee, category, due_date);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    // Broadcast task creation via WebSocket
    const ws = req.app.get('ws');
    if (ws) {
      ws.broadcastTaskEvent('created', task);
    }
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/tasks/:id - Update task
router.patch('/:id', (req, res) => {
  try {
    const { title, description, status, priority, assignee, category, due_date } = req.body;
    const id = req.params.id;
    
    // Get old task to detect status changes
    const oldTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    const updates = [];
    const params = [];
    
    if (title) { updates.push('title = ?'); params.push(title); }
    if (description) { updates.push('description = ?'); params.push(description); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (priority) { updates.push('priority = ?'); params.push(priority); }
    if (assignee) { updates.push('assignee = ?'); params.push(assignee); }
    if (category) { updates.push('category = ?'); params.push(category); }
    if (due_date) { updates.push('due_date = ?'); params.push(due_date); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    // Broadcast task update via WebSocket
    const ws = req.app.get('ws');
    if (ws) {
      const eventType = oldTask && oldTask.status !== task.status ? 'status_changed' : 'updated';
      ws.broadcastTaskEvent(eventType, task);
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/tasks/:id - Archive task (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const oldTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
    stmt.run('ARCHIVED', req.params.id);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    // Broadcast task deletion via WebSocket
    const ws = req.app.get('ws');
    if (ws) {
      ws.broadcastTaskEvent('deleted', task);
    }
    
    res.json({ message: 'Task archived', id: req.params.id, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/tasks/:id/relationships - Get dependencies
router.get('/:id/relationships', (req, res) => {
  try {
    const dependencies = db.prepare(`
      SELECT * FROM task_dependencies 
      WHERE task_id = ? OR depends_on = ?
    `).all(req.params.id, req.params.id);
    
    res.json({ dependencies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/tasks/:id/links - Link file/agent/decision to task
router.post('/:id/links', (req, res) => {
  try {
    const { link_type, link_url, link_text } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO task_links (task_id, link_type, link_url, link_text)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(req.params.id, link_type, link_url, link_text);
    
    res.status(201).json({ 
      message: 'Link created', 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
