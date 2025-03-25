import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useAuth } from "../../context/AuthenticationContext";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from "@mui/material";
import { Delete, Search } from "@mui/icons-material";

const CSVManagement: React.FC = () => {
  const { authToken } = useAuth();
  const { t } = useTranslation();

  const [csvFiles, setCsvFiles] = useState<string[]>([]);
  const [selectedCsv, setSelectedCsv] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch CSV files when component loads
  useEffect(() => {
    const fetchCsvFiles = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/list-files/csv`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCsvFiles(response.data.files);
        if (response.data.files.length > 0) {
          setSelectedCsv(response.data.files[0]);
        }
      } catch (error) {
        setError("Error fetching CSV files");
      }
    };
    fetchCsvFiles();
  }, [authToken]);

  // Handle searching inside a CSV file
  const handleSearch = async () => {
    if (!selectedCsv) {
      setError("Please select a CSV file");
      return;
    }

    if (!searchText.match(/^\d+$/)) {
      setError("Search text must be a numeric value");
      return;
    }

    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/search-csv/${selectedCsv}/${searchText}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setSearchResults(response.data.results);
    } catch (error) {
      setError("Error searching in CSV");
    }
  };

  // Handle deleting a row from CSV
  const handleDeleteRow = async () => {
    if (!selectedCsv) {
      setError("Please select a CSV file");
      return;
    }

    if (!searchText.match(/^\d+$/)) {
      setError("Search text must be a numeric value");
      return;
    }

    setError(null);
    try {
      await axios.delete(
        `${API_BASE_URL}/delete-csv-row/${selectedCsv}/${searchText}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setSearchResults([]); // Clear search results
      setError(null);
    } catch (error) {
      setError("Error deleting row from CSV");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-6">{t("filesettings.header1")}</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* CSV File Selection Dropdown */}
      <FormControl fullWidth className="mb-4">
        <InputLabel>{t("Select CSV File")}</InputLabel>
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

      {/* Search in CSV */}
      <div className="flex items-center space-x-4 mb-4">
        <TextField
          label={t("Search in CSV")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          <Search />
        </Button>
      </div>

      {/* Display Search Results */}
      {searchResults.length > 0 && (
        <div className="overflow-auto bg-white dark:bg-[#1e293b] rounded-lg shadow-md">
          <table className="min-w-full border-collapse">
            <tbody>
              {searchResults.map((row, index) => (
                <tr
                  key={index}
                  className="bg-[#e9e7d8] text-black dark:bg-gray-600 dark:text-gray-100"
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-2 border">
                      {cell}
                    </td>
                  ))}
                  <td className="p-2 border">
                    <IconButton onClick={handleDeleteRow} color="error">
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CSVManagement;
