import { useState, useEffect } from "react";
import axios from "axios";
import { axisClasses, BarChart } from "@mui/x-charts";
import { API_BASE_URL } from "../../security/config";
import NormalCard from "../normalCrard";
import { useTheme } from "../../context/themeContext";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import SpendingOverTime from "./SpendingOverTime";

// Dashboard component for displaying financial data in charts
const GraphBestand = () => {
  const { t } = useTranslation(); // Use the `useTranslation` hook
  const [categorySpending, setCategorySpending] = useState<
    Record<string, { totalSpending: number; itemCount: number }>
  >({}); // Spending by category
  const [error, setError] = useState<string | null>(null); // Error message
  const [authToken, setAuthToken] = useState<string | null>(null); // Authentication token
  const [departmentSpending, setDepartmentSpending] = useState<
    Record<string, { totalSpending: number; itemCount: number }>
  >({}); // Spending by department
  const [monthlySpending, setMonthlySpending] = useState<number[]>(
    Array(12).fill(0)
  ); // Spending by month
  const [width, setWidth] = useState(400); // Chart width
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Selected year for filtering data
  const [availableYears, setAvailableYears] = useState<number[]>([]); // Available years in the CSV data
  const { theme } = useTheme(); // Get the current theme from the ThemeProvider

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token); // Set token in state
    } else {
      setError(t("error.noToken")); // Use translation for error message
      return;
    }

    const fetchCSVFile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/download-csv/03_it-einkauf.csv`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "text", // Fetch as plain text
          }
        );

        const parsedData = parseCSV(response.data); // Parse the CSV data

        const uniqueYears = extractUniqueYears(parsedData); // Extract unique years from data
        console.log(uniqueYears.length);
        if (uniqueYears.length === 1) {
          setAvailableYears(uniqueYears); // Set available years in state
          setSelectedYear(uniqueYears[0]); // Set the year if only one is available
        } else {
          setAvailableYears(uniqueYears); // Set available years in state
        }
        calculateCategorySpending(parsedData);
        calculateDepartmentSpending(parsedData); // Calculate spending by department
        calculateMonthlySpending(parsedData, selectedYear); // Calculate monthly spending for the selected year
      } catch (error: any) {
        setError(
          `${t("error.fetchCSV")} ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    fetchCSVFile(); // Call the function to fetch CSV data
  }, [authToken, selectedYear, t]); // Re-run the effect if authToken, selectedYear, or translation changes

  const parseCSV = (text: string): string[][] => {
    const rows = text.split("\n").map((row) => row.split(";"));
    return rows;
  };

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const extractUniqueYears = (data: string[][]): number[] => {
    const years = new Set<number>();

    data.slice(1).forEach((row) => {
      const date = row[8]; // Assuming "Antragsdatum" is in column index 1
      if (date) {
        const year = parseInt(date.split("-")[0], 10);
        if (!isNaN(year)) {
          years.add(year); // Add the year to the set
        }
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Convert set to array and sort in descending order
  };

  const calculateCategorySpending = (data: string[][]) => {
    const spending: Record<
      string,
      { totalSpending: number; itemCount: number }
    > = {};
    const currentDate = new Date();

    // Function to safely parse a date
    const parseDate = (dateString: string) => {
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    data.slice(1).forEach((row) => {
      const category = row[5]; // Assuming "Hard/Software" category is in column index 5
      const price = parseFloat(row[4]);
      const amount = parseFloat(row[3]);
      const option = parseInt(row[15], 10); // Assuming rental option in column 15
      const startDate = parseDate(row[8]); // Assuming start date in column 8
      const endDate = parseDate(row[16]) || null; // Assuming cancelation date in column 16

      if (!isNaN(price) && !isNaN(amount)) {
        if (!spending[category]) {
          spending[category] = { totalSpending: 0, itemCount: 0 };
        }

        let totalCost = 0;
        const rentalEndDate = endDate ? endDate : currentDate;

        if (option === 1) {
          totalCost = price * amount;
        } else if (option === 2 && startDate) {
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - startDate.getMonth());
          totalCost = price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3 && startDate) {
          const yearsSinceStart =
            rentalEndDate.getFullYear() - startDate.getFullYear();
          totalCost = price * amount * Math.max(yearsSinceStart, 1);
        }

        spending[category].totalSpending += totalCost;
        spending[category].itemCount += 1;
      }
    });

    setCategorySpending(spending);
  };

  const calculateDepartmentSpending = (data: string[][]) => {
    const spending: Record<
      string,
      { totalSpending: number; itemCount: number }
    > = {};
    const currentDate = new Date();

    data.slice(1).forEach((row) => {
      const department = row[10]; // Assuming department is in column 10
      const price = parseFloat(row[4]);
      const amount = parseFloat(row[3]);
      const option = parseInt(row[15], 10);
      const startDate = parseDate(row[8]);
      const endDate = parseDate(row[16]) || null;

      if (!isNaN(price) && !isNaN(amount)) {
        if (!spending[department]) {
          spending[department] = { totalSpending: 0, itemCount: 0 };
        }

        let totalCost = 0;
        const rentalEndDate = endDate ? endDate : currentDate;

        if (option === 1) {
          totalCost = price * amount;
        } else if (option === 2 && startDate) {
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - startDate.getMonth());
          totalCost = price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3 && startDate) {
          const yearsSinceStart =
            rentalEndDate.getFullYear() - startDate.getFullYear();
          totalCost = price * amount * Math.max(yearsSinceStart, 1);
        }

        spending[department].totalSpending += totalCost;
        spending[department].itemCount += 1;
      }
    });

    setDepartmentSpending(spending);
  };

  const calculateMonthlySpending = (data: string[][], year: number) => {
    const monthlySpending = Array(12).fill(0);
    const currentDate = new Date();

    // Function to safely parse a date
    const parseDate = (dateString: string) => {
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    data.slice(1).forEach((row) => {
      const date = row[8]?.trim(); // Assuming Start Date in column 8
      const price = parseFloat(row[4]?.replace(",", ".").trim()); // Assuming Price in column 4
      const amount = parseFloat(row[3]); // Assuming Amount in column 3
      const option = parseInt(row[15], 10); // Assuming Subscription Type in column 15
      const startDate = parseDate(date);
      const endDate = parseDate(row[16]) || null; // Assuming End Date in column 16

      if (startDate && !isNaN(price) && !isNaN(amount)) {
        const rentalEndDate = endDate ? endDate : currentDate;
        let yearLoop = startDate.getFullYear();
        let monthLoop = startDate.getMonth(); // Start month (0-based)

        // Loop through all months from start to end (or current date)
        while (
          yearLoop <= rentalEndDate.getFullYear() &&
          (yearLoop < rentalEndDate.getFullYear() ||
            monthLoop <= rentalEndDate.getMonth())
        ) {
          if (yearLoop === year) {
            if (option === 1) {
              // One-time cost (only in the starting month)
              if (
                yearLoop === startDate.getFullYear() &&
                monthLoop === startDate.getMonth()
              ) {
                monthlySpending[monthLoop] += price * amount;
              }
            } else if (option === 2) {
              // Monthly subscription: Add cost for every month
              monthlySpending[monthLoop] += price * amount;
            } else if (option === 3) {
              // Yearly subscription: Add cost once per year
              if (monthLoop === startDate.getMonth()) {
                monthlySpending[monthLoop] += price * amount;
              }
            }
          }

          // Move to the next month
          monthLoop++;
          if (monthLoop === 12) {
            monthLoop = 0; // Reset to January
            yearLoop++; // Move to next year
          }
        }
      }
    });

    setMonthlySpending(monthlySpending);
  };

  const departmentNames = Object.keys(departmentSpending); // Get department names from spending keys
  const categoryNames = Object.keys(categorySpending);

  useEffect(() => {
    const baseWidth = 350;
    const additionalWidth = 75;
    const newChartWidth = baseWidth + departmentNames.length * additionalWidth;
    setWidth(newChartWidth); // Update chart width
  }, [departmentSpending]);

  const axisColor = theme === "light" ? "#000000" : "#ffffff";

  const departmentTotals = departmentNames.map(
    (department) => departmentSpending[department].totalSpending
  );

  const departmentItemCount = departmentNames.map(
    (department) => departmentSpending[department].itemCount
  );

  const categoryTotals = categoryNames.map(
    (category) => categorySpending[category].totalSpending
  );

  if (error) {
    return (
      <div>
        {t("error.general")}: {error}
      </div>
    );
  }

  return (
    <div className="">
      {/* Year Selection */}
      <div className="flex flex-wrap justify-start gap-5 p-4">
        <div className="p-2">
          <NormalCard title={t("charts.totalHardwareSoftware")}>
            <div className="text-black dark:text-white">
              <BarChart
                borderRadius={10}
                xAxis={[
                  {
                    id: "categories",
                    data: categoryNames,
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    id: "categoryTotals",
                    data: categoryTotals,
                  },
                ]}
                width={400}
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
              {Object.entries(categorySpending).map(
                ([category, { totalSpending }]) => (
                  <p key={category}>
                    {t(`totals`)} {category}: {totalSpending.toFixed(2)} €
                  </p>
                )
              )}
            </div>
          </NormalCard>
        </div>
        <div className="pl-6">
          <div className="pb-1">
            <label className="mr-2 text-black dark:text-white">
              {t("labels.selectYear")}:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="border p-2 rounded"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <NormalCard title={t("charts.monthlySpending")}>
            <div>
              <SpendingOverTime spendingOverTime={monthlySpending} />
            </div>
          </NormalCard>
        </div>
      </div>
      <div className="w-full p-6">
        <div className="flex flex-wrap items-center ">
          <div className="mr-10 mb-6">
            <NormalCard title={t("charts.departmentTotalSpending")}>
              <div>
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
                    },
                  ]}
                  width={width}
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
              </div>
            </NormalCard>
          </div>
          <div className="mr-10 mb-6">
            <NormalCard title={t("charts.departmentHardwareGivenOut")}>
              <div>
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
                      id: "itemCount",
                      data: departmentItemCount,
                    },
                  ]}
                  width={width}
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
              </div>
            </NormalCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphBestand;
