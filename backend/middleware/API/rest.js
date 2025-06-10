const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { logAPIAction } = require("../../functions/logFunction");
const { isApiTokenBlacklisted } = require("../apiMiddleware"); // <-- Import the blacklist checker
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware zur Prüfung des API-Tokens inkl. Blacklist-Check
function authenticateApiToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No API token provided" });
  }

  // Prüfe, ob Token auf der Blacklist steht
  if (isApiTokenBlacklisted(token)) {
    return res.status(403).json({ message: "API token is blacklisted" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err || !user || user.api !== true) {
      return res.status(403).json({ message: "Invalid or expired API token" });
    }
    req.user = user;
    next();
  });
}

// Export CSV file route (protected by API token)
router.get("/export-csv/:filename", authenticateApiToken, (req, res) => {
  const { filename } = req.params;

  // Security check: only allow .csv files and prevent directory traversal
  if (
    !filename.endsWith(".csv") ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return res.status(400).json({ message: "Invalid filename" });
  }

  const filePath = path.join(__dirname, "../../files/csv", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "CSV file not found" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "text/csv");
  logAPIAction(req, "exportCsv-API", filename);
  fs.createReadStream(filePath).pipe(res);
});

module.exports = router;