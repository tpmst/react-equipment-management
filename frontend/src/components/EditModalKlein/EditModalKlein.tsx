import React, { useState, useEffect } from "react";
import InputFieldRenderer from "./InputFieldRenderer";
import { EditModalPropsKlein } from "../../utils/EditModal/types";
import { t } from "i18next";

const EditModalKlein: React.FC<EditModalPropsKlein> = ({
  isOpen,
  onClose,
  data,
  onSave,
  allDevices,
  forEdit,
  csvData,
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
    "issuedate",
    "device",
    "serialnumber",
    "recipient",
    "issuedby",
    "returndate",
    "receivedby",
  ];

  const row1 = fields.slice(0, 3);
  const row2 = fields.slice(3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[100vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Edit Data</h2>
        <div className="grid grid-cols-2 gap-2">
          {row1.map((field, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t(`csvheader_small.${field}`)}
              </label>
              <InputFieldRenderer
                field={t(`csvheader_small.${field}`)}
                index={index}
                formData={formData}
                setFormData={setFormData}
                allDevices={allDevices}
                forEdit={forEdit}
                csvData={csvData}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {row2.map((field, index) => (
            <div key={index + row1.length} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t(`csvheader_small.${field}`)}
              </label>
              <InputFieldRenderer
                field={t(`csvheader_small.${field}`)}
                index={index + row1.length}
                formData={formData}
                setFormData={setFormData}
                allDevices={allDevices}
                forEdit={forEdit}
                csvData={csvData}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            {t(`buttons.cancel`)}
          </button>
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

export default EditModalKlein;
