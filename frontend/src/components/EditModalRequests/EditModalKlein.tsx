import React, { useState, useEffect } from "react";
import InputFieldRenderer from "./InputFieldRenderer";
import { t } from "i18next";

interface EditModalPropsRequests {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onSave: (data: string[]) => void;
  headers: string[]; // <--- hinzufügen
}

const EditModalKlein: React.FC<EditModalPropsRequests> = ({
  isOpen,
  onClose,
  data,
  onSave,
  headers, // <--- hinzufügen
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

  const fields = ["status"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-2/4 max-h-[100vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Edit Data</h2>
        {fields.map((field) => {
          const fieldIndex = data.findIndex(
            (_, idx) => (headers ? headers[idx] : "") === field
          );
          return (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t(`csvheader.${field}`)}
              </label>
              <InputFieldRenderer
                field={t(`csvheader.${field}`)}
                index={fieldIndex}
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          );
        })}

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
