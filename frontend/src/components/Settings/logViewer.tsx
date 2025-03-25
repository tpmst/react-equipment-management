import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useAuth } from "../../context/AuthenticationContext";
import { useTranslation } from "react-i18next";
import { Select, MenuItem, FormControl, TextField } from "@mui/material";

const LogViewer: React.FC = () => {
  const { authToken } = useAuth();
  const { t } = useTranslation();

  const [csvFiles, setCsvFiles] = useState<string[]>([]);
  const [selectedCsv, setSelectedCsv] = useState<string>("");
  const [logData, setLogData] = useState<string[][]>([]);
  const [filteredData, setFilteredData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchCsvFiles = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/list-files/logs`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCsvFiles(response.data.files);
        if (response.data.files.length > 0) {
          setSelectedCsv(response.data.files[0]);
        }
      } catch (error) {
        setError("Error fetching log files");
      }
    };
    fetchCsvFiles();
  }, [authToken]);

  useEffect(() => {
    const fetchLogContent = async () => {
      if (!selectedCsv || !authToken) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-log/${selectedCsv}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = parseCSV(response.data);
        setLogData(data);
        setFilteredData(data);
      } catch (error) {
        setError("Error fetching log content");
      }
    };
    fetchLogContent();
  }, [selectedCsv, authToken]);

  const parseCSV = (text: string): string[][] => {
    return text
      .trim()
      .split("\n")
      .map((row, rowIndex) => {
        const columns = row.split(";");

        // Update the header row to include "Date" and "Time"
        if (rowIndex === 0) {
          if (columns[0] === "time") {
            columns.splice(0, 1, "Date", "Time"); // Replace "Timestamp" with "Date" and "Time"
          }
        }

        // Split the timestamp column (assuming it's the first column)
        if (rowIndex > 0 && columns[0]) {
          const timestamp = new Date(columns[0]);
          const date = timestamp.toISOString().split("T")[0]; // Extract date (YYYY-MM-DD)
          const time = timestamp.toISOString().split("T")[1].split("Z")[0]; // Extract time (HH:mm:ss.sss)
          columns.splice(0, 1, date, time); // Replace the timestamp with date and time
        }

        return columns;
      });
  };

  const handleSort = (columnIndex: number) => {
    const newOrder = sortColumn === columnIndex ? !sortOrder : true;
    setSortColumn(columnIndex);
    setSortOrder(newOrder);

    const sortedData = [...filteredData.slice(1)].sort((a, b) => {
      if (a[columnIndex] < b[columnIndex]) return newOrder ? -1 : 1;
      if (a[columnIndex] > b[columnIndex]) return newOrder ? 1 : -1;
      return 0;
    });
    setFilteredData([filteredData[0], ...sortedData]);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, startDate, endDate);
  };

  const applyFilters = (search: string, start: string, end: string) => {
    let filtered = logData;

    if (search) {
      filtered = filtered.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (start || end) {
      const startTime = start ? new Date(start).getTime() : null;
      const endTime = end ? new Date(end).getTime() : null;

      filtered = filtered.filter((row, index) => {
        if (index === 0) return true; // Keep headers
        const logTimestamp = new Date(row[0]).getTime(); // Assuming column 0 contains timestamps
        return (
          (!startTime || logTimestamp >= startTime) &&
          (!endTime || logTimestamp <= endTime)
        );
      });
    }

    setFilteredData(filtered.length > 1 ? [logData[0], ...filtered] : []);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-6">{t("logheader")}</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Log File Selection Dropdown */}
      <FormControl fullWidth className="mb-4">
        <Select
          value={selectedCsv}
          onChange={(e) => setSelectedCsv(e.target.value)}
          disabled={csvFiles.length === 0}
        >
          {csvFiles.map((csv) => (
            <MenuItem key={csv} value={csv}>
              {csv}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Search & Date Range */}
      <div className="flex space-x-4 mb-4 mt-4">
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
        />
        <TextField
          label="Start Date"
          type="date"
          name="startDate"
          value={startDate}
          onChange={(e) => {
            const value = e.target.value;
            setStartDate(value);
            applyFilters(searchTerm, value, endDate); // Apply filters with updated start date
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: endDate || undefined, // Prevent selecting a start date after the end date
          }}
        />
        <TextField
          label="End Date"
          type="date"
          name="endDate"
          value={endDate}
          onChange={(e) => {
            const value = e.target.value;
            setEndDate(value);
            applyFilters(searchTerm, startDate, value); // Apply filters with updated end date
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: startDate || undefined, // Prevent selecting an end date before the start date
          }}
        />
      </div>

      {/* Display Logs as a Table with Sorting */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
        <h3 className="text-lg mb-2">Logs</h3>
        {filteredData.length > 1 ? (
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                {filteredData[0].map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 dark:border-gray-600 p-2 text-left cursor-pointer"
                    onClick={() => handleSort(index)}
                  >
                    {header}{" "}
                    {sortColumn === index ? (sortOrder ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 dark:border-gray-600 p-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No log content available</p>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
