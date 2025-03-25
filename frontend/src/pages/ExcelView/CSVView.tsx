import React, { useState, useEffect } from "react";
import axios from "axios";
import EditModal from "./EditModal"; // Import the EditModal component for editing rows
import { API_BASE_URL } from "../../security/config"; // Base URL for API requests
import { t } from "i18next";

// CSVViewer component for displaying and editing CSV data
const CSVViewer: React.FC = () => {
  // State to store CSV data, error messages, authentication token, search term, modal visibility, and devices
  const [data, setData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectableDevices, setSelectableDevices] = useState<string[]>([]);
  // State to hold all unique devices

  // Effect hook to fetch authentication token and CSV data on component mount
  useEffect(() => {
    fetchCSVFile(); // Call the function to fetch CSV data
  }, [authToken]); // Re-run the effect if authToken changes

  // Function to parse CSV data into a 2D array of strings
  const parseCSV = (text: string): string[][] => {
    const rows = text.split("\n").map((row) => row.split(";"));
    return rows;
  };

  // Function to extract unique devices from a specific column in the CSV data
  const extractUniqueDevices = (
    data: string[][],
    columnIndex: number
  ): string[] => {
    const deviceSet = new Set<string>(); // Use a set to store unique devices
    data.slice(1).forEach((row) => {
      const device = row[columnIndex];
      if (device) {
        deviceSet.add(device);
      }
    });
    return Array.from(deviceSet); // Convert set back to an array
  };

  const fetchCSVFile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token); // Token im Zustand speichern
    } else {
      setError("No token found, please log in."); // Fehler setzen, wenn kein Token gefunden wird
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv/01_it-beschaffung.csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "text", // CSV-Daten als Text abrufen
        }
      );

      const parsedData = parseCSV(response.data); // CSV-Daten parsen
      setData(parsedData); // Geparste Daten im Zustand speichern

      // Einzigartige Geräte aus der Spalte "Bezeichnung des Produktes" (Index 5) extrahieren
      const devices = extractUniqueDevices(parsedData, 5);
      setSelectableDevices(devices);
    } catch (error: any) {
      setError(
        `Error fetching CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle cell click to open the edit modal for the selected row
  const handleCellClick = (filteredRowIndex: number) => {
    const { originalIndex } = filteredData[filteredRowIndex];
    setSelectedRow(originalIndex); // Speichern Sie den ursprünglichen Index
    setIsModalOpen(true);
  };

  // Handle adding a new entry to the CSV data
  const handleAddEntry = async () => {
    const currentIds = data.slice(1).map((row) => parseInt(row[0])); // IDs aus der ersten Spalte extrahieren
    const nextId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1; // Nächste ID berechnen

    const newEntry = Array(data[0]?.length).fill(""); // Leere Zeile erstellen
    newEntry[0] = nextId.toString(); // ID in die erste Spalte einfügen

    setSelectedRow(data.length); // Neue Zeile auswählen
    setIsModalOpen(true); // Modal öffnen
    setData((prevData) => [...prevData, newEntry]); // Neue Zeile zu den Daten hinzufügen
  };

  // Handle saving the updated row data
  const handleSave = async (updatedData: string[]) => {
    if (selectedRow) {
      const updatedRows = [...data];
      updatedRows[selectedRow] = updatedData; // Aktualisiere die ausgewählte Zeile
      console.log(selectedRow);
      try {
        await axios.post(
          `${API_BASE_URL}/update-csv/01_it-beschaffung.csv`,
          {
            rowIndex: selectedRow, // Sende den tatsächlichen Index der Zeile
            updatedData,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        await fetchCSVFile(); // Aktualisierte Daten erneut laden
      } catch (error: any) {
        setError(
          `Error updating CSV file: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  // Filter the data based on the search term (searches all columns)
  const isRowValid = (row: string[]): boolean => {
    const hasOnlyID =
      row[0] && row.slice(1).every((cell) => cell.trim() === "");
    const isEmptyRow = row.every((cell) => cell.trim() === "");
    return !hasOnlyID && !isEmptyRow;
  };

  const filteredData = searchTerm
    ? data
        .map((row, index) => ({ row, originalIndex: index })) // Behalte den tatsächlichen Index bei (inkl. Header)
        .slice(1) // Überspringe die Header-Zeile für die Anzeige
        .filter(
          ({ row }) =>
            row.some((cell) =>
              cell.toLowerCase().includes(searchTerm.toLowerCase())
            ) && isRowValid(row)
        )
    : data
        .map((row, index) => ({ row, originalIndex: index })) // Behalte den tatsächlichen Index bei (inkl. Header)
        .slice(1) // Überspringe die Header-Zeile für die Anzeige
        .filter(({ row }) => isRowValid(row));

  return (
    <div className="p-4">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="px-4 bg-white text-black-200 py-2 border rounded w-full dark:bg-[#1e293b]"
        />
        <button
          onClick={handleAddEntry}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Entry
        </button>
      </div>

      {/* Table with scroll and highlight */}
      <div className="overflow-auto bg-[#e9e7d8] h-[80vh] w-full border border-gray-300 dark:bg-[#1e293b]">
        <table className="min-w-full bg-white dark:bg-[#1e293b]">
          <thead>
            <tr>
              {data[0]
                ?.filter((_, index) => index !== 11) // Exclude column 11
                .map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 bg-[#cccabc] border sticky top-0 dark:text-gray-100 dark:bg-gray-700"
                  >
                    {t(`csvheader.${col}`)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(({ row }, rowIndex) => (
              <tr
                key={rowIndex}
                className="cursor-pointer"
                onClick={() => handleCellClick(rowIndex)}
              >
                {row
                  .filter((_, cellIndex) => cellIndex !== 11) // Exclude column 11
                  .map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2 border bg-[#e9e7d8] hover:bg-[#d1cfc1] text-black dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100`}
                    >
                      {cellIndex === 10 ? t(`${cell}`) : cell}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={
          selectedRow !== null && data[selectedRow]
            ? data[selectedRow]
            : Array(data[0]?.length).fill("")
        } // Sicherstellen, dass ein leeres Array übergeben wird
        onSave={handleSave}
        allDevices={selectableDevices}
      />
    </div>
  );
};

export default CSVViewer;
