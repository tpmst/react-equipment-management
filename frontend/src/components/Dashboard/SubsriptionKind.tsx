import { t } from "i18next";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SoftwarePurchase {
  name: string;
  value: number;
}

interface SoftwarePurchasesChartProps {
  purchases: SoftwarePurchase[];
}

// Base color for the chart
const BASE_COLOR = "#024C5A"; // Green color

const trimName = (name: string): string => {
  if (name.length <= 30) return name;

  const trimmed = name.slice(0, 30);
  const lastSpaceIndex = trimmed.lastIndexOf(" ");
  return lastSpaceIndex !== -1 ? trimmed.slice(0, lastSpaceIndex) : trimmed;
};

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

const SoftwarePurchasesChart: React.FC<SoftwarePurchasesChartProps> = ({
  purchases,
}) => {
  const shades = generateShades(BASE_COLOR, purchases.length);

  return (
    <div className="bg-[#e9e7d8] border text-black rounded-lg p-6 shadow-md dark:bg-[#1e293b] dark:text-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t("dashboard.softwarePurchases")}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={purchases}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={150}
            label={({ name, value }) => `${trimName(name)}: ${value}`}
            labelLine={false}
            isAnimationActive={true}
          >
            {purchases.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={shades[index % shades.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} purchases`,
              name,
            ]}
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

export default SoftwarePurchasesChart;
