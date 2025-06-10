// Import required modules
const fs = require('fs').promises; // Use async/await for file operations
const path = require('path'); // Path module for handling file paths
const { generate } = require('@pdfme/generator'); // PDF generation library
const { logError, logAction } = require('../functions/logFunction');
const {getUsername} = require('../functions/getUsername');

/**
 * Validates required fields to ensure they are not empty, undefined, or null.
 * @param {Array} fields - Array of values to check.
 * @returns {Boolean} - Returns true if all fields are valid, otherwise false.
 */
function validateFields(fields) {
    return fields.every(field => field !== undefined && field !== null && field !== '');
}

// Update a CSV File
async function updateCsv(req, res) {
    try {
        const { rowIndex, updatedData } = req.body;
        const csvFilePath = path.join(__dirname, '../files/csv', req.params.filename);

        // Check if file exists
        try {
            await fs.access(csvFilePath);
        } catch (error) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Read the CSV file
        let data = await fs.readFile(csvFilePath, 'utf8');
        let rows = data.split('\n');


        if (rowIndex === rows.length) {
            // Append new row if rowIndex is greater than the number of rows
            rows.push(updatedData.join(';'));
        } else if (rowIndex >= 0 && rowIndex < rows.length) {
            // Update existing row
            rows[rowIndex] = updatedData.join(';');
        } else {
            // Return an error if the row index is invalid
            return res.status(400).json({ message: 'Invalid row index' });
        }
        // Write updated data back to CSV file
        await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
        // Extract fields
        const [ID, date, department, requester, itName, product, sn, accessories, details, bes, signed, filePath] = updatedData;
        const fieldsToCheck = [ID, date, department, requester, itName, product, bes];

        logAction(req, "updateCsv", updatedData)

        if (validateFields(fieldsToCheck)) {
            if (filePath) {
                // Handle file renaming
                const fileName = `${ID}-${date}-${requester}-${product}.pdf`;
                const filenameSigned = `${ID}-${date}-${requester}-${product}_Signed.pdf`;
                const newFilePathSigned = path.join(__dirname, '../files/uploads', filenameSigned);
                const existingFilePath = path.join(__dirname, '../files/uploads', filePath);
                const existingOldUnsigned = path.join(__dirname, '../files/pdf', fileName);

                try {
                    await fs.rename(existingFilePath, newFilePathSigned);

                    // Delete old unsigned file if it exists
                    try {
                        await fs.unlink(existingOldUnsigned);
                    } catch (error) {
                        console.warn('Old unsigned file not found:', existingOldUnsigned);
                    }

                    // Update CSV file path
                    updatedData[11] = filenameSigned;
                    rows[rowIndex] = updatedData.join(';');

                    await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
                } catch (error) {
                    console.error('Error renaming or deleting files:', error);
                }
            } else {
                // Generate PDF if filePath is empty
                const templatePath = path.join(__dirname, '../files/templates', 'template-betrieb.json');
                const template = JSON.parse(await fs.readFile(templatePath, 'utf-8'));

                let notebook = "", tab = "", mob = "", store = "", other = "";

                if (accessories === "Notebook") notebook = "X";
                else if (accessories === "Tablet") tab = "X";
                else if (accessories === "Mobiltelefon") mob = "X";
                else if (accessories === "Speichergerät") store = "X";
                else other = "X";

                if (details) other = "X"; // Mark "Else" if details exist

                const inputs = [{
                    "produkt": product + " S/N:" + sn,
                    "accessorie": details,
                    "notes": bes,
                    "Notebook": notebook,
                    "Tablet": tab,
                    "Mobile": mob,
                    "Storage": store,
                    "Else": other,
                    "name": requester,
                    "Uname": requester,
                    "Uname2": itName,
                }];

                const fileName = `${ID}-${date}-${requester}-${product}.pdf`;
                const newFilePath = path.join(__dirname, '../files/pdf', fileName);

                try {
                    const pdfBuffer = await generate({ template, inputs });
                    await fs.writeFile(newFilePath, pdfBuffer);
                    logAction(req, "createdPDF", fileName)

                    updatedData[11] = fileName;
                    rows[rowIndex] = updatedData.join(';');

                    await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
                } catch (error) {
                    logError(req, "createPDF", error)
                }
            }
        }

        res.json({ message: 'CSV file updated successfully' });
    } catch (error) {
        logError(req, "updateCsv", error)
        res.status(500).json({ message: 'Error updating CSV file', error: error.message });
    }
}


