// /controllers/applicationController.js
const db = require('../config/db');

/**
 * Submit a bid on a job
 * POST /api/applications
 */
exports.submitBid = async (req, res) => {
  const { jobId, bidAmount, coverLetter } = req.body;
  const freelancerId = req.user.id;

  if (!jobId || !bidAmount || !coverLetter) {
    return res.status(400).json({ message: 'Job ID, bid amount, and cover letter are required.' });
  }

  if (isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
    return res.status(400).json({ message: 'Bid amount must be a positive number.' });
  }

  try {
    // 1. Verify target job exists and is open
    const jobCheck = await db.query('SELECT status FROM jobs WHERE id = $1;', [jobId]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Target job posting does not exist.' });
    }
    if (jobCheck.rows[0].status !== 'open') {
      return res.status(400).json({ message: 'Applications are closed for this job posting.' });
    }

    // 2. Check for an existing application to respect unique database constraints
    const duplicateCheck = await db.query(
      'SELECT id FROM applications WHERE job_id = $1 AND freelancer_id = $2;',
      [jobId, freelancerId]
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: 'You have already submitted a bid for this job.' });
    }

    // 3. Insert new application
    const insertQuery = `
      INSERT INTO applications (job_id, freelancer_id, bid_amount, cover_letter)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [jobId, freelancerId, bidAmount, coverLetter.trim()]);

    return res.status(201).json({
      message: 'Bid submitted successfully.',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Submit Bid Error:', error);
    return res.status(500).json({ message: 'Internal server error processing your bid.' });
  }
};

/**
 * Update the status of a bid (Accept / Reject)
 * PATCH /api/applications/:id/status
 */
exports.updateBidStatus = async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body; // 'accepted' or 'rejected'
  const clientId = req.user.id;

  if (!status || (status !== 'accepted' && status !== 'rejected')) {
    return res.status(400).json({ message: 'Valid status (accepted or rejected) is required.' });
  }

  try {
    // Verify the requesting client owns the job tied to this application
    const ownershipQuery = `
      SELECT a.id, j.client_id, j.id AS job_id 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1;
    `;
    const ownershipResult = await db.query(ownershipQuery, [applicationId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    if (ownershipResult.rows[0].client_id !== clientId) {
      return res.status(403).json({ message: 'Not authorized to manage applications for this job.' });
    }

    const jobId = ownershipResult.rows[0].job_id;

    // Use a transaction if accepting a bid to close the job listing automatically
    if (status === 'accepted') {
      await db.query('BEGIN');
      
      // Update targeted application status
      await db.query('UPDATE applications SET status = $1 WHERE id = $2;', ['accepted', applicationId]);
      
      // Automatically reject all other outstanding bids on this job listing
      await db.query('UPDATE applications SET status = $1 WHERE job_id = $2 AND id != $3;', ['rejected', jobId, applicationId]);
      
      // Advance job lifecycle state to in_progress
      await db.query("UPDATE jobs SET status = 'in_progress' WHERE id = $1;", [jobId]);
      
      await db.query('COMMIT');
    } else {
      // Just reject the individual bid
      await db.query('UPDATE applications SET status = $1 WHERE id = $2;', ['rejected', applicationId]);
    }

    return res.status(200).json({ message: `Application has been successfully ${status}.` });
  } catch (error) {
    if (status === 'accepted') await db.query('ROLLBACK');
    console.error('Update Bid Status Error:', error);
    return res.status(500).json({ message: 'Internal server error updating application status.' });
  }
};