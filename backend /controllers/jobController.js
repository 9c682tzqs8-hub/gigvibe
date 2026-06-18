// /controllers/jobController.js
const db = require('../config/db');

/**
 * Create a new job posting
 * POST /api/jobs
 */
exports.createJob = async (req, res) => {
  const { title, description, budget } = req.body;
  const clientId = req.user.id;

  if (!title || !description || !budget) {
    return res.status(400).json({ message: 'Title, description, and budget are required.' });
  }

  if (isNaN(budget) || parseFloat(budget) <= 0) {
    return res.status(400).json({ message: 'Budget must be a positive number.' });
  }

  try {
    const queryText = `
      INSERT INTO jobs (client_id, title, description, budget)
      VALUES ($1, $2, $3, $4)
      RETURNING id, client_id, title, description, budget, status, created_at;
    `;
    const result = await db.query(queryText, [clientId, title.trim(), description.trim(), budget]);
    
    return res.status(201).json({
      message: 'Job posting created successfully.',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    return res.status(500).json({ message: 'Internal server error creating job posting.' });
  }
};

/**
 * Get all jobs (with optional status filtering)
 * GET /api/jobs
 */
exports.getAllJobs = async (req, res) => {
  const { status } = req.query;

  try {
    let queryText = `
      SELECT j.*, u.first_name, u.last_name 
      FROM jobs j
      JOIN users u ON j.client_id = u.id
    `;
    const params = [];

    if (status) {
      queryText += ' WHERE j.status = $1';
      params.push(status);
    }

    queryText += ' ORDER BY j.created_at DESC;';
    
    const result = await db.query(queryText, params);
    return res.status(200).json({ jobs: result.rows });
  } catch (error) {
    console.error('Get All Jobs Error:', error);
    return res.status(500).json({ message: 'Internal server error fetching jobs.' });
  }
};

/**
 * Get a specific job by ID along with its applications
 * GET /api/jobs/:id
 */
exports.getJobById = async (req, res) => {
  const jobId = req.params.id;

  try {
    const jobQuery = `
      SELECT j.*, u.first_name, u.last_name 
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.id = $1;
    `;
    const jobResult = await db.query(jobQuery, [jobId]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    const job = jobResult.rows[0];

    // If the requesting user is the client who owns the job, let them see the bids
    let applications = [];
    if (req.user.id === job.client_id) {
      const appQuery = `
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM applications a
        JOIN users u ON a.freelancer_id = u.id
        WHERE a.job_id = $1
        ORDER BY a.created_at DESC;
      `;
      const appResult = await db.query(appQuery, [jobId]);
      applications = appResult.rows;
    }

    return res.status(200).json({ job, applications });
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    return res.status(500).json({ message: 'Internal server error fetching job details.' });
  }
};

/**
 * Update a job posting
 * PUT /api/jobs/:id
 */
exports.updateJob = async (req, res) => {
  const jobId = req.params.id;
  const clientId = req.user.id;
  const { title, description, budget, status } = req.body;

  try {
    // Check ownership
    const checkQuery = 'SELECT client_id FROM jobs WHERE id = $1;';
    const checkResult = await db.query(checkQuery, [jobId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    if (checkResult.rows[0].client_id !== clientId) {
      return res.status(403).json({ message: 'Not authorized to modify this job posting.' });
    }

    const updateQuery = `
      UPDATE jobs
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          budget = COALESCE($3, budget),
          status = COALESCE($4, status)
      WHERE id = $5
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [title, description, budget, status, jobId]);

    return res.status(200).json({
      message: 'Job updated successfully.',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Update Job Error:', error);
    return res.status(500).json({ message: 'Internal server error updating job.' });
  }
};

/**
 * Delete a job posting
 * DELETE /api/jobs/:id
 */
exports.deleteJob = async (req, res) => {
  const jobId = req.params.id;
  const clientId = req.user.id;

  try {
    const checkQuery = 'SELECT client_id FROM jobs WHERE id = $1;';
    const checkResult = await db.query(checkQuery, [jobId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    if (checkResult.rows[0].client_id !== clientId) {
      return res.status(403).json({ message: 'Not authorized to delete this job posting.' });
    }

    await db.query('DELETE FROM jobs WHERE id = $1;', [jobId]);
    return res.status(200).json({ message: 'Job posting deleted successfully.' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    return res.status(500).json({ message: 'Internal server error deleting job.' });
  }
};