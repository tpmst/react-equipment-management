const jwt = require("jsonwebtoken");

/**
 * Cleans input to prevent newlines and ensure safe logging.
 * @param {string|null|undefined} input - The input string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitize(input) {
    if (!input) return ""; // Return an empty string if input is null/undefined
    return String(input).replace(/(\r\n|\n|\r)/gm, "").trim();
}

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
exports.getUsername = getUsername;