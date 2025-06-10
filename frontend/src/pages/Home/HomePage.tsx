import React, { useEffect, useRef, useState } from "react";
import CSVViewer from "../ExcelView/CSVView";
import ListPDF from "../pdf/ListPdf";
import Dashboard from "../Dashboard/Dashboard";
import MenuDrawer from "../../components/menuDrawer";
import CSVViewKlein from "../Sheet-Kleinzeug/CSVViewKlein";
import DruckerDashboard from "../druckerDashboard/DruckerDashboard";
import CSVViewEinkauf from "../Einkauf/CSVViewEinkauf";
import SettingsLayout from "../Settings/SettingsLayout";
import { SettingsProvider } from "../../context/SettingsContex";
import ThemeSelector from "../../context/themeSelector";
import { useTranslation } from "react-i18next";
import TelefonCSV from "../Telefon/TelefonCSV";
import CSV_ITS from "../IT-Supplies/it-supplies";
import { useAuth } from "../../context/AuthenticationContext";
import axios from "axios";
import { API_BASE_URL, COMPANY_NAME } from "../../security/config";
import LogoutIcon from "@mui/icons-material/Logout";
import RequestView from "../AnfragenPage/RequestPage";

const HomePage: React.FC = () => {
  const [site, setSite] = useState("dashboard");
  const { i18n } = useTranslation();
  const { logout, authToken, userGroup } = useAuth();
  const currentYear = new Date().getFullYear();
  const xlsxRef = useRef<{ addRow: (row: string[]) => void } | null>(null);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
  };

  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!authToken || !userGroup) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/permissions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setAllowedRoutes(response.data.allowedRoutes);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [authToken, userGroup]);

  return (
    <div className="min-h-screen bg-[#f5f4eb] dark:bg-[#1c242c] flex flex-col items-center justify-center">
      <header className="bg-[#eceadb] dark:bg-[#1e293b] flex w-full p-4 text-2xl font-bold items-center">
        <div className="flex-start">
          <MenuDrawer setSite={setSite} />
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeSelector />

          <button
            onClick={() => changeLanguage("en")}
            className={`p-2 ${
              i18n.language === "en"
                ? "bg-[#dddcd2] dark:bg-[#1a2129] dark:text-gray-200"
                : "bg-[#eceadb] dark:bg-[#1e293b] dark:text-gray-200"
            }`}
          >
            en
          </button>
          <button
            onClick={() => changeLanguage("de")}
            className={`p-2 ${
              i18n.language === "de"
                ? "bg-[#dddcd2] dark:bg-[#1a2129] dark:text-gray-200"
                : "bg-[#eceadb] dark:bg-[#1e293b] dark:text-gray-200"
            }`}
          >
            de
          </button>

          <span className="text-gray-500 dark:text-gray-400">|</span>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <SettingsProvider>
        <main className="flex-grow flex flex-col p-4 w-full pl-24 relative">
          {allowedRoutes.includes(site) ? (
            <>
              {site === "dashboard" && <Dashboard />}
              {site === "pdf" && <ListPDF />}
              {site === "xlsx" && <CSVViewer ref={xlsxRef} />}
              {site === "tabelle" && <CSVViewKlein />}
              {site === "drucker" && <DruckerDashboard />}
              {site === "einkauf" && (
                <CSVViewEinkauf
                  setSite={setSite}
                  addToXLSX={(row) => xlsxRef.current?.addRow(row)}
                />
              )}
              {site === "requests" && <RequestView />}
              {site === "telefon" && <TelefonCSV />}
              {site === "settings" && <SettingsLayout />}
              {site === "it" && <CSV_ITS />}
            </>
          ) : (
            <div className="text-center text-red-500 text-lg font-semibold">
              🚫 Access Denied: You do not have permission to view this page.
            </div>
          )}
        </main>
      </SettingsProvider>

      <footer className="bg-[#eceadb] dark:bg-[#1e293b] w-full p-4 dark:text-white text-center">
        © 2024 - {currentYear} {COMPANY_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
