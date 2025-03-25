import React from "react";
import DatePickerField from "../DatePickerField";
import DeviceDropdown from "./DeviceDropdown";
import { useSettings } from "../../context/SettingsContex";
import { t } from "i18next";

interface Props {
  field: string;
  index: number;
  formData: string[];
  setFormData: React.Dispatch<React.SetStateAction<string[]>>;
  allDevices: string[];
  forEdit: boolean;
  csvData: string[][];
}

const InputFieldRenderer: React.FC<Props> = ({
  field,
  index,
  formData,
  setFormData,
  allDevices,
  forEdit,
  csvData,
}) => {
  const { settings } = useSettings();

  const handleInputChange = (value: string) => {
    const updatedData = [...formData];
    updatedData[index] = value;
    setFormData(updatedData);
  };

  // Extract unique values from a specific column in the CSV
  const extractUniqueValues = (
    data: string[][],
    columnIndex: number
  ): string[] => {
    const uniqueValues = new Set(
      data
        .slice(1)
        .map((row) => row[columnIndex]?.trim() || "")
        .filter(Boolean) // Exclude empty values
    );
    return Array.from(uniqueValues);
  };

  const translatedCases = {
    id: t("csvheader_small.id"),
    issuedate: t("csvheader_small.issuedate"),
    device: t("csvheader_small.device"),
    serialnumber: t("csvheader_small.serialnumber"),
    recipient: t("csvheader_small.recipient"),
    issuedby: t("csvheader_small.issuedby"),
    returndate: t("csvheader_small.returndate"),
    receivedby: t("csvheader_small.receivedby"),
  };

  switch (field) {
    case translatedCases.issuedate:
    case translatedCases.returndate:
      return (
        <DatePickerField
          value={formData[index]}
          onChange={(date) => handleInputChange(date)}
        />
      );

    case translatedCases.device:
      return (
        <DeviceDropdown
          value={formData[index]}
          csvdata={allDevices}
          onDeviceSelect={(device) => handleInputChange(device)}
          forEdit={forEdit}
          placeholder="Enter the Device"
        />
      );
    case translatedCases.issuedby:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(e.target.value)}
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

    case translatedCases.receivedby:
      return (
        <select
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {!formData[index] && <option value="">Entgegengenommen von</option>}
          {settings.orderedBy?.map((person) => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>
      );

    case translatedCases.recipient: // Add support for the "Empfänger" field
      const recipients = extractUniqueValues(csvData, 4); // Extract values from column 4
      return (
        <DeviceDropdown
          value={formData[index]}
          csvdata={recipients} // Pass unique recipients from column 4
          onDeviceSelect={(recipient) => handleInputChange(recipient)}
          forEdit={forEdit}
          placeholder=""
        />
      );

    default:
      return (
        <input
          type="text"
          value={formData[index] || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      );
  }
};

export default InputFieldRenderer;
