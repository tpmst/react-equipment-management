import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import EditModalEinkauf from "../../components/EditModal/EditModalEinkauf";
import {
  CheckCircle,
  LocalShipping,
  Cancel,
  MarkunreadMailbox,
  AddShoppingCart,
  Gavel,
} from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Import copy icon
import { useTheme } from "../../context/themeContext";
import { t } from "i18next";

const CSVViewEinkauf: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [newString, setNewEntry] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenNew, setIsModalOpenNew] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selcetableUsernames, setSelectableUsernames] = useState<string[]>([]);
  const [selcetableDevices, setSelectableDevices] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    columnIndex: number;
    direction: "asc" | "desc";
  } | null>(null);

  const { theme } = useTheme();
  const textColor = theme === "light" ? "#444444" : "#ffffff";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    } else {
      setError("No token found, please log in.");
      return;
    }

    const fetchCSVFile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/download-csv/03_it-einkauf.csv`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "text",
          }
        );

        const parsedData = parseCSV(response.data);
        setData(parsedData);

        const usernames = extractUniqueDevices(parsedData, 11);
        setSelectableUsernames(usernames);

        const devices = extractUniqueDevices(parsedData, 6);
        setSelectableDevices(devices);
      } catch (error: any) {
        setError(
          `Error fetching CSV file: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    fetchCSVFile();
  }, [authToken]);

  const fetchCSVFile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv/03_it-einkauf.csv`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "text",
        }
      );

      const parsedData = parseCSV(response.data);
      setData(parsedData);

      const usernames = extractUniqueDevices(parsedData, 11);
      setSelectableUsernames(usernames);

      const devices = extractUniqueDevices(parsedData, 6);
      setSelectableDevices(devices);
    } catch (error: any) {
      setError(
        `Error fetching CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  //handle copy to clipboard
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("Copied using fallback method");
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

  const parseCSV = (text: string): string[][] => {
    const rows = text.split("\n").map((row) => row.split(";"));
    return rows;
  };

  const extractUniqueDevices = (
    data: string[][],
    columnIndex: number
  ): string[] => {
    const deviceSet = new Set<string>();
    data.slice(1).forEach((row) => {
      const device = row[columnIndex].trim();
      if (device) {
        deviceSet.add(device);
      }
    });
    return Array.from(deviceSet);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCellClick = (filteredRowIndex: number) => {
    const { originalIndex } = filteredData[filteredRowIndex];
    setSelectedRow(originalIndex - 1); // Speichern Sie den ursprünglichen Index
    setIsModalOpen(true);
  };

  const handleAddEntry = () => {
    const currentIds = data.slice(1).map((row) => parseInt(row[0]));
    const nextId = Math.max(...currentIds) + 1;

    const newEntry = Array(data[0].length).fill("");
    newEntry[0] = nextId.toString();
    setNewEntry(newEntry);
    setSelectedRow(data.length - 1);
    setIsModalOpenNew(true);
    setData((prevData) => [...prevData, newEntry]);
  };

  const handleSave = async (updatedData: string[]) => {
    if (selectedRow !== null) {
      // Find the original index in `data` based on `sortedData[selectedRow]`
      const originalIndex = data.findIndex(
        (row) => row[0] === sortedData[selectedRow][0] // Use a unique identifier like the ID column
      );

      if (originalIndex !== -1) {
        // Update the original row in `data`
        const updatedRows = [...data];
        updatedRows[originalIndex] = updatedData;

        // Update the state with the modified data
        setData(updatedRows);

        // Recalculate the sorted data based on updated data
        let recalculateSortedData = [...updatedRows.slice(1)];
        if (sortConfig) {
          recalculateSortedData.sort((a, b) => {
            const aValue =
              sortConfig.columnIndex === -1
                ? a[14]
                : a[sortConfig.columnIndex] || "";
            const bValue =
              sortConfig.columnIndex === -1
                ? b[14]
                : b[sortConfig.columnIndex] || "";
            return sortConfig.direction === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          });
        }
        try {
          // Update the server
          await axios.post(
            `${API_BASE_URL}/update-csv-klein/03_it-einkauf.csv`,
            { rowIndex: originalIndex - 1, updatedData }, // Adjust for header row
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
        } catch (error: any) {
          setError(
            `Error updating CSV file: ${
              error.response?.data?.message || error.message
            }`
          );
        }
      } else {
        console.error("Original index not found in data!");
      }
    }
  };

  const handleAdd = async (newData: string[]) => {
    try {
      // Add new row to the local state
      setData((prevData) => [...prevData, newData]);

      // Send new row to the server
      await axios.post(
        `${API_BASE_URL}/update-csv-klein/03_it-einkauf.csv`,
        { rowIndex: -1, updatedData: newData }, // rowIndex -1 means "add new row"
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Fetch updated CSV data after adding a new row
      await fetchCSVFile();
    } catch (error: any) {
      setError(
        `Error adding to CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleSort = (columnIndex: number) => {
    // Only allow sorting for Status (-1) and ID (0)
    if (columnIndex !== -1 && columnIndex !== 0) return;

    setSortConfig((prevConfig) => {
      const direction =
        prevConfig?.columnIndex === columnIndex &&
        prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { columnIndex, direction };
    });
  };

  const getStatusIcon = (status: string, secondValue: string) => {
    // If the second value contains a number, always return a specific icon
    if (/\d/.test(secondValue)) {
      return <Gavel style={{ fontSize: "40px", color: "#f50f0b" }} />;
    }

    // Otherwise, check status normally
    switch (status.toLowerCase()) {
      case "5":
        return <Cancel style={{ fontSize: "40px", color: "#f50f0b" }} />;
      case "3":
        return (
          <MarkunreadMailbox style={{ fontSize: "40px", color: "orange" }} />
        );
      case "4":
        return <CheckCircle style={{ fontSize: "40px", color: "#10b981" }} />;
      case "1":
        return (
          <AddShoppingCart style={{ fontSize: "40px", color: "#0b80f5" }} />
        );
      default:
        return <LocalShipping style={{ fontSize: "40px", color: textColor }} />;
    }
  };

  let sortedData = [...data.slice(1)];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aValue =
        sortConfig.columnIndex === -1 ? a[14] : a[sortConfig.columnIndex] || "";
      const bValue =
        sortConfig.columnIndex === -1 ? b[14] : b[sortConfig.columnIndex] || "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }

  const filteredData = sortedData
    .map((row, index) => ({ row, originalIndex: index + 1 })) // +1 wegen Header
    .filter(({ row }) => {
      const rowIncludesSearchTerm = row.some((cell) =>
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const statusMatchesSearchTerm = row[14]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return rowIncludesSearchTerm || statusMatchesSearchTerm;
    });

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
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
              <th
                onClick={() => handleSort(-1)}
                className="px-4 py-2 bg-[#cccabc] border sticky top-0 dark:text-gray-100 dark:bg-gray-700 cursor-pointer"
              >
                Status{" "}
                {sortConfig?.columnIndex === -1 &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              {data[0]?.slice(0, 14).map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className="px-4 py-2 bg-[#cccabc] border sticky top-0 dark:text-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  {t(`csvheader.${col}`)}{" "}
                  {sortConfig?.columnIndex === index &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
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
                <td className="border bg-[#e9e7d8] dark:bg-gray-600 dark:text-gray-100 text-center">
                  {getStatusIcon(row[14] || "", row[16] || "")}
                </td>
                {row.slice(0, 14).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 border bg-[#e9e7d8] hover:bg-[#d1cfc1] text-black dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {cell.length > 25 ? `${cell.slice(0, 25)}...` : cell}
                      </span>
                      {cellIndex === 2 && cell.trim() !== "" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fallbackCopyToClipboard(cell);
                          }}
                          className="p-1 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                          title="Copy to clipboard"
                        >
                          <ContentCopyIcon className="text-gray-500 dark:text-gray-300 w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModalEinkauf
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={
          selectedRow !== null
            ? sortedData[selectedRow] // Use the sorted view's row
            : []
        }
        onSave={handleSave}
        csvData={sortedData}
        selctableUsernames={selcetableUsernames}
        selectableDevices={selcetableDevices}
      />

      <EditModalEinkauf
        isOpen={isModalOpenNew}
        onClose={() => {
          setIsModalOpenNew(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={newString}
        onSave={handleAdd}
        csvData={data}
        selctableUsernames={selcetableUsernames}
        selectableDevices={selcetableDevices}
      />
    </div>
  );
};

export default CSVViewEinkauf;
