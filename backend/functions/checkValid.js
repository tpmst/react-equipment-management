const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const USERS_FILE = path.join(__dirname, "../middleware/logins/logindata.json");

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
        return "unknown"; // Default if no username found
    } catch (error) {
        console.warn("⚠️ Failed to extract username:", error.message);
        return "unknown";
    }
}

function getPassword(req) {
  try {
      // 1️⃣ Check JWT Token (Bearer Authorization)
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return sanitize(decoded.password || "unknown"); // Adjust field if needed
      }
      return "unknown"; // Default if no password found
  } catch (error) {
      console.warn("⚠️ Failed to extract password:", error.message);
      return "unknown";
  }
}

// Helper function to read users from JSON file
const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

async function checkValid(req) {
  const username = getUsername(req); // Extract username using getUsername
  const password = getPassword(req); // Extract password using getPassword

  if (!username || !password) {
    return false; // If either is missing, return false (invalid)
  }

  const allusers = getUsers(); // Retrieve all users from the JSON file
  const user = allusers.find((u) => u.username === username); // Find the user by username

  if (user && bcrypt.compareSync(password, user.password) && user.group === "admin") {
    // Check if the user exists, the password matches (hashed), and the group is "admin"
    return true;
  }

  return false; // Otherwise, return false (not valid or not an admin)
};

module.exports = {checkValid};