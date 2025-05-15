import { useEffect, useState } from "react";
import { useSettings } from "../../context/SettingsContex";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthenticationContext";
import DashboardCard from "../../components/Dashboard/DashboadCard";
import GraphKrimsKrams from "../../components/Dashboard/GraphKrimsKrams";
import { fetchCSVFiles } from "../../utils/Dashboard/fetchCSVFiles";
import { calculateTotalPrices } from "../../components/Dashboard/calculations/calculateTotalPrices";
import { calculateYearlySpending } from "../../components/Dashboard/calculations/calculateYearlySpending";
import { calculateMonthlySpending } from "../../components/Dashboard/calculations/calculateMonthlySpending";
import { calculateUserHardwareSpending } from "../../components/Dashboard/calculations/calculateUserHardwareSpending";
import { calculateAverageSpending } from "../../components/Dashboard/calculations/calculateAverageSpending";
import { calculateMostOrderedProductComparison } from "../../components/Dashboard/calculations/calculateMostOrderedProduct";
import { calculateConditionAnalysis } from "../../components/Dashboard/calculations/calculateConditionAnalysis";
import { calculateTotalITSpendings } from "../../components/Dashboard/calculations/calculateTotalITSpendings";
import { calculateTotalSpendings } from "../../components/Dashboard/calculations/calculateTotalSpending";
import { calculateYearlyITSpending } from "../../components/Dashboard/calculations/calculateYearlyITSpending";
import { calculateCountIT } from "../../components/Dashboard/calculations/calculateITDevicesCount";
import { calculateMonthlySubscriptionsUsers } from "../../components/Dashboard/calculations/claculateMontlySupscriptionsUsers";
import { calculateMonthlySubscriptionsIT } from "../../components/Dashboard/calculations/claculateMontlySupscriptionsIT";
import {
  calculateCountUserDevices,
  calculateCountITDevices,
  calculateCountITSoftware,
  calculateCountUserSoftware,
} from "../../components/Dashboard/calculations/calculateAllItems";
import { calculateAverageSubscriptionDuration } from "../../components/Dashboard/calculations/calculateAverageSubscriptionTime";
import { calculateAverageSubscriptionCost } from "../../components/Dashboard/calculations/calculateAverageSubscriptionCost";
import SpendingByCategoryChart from "../../components/Dashboard/SpendingByCategory";
import {
  calculateSpendingByCategory,
  calculateSpendingByCategoryIT,
} from "../../components/Dashboard/calculations/calculateSpendingByCategory";
import DepartmentSpendingChart from "../../components/Dashboard/DepartmendSpendingChart";
import MonthlySpendingChart from "../../components/Dashboard/MonthlySpendingChart";
import ActiveSubscriptionsChart from "../../components/Dashboard/ActiveSubscriptionsChart";
import { Divider } from "@mui/material";
import SoftwarePurchasesChart from "../../components/Dashboard/SubsriptionKind";

