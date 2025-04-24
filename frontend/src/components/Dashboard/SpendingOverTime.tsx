import React from "react";
import { LineChart, axisClasses } from "@mui/x-charts";
import { useTheme } from "../../context/themeContext";

interface SpendingOverTimeProps {
  spendingOverTime: number[];
  width: number; // Accept width as a prop
}

const SpendingOverTime: React.FC<SpendingOverTimeProps> = ({
  spendingOverTime,
  width,
}) => {
  const { theme } = useTheme();
  const axisColor = theme === "light" ? "#000000" : "#ffffff";
  const color = "#024C5A";

  return (
    <div>
      <LineChart
        xAxis={[
          {
            id: "months",
            data: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "Mai",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            scaleType: "band",
          },
        ]}
        series={[
          {
            id: "spending",
            data: spendingOverTime,
            color: color,
          },
        ]}
        width={width} // Use the dynamic width
        height={250}
        sx={() => ({
          [`.${axisClasses.root}`]: {
            [`.${axisClasses.tick}, .${axisClasses.line}`]: {
              stroke: axisColor,
              strokeWidth: 2,
            },
            [`.${axisClasses.tickLabel}`]: {
              fill: axisColor,
            },
          },
        })}
      />
    </div>
  );
};

export default SpendingOverTime;
