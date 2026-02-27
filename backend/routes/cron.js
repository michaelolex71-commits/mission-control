const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// GET /api/v1/cron/jobs - List all cron jobs
router.get('/jobs', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise('openclaw cron list --json');
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    const jobs = JSON.parse(stdout);
    
    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Ensure openclaw CLI is available and gateway is running'
    });
  }
});

// GET /api/v1/cron/jobs/:id - Get single cron job
router.get('/jobs/:id', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise('openclaw cron list --json');
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    const jobs = JSON.parse(stdout);
    const job = jobs.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Cron job not found' });
    }
    
    res.json({
      success: true,
      job: job
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Ensure openclaw CLI is available and gateway is running'
    });
  }
});

// GET /api/v1/cron/jobs/:id/runs - Get job run history
router.get('/jobs/:id/runs', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { stdout, stderr } = await execPromise(`openclaw cron runs ${req.params.id} --limit ${limit} --json`);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    const runs = JSON.parse(stdout);
    
    res.json({
      success: true,
      count: runs.length,
      runs: runs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Ensure openclaw CLI is available and gateway is running'
    });
  }
});

// POST /api/v1/cron/jobs/:id/run - Trigger cron job manually
router.post('/jobs/:id/run', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise(`openclaw cron run ${req.params.id}`);
    
    res.json({
      success: true,
      message: `Cron job ${req.params.id} triggered`,
      output: stdout
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Ensure openclaw CLI is available and gateway is running'
    });
  }
});

// GET /api/v1/cron/status - Get cron scheduler status
router.get('/status', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise('openclaw cron status --json');
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    const status = JSON.parse(stdout);
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Ensure openclaw CLI is available and gateway is running'
    });
  }
});

module.exports = router;
