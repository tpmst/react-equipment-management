// Import necessary modules
const fs = require("fs"); // For file system operations
const { parse } = require("csv-parse"); // For parsing CSV files
const ping = require("ping"); // For checking device availability via ping
const snmp = require("net-snmp"); // For interacting with devices using SNMP
const path = require('path');
const { logError} = require('../functions/logFunction');
/**
 * Reads and parses the CSV file containing device information.
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Array>} - A promise that resolves with an array of devices parsed from the CSV file.
 */
function readDevicesFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const devices = []; // Initialize an empty array to hold device objects

        // Create a readable stream from the CSV file and parse it
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true })) // Parse CSV rows into objects with column headers as keys
            .on("data", (row) => {
                // Map CSV columns to a structured device object
                const device = {
                    Name: row.Name, // Device name
                    IPAddress: row.IPAddress, // Device IP address
                    ColorPrinter: row.ColorPrinter === "true", // Convert "true"/"false" strings to boolean
                    OIDBlack: row.OIDBlack.split(";").map(oid => oid.trim()), // Split OIDBlack string by semicolon and trim spaces
                    OIDColor: row.OIDColor.split(";").map(oid => oid.trim())  // Split OIDColor string by semicolon and trim spaces
                };
                devices.push(device); // Add the device to the array
            })
            .on("end", () => {
                resolve(devices); // Resolve the promise with the devices array when parsing is complete
            })
            .on("error", (error) => {
                reject(error); // Reject the promise if an error occurs
            });
    });
}

/**
 * Processes a single device to check its status and gather SNMP data.
 * @param {Object} device - The device object containing its details and OIDs.
 * @returns {Promise<Object>} - A promise that resolves with the processed device data.
 */
function processDevice(device) {
    return new Promise((resolve) => {
        // Ping the device to check if it is online
        ping.sys.probe(device.IPAddress, (isAlive) => {
            if (!isAlive) {
                // If the device is offline, resolve with basic information and an offline status
                resolve({ ...device, PrintsBlackWhite: "-", PrintsColor: "-", Status: "Offline" });
                return;
            }

            // Create an SNMP session with the device using the default "public" community string
            const session = snmp.createSession(device.IPAddress, "public");
            let promises = []; // Array to hold SNMP query promises

            // Fetch black-and-white print data using OIDBlack array
            device.OIDBlack.forEach((oid) => {
                promises.push(
                    new Promise((resolve) => {
                        session.get([oid], (error, varbinds) => {
                            if (error) {
                                console.error(error); // Log the error
                                resolve(0); // Resolve as 0 in case of an error
                            } else {
                                resolve(varbinds[0].value); // Resolve with the SNMP value
                            }
                        });
                    })
                );
            });

            // If the device supports color printing, fetch color print data using OIDColor array
            if (device.ColorPrinter) {
                device.OIDColor.forEach((oid) => {
                    promises.push(
                        new Promise((resolve) => {
                            session.get([oid], (error, varbinds) => {
                                if (error) {
                                    console.error(error); // Log the error
                                    resolve(0); // Resolve as 0 in case of an error
                                } else {
                                    resolve(varbinds[0].value); // Resolve with the SNMP value
                                }
                            });
                        })
                    );
                });
            }

            // Process all SNMP queries concurrently and aggregate the results
            Promise.all(promises).then((results) => {
                // Calculate total black-and-white prints
                const totalBlackWhite = results.slice(0, device.OIDBlack.length).reduce((acc, val) => acc + val, 0);

                // Calculate total color prints if applicable, otherwise return "N/A"
                const totalColor = device.ColorPrinter ? 
                    results.slice(device.OIDBlack.length).reduce((acc, val) => acc + val, 0) : 
                    "N/A";

                // Resolve with the aggregated device data
                resolve({
                    Name: device.Name, // Device name
                    IP: device.IPAddress, // Device IP address
                    PrintsBlackWhite: totalBlackWhite, // Total black-and-white prints
                    PrintsColor: totalColor, // Total color prints (if applicable)
                    Status: "Online" // Device status
                });

                // Close the SNMP session after processing
                session.close();
            });
        });
    });
}

/**
 * Processes all devices listed in the given CSV file.
 * @param {string} filePath - The path to the CSV file containing device data.
 * @returns {Promise<Array>} - A promise that resolves with the results of processing all devices.
 */
async function processAllDevices(filePath) {
    try {
        // Read device data from the CSV file
        const devices = await readDevicesFromCSV(filePath);

        // Check if the devices list is empty and handle accordingly
        if (!devices || devices.length === 0) {
            console.warn("No devices to process"); // Log a warning if no devices found
            return []; // Return an empty array if there are no devices
        }

        // Process each device concurrently and collect results
        const results = await Promise.all(devices.map(processDevice));

        return results; // Return the array of results
    } catch (error) {
        logError(req, "processAllDevices", error) // Log the error details
        throw error; // Rethrow the error to propagate it upstream
    }
}

/**
 * Handles the HTTP request to get printer counts and sends the response.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
async function getPrinterCounts(req, res) {
    try {
        // Default CSV file name, can be overridden by a query parameter
        const fileName = "04_it-printers.csv";

        // Build the full file path for the CSV file
        const csvFilePath = path.join(__dirname, '../files/csv', fileName);

        // Validate that the file exists before proceeding
        if (!fs.existsSync(csvFilePath)) {
            return res.status(400).json({ error: "CSV file not found" }); // Respond with a 400 error if file is missing
        }

        // Process all devices in the CSV file and collect results
        const results = await processAllDevices(csvFilePath);

        res.json(results); // Send the results as a JSON response
    } catch (error) {
        logError(req, "getPrinterCounts", error)
        res.status(500).json({ error: error.message || "Error processing printer counts" }); // Respond with a 500 status and error message
    }
}

// Export the function(s) for use in other modules
module.exports = {
    getPrinterCounts, // Expose the getPrinterCounts function as part of the module's public API
};
