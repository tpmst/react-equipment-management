// Import required modules
const fs = require('fs');
const path = require('path');
const { file } = require('pdfkit');
const { logError, logAction, logDetection } = require('../functions/logFunction');
// List Files in a Directory
/**
 * Lists files in a specified folder inside the "../files" directory.
 */
function listFilesAll(req, res) {
    
    const { filename, foldername } = req.params;

    // Security check to prevent directory traversal
    if (!filename || !foldername || 
        foldername.includes("..") || foldername.includes("/") || foldername.includes("\\") || 
        !/^(pdf|uploads|investantrag|rechnungen)$/.test(foldername) || 
        filename.includes("..") || filename.includes("/") || filename.includes("\\")
    ) {
        console.warn(`Blocked deletion attempt: Folder: ${foldername}, File: ${filename}`);
        return res.status(400).json({ message: "Invalid file or folder name" });
    }

    const directoryPath = path.join(__dirname, '../files', folderName);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory', error: err.message });
        }

        // Filter out directories, returning only files
        const fileList = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile());

        res.json({ files: fileList });
    });
}

/**
 * Lists all folders inside the "../files" directory, excluding "config", "csv", and "template".
 */
function listAllFolders(req, res) {
    const baseDirectory = path.join(__dirname, "../files");

    fs.readdir(baseDirectory, { withFileTypes: true }, (err, items) => {
        if (err) {
            return res.status(500).json({ message: "Unable to scan directories", error: err.message });
        }

        // Filter only directories and exclude specific ones
        const excludedFolders = new Set(["config", "csv", "templates", "logs"]);
        const folders = items
            .filter(item => item.isDirectory() && !excludedFolders.has(item.name))
            .map(item => item.name);

        res.json({ folders });
    });
}

// File Download Handlers

/**
 * Handles file downloads from the "pdf" directory.
 * @param {Object} req - Express request object containing filename as a parameter.
 * @param {Object} res - Express response object for sending the file.
 */
function downloadFiles(req, res) {

    const { filename, foldername } = req.params;

    // Security check to prevent directory traversal
    if (!filename || !foldername || 
        foldername.includes("..") || foldername.includes("/") || foldername.includes("\\") || 
        !/^(pdf|uploads|investantrag|rechnungen)$/.test(foldername) || 
        filename.includes("..") || filename.includes("/") || filename.includes("\\")
    ) {
        logDetection(req, "downloadFiles", foldername + " | " + filename)
        return res.status(400).json({ message: "Invalid file or folder name" });
    }
    // Construct the full file path for the requested file
    const filePath = path.join(__dirname, '../files/', req.params.foldername , req.params.filename);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        res.download(filePath); // Send the file for download
        logAction(req, "downloadFiles", filePath)
    } else {
        logError(req, "downloadFiles", error)
        res.status(404).json({ message: 'File not found' }); // Return 404 if file is missing
    }
}

// Delete File Handler
/**
 * Deletes a specified file 
 */
async function deleteFiles(req, res) {
    const { filename, foldername } = req.params;

    // Security check to prevent directory traversal
    if (!filename || !foldername || 
        foldername.includes("..") || foldername.includes("/") || foldername.includes("\\") || 
        !/^(pdf|uploads|investantrag|rechnungen)$/.test(foldername) || 
        filename.includes("..") || filename.includes("/") || filename.includes("\\")
    ) {
        logDetection(req, "deleteFiles", foldername + " | " + filename)
        return res.status(400).json({ message: "Invalid file or folder name" });
    }
    
    

    const filePath = path.join(__dirname, "../files", foldername, filename);

    try {
        // Check if file exists before deleting
        await fs.promises.access(filePath, fs.constants.F_OK);

        // Delete the file
        await fs.promises.unlink(filePath);

        // Search and clear the filename in CSV files
        const csvDirectory = path.join(__dirname, "../files/csv");
        const csvFiles = await fs.promises.readdir(csvDirectory);

        for (const csvFile of csvFiles) {
            const csvFilePath = path.join(csvDirectory, csvFile);
            let data = await fs.promises.readFile(csvFilePath, "utf8");
            let rows = data.split("\n");

            let updated = false;
            const updatedRows = rows.map((row) => {
                const columns = row.split(";");

                // Check if any cell contains the filename and clear it
                if (columns.includes(filename)) {
                    updated = true;
                    return columns.map((cell) => (cell === filename ? "" : cell)).join(";");
                }
                return row;
            });

            // If a change was made, write the updated CSV file
            if (updated) {
                await fs.promises.writeFile(csvFilePath, updatedRows.join("\n"), "utf8");
            }
        }

        logAction(req, "deleteFiles", filePath + " | " + updatedRows)

        res.json({ message: "File deleted successfully and CSV references cleared" });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({ message: "File not found" });
        }
        logError(req, "deleteFiles", error)
        res.status(500).json({ message: "Error deleting file", error: error.message });
    }
}



// Export functions for use in Express routes
module.exports = {
    listFilesAll,
    listAllFolders, // New function to list all folders
    deleteFiles,
    downloadFiles,
};
