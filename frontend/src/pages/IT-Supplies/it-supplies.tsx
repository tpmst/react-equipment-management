import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import EditModalIT from "../../components/EditModalIT/EditModalIT";
import {
  CheckCircle,
  LocalShipping,
  Cancel,
  MarkunreadMailbox,
  AddShoppingCart,
  Gavel,
} from "@mui/icons-material";
import { useTheme } from "../../context/themeContext";
import { t } from "i18next";

const CSV_ITS: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newString, setNewEntry] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenNew, setIsModalOpenNew] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selcetableDevices, setSelectableDevices] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    columnIndex: number;
    direction: "asc" | "desc";
  } | null>(null);

  const { theme } = useTheme();
  const textColor = theme === "light" ? "#444444" : "#ffffff";

  useEffect(() => {
    fetchCSVFile();
  }, [authToken]);

  const fetchCSVFile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    } else {
      setError("No token found, please log in.");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv/07_it-geraete.csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "text",
        }
      );

      const parsedData = parseCSV(response.data);
      setData(parsedData);
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
    setSelectedRow(originalIndex); // -1, um den Header zu berücksichtigen
    setIsModalOpen(true);
  };

  const handleAddEntry = async () => {
    const currentIds = data.slice(1).map((row) => parseInt(row[0]));
    const nextId = Math.max(...currentIds) + 1;

    const newEntry = Array(data[0].length).fill("");
    newEntry[0] = nextId.toString();
    setNewEntry(newEntry);
    setSelectedRow(data.length - 1);
    setIsModalOpenNew(true);
    setData((prevData) => [...prevData, newEntry]);
    await fetchCSVFile();
  };

  const handleSave = async (updatedData: string[]) => {
    if (selectedRow !== null) {
      const updatedRows = [...data];
      updatedRows[selectedRow] = updatedData; // Verwenden Sie den `selectedRow`-Index direkt
      setData(updatedRows); // Aktualisieren Sie den Zustand

      try {
        // Senden Sie die Änderungen an den Server
        await axios.post(
          `${API_BASE_URL}/update-csv-klein/07_it-geraete.csv`,
          { rowIndex: selectedRow - 1, updatedData }, // -1, um die Header-Zeile zu überspringen
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
    }
  };

  const handleAdd = async (newData: string[]) => {
    try {
      // Add new row to the local state
      setData((prevData) => [...prevData, newData]);

      // Send new row to the server
      await axios.post(
        `${API_BASE_URL}/update-csv-klein/07_it-geraete.csv`, // Endpoint remains the same
        { rowIndex: -1, updatedData: newData }, // rowIndex -1 means "add new row"
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      fetchCSVFile();
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
        sortConfig.columnIndex === -1 ? a[12] : a[sortConfig.columnIndex] || "";
      const bValue =
        sortConfig.columnIndex === -1 ? b[12] : b[sortConfig.columnIndex] || "";
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

      const statusMatchesSearchTerm = row[12]
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
              {data[0]?.slice(0, 12).map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className="px-4 py-2 bg-[#cccabc] border sticky top-0 dark:text-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  {t(`csvheader.${col}`)}
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
                  {getStatusIcon(row[12] || "", row[14] || "")}
                </td>
                {row.slice(0, 12).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 border bg-[#e9e7d8] hover:bg-[#d1cfc1] text-black dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
                  >
                    {cell.length > 25 ? `${cell.slice(0, 25)}...` : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModalIT
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={
          selectedRow !== null
            ? data[selectedRow] // Verwenden Sie den ursprünglichen Index
            : []
        }
        onSave={handleSave}
        csvData={data}
        selectableDevices={selcetableDevices}
      />
      <EditModalIT
        isOpen={isModalOpenNew}
        onClose={() => {
          setIsModalOpenNew(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={newString}
        onSave={handleAdd}
        csvData={data}
        selectableDevices={selcetableDevices}
      />
    </div>
  );
};

export default CSV_ITS;
