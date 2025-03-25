const fs = require("fs");
const path = require("path");
const { logError, logAction, logDetection } = require('../functions/logFunction');

/**
 * Searches for an exact numeric value in a selected CSV file.
 */
async function searchCsvRow(req, res) {
    const { csvname, searchText } = req.params;

    if (!/^\d+$/.test(searchText)) {
        return res.status(400).json({ message: "Invalid search text. Must be a numeric string." });
    }

    if (!csvname || csvname.includes("..") || csvname.includes("/") || csvname.includes("\\")) {
        logDetection(req, "searchCsvRow", csvname + " | " + searchText)
        return res.status(400).json({ message: "Invalid CSV name or search text" });
    }

    const csvFilePath = path.join(__dirname, "../files/csv", csvname);

    try {
        await fs.promises.access(csvFilePath, fs.constants.F_OK);
        let data = await fs.promises.readFile(csvFilePath, "utf8");
        let rows = data.split("\n");

        // Convert results to an array of arrays (split each row into columns)
        const matchingRows = rows
            .map(row => row.split(";")) // Convert each row into an array
            .filter(columns => columns.includes(searchText)); // Filter based on search

        if (matchingRows.length === 0) {
            return res.json({ message: "No matches found", results: [] });
        }
        logAction(req, "searchCsvRow", matchingRows)
        return res.json({ message: "Matches found", results: matchingRows });

    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({ message: "CSV file not found" });
        }
        logError(req, "searchCsvRow", error)
        res.status(500).json({ message: "Error searching CSV", error: error.message });
    }
}


/**
 * Searches for an exact numeric value in a selected CSV file and deletes the row(s) if found.
 */
async function searchAndDeleteCsvRow(req, res) {
    const { csvname, searchText } = req.params;

    // Validate that searchText is a numeric string (e.g., "100007")
    if (!/^\d+$/.test(searchText)) {
        return res.status(400).json({ message: "Invalid search text. Must be a numeric string." });
    }

    // Security check to prevent directory traversal
    if (!csvname || csvname.includes("..") || csvname.includes("/") || csvname.includes("\\")) {
        logDetection(req, "searchAndDeleteCsvRow", csvname + " | " + searchText)
        return res.status(400).json({ message: "Invalid CSV name or search text" });
    }

    const csvFilePath = path.join(__dirname, "../files/csv", csvname);

    try {
        // Check if the CSV file exists
        await fs.promises.access(csvFilePath, fs.constants.F_OK);

        // Read the CSV file
        let data = await fs.promises.readFile(csvFilePath, "utf8");
        let rows = data.split("\n");

        // Find and delete rows where a column exactly matches the numeric searchText
        const filteredRows = rows.filter(row => {
            const columns = row.split(";");
            return !columns.includes(searchText); // Only delete rows where the number is found
        });

        if (filteredRows.length === rows.length) {
            return res.json({ message: "No matches found, no deletion performed" });
        }

        // Write the updated CSV file (removing the matched rows)
        await fs.promises.writeFile(csvFilePath, filteredRows.join("\n"), "utf8");

        logAction(req, "searchAndDeleteCsvRow", searchText + " " + csvname)

        return res.json({
            message: "Matching row(s) deleted successfully",
            remainingData: filteredRows
        });

    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({ message: "CSV file not found" });
        }
        logError(req, "searchAndDeleteCsvRow", error)
        res.status(500).json({ message: "Error deleting row(s)", error: error.message });
    }
}


module.exports = { searchCsvRow, searchAndDeleteCsvRow};
