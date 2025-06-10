import React, { useState, useEffect, useMemo } from "react";
import { t } from "i18next";
import DatePickerField from "../../components/DatePickerField";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";

interface RequestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onSave: (formData: string[]) => void;
  onDelete?: (formData: string[]) => void; // <-- NEU
  headers: string[];
}

const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    // ignore
  }
  document.body.removeChild(textArea);
};

const RequestEditModal: React.FC<RequestEditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onDelete,
  headers,
}) => {
  const [formData, setFormData] = useState<string[]>(data);
  const [settings, setSettings] = useState<string[]>([]);

  const translatedCases = useMemo(
    () => ({
      orderlink: t("csvheader.orderlink"),
      amount: t("csvheader.amount"),
      unitprice: t("csvheader.unitprice"),
      type: t("csvheader.type"),
      productname: t("csvheader.productname"),
      orderdate: t("csvheader.orderdate"),
    }),
    [t]
  );

  useEffect(() => {
    setFormData(data);
  }, [data]);

  useEffect(() => {
    // Hole die Kategorien vom Backend mit Auth-Token
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/settings-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // Falls die API ein Objekt mit categories-Array liefert:
        if (Array.isArray(res.data.categories)) {
          setSettings(res.data.categories); // <-- jetzt ein Array von Strings
        } else if (Array.isArray(res.data)) {
          setSettings(res.data); // falls direkt ein Array kommt
        } else {
          setSettings([]); // fallback
        }
      });
  }, []);

  const handleInputChange = (idx: number, value: string) => {
    const updated = [...formData];
    updated[idx] = value;
    setFormData(updated);
  };

  if (!isOpen) return null;

  if (!headers || headers.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
          onClose();
        }}
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg"
      >
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">{t("editmodal.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-white bg-red-500 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {headers.map((header, idx) => {
            // skip hidden fields
            if (header === "id" || header === "user" || header === "status")
              return null;

            // Date field
            if (t(`csvheader.${header}`) === translatedCases.orderdate) {
              return (
                <div key={header}>
                  <label className="block mb-1 font-medium">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <DatePickerField
                    value={formData[idx] || ""}
                    onChange={(date) => handleInputChange(idx, date)}
                  />
                </div>
              );
            }

            // Kategorie/Typ Dropdown
            if (t(`csvheader.${header}`) === translatedCases.type) {
              return (
                <div>
                  <label className="block mb-1 font-medium">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <select
                    value={formData[idx] || ""}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {!formData[idx] && <option value=""></option>}
                    {settings.map((cat, index) => (
                      <option key={`${cat}-${index}`} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // Copyable Link
            if (t(`csvheader.${header}`) === translatedCases.orderlink) {
              return (
                <div key={header}>
                  <label className="block mb-1 font-medium w-full">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      name={header}
                      value={formData[idx] || ""}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      className="w-full border rounded p-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        fallbackCopyToClipboard(formData[idx] || "")
                      }
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
                      title="Copy to clipboard"
                    >
                      <ContentCopyIcon className="text-gray-500 w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            }
            if (t(`csvheader.${header}`) === translatedCases.amount) {
              return (
                <div key={header}>
                  <label className="block mb-1 font-medium w-full">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <input
                    type="number"
                    value={formData[idx] || ""}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              );
            }
            if (t(`csvheader.${header}`) === translatedCases.unitprice) {
              return (
                <div key={header}>
                  <label className="block mb-1 font-medium w-full">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <input
                    type="number"
                    value={formData[idx] || ""}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              );
            }
            if (t(`csvheader.${header}`) === translatedCases.productname) {
              return (
                <div key={header}>
                  <label className="block mb-1 font-medium w-full">
                    {t(`csvheader.${header}`) || header}
                  </label>
                  <input
                    type="text"
                    value={formData[idx] || ""}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              );
            }
          })}
        </div>

        <div className="flex justify-end mt-6">
          {onDelete && (
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 mr-2"
              onClick={() => {
                onDelete(formData);
              }}
            >
              {t("buttons.delete") || "Löschen"}
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            {t("buttons.save") || "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestEditModal;
