// Import required modules
const fs = require('fs'); // File system module for interacting with files and directories
const path = require('path'); // Path module to handle and manipulate file paths
const multer = require('multer'); // Multer library for handling file uploads
const { file } = require('jszip');
const { logError, logAction, logDetection } = require('../functions/logFunction');
// Setup for "Rechnungen" Uploads

/**
 * Configures multer for storing uploaded "Rechnungen" files.
 */
const storageRechnungen = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the upload path
        const uploadPath = path.join(__dirname, '../files/rechnungen');
        
        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
        }

        cb(null, uploadPath); // Pass the destination path to multer
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name for storage
    },
});

// Initialize multer with the defined storage configuration
const uploadRechnungen = multer({ storage: storageRechnungen });

/**
 * Handles file uploads for "Rechnungen" (Invoices).
 * @param {Object} req - Express request object containing the uploaded file.
 * @param {Object} res - Express response object for sending responses.
 */
function uploadFileEinkauf(req, res) {
    // Construct the full file path where the uploaded file is stored
    const filePath = path.join(__dirname, '../files/rechnungen', req.file.filename);
    logAction(req, "uploadRechnung", filePath)

    // Respond with a success message and file path
    res.json({ message: 'File uploaded successfully', filePath });
}

/**
 * Handles file downloads for "Rechnungen".
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadFileRechnungen(req, res) {
    // Construct the full file path for the requested file
    const filePath = path.join(__dirname, '../files/rechnungen', req.params.filename);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        logAction(req, "downloadRechnung", filePath)
        res.download(filePath); // Send the file for download
    } else {
        logError(req, "downloadFileRechnungen", error)
        res.status(404).json({ message: 'File not found' }); // Return 404 if file is missing
    }
}

// Setup for "Investantrag" Uploads

/**
 * Configures multer for storing uploaded "Investantrag" files.
 */
const storageInvest = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the upload path
        const uploadPath = path.join(__dirname, '../files/investantrag');

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
        }

        cb(null, uploadPath); // Pass the destination path to multer
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name for storage
    },
});

// Initialize multer with the defined storage configuration
const uploadInvest = multer({ storage: storageInvest });

/**
 * Handles file uploads for "Investantrag" (Investment Requests).
 * @param {Object} req - Express request object containing the uploaded file.
 * @param {Object} res - Express response object for sending responses.
 */
function uploadFileEinkaufInvest(req, res) {
    // Construct the full file path where the uploaded file is stored
    const filePath = path.join(__dirname, '../files/investantrag', req.file.filename);
    logAction(req, "uploadInvest", filePath)
    // Respond with a success message and file path
    res.json({ message: 'File uploaded successfully', filePath });
}

/**
 * Handles file downloads for "Investantrag".
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadFileInvest(req, res) {
    // Construct the full file path for the requested file
    const filePath = path.join(__dirname, '../files/investantrag', req.params.filename);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        logAction(req, "downloadInvest", filePath)
        res.download(filePath); // Send the file for download
    } else {
        logError(req, "downloadFileInvest", error)
        res.status(404).json({ message: 'File not found' }); // Return 404 if file is missing
    }
}

// Setup for "contracts" Uploads

/**
 * Configures multer for storing uploaded "contracts" files.
 */
const storageContract = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the upload path
        const uploadPath = path.join(__dirname, '../files', req.query.folder);

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
        }

        cb(null, uploadPath); // Pass the destination path to multer
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name for storage
    },
});

// Initialize multer with the defined storage configuration
const uploadContract = multer({ storage: storageContract });

/**
 * Handles file uploads for "contracts" (Investment Requests).
 * @param {Object} req - Express request object containing the uploaded file.
 * @param {Object} res - Express response object for sending responses.
 */
function uploadFileContract(req, res) {
    // Construct the full file path where the uploaded file is stored
    const filePath = path.join(__dirname, '../files', req.query.folder, req.file.filename);
    logAction(req, "uploadContracts", filePath)
    // Respond with a success message and file path
    res.json({ message: 'File uploaded successfully', filePath });
}

/**
 * Handles file downloads for "contracts".
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadContract(req, res) {
    try {
        const folder = decodeURIComponent(req.query.folder);
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(__dirname, '../files', folder, filename);

        if (fs.existsSync(filePath)) {
            logAction(req, "downloadContracts", filePath);
            res.download(filePath, (err) => {
                if (err) {
                    logError(req, "downloadFileContracts", err.message || err);
                    res.status(500).json({ message: 'Error sending file' });
                }
            });
        } else {
            logError(req, "downloadFileContracts", `File not found: ${filePath}`);
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        logError(req, "downloadFileContracts", error.message || error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



// Export functions for use in Express routes
module.exports = {
    downloadFileRechnungen,
    uploadFileEinkauf,
    uploadRechnungen,

    uploadFileEinkaufInvest,
    uploadInvest,
    downloadFileInvest,

    downloadContract,
    uploadContract,
    uploadFileContract,
};
