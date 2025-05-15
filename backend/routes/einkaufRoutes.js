const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {downloadFileRechnungen, uploadFileEinkauf, uploadRechnungen, uploadInvest, uploadFileEinkaufInvest, downloadFileInvest, uploadContract, downloadContract, uploadFileContract} = require('../controllers/einkaufController')
router.get('/download-rechnungen/:filename', authenticateToken, downloadFileRechnungen);
router.post('/upload-rechnungen', authenticateToken, uploadRechnungen.single('file'), uploadFileEinkauf);
router.get('/download-invest/:filename', authenticateToken, downloadFileInvest);
router.post('/upload-invest', authenticateToken, uploadInvest.single('file'), uploadFileEinkaufInvest);

router.get('/download-contract/:filename', authenticateToken, downloadContract);
router.post('/upload-contract', authenticateToken, uploadContract.single('file'), uploadFileContract);

module.exports = router;