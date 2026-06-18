// /routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or Shared Routes (Both roles can view listings)
router.get('/', protect, jobController.getAllJobs);
router.get('/:id', protect, jobController.getJobById);

// Restricted Routes (Clients Only)
router.post('/', protect, authorize('client'), jobController.createJob);
router.put('/:id', protect, authorize('client'), jobController.updateJob);
router.delete('/:id', protect, authorize('client'), jobController.deleteJob);

module.exports = router;