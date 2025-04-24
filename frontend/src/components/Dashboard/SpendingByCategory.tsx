import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SpendingByCategoryChartProps {
  spendingByCategory: Record<string, number>;
  title: string;
}

// Base color for the chart
const BASE_COLOR = "#024C5A"; // Green color

const SpendingByCategoryChart: React.FC<SpendingByCategoryChartProps> = ({
  spendingByCategory,
  title,
}) => {
  const data = Object.entries(spendingByCategory).map(([category, value]) => ({
    name: category,
    value,
  }));

  // Generate shades of the base color
  const generateShades = (baseColor: string, count: number) => {
    const shades = [];
    for (let i = 0; i < count; i++) {
      const shadeFactor = 1 - i * 0.1; // Decrease brightness for each item
      const shade = Math.floor(shadeFactor * 255)
        .toString(16)
        .padStart(2, "0");
      shades.push(`${baseColor}${shade}`);
    }
    return shades;
  };

  const shades = generateShades(BASE_COLOR, data.length);

  return (
    <div className="bg-[#e9e7d8] border text-black rounded-lg p-6 shadow-md dark:bg-[#1e293b] dark:text-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%" // Center the chart horizontally
            cy="50%" // Center the chart vertically
            innerRadius={80} // Inner radius for the donut effect
            outerRadius={150} // Outer radius for the donut
            label={({ name, value }) => `${name}: ${value}€`} // Add labels with category name, value, and percentage
            isAnimationActive={true} // Enable animation
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={shades[index % shades.length]} // Apply green shades
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}€`}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingByCategoryChart;
