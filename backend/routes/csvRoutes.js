const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { updateCsv, downloadCsv, updateCsvKlein, downloadCsvLogs, addLineToCSV, downloadCsvUser, softDeleteCsvLine} = require('../controllers/csvController');
const { searchAndDeleteCsvRow, searchCsvRow } = require('../controllers/csvDeleteController')

router.post('/update-csv/:filename', authenticateToken, updateCsv);
router.post('/update-csv-klein/:filename', authenticateToken, updateCsvKlein);
router.get('/download-csv/:filename', authenticateToken, downloadCsv);

router.delete('/delete-csv-row/:csvname/:searchText', authenticateToken, searchAndDeleteCsvRow)
router.get('/search-csv/:csvname/:searchText', authenticateToken, searchCsvRow)
router.get('/get-log/:filename', authenticateToken, downloadCsvLogs);

router.post('/addLine-csv/:filename', authenticateToken, addLineToCSV);
router.get('/download-csv-user/:filename', authenticateToken, downloadCsvUser);
router.delete('/deleteLine-csv/:filename/:id/:action', authenticateToken, softDeleteCsvLine)

module.exports = router;
