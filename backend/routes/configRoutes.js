const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { updateSettings, getSettings, getSettingsUser } = require('../controllers/configController');

router.post('/updateConfig', authenticateToken, updateSettings);
router.get('/getConfig', authenticateToken, getSettings);

router.get('/settings-user', authenticateToken, getSettingsUser);

module.exports = router;
