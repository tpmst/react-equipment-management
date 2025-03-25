import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import SelectSettings from "./SelectSettings";
import StandardHardware from "./StandardHardware";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import UserManagement from "../../components/Settings/UserManagement";
import GroupManagement from "../../components/Settings/GroupManagement";
import FileManagement from "../../components/Settings/FileManagment";
import CSVManagement from "../../components/Settings/CSVManagment";
import LogViewer from "../../components/Settings/logViewer";

const SettingsLayout = () => {
  const { t } = useTranslation(); // Use translation hook
  const [selectedTab, setSelectedTab] = useState(0); // Track active tab

  return (
    <div className="p-4">
      <div className="flex items-center justify-center pt-3 pb-4">
        <h1 className="text-3xl font-semibold">{t("settings.title")}</h1>
      </div>

      {/* Tabs for switching between different settings */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          aria-label="Settings Tabs"
          variant="fullWidth"
        >
          <Tab label={t("settings.general")} />
          <Tab label={t("settings.hardware")} />
          <Tab label={t("settings.user")} />
          <Tab label={t("settings.group")} />
          <Tab label={t("settings.files")} />
          <Tab label="Logs" />
        </Tabs>
      </Box>

      {/* Render components based on selected tab */}
      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 && <SelectSettings />}
        {selectedTab === 1 && <StandardHardware />}
        {selectedTab === 2 && <UserManagement />}
        {selectedTab === 3 && <GroupManagement />}
        {selectedTab === 4 && (
          <>
            <div className="space-y-8">
              <CSVManagement />
              <FileManagement />
            </div>
          </>
        )}
        {selectedTab === 5 && <LogViewer />}
      </Box>
    </div>
  );
};

export default SettingsLayout;
