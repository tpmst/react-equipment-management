const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken"); // For extracting user info from JWT

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
 * Extracts the username from the request (supports JWT & sessions).
 * @param {Object} req - Express request object
 * @returns {string} - Extracted username or "unknown" if not found
 */
function getUsername(req) {
    try {
        // 1️⃣ Check JWT Token (Bearer Authorization)
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return sanitize(decoded.username || "unknown"); // Adjust field if needed
        }

        // 2️⃣ Check Express Session (if used)
        if (req.session?.user?.username) {
            return sanitize(req.session.user.username);
        }

        // 3️⃣ Check Basic Authentication (rare case)
        const authHeader = req.headers.authorization || "";
        if (authHeader.startsWith("Basic ")) {
            const base64Credentials = authHeader.split(" ")[1];
            const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
            const [username] = credentials.split(":");
            return sanitize(username || "unknown");
        }

        return "unknown"; // Default if no username found
    } catch (error) {
        console.warn("⚠️ Failed to extract username:", error.message);
        return "unknown";
    }
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
module.exports = { logAction, logDetection, logError, logLogin };
