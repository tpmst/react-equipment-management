const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret"; // Secure your key in .env

// Funktion zum Laden der JSON-Datei mit den Routen
const getRoutePermissions = () => {
  const filePath = path.join(__dirname, "./logins/routes.json"); // Ensure path is correct
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    logError(req, "getRoutePermissions", error)
    return {};
  }
};

// Middleware zur Authentifizierung & Überprüfung
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    if (!user.group) {
      return res.status(403).json({ message: "User group missing in token" });
    }

    req.user = user; // Store decoded token payload
    next();
  });
};

// Endpunkt: Erlaubte Routen abrufen
router.get("/permissions", authenticateToken, (req, res) => {
  const routePermissions = getRoutePermissions();
  const userGroup = req.user.group || "guest";
  const allowedRoutes = routePermissions[userGroup] || [];

  res.json({ allowedRoutes });
});

module.exports = router;
