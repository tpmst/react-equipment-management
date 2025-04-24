// Import required modules
const fs = require('fs'); // File system module for interacting with files and directories
const path = require('path'); // Path module to handle and manipulate file paths
const multer = require('multer'); // Multer library for handling file uploads
const { logError, logAction, logDetection } = require('../functions/logFunction');
// Setup for File Uploads

/**
 * Configures multer for storing uploaded files in the "uploads" directory.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the upload path
        const uploadPath = path.join(__dirname, '../files/uploads');
        
        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure all parent directories are created
        }

        cb(null, uploadPath); // Pass the destination path to multer
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name for storage
    },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

/**
 * Handles file uploads.
 * @param {Object} req - Express request object containing the uploaded file.
 * @param {Object} res - Express response object for sending responses.
 */
function uploadFile(req, res) {
    // Construct the full file path where the uploaded file is stored
    const filePath = path.join(__dirname, '../files/uploads', req.file.filename);
    logAction(req, "uploadFile", req.file.filename)

    // Respond with a success message and file path
    res.json({ message: 'File uploaded successfully', filePath });
}

// List Files in a Directory

/**
 * Lists files in a specified folder inside the "../files" directory.
 * @param {Object} req - Express request object containing folder name as a parameter.
 * @param {Object} res - Express response object for sending file list.
 */
function listFiles(req, res) {
    const folderName = req.params.folder;

    // Sanitize the folder name to prevent directory traversal attacks
    if (!folderName || folderName.includes('..')) {
        return res.status(400).json({ message: 'Invalid folder name' });
    }

    // Define the directory path based on the provided folder name
    const directoryPath = path.join(__dirname, '../files', folderName);

    // Read the contents of the specified directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory', error: err.message });
        }

        // Filter out directories and only return files
        const fileList = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile());

        res.json({ files: fileList });
    });
}

// File Download Handlers

/**
 * Handles file downloads from the "pdf" directory.
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadFile(req, res) {
    // Construct the full file path for the requested file
    const filePath = path.join(__dirname, '../files/pdf', req.params.filename);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        logAction(req, "downloadFile", req.params.filename)
        res.download(filePath); // Send the file for download
    } else {
        logError(req, "downloadFile", error)
        res.status(404).json({ message: 'File not found' }); // Return 404 if file is missing
    }
}

/**
 * Handles file downloads from the "uploads" directory.
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadFileSigned(req, res) {
    // Construct the full file path for the requested file
    const filePath = path.join(__dirname, '../files/uploads', req.params.filename);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        logAction(req, "downloadFileSigned", req.params.filename)
        res.download(filePath); // Send the file for download
    } else {
        logError(req, "downloadFileSigned", error)
        res.status(404).json({ message: 'File not found' }); // Return 404 if file is missing
    }
}

// Export functions for use in Express routes
module.exports = {
    downloadFile,
    listFiles,
    uploadFile,
    downloadFileSigned,
    upload,
};
