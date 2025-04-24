const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/authMiddleware");
const {logAction, logError, logDetection} = require('../functions/logFunction')
const { checkValid } = require('../functions/checkValid')



const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

// Path to groups database (JSON file)
const GROUPS_FILE = path.join(__dirname, "./logins/routes.json");

// Path to user database (JSON file)
const USERS_FILE = path.join(__dirname, "./logins/logindata.json");

// Helper function to read groups from JSON file
const getGroups = () => {
  try {
    const data = fs.readFileSync(GROUPS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading groups file:", error);
    return {};
  }
};

// Helper function to write groups to JSON file
const saveGroups = (groups) => {
  try {
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to groups file:", error);
  }
};

// GET: Fetch all groups (Admin only)
router.get("/groups", authenticateToken, (req, res) => {
  if(!checkValid(req)){
      logDetection(req, "addUser", req.params.username);
      return res.status(403).json({ message: "Access denied" });
    }
  
  
  const groups = getGroups();
  res.json(groups);
});

// POST: Add a new group (Admin only)
router.post("/groups/add", authenticateToken, (req, res) => {
  if(!checkValid(req)){
      logDetection(req, "addUser", req.params.username);
      return res.status(403).json({ message: "Access denied" });
    }
  

  const { groupName, permissions } = req.body;
  if (!groupName || !Array.isArray(permissions)) {
    return res.status(400).json({ message: "Group name and permissions are required" });
  }

  const groups = getGroups();
  if (groups[groupName]) {
    return res.status(400).json({ message: "Group already exists" });
  }

  groups[groupName] = permissions;
  logAction(req, "addGroup", groupName)

  saveGroups(groups);
  res.json({ message: "Group added successfully" });
});

// PUT: Edit a group (Admin only)
router.put("/groups/edit/:groupName", authenticateToken, (req, res) => {
  if(!checkValid(req)){
      logDetection(req, "addUser", req.params.username);
      return res.status(403).json({ message: "Access denied" });
    }
  

  const { groupName } = req.params;
  const { newGroupName, newPermissions } = req.body;

  const groups = getGroups();
  if (!groups[groupName]) {
    return res.status(404).json({ message: "Group not found" });
  }

  if (newGroupName) {
    groups[newGroupName] = groups[groupName];
    delete groups[groupName];
  }
  if (newPermissions) {
    groups[newGroupName || groupName] = newPermissions;
  }
  logAction(req, "changeGroup", groupName + " | " + newGroupName )

  saveGroups(groups);
  res.json({ message: "Group updated successfully" });
});

// DELETE: Remove a group (Admin only)
router.delete("/groups/delete/:groupName", authenticateToken, (req, res) => {
  if(!checkValid(req)){
      logDetection(req, "addUser", req.params.username);
      return res.status(403).json({ message: "Access denied" });
    }
  

  const { groupName } = req.params;
  const groups = getGroups();
  
  if (!groups[groupName]) {
    return res.status(404).json({ message: "Group not found" });
  }

  delete groups[groupName];
  logAction(req, "deleteGroup", groupName)
  saveGroups(groups);
  res.json({ message: "Group deleted successfully" });
});

module.exports = router;
