import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  value: string | null;
  onChange: (date: string) => void;
}

const DatePickerField: React.FC<Props> = ({ value, onChange }) => {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isoDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      )
        .toISOString()
        .split("T")[0];
      onChange(isoDate);
    } else {
      onChange("");
    }
  };

  return (
    <DatePicker
      selected={value ? new Date(value + "T00:00:00Z") : null}
      onChange={handleDateChange}
      className="w-full p-2 border border-gray-300 rounded"
      dateFormat="yyyy-MM-dd"
      placeholderText="Select date"
    />
  );
};

export default DatePickerField;
