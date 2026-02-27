const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', '..', '..', 'workspace-shared', 'agents');

// GET /api/v1/agents - List all agents
router.get('/', (req, res) => {
  try {
    const agents = [];
    
    if (fs.existsSync(AGENTS_DIR)) {
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
          card_path: filePath
        });
      }
    }
    
    res.json({ agents, count: agents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agents/:name - Get single agent
router.get('/:name', (req, res) => {
  try {
    const filePath = path.join(AGENTS_DIR, `${req.params.name}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.json({
      name: req.params.name,
      card: content,
      card_path: filePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/agents/:name - Update agent status
router.patch('/:name', (req, res) => {
  try {
    const { state, current_task } = req.body;
    const filePath = path.join(AGENTS_DIR, `${req.params.name}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (state) {
      content = content.replace(/\*\*State:\*\*\s*\w+/, `**State:** ${state}`);
    }
    
    if (current_task !== undefined) {
      if (content.includes('**Current Task:**')) {
        content = content.replace(/\*\*Current Task:\*\*\s*.+/, `**Current Task:** ${current_task || 'none'}`);
      }
    }
    
    fs.writeFileSync(filePath, content);
    
    res.json({ 
      message: 'Agent updated',
      name: req.params.name,
      state,
      current_task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
