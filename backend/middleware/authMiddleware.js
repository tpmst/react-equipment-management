const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { logLogin, logError } = require('../functions/logFunction');
require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET; // Separate secret for refresh tokens
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h"; // Default expiration time for JWT
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || "7d"; // Refresh token expiration
const BACKEND_URL = process.env.BACKEND_URL;

// In-memory store for refresh tokens (use a database in production)
const refreshTokens = new Map();

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    
    // Check if user group exists in the token payload
    if (!user.group) {
      return res.status(403).json({ message: "User group missing from token" });
    }

    req.user = user; // Attach user data to request
    next();
  });
};

function getUsers() {
  
    const filePath = path.join(__dirname, 'logins', 'logindata.json');
    if (!fs.existsSync(filePath)) {
      throw new Error('Login data file not found'); // Error if the file does not exist
    }
    const data = fs.readFileSync(filePath, 'utf8'); // Read the JSON file
    return JSON.parse(data); // Parse and return the data
}

// Function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { username: user.username, group: user.group },
    SECRET_KEY,
    { expiresIn: JWT_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    { username: user.username },
    REFRESH_SECRET_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );

  // Store the refresh token in memory (or database)
  refreshTokens.set(refreshToken, user.username);

  return { accessToken, refreshToken };
};

// Login function with token generation
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const users = getUsers(); // Fetch users from JSON file
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logLogin(user.username, user.group);
    res.json({ accessToken, refreshToken, group: user.group, username: user.username });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "An error occurred during login", error: error.message });
  }
}

// Token renewal endpoint
async function renewToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);

    // Check if the refresh token exists in the store
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Get the username from the refresh token
    const username = refreshTokens.get(refreshToken);

    // Fetch the user from the database or file
    const users = getUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { username: user.username, group: user.group },
      SECRET_KEY,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error("Token Renewal Error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}

// Logout function to invalidate refresh tokens
function logout(req, res) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken); // Remove the refresh token from the store
  }

  res.json({ message: "Logged out successfully" });
}

// POST: Forgot Password - Send Reset Email
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "User with this email not found" });
  }

  // Generate a temporary reset token (e.g., JWT or random string)
  const resetToken = jwt.sign({ username: user.username }, SECRET_KEY, {
    expiresIn: "2h", // Token valid for 1 hour
  });

  // Create a reset link (adjust the URL to match your frontend)
  const resetLink = `${BACKEND_URL}//reset-password?token=${resetToken}`;

  // Configure the email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Email user
      pass: process.env.EMAIL_PASS, // Email password
    },
  });

  // Email content
  const mailOptions = {
    from: `"IT-Beschaffung Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    text: `Hello ${user.username},\n\nYou requested a password reset. Please use the following link to reset your password:\n\n${resetLink}\n\nThis link is valid for 1 hour.\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hello <strong>${user.username}</strong>,</p>
           <p>You requested a password reset. Please use the following link to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link is valid for 1 hour.</p>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    logLogin(user.username, "Password reset email sent");

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    logError(req, "forgotPassword", error);
    res.status(500).json({ message: "Error sending password reset email" });
  }
}

// POST: Reset Password - Update the password
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, SECRET_KEY);
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.username === decoded.username);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10); // Salt rounds = 10
    users[userIndex].password = hashedPassword;

    logLogin(decoded.username, "Password reset successfully");

    saveUsers(users);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    logError(req, "resetPassword", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken, login, forgotPassword, resetPassword, renewToken, logout };

