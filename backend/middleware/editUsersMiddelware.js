const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/authMiddleware");
const { group } = require("console");
const {logAction, logError, logDetection} = require('../functions/logFunction')

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

// Path to user database (JSON file)
const USERS_FILE = path.join(__dirname, "./logins/logindata.json");

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

// Helper function to write users to JSON file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to users file:", error);
  }
};

// POST: Add a new user (Admin only)
router.post("/users/add", authenticateToken, (req, res) => {
  if (req.user.group !== "admin") {
    logDetection(req, "addUser", req.params.username);
    return res.status(403).json({ message: "Access denied" });
  }

  const { username, password, group, email } = req.body;
  if (!username || !password || !group || !email) {
    return res.status(400).json({ message: "All fields (username, password, group, email) are required" });
  }

  const users = getUsers();
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password, group, email });
  logAction(req, "addUser", username);

  saveUsers(users);
  res.json({ message: "User added successfully" });
});

// PUT: Edit a user (Admin only)
router.put("/users/edit/:username", authenticateToken, (req, res) => {
  if (req.user.group !== "admin") {
    logDetection(req, "editUser", req.params.username);
    return res.status(403).json({ message: "Access denied" });
  }

  const { username } = req.params;
  const { newUsername, newPassword, newGroup, newEmail } = req.body;

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.username === username);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (newUsername) users[userIndex].username = newUsername;
  if (newPassword) users[userIndex].password = newPassword;
  if (newGroup) users[userIndex].group = newGroup;
  if (newEmail) users[userIndex].email = newEmail;

  logAction(req, "changeUser", `${username} | ${newGroup} | ${newEmail}`);

  saveUsers(users);
  res.json({ message: "User updated successfully" });
});

// GET: Fetch all users (Admin only)
router.get("/users", authenticateToken, (req, res) => {
  if (req.user.group !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = getUsers();
  res.json(users.map(({ password, ...rest }) => rest)); // Hide passwords in response
});

// DELETE: Remove a user (Admin only)
router.delete("/users/delete/:username", authenticateToken, (req, res) => {
  if (req.user.group !== "admin") {
    logDetection(req, "deleteUser", req.params.username)
    return res.status(403).json({ message: "Access denied" });
  }

  const { username } = req.params;
  const users = getUsers();
  const filteredUsers = users.filter((u) => u.username !== username);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ message: "User not found" });
  }
  logAction(req, "deleteUSer", username)

  saveUsers(filteredUsers);
  res.json({ message: "User deleted successfully" });
});

// PUT: Change password for the authenticated user
router.put("/users/change-password", authenticateToken, (req, res) => {
  const { username } = req.user; // Der authentifizierte Benutzer
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new passwords are required" });
  }

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = users[userIndex];

  // Überprüfen, ob das aktuelle Passwort korrekt ist
  if (user.password !== currentPassword) {
    logDetection(req, "changePassword", username);
    return res.status(403).json({ message: "Current password is incorrect" });
  }

  // Neues Passwort setzen
  users[userIndex].password = newPassword;

  logAction(req, "changePassword", currentPassword + " | " + newPassword);

  saveUsers(users);
  res.json({ message: "Password changed successfully" });
});

module.exports = router;
