import React from "react";
import { t } from "i18next";

interface Props {
  field: string;
  index: number;
  formData: string[];
  setFormData: React.Dispatch<React.SetStateAction<string[]>>;
}

const InputFieldRenderer: React.FC<Props> = ({
  field,
  index,
  formData,
  setFormData,
}) => {
  const handleInputChange = (index: number, value: string) => {
    setFormData((prev) => {
      console.log(formData);
      const updatedData = [...prev];
      updatedData[index] = value;
      console.log(updatedData);
      return updatedData;
    });
  };

  const translatedCases = {
    status: t("csvheader.status"),
  };

  switch (field) {
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
              className="w-6 h-6 accent-greeen-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.open")}
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
              className="w-6 h-6 accent-orange-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.onhold")}
            </span>
          </label>
          {/* Geliefert */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`}
              value="3"
              checked={formData[index] === "3"}
              onChange={() => handleInputChange(index, "3")}
              className="w-6 h-6 accent-orange-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.inprogress")}
            </span>
          </label>
          {/* Geliefert */}
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name={`status-${index}`} // Ensure unique group name
              value="5"
              checked={formData[index] === "5"}
              onChange={() => handleInputChange(index, "5")}
              className="w-6 h-6 accent-red-500" // Bigger input with custom color
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.canceled")}
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
              className="w-6 h-6 accent-blue-500"
            />
            <span className="text-lm font-medium text-gray-800 dark:text-gray-200">
              {t("satusfields.closed")}
            </span>
          </label>
        </div>
      );
  }
};

export default InputFieldRenderer;
