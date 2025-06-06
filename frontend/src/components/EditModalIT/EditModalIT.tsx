import React, { useState, useEffect } from "react";
import { EditModalPropsIT } from "../../utils/EditModal/types";
import InputFieldRenderer from "./InputFiledRenderer";
import { t } from "i18next";

const EditModalIT: React.FC<EditModalPropsIT> = ({
  isOpen,
  onClose,
  data,
  onSave,
  csvData,
  selectableDevices,
}) => {
  const [formData, setFormData] = useState<string[]>([]);

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
    "billnum",
    "amount",
    "purchaseoption",
    "type",
    "productname",
    "condition",
    "orderdate",
    "orderedby",
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
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
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

export default EditModalIT;
