// Import required modules
const express = require('express'); // Express framework for handling HTTP requests
const cors = require('cors'); // CORS middleware to enable cross-origin requests

// Import route handlers
const csvRoutes = require('./routes/csvRoutes'); // Routes for handling CSV operations
const fileRoutes = require('./routes/fileRoutes'); // Routes for handling file uploads/downloads
const druckerRoutes = require('./routes/druckerRoutes'); // Routes for handling printer-related tasks
const einkaufRoutes = require('./routes/einkaufRoutes'); // Routes for handling purchase-related operations
const configRoutes = require('./routes/configRoutes'); // Routes for configuration settings


// Import authentication middleware
const { login, resetPassword, forgotPassword } = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();
const PORT = 3000; // Define the port number

// Middleware Configuration

/**
 * Enable CORS (Cross-Origin Resource Sharing)
 * - Allows requests from any origin (`*`)
 * - Supports GET, POST, PUT, DELETE methods
 * - Does not allow credentials (cookies, authorization headers)
 */
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: false,
}));

// Parse incoming JSON requests
app.use(express.json());

// Authentication Route

/**
 * Login Route
 * Uses authentication middleware to process login requests.
 */
app.post('/login', login);
app.post('/users/forgot-password', forgotPassword);
app.post('/users/reset-password', resetPassword);


//for groups
const authRoutes = require("./middleware/routesMiddelware");
app.use(authRoutes);

//admin routes
const userRoutes = require("./middleware/editUsersMiddelware");
app.use(userRoutes);

const groupRoutes = require("./middleware/editGroupsMiddelware");
app.use(groupRoutes);

// Route Handling

/**
 * Register all route handlers
 */
app.use(configRoutes);  // Configuration settings routes
app.use(csvRoutes);     // CSV operations routes
app.use(fileRoutes);    // File upload and download routes
app.use(druckerRoutes); // Printer-related routes
app.use(einkaufRoutes); // Purchase-related routes

// Start the Server

app.listen(PORT, () => {
    console.log(`Server is running`);
});
