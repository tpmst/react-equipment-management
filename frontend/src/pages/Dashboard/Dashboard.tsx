import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthenticationContext";
import DashboardCard from "../../components/Dashboard/DashboadCard";
import GraphBestand from "../../components/Dashboard/GraphBestand";
import GraphKrimsKrams from "../../components/Dashboard/GraphKrimsKrams";
import { fetchCSVFiles } from "../../utils/Dashboard/fetchCSVFiles";
import { calculateTotalPrices } from "../../components/Dashboard/calculations/calculateTotalPrices";
import { calculateYearlySpending } from "../../components/Dashboard/calculations/calculateYearlySpending";
import { calculateMonthlySpending } from "../../components/Dashboard/calculations/calculateMonthlySpending";
import { calculateUserHardwareSpending } from "../../components/Dashboard/calculations/calculateUserHardwareSpending";
import { calculateAverageSpending } from "../../components/Dashboard/calculations/calculateAverageSpending";
import {
  calculateMostOrderedProductHardware,
  calculateMostOrderedProductSoftware,
} from "../../components/Dashboard/calculations/calculateMostOrderedProduct";
import { calculateConditionAnalysis } from "../../components/Dashboard/calculations/calculateConditionAnalysis";
import { calculateTotalITSpendings } from "../../components/Dashboard/calculations/calculateTotalITSpendings";
import { calculateTotalSpendings } from "../../components/Dashboard/calculations/calculateTotalSpending";
import { calculateYearlyITSpending } from "../../components/Dashboard/calculations/calculateYearlyITSpending";
import { calculateCountIT } from "../../components/Dashboard/calculations/calculateITDevicesCount";
import { calculateMonthlySubscriptionsUsers } from "../../components/Dashboard/calculations/claculateMontlySupscriptionsUsers";
import { calculateMonthlySubscriptionsIT } from "../../components/Dashboard/calculations/claculateMontlySupscriptionsIT";

const Dashboard = () => {
  const { t } = useTranslation();
  const { userGroup } = useAuth(); // Get user group

  // State variables for all KPIs
  const [totalHardwarePrice, setTotalHardwarePrice] = useState<number>(0);
  const [averageSpending, setAverageSpending] = useState<number>(0);
  const [mostOrderedProductS, setMostOrderedProductS] = useState<string>("");
  const [mostOrderedProductH, setMostOrderedProductH] = useState<string>("");
  const [conditionAnalysis, setConditionAnalysis] = useState<{
    [key: string]: number;
  }>({});
  const [countIT, setCountIT] = useState<string>("");
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
      calculateMonthlySpending(
        mainData,
        setPriceLastMonth,
        setPercntageLastMonth,
        t
      );
      calculateYearlyITSpending(
        itData,
        setPriceLastYearIT,
        setPercntageLastYearIT,
        t
      );
      calculateUserHardwareSpending(krimskramsData, setKrimskramsLastYear);
      calculateAverageSpending(mainData, setAverageSpending);
      calculateMostOrderedProductSoftware(mainData, setMostOrderedProductS);
      calculateMostOrderedProductHardware(mainData, setMostOrderedProductH);
      calculateConditionAnalysis(mainData, setConditionAnalysis);
      calculateTotalITSpendings(itData, setTotalITSpendings);
      calculateTotalSpendings(mainData, itData, setTotalSpending);
      calculateCountIT(itData, setCountIT);
      calculateMonthlySubscriptionsUsers(mainData, setTotalSubscriptionPrice);
      calculateMonthlySubscriptionsIT(itData, setTotalSubscriptionPriceIT);
    };

    fetchData();
  }, [t]);

  return (
    <div className="p-6 bg-[#f5f4eb] dark:bg-[#1c242c]">
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
        <Grid item xs={12} md={12} lg={6}>
          <DashboardCard
            title={t("dashboard.mostOrderedProductH")}
            value={mostOrderedProductH}
            icon="device"
            sx={{ height: 150 }} // Set a fixed height
          />
        </Grid>
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

      {/* Graphs */}
      <List>
        <ListItem>
          <GraphBestand />
        </ListItem>
      </List>
      <Divider className="bg-gray-700 dark:bg-gray-200" />
      {userGroup === "admin" && (
        <List>
          <ListItem>
            <GraphKrimsKrams />
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default Dashboard;
