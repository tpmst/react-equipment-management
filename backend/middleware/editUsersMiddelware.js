const express = require("express");
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("../middleware/authMiddleware");
const {logAction, logError, logDetection} = require('../functions/logFunction');
const {checkValid} = require('../functions/checkValid');
const bcrypt = require("bcryptjs");

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
  if (!checkValid(req)) {
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

  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password with a salt round of 10
  users.push({ username, password: hashedPassword, group, email });
  logAction(req, "addUser", username);

  saveUsers(users);
  res.json({ message: "User added successfully" });
});

// PUT: Edit a user (Admin only)
router.put("/users/edit/:username", authenticateToken, (req, res) => {
  if (!checkValid(req)) {
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
  if (newPassword) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password
    users[userIndex].password = hashedPassword;
  }
  if (newGroup) users[userIndex].group = newGroup;
  if (newEmail) users[userIndex].email = newEmail;

  logAction(req, "editUser", `${username} updated their details`);

  saveUsers(users);
  res.json({ message: "User updated successfully" });
});

// GET: Fetch all users (Admin only)
router.get("/users", authenticateToken, (req, res) => {
  if (!checkValid(req)) {
    logDetection(req, "viewUsers", req.params.username);
    return res.status(403).json({ message: "Access denied" });
  }

  const users = getUsers();
  res.json(users.map(({ password, ...rest }) => rest)); // Exclude passwords from the response
});

// DELETE: Remove a user (Admin only)
router.delete("/users/delete/:username", authenticateToken, (req, res) => {
  if(!checkValid(req.body)){
    logDetection(req, "addUser", req.params.username);
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
  const username = getUsername(req); // The authenticated user
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

  // Verify if the current password is correct
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    logDetection(req, "changePassword", username);
    return res.status(403).json({ message: "Current password is incorrect" });
  }

  // Hash the new password
  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  users[userIndex].password = hashedNewPassword;

  logAction(req, "changePassword", `${username} changed their password`);

  saveUsers(users);
  res.json({ message: "Password changed successfully" });
});

module.exports = router;
