interface DropdownProps {
  value: string;
  options: string[];
  onInputChange?: (input: string) => void; // Optional prop for input filtering
  onSelect: (selected: string) => void;
  isOpen: boolean; // New prop to control dropdown visibility
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onInputChange,
  onSelect,
  isOpen,
}) => {
  return (
    <div className="relative">
      {/* Input field for the dropdown */}
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          onInputChange?.(newValue); // Call onInputChange if provided
        }}
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Conditionally render dropdown menu based on isOpen */}
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
          {options.map((option, i) => (
            <li
              key={i}
              onClick={() => onSelect(option)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
