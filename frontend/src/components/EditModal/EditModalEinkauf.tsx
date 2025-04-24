import React, { useState, useEffect } from "react";
import InputFieldRenderer from "./InputFiledRenderer";
import { t } from "i18next";
import { useSettings } from "../../context/SettingsContex";

export interface EditModalEinkaufProps {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onSave: (data: string[]) => void;
  csvData: string[][];
  selctableUsernames: string[];
  selectableDevices: string[];
  setSite: React.Dispatch<React.SetStateAction<string>>;
  addToXLSX?: (entry: string[]) => void;
}

const EditModalEinkauf: React.FC<EditModalEinkaufProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  csvData,
  selctableUsernames,
  selectableDevices,
  setSite,
  addToXLSX,
}) => {
  const [formData, setFormData] = useState<string[]>([]);

  const { settings } = useSettings();

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const fields = [
    "id",
    "serialnumber",
    "orderlink",
    "amount",
    "purchaseoption",
    "type",
    "productname",
    "condition",
    "orderdate",
    "orderedby",
    "department",
    "orderedfor",
    "investmentrequest",
    "invoicefile",
    "status",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[100vh] overflow-auto">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">Edit Data</h2>
          <button
            onClick={onClose}
            className="ml-auto text-white bg-red-500 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {fields.map((field, index) => (
            <div key={`field-${index}`} className="mb-4">
              <label
                htmlFor={`field-${index}`}
                className="block text-sm font-medium mb-1"
              >
                {t(`csvheader.${field}`)}
              </label>
              <InputFieldRenderer
                field={t(`csvheader.${field}`)}
                index={index}
                formData={formData}
                setFormData={setFormData}
                csvData={csvData}
                selectableDevices={selectableDevices}
                selctableUsernames={selctableUsernames}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          {settings.betriebsmittel?.includes(formData[5]) && (
            <button
              onClick={() => {
                setSite("xlsx");
                setTimeout(() => {
                  addToXLSX?.(formData);
                }, 50); // give time to mount
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              {t("buttons.specialType")}
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {t(`buttons.save`)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModalEinkauf;
