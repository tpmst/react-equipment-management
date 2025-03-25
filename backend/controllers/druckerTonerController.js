// Import required modules
const snmp = require("net-snmp"); // SNMP library for querying network devices
const ping = require("ping"); // Library for checking if a device is reachable via network ping
const fs = require("fs"); // File system module to read files
const { parse } = require("csv-parse"); // CSV parsing library to read CSV files
const path = require('path'); // Path module to handle file paths
const { logError } = require('../functions/logFunction');
/**
 * Function to read and parse the CSV file containing device information.
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of devices.
 */
function readDevicesFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const devices = []; // Array to store device objects

        // Read the CSV file and parse its content
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true })) // Parse CSV with column headers as object keys
            .on("data", (row) => { // Process each row of the CSV
                const device = {
                    Name: row.Name, // Printer name
                    IPAddress: row.IPAddress, // Printer IP address
                    ColorPrinter: row.ColorPrinter === "true", // Boolean flag indicating if it's a color printer
                    OIDToner: row.OIDToner ? row.OIDToner.split(";").map(oid => oid.trim()) : [] // Array of toner level OIDs
                };
                devices.push(device); // Add the device to the array
            })
            .on("end", () => resolve(devices)) // Resolve the promise when reading is complete
            .on("error", (error) => reject(error)); // Handle any errors
    });
}

/**
 * Function to process an individual printer device.
 * Checks if the printer is online and retrieves toner levels using SNMP.
 * @param {Object} device - Device object with properties Name, IPAddress, ColorPrinter, and OIDToner.
 * @returns {Promise<Object>} - Resolves with an object containing printer status and toner levels.
 */
function processDevice(device) {
    return new Promise((resolve) => {
        // Check if the printer is online by sending a ping request
        ping.sys.probe(device.IPAddress, (isAlive) => {
            if (!isAlive) { // If the printer is offline, return default values
                resolve({ ...device, TonerLevels: "-", Status: "Offline" });
                return;
            }

            // Create an SNMP session to query toner levels
            const session = snmp.createSession(device.IPAddress, "public");
            let promises = [];

            // Iterate through all OIDs for toner levels
            device.OIDToner.forEach((oid) => {
                // Ensure the OID is in a valid SNMP format before querying
                if (/^\d+(\.\d+)*$/.test(oid)) {
                    promises.push(
                        new Promise((resolve) => {
                            session.get([oid], (error, varbinds) => {
                                if (error) {
                                    console.error(`SNMP Error for OID ${oid} on ${device.Name}:`, error);
                                    resolve(0); // Resolve with 0 in case of an error
                                } else {
                                    resolve(varbinds[0].value); // Resolve with the retrieved toner level
                                }
                            });
                        })
                    );
                } else {
                    console.error(`Invalid OID format: ${oid} for device ${device.Name}`);
                    promises.push(Promise.resolve(0)); // Resolve with 0 for invalid OID
                }
            });

            // Wait for all SNMP queries to complete
            Promise.all(promises).then((results) => {
                const tonerLevels = device.ColorPrinter ? {
                    Black: results[0], // Black toner level
                    Cyan: results[1], // Cyan toner level
                    Magenta: results[2], // Magenta toner level
                    Yellow: results[3] // Yellow toner level
                } : {
                    Black: results[0], // Only black toner for non-color printers
                    Cyan: "N/A",
                    Magenta: "N/A",
                    Yellow: "N/A"
                };

                // Resolve the promise with device details and toner levels
                resolve({
                    Name: device.Name,
                    IP: device.IPAddress,
                    ColorPrinter: device.ColorPrinter,
                    TonerLevels: tonerLevels,
                    Status: "Online"
                });

                // Close the SNMP session
                session.close();
            });
        });
    });
}

/**
 * Main function to process all devices listed in the CSV file.
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Array>} - Resolves with an array of processed printer objects.
 */
async function processAllDevices(filePath) {
    try {
        const devices = await readDevicesFromCSV(filePath); // Read devices from CSV
        const results = await Promise.all(devices.map(processDevice)); // Process each device in parallel
        return results; // Return processed device results
    } catch (error) {
        logError(req, "processAllDevices", error)
        throw error; // Throw error for higher-level handling
    }
}

/**
 * Express route handler to fetch printer toner levels and return JSON response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function getPrinterToner(req, res) {
    try {
        // Define the path to the CSV file containing printer details
        const csvFilePath = path.join(__dirname, '../files/csv', "05_it-printerstoner.csv");
        
        // Process all devices and get their toner levels
        const results = await processAllDevices(csvFilePath);

        // Send the results as a JSON response
        res.json(results);
    } catch (error) {
        logError(req, "getPrinterToner", error)
        res.status(500).json({ error: "Error processing printer toner levels" }); // Handle errors
    }
}

// Export the function to be used in other parts of the application (e.g., Express routes)
module.exports = {
    getPrinterToner,
};
