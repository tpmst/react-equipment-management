const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = process.env.JWT_SECRET;

// Helper: Path to API token and blacklist files
const apiDir = path.join(__dirname, "API/json");
const apiTokensPath = path.join(apiDir, "api-tokens.json");
const blacklistPath = path.join(apiDir, "blacklist.json");

// Ensure API directory exists
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

/**
 * Generates and returns a static API token for REST API access.
 * Only accessible by admin users (group === 'admin').
 * Stores the token and username in API/api-tokens.json.
 */
function getApiToken(req, res) {
  // Only allow admin users to generate API tokens
  if (!req.user || req.user.group !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  // Read all tokens from file
  let tokens = [];
  if (fs.existsSync(apiTokensPath)) {
    try {
      tokens = JSON.parse(fs.readFileSync(apiTokensPath, "utf8"));
    } catch {
      tokens = [];
    }
  }

  // Try to find an existing token for this user
  let userTokenObj = null;
  for (const tokenObj of tokens) {
    try {
      const decoded = jwt.verify(tokenObj.token, SECRET_KEY);
      if (decoded.username === req.user.username && decoded.api === true) {
        userTokenObj = tokenObj;
        break;
      }
    } catch {
      // ignore invalid/expired tokens
    }
  }

  // If user has a valid token, return it
  if (userTokenObj) {
    return res.json({ apiToken: userTokenObj.token });
  }

  // Otherwise, generate a new token, save it with the username, and return it
  const apiToken = jwt.sign(
    { username: req.user.username, group: req.user.group, api: true },
    SECRET_KEY,
    { expiresIn: "365d" }
  );
  tokens.push({ username: req.user.username, token: apiToken });
  fs.writeFileSync(apiTokensPath, JSON.stringify(tokens, null, 2), "utf8");

  res.json({ apiToken });
}

/**
 * Adds a compromised API token to the blacklist.json file in the API folder.
 * This ensures persistent blacklisting across server restarts.
 */
function addTokenToBlacklist(token) {
  let blacklist = [];
  if (fs.existsSync(blacklistPath)) {
    try {
      blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf8"));
    } catch {
      blacklist = [];
    }
  }
  if (!blacklist.includes(token)) {
    blacklist.push(token);
    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2), "utf8");
  }
}

/**
 * "Deletes" (invalidates) an API token for REST API access.
 * Only accessible by admin users (group === 'admin').
 * The client must send the token to be invalidated in the Authorization header.
 * Removes the token from api-tokens.json and adds it to blacklist.json.
 */
function deleteApiToken(req, res) {
  // Only allow admin users to delete API tokens
  if (!req.user || req.user.group !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  // Find the API token for this user in api-tokens.json
  let tokens = [];
  if (fs.existsSync(apiTokensPath)) {
    try {
      tokens = JSON.parse(fs.readFileSync(apiTokensPath, "utf8"));
    } catch {
      tokens = [];
    }
  }

  // Find the token object for the current user
  const userTokenObj = tokens.find(t => t.username === req.user.username);

  if (!userTokenObj) {
    return res.status(404).json({ message: "No API token found for this user" });
  }

  // Remove the user's token from api-tokens.json
  tokens = tokens.filter(t => t.username !== req.user.username);
  fs.writeFileSync(apiTokensPath, JSON.stringify(tokens, null, 2), "utf8");

  // Add the token to the blacklist
  addTokenToBlacklist(userTokenObj.token);

  res.json({ message: "API token for user has been deleted and blacklisted" });
}

// Middleware to check if API token is blacklisted (persistent)
function isApiTokenBlacklisted(token) {
  if (fs.existsSync(blacklistPath)) {
    try {
      const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf8"));
      return blacklist.includes(token);
    } catch {
      return false;
    }
  }
  return false;
}

module.exports = {
  getApiToken,
  deleteApiToken,
  isApiTokenBlacklisted,
};
