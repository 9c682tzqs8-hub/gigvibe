// /routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Freelancers apply to jobs
router.post('/', protect, authorize('freelancer'), applicationController.submitBid);

// Clients review and change application states
router.patch('/:id/status', protect, authorize('client'), applicationController.updateBidStatus);

module.exports = router;