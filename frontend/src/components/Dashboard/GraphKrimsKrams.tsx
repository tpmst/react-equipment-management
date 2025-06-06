import { useState, useEffect } from "react";
import axios from "axios";
import { axisClasses, BarChart } from "@mui/x-charts";
import { API_BASE_URL } from "../../security/config";
import NormalCard from "../normalCrard";
import { useTheme } from "../../context/themeContext";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook

const GraphKrimsKrams = () => {
  const { t } = useTranslation(); // Use the translation hook
  const [userHardwareSpending, setUserHardwareSpending] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    } else {
      setError(t("error.noToken")); // Set error message
      return;
    }

    const fetchCSVFile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/download-csv/02_it-kleinZeug.csv`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "text",
          }
        );

        const parsedData = parseCSV(response.data);
        const userSpending = calculateUserHardwareSpending(parsedData);
        setUserHardwareSpending(userSpending);
      } catch (error: any) {
        setError(
          `${t("error.fetchCSV")} ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    fetchCSVFile();
  }, [authToken, t]);

  const calculateUserHardwareSpending = (data: string[][]) => {
    const userSpending: Record<string, number> = {};

    data.slice(1).forEach((row) => {
      const user = row[4]; // Assuming "Besteller" is in column index 4
      if (!userSpending[user]) {
        userSpending[user] = 0; // Initialize user spending if not already done
      }
      userSpending[user] += 1; // Increment hardware count
    });

    return userSpending;
  };

  const parseCSV = (text: string): string[][] => {
    const rows = text.split("\n").map((row) => row.split(";"));
    return rows;
  };

  const userNames = Object.keys(userHardwareSpending);

  // Sort by hardware spending and get the top 20 users
  const top20Users = userNames
    .map((user) => ({ user, total: userHardwareSpending[user] })) // Create array of objects with user and total
    .sort((a, b) => b.total - a.total) // Sort by total in descending order
    .slice(0, 20); // Take top 20

  // Extract names and totals for the top 20 users
  const topUserNames = top20Users.map((entry) => entry.user);
  const topUserTotals = top20Users.map((entry) => entry.total);

  useEffect(() => {
    const baseWidth = 350;
    const additionalWidth = 75;
    const newChartWidth = baseWidth + topUserNames.length * additionalWidth;
    setWidth(newChartWidth);
  }, [userHardwareSpending]);

  const { theme } = useTheme();
  const axisColor = theme === "light" ? "#000000" : "#ffffff";
  const color = "#024C5A";

  if (error) {
    return (
      <div>
        {t("error.general")}: {error}
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <div className="w-full">
        <NormalCard title={t("charts.top20UsersWithMostHardware")}>
          <div>
            <BarChart
              borderRadius={10}
              xAxis={[
                {
                  id: "users",
                  data: topUserNames,
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  id: "totalSpending",
                  data: topUserTotals,
                  color: color,
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
  );
};

export default GraphKrimsKrams;
