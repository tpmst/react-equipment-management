// Import required modules
const fs = require('fs'); // File system module for reading and writing files
const path = require('path'); // Path module for handling file paths
const { logAction, logError } = require('../functions/logFunction');

// Get Configuration Settings

/**
 * Retrieves the current settings from the "config.json" file.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
function getSettings(req, res) {
    // Define the path to the configuration file
    const filePath = path.join(__dirname, '../files/config', 'config.json');
    
    // Check if the file exists before reading
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Config data file not found' });
    }

    try {
        // Read the JSON file and parse it
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data)); // Send parsed JSON data as a response
    } catch (error) {
        logError(req, "getSettings", error)
        res.status(500).json({ message: 'Error reading config file' });
    }
}

// Update Configuration Settings

/**
 * Updates the settings in the "config.json" file by merging new values with existing ones.
 * @param {Object} req - Express request object containing the updated settings in the body.
 * @param {Object} res - Express response object.
 */
function updateSettings(req, res) {
    // Define the path to the configuration file
    const filePath = path.join(__dirname, '../files/config', 'config.json');

    // Check if the file exists before updating
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Config data file not found' });
    }

    try {
        // Read existing config file
        const existingData = fs.readFileSync(filePath, 'utf8');
        const configData = JSON.parse(existingData);

        // Get the updated data from the request body
        const updatedData = req.body;

        // Merge the new data into the existing config
        const newConfig = { ...configData, ...updatedData };

        // Write the updated config back to the file with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2), 'utf8');

        logAction(req, "updateSettings", updatedData)

        res.json({ message: 'Settings updated successfully', newConfig });
    } catch (error) {
        logError(req, "updateSettings", error)
        res.status(500).json({ message: 'Error updating settings' });
    }
}

// Export Functions for Express Routes

module.exports = {
    getSettings,
    updateSettings
};
