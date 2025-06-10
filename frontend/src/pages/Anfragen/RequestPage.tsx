import { useState, useEffect } from "react";
import RequestEditModal from "./RequestForm";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useAuth } from "../../context/AuthenticationContext";
import { t } from "i18next";
import {
  MoreHoriz,
  PanoramaFishEye,
  PauseCircleOutline,
  TaskAlt,
} from "@mui/icons-material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useTranslation } from "react-i18next";

const parseCSV = (text: string): string[][] => {
  return text
    .split("\n")
    .filter((row) => row.trim() !== "")
    .map((row) => row.split(";"));
};

const AnfragePage = () => {
  const { authToken } = useAuth();
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // <--- NEU
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (authToken) {
      fetchCSVFile();
    }
    // eslint-disable-next-line
  }, [authToken]);

  // CSV laden
  const fetchCSVFile = async () => {
    setLoading(true); // <--- NEU
    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-csv-user/09_anfragen.csv`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "text",
        }
      );
      const parsedData = parseCSV(response.data);
      setData(parsedData);
      setHeaders(parsedData[0]);
      setLoading(false); // <--- NEU
    } catch (error: any) {
      setError(
        `Error fetching CSV file: ${
          error.response?.data?.message || error.message
        }`
      );
      setLoading(false); // <--- NEU
    }
  };

  // Speichern einer neuen Anfrage
  const handleAdd = async (formData: string[]) => {
    try {
      // formData ist bereits ein Array in der richtigen Reihenfolge!
      await axios.post(
        `${API_BASE_URL}/addLine-csv/09_anfragen.csv`,
        { updatedData: formData },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsModalOpen(false);
      fetchCSVFile();
    } catch (error: any) {
      setError(
        `Error saving request: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Löschen einer Anfrage
  const handleDelete = async (formData: string[], action: string) => {
    try {
      // Annahme: Die ID ist eindeutig und im gleichen Index wie im Header
      const idIndex = headers.findIndex((h) => h.toLowerCase() === "id");
      const id = formData[idIndex];
      await axios.delete(
        `${API_BASE_URL}/deleteLine-csv/09_anfragen.csv/${id}/${action}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCSVFile();
    } catch (error: any) {
      setError(
        `Error deleting request: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Checkbox-Handler
  const handleSelectRow = (rowIdx: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIdx)
        ? prev.filter((idx) => idx !== rowIdx)
        : [...prev, rowIdx]
    );
  };

  // Alle selektierten Zeilen löschen
  const handleBulkDelete = async () => {
    for (const idx of selectedRows) {
      await handleDelete(data[idx + 1], "delete"); // +1 wegen Header
    }
    setSelectedRows([]);
    fetchCSVFile();
  };

  // Alle selektierten Zeilen löschen
  const handleBulkArchvie = async () => {
    for (const idx of selectedRows) {
      await handleDelete(data[idx + 1], "archive"); // +1 wegen Header
    }
    setSelectedRows([]);
    fetchCSVFile();
  };

  // Sprachen-Handler
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
  };

  return (
    <div className="p-6">
      {/* Language Switcher oben rechts */}
      <div className="flex justify-end mb-2">
        <button
          className="px-3 py-1 mx-1 rounded border bg-white hover:bg-gray-100"
          onClick={() => changeLanguage("de")}
        >
          DE
        </button>
        <button
          className="px-3 py-1 mx-1 rounded border bg-white hover:bg-gray-100"
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>
      </div>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          // Nutze headers direkt, nicht aus State!
          setNewEntry(Array(headers.length).fill(""));
          setIsModalOpen(true);
        }}
        disabled={loading || headers.length === 0}
      >
        {t("requestpage.addrequest")}
      </button>
      <RequestEditModal
        isOpen={isModalOpen && headers.length > 0}
        onClose={() => setIsModalOpen(false)}
        data={newEntry}
        onSave={handleAdd}
        headers={headers}
      />
      <button
        className={`mx-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700`}
        onClick={fetchCSVFile}
      >
        Refresh
      </button>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mt-6 mb-2">
          {t("requestpage.myrequests")}
        </h2>
        <div className="flex space-x-2">
          <button
            className={`mb-4 px-4 py-2 rounded ${
              selectedRows.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            onClick={handleBulkDelete}
            disabled={selectedRows.length === 0}
          >
            {t("buttons.delete") || "Delete selected"}
          </button>
          <button
            className={`mb-4 px-4 py-2 rounded ${
              selectedRows.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleBulkArchvie}
            disabled={selectedRows.length === 0}
          >
            {t("buttons.archive") || "Archvie selected"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div>{t("requestpage.loading")}</div>
        ) : headers.length > 0 ? (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1"></th>
                {headers.map((col, idx) => (
                  <th key={idx} className="border px-2 py-1">
                    {t(`csvheader.${col}`) || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 1 ? (
                data.slice(1).map((row, idx) => (
                  <tr
                    key={idx}
                    className={`cursor-pointer hover:bg-blue-50 ${
                      selectedRows.includes(idx) ? "bg-blue-100" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="border px-2 py-1 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleSelectRow(idx)}
                        aria-label="Select row"
                      >
                        {selectedRows.includes(idx) ? (
                          <CheckBoxIcon className="text-blue-600" />
                        ) : (
                          <CheckBoxOutlineBlankIcon />
                        )}
                      </button>
                    </td>
                    {row.map((cell, cidx) => {
                      const isStatusCol =
                        headers[cidx].toLowerCase() === "status";
                      if (isStatusCol && cell === "1") {
                        return (
                          <td
                            key={cidx}
                            className="border px-2 py-1 text-center flex justify-center"
                          >
                            <div className="bg-blue-500 border rounded-full w-10 h-10 flex items-center justify-center">
                              <PanoramaFishEye className="m-2" />
                            </div>
                          </td>
                        );
                      }
                      if (isStatusCol && cell === "2") {
                        return (
                          <td
                            key={cidx}
                            className="border px-2 py-1 text-center flex justify-center"
                          >
                            <div className="bg-orange-500 border rounded-full w-10 h-10 flex items-center justify-center">
                              <PauseCircleOutline className="m-2" />
                            </div>
                          </td>
                        );
                      }
                      if (isStatusCol && cell === "3") {
                        return (
                          <td
                            key={cidx}
                            className="border px-2 py-1 text-center flex justify-center"
                          >
                            <div className="bg-blue-500 border rounded-full w-10 h-10 flex items-center justify-center relative">
                              <PanoramaFishEye className="m-2 absolute left-0 top-0 right-0 bottom-0 mx-auto my-auto " />
                              <MoreHoriz
                                className="m-2 absolute left-0 top-0 right-0 bottom-0 mx-auto my-auto"
                                fontSize="small"
                              />
                            </div>
                          </td>
                        );
                      }
                      if (isStatusCol && cell === "4") {
                        return (
                          <td
                            key={cidx}
                            className="border px-2 py-1 text-center flex justify-center"
                          >
                            <div className="bg-green-500 border rounded-full w-10 h-10 flex items-center justify-center">
                              <TaskAlt className="m-2" />
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={cidx} className="border px-2 py-1">
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="text-center py-4">
                    {t("requestpage.nothingfound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div>{t("requestpage.nodata")}</div>
        )}
      </div>
    </div>
  );
};

export default AnfragePage;
