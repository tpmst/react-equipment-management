import React, { useState, useEffect } from "react";
import axios from "axios";
import EditModal from "./EditModal"; // Import the EditModal component for editing rows
import { API_BASE_URL } from "../../security/config"; // Base URL for API requests
import { t } from "i18next";
import { CheckCircle, Gavel } from "@mui/icons-material";

const PrinterList: React.FC = () => {
  const [data, setData] = useState<string[][]>([[]]); // Initialize with an empty 2D array
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenNew, setIsModalOpenNew] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [newRowData, setNewRowData] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCSVFile();
  }, [authToken]);

  const parseCSV = (text: string): string[][] => {
    const rows = text.split("\n").map((row) => row.split(";"));
    return rows;
  };

  const fetchCSVFile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    } else {
      setError("No token found, please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv/08_printers.csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "text",
        }
      );

      const parsedData = parseCSV(response.data);
      setData(parsedData);
    } catch (error: any) {
      setError(
        `Error fetching CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = data
    .slice(1) // Skip the header row
    .map((row, index) => ({ row, originalIndex: index + 1 })) // Keep track of the original index
    .filter(({ row }) =>
      row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleCellClick = (filteredRowIndex: number) => {
    const { originalIndex } = filteredData[filteredRowIndex];
    setSelectedRow(originalIndex - 1); // Adjust for header row
    setIsModalOpen(true);
  };

  const handleAddEntry = () => {
    const currentIds = data.slice(1).map((row) => parseInt(row[0]));
    const nextId = Math.max(...currentIds) + 1;

    const newEntry = Array(data[0].length).fill("");
    newEntry[0] = nextId.toString();
    setNewRowData(newEntry);
    setIsModalOpenNew(true);
    setData((prevData) => [...prevData, newEntry]);
  };

  const handleSave = async (updatedData: string[]) => {
    if (selectedRow !== null) {
      const updatedRows = [...data];
      updatedRows[selectedRow + 1] = updatedData; // Adjust for header row

      setData(updatedRows);

      try {
        await axios.post(
          `${API_BASE_URL}/update-csv-klein/08_printers.csv`,
          { rowIndex: selectedRow, updatedData },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        await fetchCSVFile();
      } catch (error: any) {
        setError(
          `Error saving CSV file: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleAdd = async (newData: string[]) => {
    try {
      setData((prevData) => [...prevData, newData]);

      await axios.post(
        `${API_BASE_URL}/update-csv-klein/08_printers.csv`,
        { rowIndex: -1, updatedData: newData },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      await fetchCSVFile();
    } catch (error: any) {
      setError(
        `Error adding to CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="px-4 py-2 border rounded w-full"
        />
        <button
          onClick={handleAddEntry}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Entry
        </button>
      </div>

      <div className="overflow-auto h-[80vh] w-full border border-gray-300">
        <table className="min-w-full">
          <thead>
            <tr>
              {/* Status column header */}
              <th className="px-4 py-2 bg-[#cccabc] border sticky top-0 dark:text-gray-100 dark:bg-gray-700 w-10">
                {/* Optionally, an icon or just empty */}
              </th>
              {data[0]?.slice(0, 10).map((col, index) => (
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
                {/* Status icon column */}
                <td className="px-4 py-2 border bg-[#e9e7d8] text-center align-middle dark:bg-gray-600">
                  {row[6] === "Gekündigt" ? (
                    <Gavel style={{ fontSize: "40px", color: "#423e3e" }} />
                  ) : (row[8] &&
                      row[8].trim() !== "" &&
                      row[9] &&
                      row[9].trim() !== "") ||
                    (((row[8] && row[8].trim() !== "") ||
                      (row[9] && row[9].trim() !== "")) &&
                      row[10] === "1") ? (
                    <CheckCircle
                      style={{ fontSize: "40px", color: "#10b981" }}
                    />
                  ) : (
                    <span title="No Status" className="text-gray-400 text-lg">
                      —
                    </span>
                  )}
                </td>
                {/* Original columns */}
                {row.slice(0, 10).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 border bg-[#e9e7d8] hover:bg-[#d1cfc1] text-black dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
                  >
                    {/* Truncate the last three columns to 10 characters */}
                    {cellIndex >= 7
                      ? cell.length > 10
                        ? `${cell.slice(0, 10)}...`
                        : cell
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCSVFile();
        }}
        data={selectedRow !== null ? data[selectedRow + 1] : []} // Adjust for header row
        onSave={handleSave}
      />

      <EditModal
        isOpen={isModalOpenNew}
        onClose={() => {
          setIsModalOpenNew(false);
          fetchCSVFile();
        }}
        data={newRowData || []}
        onSave={handleAdd}
      />
    </div>
  );
};

export default PrinterList;
