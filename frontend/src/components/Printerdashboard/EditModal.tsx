import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker"; // Import the date picker
import "react-datepicker/dist/react-datepicker.css"; // Import the date picker styles
import { API_BASE_URL } from "../../security/config";
import { useSettings } from "../../context/SettingsContex";
import { t } from "i18next";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onSave: (updatedData: string[]) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<string[]>([]);
  const { settings } = useSettings(); // State for managing errors
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setFormData([...data]); // Initialize formData with the passed data
    }
  }, [data]);

  const handleInputChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = value; // Update the specific field
      return updatedData;
    });
  };

  const handleDateChange = (index: number, date: Date | null) => {
    if (date) {
      // Convert the date to a string in the format 'YYYY-MM-DD' without timezone issues
      const isoDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      )
        .toISOString()
        .split("T")[0];
      handleInputChange(index, isoDate);
    } else {
      handleInputChange(index, ""); // Handle the case where the date is null
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    uploadEndpoint: string,
    folder: string
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
            params: {
              folder: folder,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const uploadedFileName = response.data.fileName || file.name;
        if (folder === "buy-rent") {
          handleInputChange(8, uploadedFileName);
        }
        if (folder === "maintanance") {
          handleInputChange(9, uploadedFileName);
        }
        console.log(`Uploaded file: ${uploadedFileName}`);
      } catch (err: any) {
        setError(err.response?.data?.message || "File upload failed.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileDownload = async (
    downloadEndpoint: string,
    fileName: string,
    folder: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}${downloadEndpoint}/${fileName}`,
        {
          params: {
            folder: folder,
          },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError("File download failed.");
    }
  };

  if (!isOpen) return null;

  const translatedFields = {
    id: t("csvheader.id"),
    name: t("csvheader.name"),
    serialnumber: t("csvheader.serialnumber"),
    seller: t("csvheader.seller"),
    department: t("csvheader.department"),
    purchaseprice: t("csvheader.purchaseprice"),
    purchaseoption: t("csvheader.purchaseoption"),
    canceldate: t("csvheader.canceldate"),
    contractfile: t("csvheader.contractfile"),
    maintanacefile: t("csvheader.maintanacefile"),
  };

  const uploadEndpoint = "/upload-contract";
  const downloadEndpoint = "/download-contract";

  const renderInputField = (field: string, index: number) => {
    switch (field) {
      case translatedFields.id:
        // ID-Feld schreibgeschützt machen
        return (
          <input
            type="text"
            value={formData[index] || ""}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        );
      case translatedFields.canceldate:
        // Add a date picker for the cancel date
        return (
          <DatePicker
            selected={formData[index] ? new Date(formData[index]) : null}
            onChange={(date) => handleDateChange(index, date)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border border-gray-300 rounded"
            placeholderText={t("form.placeholders.selectDate")}
          />
        );

      case translatedFields.department:
        return (
          <select
            value={formData[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {!formData[index] && (
              <option value="">{t("form.select.department")}</option>
            )}
            {settings.departments?.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        );

      case translatedFields.purchaseoption:
        return (
          <div className="flex items-center space-x-6">
            {/* Radio Buttons */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1 */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`status-${5}`}
                  value="1"
                  checked={formData[index] === "Kauf"}
                  onChange={() => handleInputChange(index, "Kauf")}
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                  {t("orderoption.buy")}
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`status-${5}`}
                  value="2"
                  checked={formData[index] === "Miete"}
                  onChange={() => handleInputChange(index, "Miete")}
                  className="w-5 h-5 accent-gray-500"
                />
                <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                  {t("orderoption.lease")}
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`status-${5}`}
                  checked={formData[index] === "Gekündigt"}
                  onChange={() => handleInputChange(index, "Gekündigt")}
                  className="w-5 h-5 accent-red-500"
                />
                <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
                  {t("orderoption.cancel")}
                </span>
              </label>
            </div>
          </div>
        );

      case translatedFields.contractfile:
        return (
          <div className="file-upload-field">
            <input
              type="file"
              onChange={(event) =>
                handleFileUpload(event, uploadEndpoint, "buy-rent")
              }
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
                <button
                  onClick={() =>
                    handleFileDownload(
                      downloadEndpoint,
                      formData[index],
                      "buy-rent"
                    )
                  }
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {t("buttons.download")}
                </button>
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

      case translatedFields.maintanacefile:
        return (
          <div className="file-upload-field">
            <input
              type="file"
              onChange={(event) =>
                handleFileUpload(event, uploadEndpoint, "maintanance")
              }
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
                <button
                  onClick={() =>
                    handleFileDownload(
                      downloadEndpoint,
                      formData[index],
                      "maintanance"
                    )
                  }
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {t("buttons.download")}
                </button>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[100vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">{t("modal.editData")}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-2">
          {Object.values(translatedFields).map((field, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium mb-1">{field}</label>
              {renderInputField(field, index)}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end space-y-4">
          {formData[10] === "1" && (
            <div className="w-full flex justify-center">
              <div className="mb-4 p-4 bg-blue-100 text-blue-700 border border-blue-400 rounded text-lg">
                {t("modal.contractConnected")}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4 w-full">
            {formData[10] !== "1" && (
              <button
                onClick={() => handleInputChange(10, "1")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {t("buttons.connectContract")}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              {t("buttons.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
