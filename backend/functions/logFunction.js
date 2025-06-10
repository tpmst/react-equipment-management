const fs = require("fs");
const path = require("path");
const {getUsername} = require("./getUsername")

/**
 * Cleans input to prevent newlines and ensure safe logging.
 * @param {string|null|undefined} input - The input string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitize(input) {
    if (!input) return ""; // Return an empty string if input is null/undefined
    return String(input).replace(/(\r\n|\n|\r)/gm, "").trim();
}


/**
 * Logs actions to a CSV file.
 * @param {Object} req - Express request object (for extracting username)
 * @param {string} action - The type of action (e.g., "DELETE_FILE", "SEARCH_CSV").
 * @param {string} details - Additional details about the action.
 */
async function logAction(req, action, details) {
    const user = getUsername(req);
    const logFilePath = path.join(__dirname, "../files/logs/actionLogs.csv");

    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    // Prepare log entry
    const timestamp = new Date().toISOString();
    const logEntry = `${sanitize(timestamp)};${user};${sanitize(action)};[${sanitize(details)}]\n`;

    try {
        await fs.promises.appendFile(logFilePath, logEntry, "utf8");
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

async function logAPIAction(req, action, details) {
    const user = getUsername(req);
    const logFilePath = path.join(__dirname, "../files/logs/api-actionLogs.csv");

    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    // Prepare log entry
    const timestamp = new Date().toISOString();
    const logEntry = `${sanitize(timestamp)};${user};${sanitize(action)};[${sanitize(details)}]\n`;

    try {
        await fs.promises.appendFile(logFilePath, logEntry, "utf8");
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

/**
 * Logs security detections.
 */
async function logDetection(req, action, detection) {
    const user = getUsername(req);
    const logFilePath = path.join(__dirname, "../files/logs/detectionLogs.csv");

    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${sanitize(timestamp)};${user};${sanitize(action)};${sanitize(detection)}\n`;

    try {
        await fs.promises.appendFile(logFilePath, logEntry, "utf8");
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

/**
 * Logs system errors.
 */
async function logError(req, action, errorMessage) {
    const user = getUsername(req);
    const logFilePath = path.join(__dirname, "../files/logs/errorLogs.csv");

    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${sanitize(timestamp)};${user};${sanitize(action)};${sanitize(errorMessage)}\n`;

    try {
        await fs.promises.appendFile(logFilePath, logEntry, "utf8");
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

/**
 * Logs user logins.
 */
async function logLogin(user, group) {
    const logFilePath = path.join(__dirname, "../files/logs/loginLogs.csv");

    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${sanitize(timestamp)};${user};${group}\n`;

    try {
        await fs.promises.appendFile(logFilePath, logEntry, "utf8");
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

// Export functions for use in other files
module.exports = { logAction, logDetection, logError, logLogin, logAPIAction };
