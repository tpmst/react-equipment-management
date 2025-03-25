import React from "react";
import { LineChart, axisClasses } from "@mui/x-charts";
import { useTheme } from "../../context/themeContext";

interface SpendingOverTimeProps {
  spendingOverTime: number[];
}

const SpendingOverTime: React.FC<SpendingOverTimeProps> = ({
  spendingOverTime,
}) => {
  const { theme } = useTheme();
  const axisColor = theme === "light" ? "#000000" : "#ffffff";

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
          },
        ]}
        width={800}
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
