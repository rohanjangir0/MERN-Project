// Backend/src/routes/adminLeaveRoutes.js
const express = require('express');
const router = express.Router();
const leaveCtrl = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin'); // make sure this exists

// GET all leaves (Admin only)
router.get('/', auth, isAdmin, leaveCtrl.getAllLeaves);

// PATCH leave status (approve/reject) (Admin only)
router.patch('/:id', auth, isAdmin, leaveCtrl.updateStatus);

module.exports = router;
