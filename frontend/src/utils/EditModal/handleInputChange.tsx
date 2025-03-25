import { Dispatch, SetStateAction } from "react";

interface Params {
  index: number;
  value: string;
  formData: string[];
  setFormData: Dispatch<SetStateAction<string[]>>;
  csvData: string[][];
}

export const handleInputChange = ({
  index,
  value,
  formData,
  setFormData,
  csvData,
}: Params) => {
  const updatedData = [...formData];
  updatedData[index] = value;

  if (index === 6) {
    const matchingRow = csvData.find((row) => row[6] === value);
    if (matchingRow) {
      updatedData[5] = matchingRow[5]; // Hard/Software
      updatedData[2] = matchingRow[2]; // Artikelnummer
      updatedData[7] = matchingRow[7]; // Zustand
      updatedData[4] = matchingRow[4]; // Preis
    }
  }

  if (index === 11) {
    const matchingRow = csvData.find((row) => row[11] === value);
    if (matchingRow) {
      updatedData[10] = matchingRow[10]; // Abteilung
    }
  }

  setFormData(updatedData);
};
