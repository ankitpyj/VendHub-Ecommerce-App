const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const requirementController = require('../controllers/requirementController');

// Protect all routes below this line
router.use(protect);

// Post requirement - only vendors can post requirements
router.post('/post', authorizeRoles('vendor'), requirementController.postRequirement);

// Get all requirements - farmers and vendors can view
router.get('/browse', authorizeRoles('farmer', 'vendor'), requirementController.getAllRequirements);

// Get vendor's own requirements
router.get('/my-requirements', authorizeRoles('vendor'), requirementController.getMyRequirements);

// Respond to requirement - only farmers can respond
router.post('/respond/:requirementId', authorizeRoles('farmer'), requirementController.respondToRequirement);

// Update requirement status - only vendors can update their own requirements
router.put('/status/:requirementId', authorizeRoles('vendor'), requirementController.updateRequirementStatus);

module.exports = router;