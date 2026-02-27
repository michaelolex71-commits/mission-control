const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/mission-control.db');
const db = new Database(DB_PATH);

// GET /api/v1/calendar/events - List all events
router.get('/events', (req, res) => {
  try {
    const { category, from, to, limit = 100 } = req.query;
    
    let sql = 'SELECT * FROM calendar_events';
    const conditions = [];
    const params = [];
    
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (from) {
      conditions.push('datetime >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('datetime <= ?');
      params.push(to);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY datetime ASC LIMIT ?';
    params.push(parseInt(limit));
    
    const events = db.prepare(sql).all(...params);
    
    // Parse JSON fields
    const parsedEvents = events.map(event => ({
      ...event,
      recurring: event.recurring === 1,
      all_day: event.all_day === 1,
      reminders: JSON.parse(event.reminders || '[]')
    }));
    
    res.json({
      success: true,
      count: parsedEvents.length,
      events: parsedEvents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/calendar/events/:id - Get single event
router.get('/events/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    res.json({
      success: true,
      event: {
        ...event,
        recurring: event.recurring === 1,
        all_day: event.all_day === 1,
        reminders: JSON.parse(event.reminders || '[]')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/calendar/events - Create new event
router.post('/events', (req, res) => {
  try {
    const { id, title, datetime, duration, recurring, recurring_id, source, category, reminders, notes, all_day } = req.body;
    
    if (!id || !title || !datetime) {
      return res.status(400).json({ success: false, error: 'Missing required fields: id, title, datetime' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO calendar_events 
      (id, title, datetime, duration, recurring, recurring_id, source, category, reminders, notes, all_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      title,
      datetime,
      duration || 60,
      recurring ? 1 : 0,
      recurring_id || null,
      source || 'api',
      category || 'personal',
      JSON.stringify(reminders || []),
      notes || null,
      all_day ? 1 : 0
    );
    
    res.status(201).json({
      success: true,
      event: { id, title, datetime, duration, recurring, recurring_id, source, category, reminders, notes, all_day }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/calendar/events/:id - Update event
router.put('/events/:id', (req, res) => {
  try {
    const { title, datetime, duration, recurring, recurring_id, source, category, reminders, notes, all_day } = req.body;
    
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (datetime !== undefined) { updates.push('datetime = ?'); params.push(datetime); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
    if (recurring !== undefined) { updates.push('recurring = ?'); params.push(recurring ? 1 : 0); }
    if (recurring_id !== undefined) { updates.push('recurring_id = ?'); params.push(recurring_id); }
    if (source !== undefined) { updates.push('source = ?'); params.push(source); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (reminders !== undefined) { updates.push('reminders = ?'); params.push(JSON.stringify(reminders)); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (all_day !== undefined) { updates.push('all_day = ?'); params.push(all_day ? 1 : 0); }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    
    const stmt = db.prepare(`UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    res.json({ success: true, updated: result.changes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/calendar/events/:id - Delete event
router.delete('/events/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM calendar_events WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/calendar/recurring - List recurring templates
router.get('/recurring', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM recurring_templates ORDER BY created_at DESC').all();
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      reminders: JSON.parse(template.reminders || '[]')
    }));
    
    res.json({
      success: true,
      count: parsedTemplates.length,
      templates: parsedTemplates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/calendar/upcoming - Get upcoming events
router.get('/upcoming', (req, res) => {
  try {
    const { days = 7, limit = 20 } = req.query;
    const now = new Date().toISOString();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    
    const events = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE datetime >= ? AND datetime <= ?
      ORDER BY datetime ASC
      LIMIT ?
    `).all(now, endDate, parseInt(limit));
    
    const parsedEvents = events.map(event => ({
      ...event,
      recurring: event.recurring === 1,
      all_day: event.all_day === 1,
      reminders: JSON.parse(event.reminders || '[]')
    }));
    
    res.json({
      success: true,
      count: parsedEvents.length,
      events: parsedEvents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
