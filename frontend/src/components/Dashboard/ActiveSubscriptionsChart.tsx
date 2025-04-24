import { t } from "i18next";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ActiveSubscriptionsChartProps {
  activeCount: number;
  inactiveCount: number;
}

const COLORS = ["#024C5A", "#bc0b0b"]; //colors for the chart

const ActiveSubscriptionsChart: React.FC<ActiveSubscriptionsChartProps> = ({
  activeCount,
  inactiveCount,
}) => {
  const data = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
  ];

  return (
    <div className="bg-[#e9e7d8] border text-black rounded-lg p-6 shadow-md dark:bg-[#1e293b] dark:text-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t("dashboard.activeSubscriptions")}
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
            label={({ name, value }) => `${name}: ${value}`} // Add labels with category name, value, and percentage
            labelLine={false} // Disable label lines
            isAnimationActive={true} // Enable animation
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value} subscriptions`}
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

export default ActiveSubscriptionsChart;