const Dashboard = () => {
  const { t } = useTranslation();
  const { userGroup } = useAuth(); // Get user group
  const { settings } = useSettings(); // Get settings

  // State variables for Charts
  const [spendingByCategory, setSpendingByCategory] = useState<
    Record<string, number>
  >({});
  const [spendingByCategoryIT, setSpendingByCategoryIT] = useState<
    Record<string, number>
  >({});
  const [monthlySpending, setMonthlySpending] = useState<number[]>(
    Array(12).fill(0)
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [departmentSpending, setDepartmentSpending] = useState<
    Record<string, { totalSpending: number; itemCount: number }>
  >({});
  const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);
  const [inactiveSubscriptions, setInactiveSubscriptions] = useState<number>(0);

  const [softwarePurchases, setSoftwarePurchases] = useState<
    { name: string; value: number }[]
  >([]);

  // State variables for all KPIs
  const [averageSubscriptionDuration, setAverageSubscriptionDuration] =
    useState<number>(0);
  const [avereageSubscriptionCost, setAverageSubscriptionCost] =
    useState<number>(0);
  const [countITDevices, setCountITDevices] = useState<number>(0);
  const [countUserDevices, setCountUserDevices] = useState<number>(0);
  const [countITSoftware, setCountITSoftware] = useState<number>(0);
  const [countUserSoftware, setCountUserSoftware] = useState<number>(0);
  const [totalHardwarePrice, setTotalHardwarePrice] = useState<number>(0);
  const [averageSpending, setAverageSpending] = useState<number>(0);
  const [mostOrderedProductS, setMostOrderedProductS] = useState<string>("");
  const [mostOrderedProductH, setMostOrderedProductH] = useState<string>("");
  const [conditionAnalysis, setConditionAnalysis] = useState<{
    [key: string]: number;
  }>({});
  const [countIT, setCountIT] = useState<number>(0);
  const [totalITSpendings, setTotalITSpendings] = useState<string>("");
  const [totalSpending, setTotalSpending] = useState<number>(0);
  const [percntageLastMonth, setPercntageLastMonth] = useState<string>("");
  const [PriceLastMonth, setPriceLastMonth] = useState<number>(0);
  const [percntageLastYear, setPercntageLastYear] = useState<string>("");
  const [PriceLastYear, setPriceLastYear] = useState<number>(0);
  const [krimskramsLastYear, setKrimskramsLastYear] = useState<string>("");
  const [percntageLastYearIT, setPercntageLastYearIT] = useState<string>("");
  const [totalSubscriptionPrice, setTotalSubscriptionPrice] =
    useState<number>(0);
  const [totalSubscriptionPriceIT, setTotalSubscriptionPriceIT] =
    useState<number>(0);
  const [PriceLastYearIT, setPriceLastYearIT] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { mainData, krimskramsData, itData } = await fetchCSVFiles(token);

      calculateTotalPrices(mainData, setTotalHardwarePrice);
      calculateYearlySpending(
        mainData,
        setPriceLastYear,
        setPercntageLastYear,
        t
      );

      calculateYearlyITSpending(
        itData,
        setPriceLastYearIT,
        setPercntageLastYearIT,
        t
      );

      calculateMonthlySpending(
        mainData,
        setPriceLastMonth,
        setPercntageLastMonth,
        t
      );
      calculateCountITDevices(itData, setCountITDevices);
      calculateCountUserDevices(mainData, setCountUserDevices);
      calculateCountITSoftware(itData, setCountITSoftware);
      calculateCountUserSoftware(mainData, setCountUserSoftware);
      calculateUserHardwareSpending(krimskramsData, setKrimskramsLastYear);
      calculateAverageSpending(mainData, setAverageSpending);
      calculateMostOrderedProductComparison(
        mainData,
        setMostOrderedProductS,
        setMostOrderedProductH
      );
      calculateConditionAnalysis(mainData, setConditionAnalysis);
      calculateTotalITSpendings(itData, setTotalITSpendings);
      calculateTotalSpendings(mainData, itData, setTotalSpending);
      calculateCountIT(itData, setCountIT);
      calculateMonthlySubscriptionsUsers(mainData, setTotalSubscriptionPrice);
      calculateMonthlySubscriptionsIT(itData, setTotalSubscriptionPriceIT);
      calculateAverageSubscriptionCost(mainData, setAverageSubscriptionCost);
      calculateAverageSubscriptionDuration(
        mainData,
        setAverageSubscriptionDuration
      );
    };

    fetchData();
  }, [t, settings.categories]);

  //useEffect for the charts

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const { mainData, itData } = await fetchCSVFiles(token);

        // Calculate unique years
        const uniqueYears = calculateUniqueYears(mainData);
        setAvailableYears(uniqueYears);

        // Set the selected year to the most recent year if not already set
        if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
          setSelectedYear(uniqueYears[0]);
        }

        // Calculate spending by category
        if (settings.categories && settings.categories.length > 0) {
          calculateSpendingByCategory(
            mainData,
            settings.categories,
            setSpendingByCategory
          );
        }

        if (settings.itCategories && settings.itCategories.length > 0) {
          calculateSpendingByCategoryIT(
            itData,
            settings.itCategories,
            setSpendingByCategoryIT
          );
        }

        // Calculate monthly spending for the selected year
        calculateMonthlySpending2(mainData, selectedYear);

        // Calculate department spending
        calculateDepartmentSpending(mainData);

        // Calculate Subscriptions
        let activeCount = 0;
        let inactiveCount = 0;

        mainData.slice(1).forEach((row) => {
          if (row[5] === "Software") {
            if (row[15] === "2" || row[15] === "3") {
              if (row[16] && row[16].length > 3) {
                // Inactive if row[16] is a string with more than 3 characters
                inactiveCount++;
              } else {
                // Active otherwise
                activeCount++;
              }
            }
          }
        });

        setActiveSubscriptions(activeCount);
        setInactiveSubscriptions(inactiveCount);

        const softwareCountMap: Record<string, number> = {};

        mainData.slice(1).forEach((row) => {
          const softwareName = row[6];
          const count = parseInt(row[3], 10); // Assuming count is in column index 3

          // Only consider rows that meet the subscription type criteria
          if (row[5] === "Software") {
            if (softwareName) {
              if (softwareCountMap[softwareName]) {
                softwareCountMap[softwareName]++;
              } else {
                softwareCountMap[softwareName] = count || 1;
              }
            }
          }
        });

        // Convert the map into an array for the chart
        const purchases = Object.entries(softwareCountMap).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setSoftwarePurchases(purchases);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [settings.categories, selectedYear]); // Include selectedYear in the dependency array

  const calculateMonthlySpending2 = (data: string[][], year: number) => {
    const monthlySpending = Array(12).fill(0);

    data.slice(1).forEach((row) => {
      const date = row[8]; // Assuming date is in column index 8
      const price = parseFloat(row[4]?.replace(",", "."));
      const amount = parseFloat(row[3]);
      const option = parseInt(row[15], 10);
      const cancelDate = row[16] ? new Date(row[16]) : null;

      if (date && !isNaN(price) && !isNaN(amount)) {
        const [yearStr, monthStr] = date.split("-");
        const startYear = parseInt(yearStr, 10);
        const startMonth = parseInt(monthStr, 10) - 1;

        if (startYear <= year) {
          if (option === 2) {
            // Monthly subscription
            for (
              let currentYear = startYear, month = startMonth;
              currentYear <= year;
              month++
            ) {
              if (month === 12) {
                month = 0;
                currentYear++;
              }
              if (currentYear === year) {
                if (
                  cancelDate &&
                  (cancelDate.getFullYear() < year ||
                    (cancelDate.getFullYear() === year &&
                      cancelDate.getMonth() < month))
                ) {
                  break;
                }
                monthlySpending[month] += price * amount;
              }
            }
          } else if (option === 3) {
            // Yearly subscription
            for (
              let currentYear = startYear;
              currentYear <= year;
              currentYear++
            ) {
              if (
                (!cancelDate || cancelDate.getFullYear() >= currentYear) &&
                currentYear === year
              ) {
                monthlySpending[startMonth] += price * amount;
              }
            }
          } else {
            // One-time purchase
            if (startYear === year) {
              monthlySpending[startMonth] += price * amount;
            }
          }
        }
      }
    });

    setMonthlySpending(monthlySpending);
  };

  const calculateDepartmentSpending = (data: string[][]) => {
    const spending: Record<
      string,
      { totalSpending: number; itemCount: number }
    > = {};
    data.slice(1).forEach((row) => {
      const department = row[10]; // Assuming department is in column index 10
      const price = parseFloat(row[4]);
      if (!isNaN(price)) {
        if (!spending[department])
          spending[department] = { totalSpending: 0, itemCount: 0 };
        spending[department].totalSpending += price;
        spending[department].itemCount += 1;
      }
    });
    setDepartmentSpending(spending);
  };

  const calculateUniqueYears = (data: string[][]): number[] => {
    const years = new Set<number>();
    data.slice(1).forEach((row) => {
      const date = row[8]; // Assuming the date is in column index 8
      if (date) {
        const year = parseInt(date.split("-")[0], 10);
        if (!isNaN(year)) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Sort years in descending order
  };

  return (
    <div className="p-6 bg-[#f5f4eb] dark:bg-[#1c242c]">
      <div className="mb-6">
        <Grid container spacing={4}>
          {/* Financial KPIs */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.totalSpending")}
              value={`${totalSpending}€`}
              icon="money"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.totalDevices")}
              value={`${countUserDevices + countITDevices}`}
              icon="money"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.totalSoftware")}
              value={`${countUserSoftware + countITSoftware}`}
              icon="money"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          {/* Financial KPIs */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.totalSpendingUser")}
              value={`${totalHardwarePrice.toFixed(2)}€`}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.averageSpending")}
              value={`${averageSpending.toFixed(2)}€`}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.averageSubscriptionCost")}
              value={`${avereageSubscriptionCost.toFixed(2)}€`}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.averageSubscriptionDuration")} // Add a translation key
              value={`${averageSubscriptionDuration.toFixed(1)} ${t("days")}`} // Format the value
              icon="user" // Use an appropriate icon
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.thisYearSpending")}
              value={`${PriceLastYear.toFixed(2)}€`}
              percentage={percntageLastYear}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.thisMonthSpending")}
              value={`${PriceLastMonth.toFixed(2)}€`}
              percentage={percntageLastMonth}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.TotalSupscriptionsUser")}
              value={`${totalSubscriptionPrice.toFixed(2)}€`}
              icon="user"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>

          {/* Product and Usage KPIs */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard
              title={t("dashboard.hardwareThisYear")}
              value={krimskramsLastYear}
              icon="device"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={12} lg={3}>
            <DashboardCard
              title={t("dashboard.conditionAnalysis")}
              value={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(conditionAnalysis).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold">{key}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              }
              icon="device"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <DashboardCard
              title={t("dashboard.mostOrderedProductH")}
              value={mostOrderedProductH}
              icon="device"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <DashboardCard
              title={t("dashboard.mostOrderedProductS")}
              value={mostOrderedProductS}
              icon="device"
              sx={{ height: 150 }} // Set a fixed height
            />
          </Grid>
          {userGroup === "admin" && (
            <>
              {/* Product and Usage KPIs */}
              <Grid item xs={12} md={6} lg={3}>
                <DashboardCard
                  title={t("dashboard.totalSpendingIT")}
                  value={`${totalITSpendings}€`}
                  icon="server"
                  sx={{ height: 150 }} // Set a fixed height
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DashboardCard
                  title={t("dashboard.thisYearSpendingIT")}
                  value={`${PriceLastYearIT.toFixed(2)}€`}
                  percentage={percntageLastYearIT}
                  icon="server"
                  sx={{ height: 150 }} // Set a fixed height
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DashboardCard
                  title={t("dashboard.monthlySupscriptionIT")}
                  value={`${totalSubscriptionPriceIT.toFixed(2)}€`}
                  icon="server"
                  sx={{ height: 150 }} // Set a fixed height
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DashboardCard
                  title={t("dashboard.hardwareThisYearIT")}
                  value={countIT}
                  icon="server"
                  sx={{ height: 150 }} // Set a fixed height
                />
              </Grid>
            </>
          )}
        </Grid>
      </div>

      <Divider className="my-6 bg-gray-400" />

      <div className="mt-6">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={6}>
            <SpendingByCategoryChart
              spendingByCategory={spendingByCategory}
              title={`${t("dashboard.spendingByCategory")}`}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <SpendingByCategoryChart
              spendingByCategory={spendingByCategoryIT}
              title={`${t("dashboard.spendingByCategoryIT")}`}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <ActiveSubscriptionsChart
              activeCount={activeSubscriptions}
              inactiveCount={inactiveSubscriptions}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <SoftwarePurchasesChart purchases={softwarePurchases} />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <MonthlySpendingChart
              monthlySpending={monthlySpending}
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={(year) => setSelectedYear(year)} // Update selectedYear
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <DepartmentSpendingChart departmentSpending={departmentSpending} />
          </Grid>
          {userGroup === "admin" && (
            <Grid item xs={12} md={12} lg={12}>
              <GraphKrimsKrams />
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;
