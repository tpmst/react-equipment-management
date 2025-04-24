import React, { useRef, useState, useEffect } from "react";
import { BarChart, axisClasses } from "@mui/x-charts";
import NormalCard from "../normalCrard";
import { useTheme } from "../../context/themeContext";
import { useTranslation } from "react-i18next";

interface DepartmentSpendingChartProps {
  departmentSpending: Record<
    string,
    { totalSpending: number; itemCount: number }
  >;
}

const DepartmentSpendingChart: React.FC<DepartmentSpendingChartProps> = ({
  departmentSpending,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const axisColor = theme === "light" ? "#000000" : "#ffffff";
  const color = "#024C5A";
  const departmentNames = Object.keys(departmentSpending);
  const departmentTotals = departmentNames.map(
    (department) => departmentSpending[department].totalSpending
  );

  const cardRef = useRef<HTMLDivElement>(null); // Reference to the card
  const [cardWidth, setCardWidth] = useState<number>(0); // State to store the card width

  // Measure the width of the card when it mounts or resizes
  useEffect(() => {
    const updateWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };

    updateWidth(); // Initial measurement
    window.addEventListener("resize", updateWidth); // Update on window resize

    return () => {
      window.removeEventListener("resize", updateWidth); // Cleanup listener
    };
  }, []);

  return (
    <div className="pr-6">
      <NormalCard title={t("charts.departmentTotalSpending")} ref={cardRef}>
        <BarChart
          borderRadius={10}
          xAxis={[
            {
              id: "departments",
              data: departmentNames,
              scaleType: "band",
            },
          ]}
          series={[
            {
              id: "totalSpending",
              data: departmentTotals,
              color: color,
            },
          ]}
          width={cardWidth} // Use the dynamic width
          height={250}
          sx={() => ({
            [`.${axisClasses.root}`]: {
              [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                stroke: axisColor,
                strokeWidth: 3,
              },
              [`.${axisClasses.tickLabel}`]: {
                fill: axisColor,
              },
            },
          })}
        />
      </NormalCard>
    </div>
  );
};

export default DepartmentSpendingChart;