// Update CSV Small (Handles both update & append)
async function updateCsvKlein(req, res) {
    try {
        const { rowIndex, updatedData } = req.body;
        const csvFilePath = path.join(__dirname, '../files/csv', req.params.filename);

        // Check if file exists
        await fs.access(csvFilePath);

        // Read the existing CSV data
        let data = await fs.readFile(csvFilePath, 'utf8');
        let rows = data.trim().split('\n'); // Trim to avoid blank lines

        if (rowIndex < 0) {
            // Append new row if rowIndex is negative
            rows.push(updatedData.join(';'));
        } else if (rowIndex >= 0 && rowIndex < rows.length - 1) {
            // Update existing row
            rows[rowIndex + 1] = updatedData.join(';');
        } else {
            return res.status(400).json({ message: 'Invalid row index' });
        }

        // Write updated data back to the CSV file
        await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
        
        logAction(req, "updateCsvKlein", updatedData)

        res.json({
            message: rowIndex < 0 ? "Row added successfully" : "CSV file updated successfully"
        });

    } catch (error) {
        logError(req, "updateCsvKlein", error)
        res.status(500).json({ message: "Error updating CSV file", error: error.message });
    }
}



async function addLineToCSV(req, res) {
    try {
        const { updatedData } = req.body;
        const csvFilePath = path.join(__dirname, '../files/csv', req.params.filename);

        // Check if file exists
        await fs.access(csvFilePath);

        // Read the existing CSV data
        let data = await fs.readFile(csvFilePath, 'utf8');
        let rows = data.trim().split('\n'); // Trim to avoid blank lines

        // Füge den Usernamen in die richtige Spalte ein
        const header = rows[0].split(';').map(h => h.trim().toLowerCase());
        const userIndex = header.findIndex(h => h === "user");
        const idIndex = header.findIndex(h => h === "id");
        const statusIndex = header.findIndex(h => h === "status");
        const username = getUsername(req);

        let newRow = [...updatedData];

        // ID automatisch erhöhen
        if (idIndex !== -1) {
            // Finde die höchste existierende ID (ignoriere Header)
            const ids = rows.slice(1)
                .map(row => row.split(';')[idIndex])
                .map(id => parseInt(id, 10))
                .filter(id => !isNaN(id));
            const maxId = ids.length > 0 ? Math.max(...ids) : 0;
            newRow[idIndex] = String(maxId + 1);
        }

        // Status auf "offen" (z.B. 1) setzen
        if (statusIndex !== -1) {
            newRow[statusIndex] = "1";
        }

        // Username setzen
        if (userIndex !== -1) {
            newRow[userIndex] = username;
        }

        // Always append a new row at the end
        rows.push(newRow.join(';'));

        // Write updated data back to the CSV file
        await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
        
        logAction(req, "addLineToCSV", newRow);

        res.json({
            message: "Row added successfully"
        });

    } catch (error) {
        logError(req, "addLineToCSV", error);
        res.status(500).json({ message: "Error updating CSV file", error: error.message });
    }
}

