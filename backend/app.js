// Import required modules
const express = require('express'); // Express framework for handling HTTP requests
const cors = require('cors'); // CORS middleware to enable cross-origin requests
//const cron = require('node-cron'); // Cron scheduler for running tasks
const path = require('path'); // For handling file paths
const { getPrinterCounts } = require('./functions/getPrinterCounts'); // Import the getPrinterCounts function

// Import route handlers
const csvRoutes = require('./routes/csvRoutes'); // Routes for handling CSV operations
const fileRoutes = require('./routes/fileRoutes'); // Routes for handling file uploads/downloads
const druckerRoutes = require('./routes/druckerRoutes'); // Routes for handling printer-related tasks
const einkaufRoutes = require('./routes/einkaufRoutes'); // Routes for handling purchase-related operations
const configRoutes = require('./routes/configRoutes'); // Routes for configuration settings

const PORT = process.env.API_PORT;

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_BACKUP = process.env.FRONTEND_URL_BACKUP;
const ENABLE_GET_PRINTER_COUNTS = process.env.ENABLE_GET_PRINTER_COUNTS || false;

// Import authentication middleware
const { login, resetPassword, forgotPassword, renewToken } = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

// Middleware Configuration

/**
 * Enable CORS (Cross-Origin Resource Sharing)
 * - Allows requests from any origin (`*`)
 * - Supports GET, POST, PUT, DELETE methods
 * - Does not allow credentials (cookies, authorization headers)
 */
app.use(cors({
    origin: FRONTEND_URL || FRONTEND_URL_BACKUP,
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
app.post('/users/renew-token', renewToken);

// For groups
const authRoutes = require("./middleware/routesMiddelware");
app.use(authRoutes);

// Admin routes
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

// Schedule the getPrinterCounts function to run daily at 14:00
// install node-cron before using
/*


cron.schedule('0 14 * * *', async () => {
    if(ENABLE_GET_PRINTER_COUNTS === 'true') {
        console.log('Running scheduled task: getPrinterCounts');
        try {
            // Call the getPrinterCounts function
            await getPrinterCounts();
            console.log('Printer counts successfully processed and saved.');
        } catch (error) {
            console.error('Error running scheduled task: getPrinterCounts', error);
        }
    }   
    else {
    console.log('Scheduled task for getPrinterCounts is disabled.');
    }
});
*/
// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
