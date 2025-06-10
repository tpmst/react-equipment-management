import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useSettings } from "../../context/SettingsContex";
import { t } from "i18next";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onSave: (updatedData: string[]) => void;
  allDevices: string[];
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  allDevices,
}) => {
  const [formData, setFormData] = useState<string[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<string[]>([]);
  const { settings } = useSettings(); // State for managing errors
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setFormData(data || []); // Standardwert setzen, falls `data` undefined ist
    setFilteredDevices(allDevices || []); // Standardwert setzen, falls `allDevices` undefined ist
  }, [data, allDevices]);

  const handleInputChange = (index: number, value: string) => {
    const updatedData = [...formData];
    updatedData[index] = value;
    setFormData(updatedData);

    // If the field being edited is the 'Bezeichnung des Produktes' field, filter the devices
    if (index === 7) {
      const filtered = allDevices.filter((device) =>
        device.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  };

  // Handle selecting a device from the filtered list
  const handleDeviceSelect = (index: number, device: string) => {
    handleInputChange(index, device);
    setFilteredDevices([]); // Clear the filtered list after selection
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

  const onUnsignedDownload = async () => {
    try {
      const authToken = localStorage.getItem("token"); // Retrieve auth token
      const fileName = formData[formData.length - 1]; // Assuming the file name is in the last field
      if (!authToken) {
        setError("No authentication token found");
        return;
      }

      // Make an API call to download the file
      const response = await axios.get(`${API_BASE_URL}/download/${fileName}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Pass the token in the Authorization header
        },
        responseType: "blob", // Fetch the file as binary large object (BLOB)
      });

      // Create a URL for the file blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Set the filename for the download
      document.body.appendChild(link);
      link.click();

      // Cleanup: remove the link and revoke the object URL
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // Set an error message if the download fails
      setError(
        "Error downloading file: " +
          (err.response?.data?.message || err.message)
      );
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
        handleInputChange(11, uploadedFileName);
        console.log(`Uploaded file: ${uploadedFileName}`);
      } catch (err: any) {
        setError(err.response?.data?.message || "File upload failed.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onDownload = async () => {
    try {
      const authToken = localStorage.getItem("token"); // Retrieve auth token
      const fileName = formData[formData.length - 1]; // Assuming the file name is in the last field

      if (!authToken) {
        setError("No authentication token found");
        return;
      }

      // Make an API call to download the file
      const response = await axios.get(
        `${API_BASE_URL}/download-signed/${fileName}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Pass the token in the Authorization header
          },
          responseType: "blob", // Fetch the file as binary large object (BLOB)
        }
      );

      // Create a URL for the file blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Set the filename for the download
      document.body.appendChild(link);
      link.click();

      // Cleanup: remove the link and revoke the object URL
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // Set an error message if the download fails
      setError(
        "Error downloading file: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const isValidDate = (dateString: string) => {
    return !isNaN(Date.parse(dateString));
  };

  if (!isOpen) return null;

  const translatedFields = {
    id: t("csvheader.id"),
    requestdate: t("csvheader.requestdate"),
    department: t("csvheader.department"),
    recipient: t("csvheader.recipient"),
    orderedbyIT: t("csvheader.orderedbyIT"),
    productname: t("csvheader.productname"),
    serialnumber: t("csvheader.serialnumber"),
    operatingresource: t("csvheader.operatingresource"),
    accessories: t("csvheader.accessories"),
    specialfeatures: t("csvheader.specialfeatures"),
    signed: t("csvheader.signed"),
    path: t("csvheader.path"),
  };

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

      case translatedFields.requestdate:
        return (
          <DatePicker
            selected={
              formData[index] && isValidDate(formData[index])
                ? new Date(formData[index] + "T00:00:00Z")
                : null
            }
            onChange={(date) => handleDateChange(index, date)}
            className="w-full p-2 border border-gray-300 rounded"
            dateFormat="yyyy-MM-dd"
            placeholderText={t("form.placeholders.selectDate")}
          />
        );

      case translatedFields.orderedbyIT:
        return (
          <select
            value={formData[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {!formData[index] && (
              <option value="">{t("form.select.orderedbyIT")}</option>
            )}
            {settings.orderedBy?.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        );

      case translatedFields.productname:
        return (
          <div className="relative flex items-center">
            <input
              type="text"
              value={formData[index] || ""}
              onChange={(e) => {
                handleInputChange(index, e.target.value);
                // Filter die Geräte basierend auf der Eingabe, öffne aber das Dropdown nicht automatisch
                const filtered = allDevices.filter((device) =>
                  device.toLowerCase().includes(e.target.value.toLowerCase())
                );
                setFilteredDevices(filtered);
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {/* Button zum Öffnen/Schließen des Dropdowns */}
            <button
              onClick={() => {
                setIsDropdownOpen((prev) => !prev); // Toggle Dropdown
                if (!isDropdownOpen) {
                  setFilteredDevices(allDevices); // Liste erneut initialisieren
                }
              }}
              className="ml-2 px-2 py-1 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300"
              title={t("buttons.toggleDropdown")}
            >
              {isDropdownOpen ? "▲" : "▼"}
            </button>
            {/* Dropdown anzeigen, wenn `isDropdownOpen` true ist */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
                {/* Schließen-Button oben rechts */}
                <div className="absolute top-0 right-0 p-1">
                  <button
                    onClick={() => {
                      setFilteredDevices([]); // Liste leeren
                      setIsDropdownOpen(false); // Dropdown schließen
                    }}
                    className="text-red-500 hover:text-red-700"
                    title={t("buttons.close")}
                  >
                    ✖
                  </button>
                </div>
                <ul className="mt-6">
                  {/* Platz für den Schließen-Button lassen */}
                  {filteredDevices.map((device, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        handleDeviceSelect(index, device);
                        setIsDropdownOpen(false); // Dropdown schließen nach Auswahl
                      }}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {device}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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

      case translatedFields.operatingresource:
        return (
          <select
            value={formData[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {!formData[index] && (
              <option value="">{t("form.select.operatingresource")}</option>
            )}
            {settings.betriebsmittel?.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        );

      case translatedFields.path: {
        const uploadEndpoint = "/upload";

        // Funktion zum Anzeigen der PDF im neuen Tab
        const onView = async (path: string) => {
          try {
            const authToken = localStorage.getItem("token");
            const fileName = formData[index];
            if (!authToken) {
              setError("No authentication token found");
              return;
            }
            const response = await axios.get(
              `${API_BASE_URL}/${path}/${fileName}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
                responseType: "blob",
              }
            );
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
          } catch (err: any) {
            setError(
              "Error viewing file: " +
                (err.response?.data?.message || err.message)
            );
          }
        };

        return (
          <div className="file-upload-field">
            {formData[10] == "form.yes" ? (
              <div className="mt-2 text-sm text-gray-600">
                {formData[index] && (
                  <button
                    onClick={() => onView("download-signed")}
                    className="mb-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    {t("buttons.view")}
                  </button>
                )}
                <p>
                  {t("file.uploaded")}: {formData[index] || t("file.none")}
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id={`file-upload-${index}`}
                  onChange={(event) => handleFileUpload(event, uploadEndpoint)}
                  className="hidden"
                />
                <div className="flex items-center space-x-4 mt-2">
                  <label
                    htmlFor={`file-upload-${index}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                  >
                    {isUploading ? t("file.uploading") : t("buttons.upload")}
                  </label>
                  <button
                    onClick={() => onView("download")}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    {t("buttons.view")}
                  </button>
                </div>
                {formData[index] && (
                  <p className="mt-2 text-sm text-gray-600">
                    {t("file.uploaded")}: {formData[index]}
                  </p>
                )}
              </>
            )}
          </div>
        );
      }

      case translatedFields.signed:
        return (
          <div className="flex items-center space-x-8">
            <label className="flex items-center space-x-4">
              <input
                type="radio"
                name={`signed-${index}`}
                value="form.yes"
                checked={formData[index] === "form.yes"}
                onChange={() => handleInputChange(index, "form.yes")}
                className="w-6 h-6 accent-blue-500"
              />
              <span>{t("form.yes")}</span>
            </label>

            <label className="flex items-center space-x-4">
              <input
                type="radio"
                name={`signed-${index}`}
                value="form.no"
                checked={formData[index] === "form.no"}
                onChange={() => handleInputChange(index, "form.no")}
                className="w-6 h-6 accent-gray-500"
              />
              <span>{t("form.no")}</span>
            </label>
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

        <div className="flex justify-end space-x-4">
          {formData[10] === "form.yes" ? (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {t("buttons.download2")}
            </button>
          ) : (
            <button
              onClick={onUnsignedDownload}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {t("buttons.download1")}
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
  );
};

export default EditModal;
