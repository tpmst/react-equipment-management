import React from "react";
import { Apartment, Devices, Storage, Person } from "@mui/icons-material"; // Import Dns for server icon

interface DashboardCardProps {
  title: string;
  value: React.ReactNode; // Support JSX for custom content
  percentage?: string;
  icon?: "money" | "device" | "server" | "user"; // Added "server" option
  sx?: React.CSSProperties; // Allow custom styles
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  percentage,
  icon,
  sx,
}) => {
  // Choose icon based on prop
  const renderIcon = () => {
    switch (icon) {
      case "device":
        return (
          <Devices className="text-gray-800 dark:text-gray-400 text-2xl" />
        );
      case "server":
        return (
          <Storage className="text-gray-800 dark:text-gray-400 text-2xl" />
        );
      case "user":
        return <Person className="text-gray-800 dark:text-gray-400 text-2xl" />;
      default:
        return (
          <Apartment className="text-gray-800 dark:text-gray-400 text-2xl" />
        );
    }
  };

  return (
    <div
      className="bg-[#e9e7d8] border text-black rounded-lg p-6 shadow-md dark:bg-[#1e293b] dark:text-white"
      style={sx}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-800 dark:text-gray-400">{title}</p>
        {renderIcon()} {/* Render the selected icon */}
      </div>
      <div className="mt-3 mb-2 text-4xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="h-4">
        {/* Render percentage if provided, otherwise use an empty placeholder */}
        {percentage ? (
          <p className="text-sm text-gray-800 dark:text-gray-400">
            {percentage}
          </p>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
