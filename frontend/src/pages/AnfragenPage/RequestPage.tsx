import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import {
  PanoramaFishEye,
  PauseCircleOutline,
  TaskAlt,
  HighlightOff,
  MoreHoriz,
} from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Import copy icon
import { t } from "i18next";
import EditModalKlein from "../../components/EditModalRequests/EditModalKlein";

const RequestView: React.FC = ({}) => {
  const [data, setData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpenNew, setIsModalOpenNew] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    columnIndex: number;
    direction: "asc" | "desc";
  } | null>(null);

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
          `${API_BASE_URL}/download-csv/09_anfragen.csv`,
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
      }
    };

    fetchCSVFile();
  }, [authToken]);

  const fetchCSVFile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv/09_anfragen.csv`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCellClick = (filteredRowIndex: number) => {
    const { originalIndex } = filteredData[filteredRowIndex];
    setSelectedRow(originalIndex); // Speichern Sie den ursprünglichen Index
    setIsModalOpenNew(true);
  };

  const handleSave = async (updatedData: string[]) => {
    if (selectedRow !== null) {
      // Find the original index in `data` based on `sortedData[selectedRow]`
      const originalIndex = selectedRow;
      console.log("Saving data for row:", selectedRow, updatedData);
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
                ? a[8]
                : a[sortConfig.columnIndex] || "";
            const bValue =
              sortConfig.columnIndex === -1
                ? b[8]
                : b[sortConfig.columnIndex] || "";
            return sortConfig.direction === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          });
        }
        try {
          // Update the server
          await axios.post(
            `${API_BASE_URL}/update-csv-klein/09_anfragen.csv`,
            { rowIndex: originalIndex - 1, updatedData }, // Adjust for header row
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          await fetchCSVFile(); // CSV-Daten erneut laden
        } catch (error: any) {
          console.error("Error updating CSV file:", error);
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

  const getStatusIcon = (status: string) => {
    // Otherwise, check status normally
    switch (status.toLowerCase()) {
      case "5":
        return (
          <div className="bg-red-500 border rounded-full w-10 h-10 flex items-center justify-center">
            <HighlightOff className="m-2" />
          </div>
        );
      case "4":
      case "6":
        return (
          <div className="bg-green-500 border rounded-full w-10 h-10 flex items-center justify-center">
            <TaskAlt className="m-2" />
          </div>
        );
      case "3":
        return (
          <div className="bg-blue-500 border rounded-full w-10 h-10 flex items-center justify-center relative">
            <PanoramaFishEye className="m-2 absolute left-0 top-0 right-0 bottom-0 mx-auto my-auto " />
            <MoreHoriz
              className="m-2 absolute left-0 top-0 right-0 bottom-0 mx-auto my-auto"
              fontSize="small"
            />
          </div>
        );
      case "2":
        return (
          <div className="bg-orange-500 border rounded-full w-10 h-10 flex items-center justify-center">
            <PauseCircleOutline className="m-2" />
          </div>
        );
      default:
        return (
          <div className="bg-blue-500 border rounded-full w-10 h-10 flex items-center justify-center">
            <PanoramaFishEye className="m-2" />
          </div>
        );
    }
  };

  let sortedData = [...data.slice(1)];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aValue =
        sortConfig.columnIndex === -1
          ? String(a[8] ?? "")
          : String(a[sortConfig.columnIndex] ?? "");
      const bValue =
        sortConfig.columnIndex === -1
          ? String(b[8] ?? "")
          : String(b[sortConfig.columnIndex] ?? "");
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

      const statusMatchesSearchTerm = row[8]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return rowIncludesSearchTerm || statusMatchesSearchTerm;
    });

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Extract headers from the first row of data
  const headers = data[0] || [];

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
              {data[0]?.slice(0, 8).map((col, index) => (
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
                <td className="border bg-[#e9e7d8] dark:bg-gray-600 dark:text-gray-100 justify-center flex items-center px-4 py-2">
                  {getStatusIcon(row[8] || "")}
                </td>
                {row.slice(0, 8).map((cell, cellIndex) => (
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
      <EditModalKlein
        isOpen={isModalOpenNew}
        onClose={() => {
          setIsModalOpenNew(false);
          fetchCSVFile(); // CSV-Daten erneut laden
        }}
        data={selectedRow !== null ? data[selectedRow] : []} // Kein +1 mehr nötig, da `selectedRow` jetzt korrekt ist
        onSave={handleSave}
        headers={headers} // <--- hinzufügen
      />
    </div>
  );
};

export default RequestView;
