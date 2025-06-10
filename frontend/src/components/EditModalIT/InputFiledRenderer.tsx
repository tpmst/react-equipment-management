import React, { useState } from "react";
import Dropdown from "./Dropdown";
import DatePickerField from "../DatePickerField";
import { useSettings } from "../../context/SettingsContex";
import { API_BASE_URL } from "../../security/config";
import axios from "axios";
import { t } from "i18next";

interface Props {
  field: string;
  index: number;
  formData: string[];
  setFormData: React.Dispatch<React.SetStateAction<string[]>>;
  csvData: string[][];
  selectableDevices: string[];
}

const InputFieldRenderer: React.FC<Props> = ({
  field,
  index,
  formData,
  setFormData,
  csvData,
  selectableDevices,
}) => {
  const [filteredDevices, setFilteredDevices] = useState(selectableDevices);
  const [isDevicesDropdownOpen, setIsDevicesDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings(); // Access settings context

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Update input value dynamically based on index
  const handleInputChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = value;
      console.log(updatedData);
      return updatedData;
    });
  };

  // Autofill related fields based on the current input value
  const handleAutofill = (
    value: string,
    sourceIndex: number,
    mappings: { [key: number]: number }
  ) => {
    const updatedData = [...formData];
    const matchingRow = csvData.find((row) => row[sourceIndex] === value);

    if (matchingRow) {
      Object.entries(mappings).forEach(([sourceIdx, targetIdx]) => {
        updatedData[Number(targetIdx)] = matchingRow[Number(sourceIdx)];
      });
      setFormData(updatedData);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    uploadEndpoint: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_BASE_URL}${uploadEndpoint}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const uploadedFileName = response.data.fileName || file.name;
        handleInputChange(index, uploadedFileName);
        console.log(`Uploaded file: ${uploadedFileName}`);
      } catch (err: any) {
        setError(err.response?.data?.message || "File upload failed.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileDownload = async (downloadEndpoint: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}${downloadEndpoint}/${formData[index]}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", formData[index]);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError("File download failed.");
    }
  };

  const handleFileView = async (downloadEndpoint: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}${downloadEndpoint}/${formData[index]}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (err) {
      setError("File view failed.");
    }
  };

  const translatedCases = {
    status: t("csvheader.status"),
    id: t("csvheader.id"),
    billnum: t("csvheader.billnum"),
    orderlink: t("csvheader.orderlink"),
    amount: t("csvheader.amount"),
    unitprice: t("csvheader.unitprice"),
    type: t("csvheader.type"),
    productname: t("csvheader.productname"),
    condition: t("csvheader.condition"),
    orderdate: t("csvheader.orderdate"),
    orderedby: t("csvheader.orderedby"),
    department: t("csvheader.department"),
    orderedfor: t("csvheader.orderedfor"),
    investmentrequest: t("csvheader.investmentrequest"),
    invoicefile: t("csvheader.invoicefile"),
    purchaseoption: t("csvheader.purchaseoption"),
    cancellation: t("csvheader.cancellation"),
  };

  // Render fields based on field type
  switch (field) {
    case translatedCases.orderdate:
      return (
        <DatePickerField
          value={formData[index]}
          onChange={(date) => handleInputChange(index, date)}
        />
      );

    case translatedCases.productname:
      return (
        <Dropdown
          value={formData[index]}
          options={filteredDevices}
          isOpen={isDevicesDropdownOpen}
          onInputChange={(value) => {
            handleInputChange(index, value);
            const filtered = selectableDevices.filter((device) =>
              device.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDevices(filtered);
            setIsDevicesDropdownOpen(true);
          }}
          onSelect={(value) => {
            handleInputChange(index, value);
            handleAutofill(value, 5, {
              5: 5, // Match Produktbezeichnung
              4: 4, // Autofill Hard/Software
              6: 6, // Autofill Zustand
              3: 3, // Autofill Preis
            });
            setIsDevicesDropdownOpen(false); // Close dropdown after selection
          }}
        />
      );

    case translatedCases.orderedby:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(index, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {!formData[index] && <option value="">Bestellt von</option>}
          {settings.orderedBy?.map((person) => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>
      );

    case translatedCases.orderedfor:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(index, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {!formData[index] && <option value=""></option>}
          {settings.departments?.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      );

    case translatedCases.condition:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(index, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {!formData[index] && <option value=""></option>}
          {settings.conditions?.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
      );

    case translatedCases.type:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(index, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {!formData[index] && <option value=""></option>}
          {settings.itCategories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      );

    case translatedCases.invoicefile:
    case translatedCases.investmentrequest: {
      const uploadEndpoint =
        field === translatedCases.invoicefile
          ? "/upload-rechnungen"
          : "/upload-invest";
      const downloadEndpoint =
        field === translatedCases.invoicefile
          ? "/download-rechnungen"
          : "/download-invest";

      return (
        <div className="file-upload-field">
          <input
            type="file"
            onChange={(event) => handleFileUpload(event, uploadEndpoint)}
            className="hidden"
            id={`file-upload-${index}`}
          />
          <div className="flex items-center space-x-4">
            <label
              htmlFor={`file-upload-${index}`}
              className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              {isUploading ? "Uploading..." : t(`buttons.upload`)}
            </label>
            {formData[index] && (
              <>
                <button
                  onClick={() => handleFileDownload(downloadEndpoint)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download File
                </button>
                <button
                  onClick={() => handleFileView(downloadEndpoint)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  View PDF
                </button>
              </>
            )}
          </div>
          {formData[index] && (
            <p className="mt-2 text-sm text-gray-600">
              File: {formData[index]}
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    case translatedCases.status:
      return (
        <div className="flex items-center space-x-8">
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`}
              value="1"
              checked={formData[index] === "1"}
              onChange={() => handleInputChange(index, "1")}
              className="w-6 h-6 accent-blue-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.toorder")}
            </span>
          </label>
          {/*bestellt */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`}
              value="2"
              checked={formData[index] === "2"}
              onChange={() => handleInputChange(index, "2")}
              className="w-6 h-6 accent-gray-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.ordered")}
            </span>
          </label>
          {/* Geliefert */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`} // Ensure unique group name
              value="3"
              checked={formData[index] === "3"}
              onChange={() => handleInputChange(index, "3")}
              className="w-6 h-6 accent-yellow-500" // Bigger input with custom color
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.delivered")}
            </span>
          </label>

          {/* Aufgebaut */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`}
              value="4"
              checked={formData[index] === "4"}
              onChange={() => handleInputChange(index, "4")}
              className="w-6 h-6 accent-green-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.deployed")}
            </span>
          </label>

          {/* Abgebrochen */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`}
              value="5"
              checked={formData[index] === "5"}
              onChange={() => handleInputChange(index, "5")}
              className="w-6 h-6 accent-red-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.cancel")}
            </span>
          </label>
        </div>
      );

    case translatedCases.purchaseoption:
      return (
        <div className="flex items-center space-x-6">
          {/* Input Field */}
          <input
            type="text"
            value={formData[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-32 p-2 border border-gray-300 rounded"
          />

          {/* Radio Buttons */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Row 1 */}
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`status-${13}`}
                value="1"
                checked={formData[13] === "1"}
                onChange={() => handleInputChange(13, "1")}
                className="w-5 h-5 accent-blue-500"
              />
              <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                {t("orderoption.buy")}
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`status-${13}`}
                value="2"
                checked={formData[13] === "2"}
                onChange={() => handleInputChange(13, "2")}
                className="w-5 h-5 accent-gray-500"
              />
              <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                {t("orderoption.lease")}
              </span>
            </label>

            {/* Row 2 */}
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`status-${13}`}
                value="3"
                checked={formData[13] === "3"}
                onChange={() => handleInputChange(13, "3")}
                className="w-5 h-5 accent-gray-500"
              />
              <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                {t("orderoption.lease2")}
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`status-${14}`}
                checked={/\d/.test(formData[14])}
                onChange={() => handleInputChange(14, today)}
                className="w-5 h-5 accent-red-500"
              />
              <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                {t("orderoption.cancel")}
              </span>
              {/\d/.test(formData[14]) && (
                <span className="text-lm font-light text-gray-800 dark:text-gray-200">
                  {t("orderoption.at")} {formData[14]}
                </span>
              )}
            </label>
          </div>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(index, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      );
  }
};

export default InputFieldRenderer;
