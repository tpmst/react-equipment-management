import React, { useState } from "react";

interface Props {
  value: string;
  csvdata: string[];
  onDeviceSelect: (device: string) => void;
  forEdit: boolean;
  placeholder: string;
}

const DeviceDropdown: React.FC<Props> = ({
  value,
  csvdata,
  onDeviceSelect,
  forEdit,
  placeholder,
}) => {
  const [filteredDevices, setFilteredDevices] = useState<string[]>(csvdata);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (input: string) => {
    const filtered = csvdata.filter((data) =>
      data.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredDevices(filtered);
    onDeviceSelect(input);
    setIsOpen(true); // Open dropdown when filtering
  };

  const handleDeviceSelect = (device: string) => {
    onDeviceSelect(device);
    setIsOpen(false); // Close dropdown when an item is selected
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)} // Open dropdown on focus
      />
      {isOpen && forEdit === false && filteredDevices.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
          {filteredDevices.map((device, i) => (
            <li
              key={i}
              onClick={() => handleDeviceSelect(device)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {device}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeviceDropdown;
