import React, { useRef, useState, useEffect } from "react";
import NormalCard from "../normalCrard";
import SpendingOverTime from "./SpendingOverTime";
import { useTranslation } from "react-i18next";

interface MonthlySpendingChartProps {
  monthlySpending: number[];
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
  monthlySpending,
  selectedYear,
  availableYears,
  onYearChange,
}) => {
  const { t } = useTranslation();
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
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl text-black dark:text-white mt-4">
          {t("charts.monthlySpending")}
        </h1>
        <div className="flex items-center">
          <label className="mr-2 text-black dark:text-white">
            {t("labels.selectYear")}:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            className="border p-2 rounded"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <NormalCard title="" ref={cardRef}>
        <SpendingOverTime
          spendingOverTime={monthlySpending}
          width={cardWidth}
        />
      </NormalCard>
    </div>
  );
};

export default MonthlySpendingChart;