// Download CSV File (nur Zeilen für den aktuellen User und Status != 5)
async function downloadCsvUser(req, res) {
    try {
        const user = getUsername(req);
        const filePath = path.join(__dirname, '../files/csv', req.params.filename);
        await fs.access(filePath);

        // Lies die CSV-Datei ein
        const data = await fs.readFile(filePath, "utf8");
        const lines = data.trim().split('\n');
        if (lines.length === 0) {
            return res.status(405).json({ message: 'File is empty' });
        }

        // Header extrahieren
        const header = lines[0];
        const headers = header.split(';').map(h => h.trim().toLowerCase());
        const usernameIndex = headers.findIndex(h => h === "user");
        const statusIndex = headers.findIndex(h => h === "status");

        if (usernameIndex === -1) {
            return res.status(400).json({ message: 'No username column in CSV' });
        }
        if (statusIndex === -1) {
            return res.status(400).json({ message: 'No status column in CSV' });
        }

        // Filtere nur Zeilen, die zum User passen und Status != 5
        const filteredLines = [
            header,
            ...lines.slice(1).filter(line => {
                const cols = line.split(';');
                return cols[usernameIndex] === user && !["5", "6"].includes(cols[statusIndex]);
            })
        ];

        // Sende die gefilterte CSV als Download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
        res.send(filteredLines.join('\n'));
    } catch (error) {
        logError(req, "downloadCsvUser", error);
        console.log(error)
        res.status(404).json({ message: 'File not found' });
    }
}

// Download CSV File
async function downloadCsv(req, res) {
    try {
        const filePath = path.join(__dirname, '../files/csv', req.params.filename);
        await fs.access(filePath);
        res.download(filePath);
    } catch (error) {
        logError(req, "downloadCsv", error)
        res.status(404).json({ message: 'File not found' });
    }
}


// Download CSV File
async function downloadCsvLogs(req, res) {
    try {
        const filePath = path.join(__dirname, '../files/logs', req.params.filename);
        await fs.access(filePath);
        res.download(filePath);
    } catch (error) {
        logError(req, "downloadCsvLogs", error)
        res.status(404).json({ message: 'File not found' });
    }
}

// "Soft Delete": Setzt die Status-Spalte auf "5" statt die Zeile zu löschen
async function softDeleteCsvLine(req, res) {
    try {
        const { id, action } = req.params;
        const csvFilePath = path.join(__dirname, '../files/csv', req.params.filename);

        // Check if file exists
        await fs.access(csvFilePath);

        // Read the CSV file
        let data = await fs.readFile(csvFilePath, 'utf8');
        let rows = data.trim().split('\n');
        if (rows.length < 2) {
            return res.status(404).json({ message: 'No data rows found' });
        }

        // Find header and relevant indices
        const header = rows[0].split(';').map(h => h.trim().toLowerCase());
        const idIndex = header.findIndex(h => h === "id");
        const statusIndex = header.findIndex(h => h === "status");

        if (idIndex === -1 || statusIndex === -1) {
            return res.status(400).json({ message: 'ID or status column not found' });
        }

        let found = false;
        if(action === "delete"){
        // Find the row to "delete"
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(';');
                if (cols[idIndex] === id) {
                    cols[statusIndex] = "5"; // Set status to 5 (deleted)
                    rows[i] = cols.join(';');
                    found = true;
                    break;
                }
            }
        }
        if(action === "archive"){
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(';');
                if (cols[idIndex] === id) {
                    cols[statusIndex] = "6"; // Set status to 5 (deleted)
                    rows[i] = cols.join(';');
                    found = true;
                    break;
                }
            }
        }


        if (!found) {
            return res.status(404).json({ message: 'Row with given ID not found' });
        }

        // Write updated data back to the CSV file
        await fs.writeFile(csvFilePath, rows.join('\n'), 'utf8');
        logAction(req, "softDeleteCsvLine", { id });

        res.json({ message: "Row marked as deleted (status=5)" });
    } catch (error) {
        logError(req, "softDeleteCsvLine", error);
        res.status(500).json({ message: "Error updating CSV file", error: error.message });
    }
}

// Export Functions
module.exports = {
    updateCsv,
    downloadCsv,
    updateCsvKlein,
    downloadCsvLogs,
    addLineToCSV,
    downloadCsvUser,
    softDeleteCsvLine,
};
