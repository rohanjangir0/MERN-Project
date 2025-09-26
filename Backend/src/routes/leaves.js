const express = require('express');
const router = express.Router();
const leaveCtrl = require('../controllers/leaveController');
const auth = require('../middleware/auth');

router.post('/', auth, leaveCtrl.createLeave);     // Employee creates leave
router.get('/', auth, leaveCtrl.getMyLeaves);      // Employee gets own leaves
router.delete('/:id', auth, leaveCtrl.deleteLeave); // Employee deletes pending leave

module.exports = router;
