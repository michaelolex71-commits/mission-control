const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const TASK_QUEUE_PATH = path.join(__dirname, '..', '..', '..', 'workspace-shared', 'TASK-QUEUE.md');

// GET /api/v1/sync/tasks - Read TASK-QUEUE.md
router.get('/tasks', (req, res) => {
  try {
    if (!fs.existsSync(TASK_QUEUE_PATH)) {
      return res.status(404).json({ error: 'TASK-QUEUE.md not found' });
    }
    
    const content = fs.readFileSync(TASK_QUEUE_PATH, 'utf8');
    
    // Parse tasks from markdown table
    const tasks = [];
    const lines = content.split('\n');
    let inTable = false;
    
    for (const line of lines) {
      if (line.startsWith('| ID |')) {
        inTable = true;
        continue;
      }
      
      if (inTable && line.startsWith('| T')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 5) {
          tasks.push({
            id: parts[0],
            title: parts[1],
            assignee: parts[2],
            status: parts[3],
            notes: parts[4] || ''
          });
        }
      }
      
      if (inTable && !line.startsWith('|')) {
        inTable = false;
      }
    }
    
    res.json({ 
      file: TASK_QUEUE_PATH,
      tasks,
      count: tasks.length,
      last_modified: fs.statSync(TASK_QUEUE_PATH).mtime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/sync/tasks/update - Update task status
router.post('/tasks/update', (req, res) => {
  try {
    const { id, status, notes } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Task ID required' });
    }
    
    if (!fs.existsSync(TASK_QUEUE_PATH)) {
      return res.status(404).json({ error: 'TASK-QUEUE.md not found' });
    }
    
    let content = fs.readFileSync(TASK_QUEUE_PATH, 'utf8');
    
    // Update task status in markdown table
    const lines = content.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`| ${id} |`)) {
        const parts = lines[i].split('|');
        
        if (status) {
          parts[4] = ` ${status} `; // Status column
        }
        
        if (notes) {
          parts[6] = ` ${notes} `; // Notes column
        }
        
        lines[i] = parts.join('|');
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    
    fs.writeFileSync(TASK_QUEUE_PATH, lines.join('\n'));
    
    res.json({ 
      message: 'Task updated',
      id,
      status,
      notes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/sync/agents - Read all agent cards
router.get('/agents', (req, res) => {
  try {
    const AGENTS_DIR = path.join(__dirname, '..', '..', '..', 'workspace-shared', 'agents');
    
    if (!fs.existsSync(AGENTS_DIR)) {
      return res.status(404).json({ error: 'Agents directory not found' });
    }
    
    const agents = [];
    const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(AGENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse agent card
      const name = file.replace('.md', '');
      const stateMatch = content.match(/\*\*State:\*\*\s*(\w+)/);
      const taskMatch = content.match(/\*\*Current Task:\*\*\s*(.+)/);
      
      agents.push({
        name,
        state: stateMatch ? stateMatch[1] : 'unknown',
        current_task: taskMatch ? taskMatch[1].trim() : null,
        card_path: filePath,
        last_modified: fs.statSync(filePath).mtime
      });
    }
    
    res.json({ 
      agents,
      count: agents.length,
      directory: AGENTS_DIR
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/sync/agents/:name - Read single agent card
router.get('/agents/:name', (req, res) => {
  try {
    const AGENTS_DIR = path.join(__dirname, '..', '..', '..', 'workspace-shared', 'agents');
    const filePath = path.join(AGENTS_DIR, `${req.params.name}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.json({
      name: req.params.name,
      card: content,
      card_path: filePath,
      last_modified: fs.statSync(filePath).mtime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
