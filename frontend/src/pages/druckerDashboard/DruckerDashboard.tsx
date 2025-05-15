import { useState } from "react";
import { Tabs, Tab, Box, List, ListItem } from "@mui/material";
import Zaelerstaende from "../../components/Printerdashboard/Zählerstände";
import Tonerlevels from "../../components/Printerdashboard/Tonerstände";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import PrinterList from "../../components/Printerdashboard/PrinterList";

const DruckerDashboard = () => {
  const { t } = useTranslation(); // Use translation hook
  const [selectedTab, setSelectedTab] = useState(0); // Track active tab

  return (
    <div className="p-4">
      {/* Tabs for switching between different sections */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          aria-label="Drucker Dashboard Tabs"
          variant="fullWidth"
        >
          <Tab label={t("dashboard.counterLevels")} />
          <Tab label={t("dashboard.printerList")} />
        </Tabs>
      </Box>

      {/* Render components based on selected tab */}
      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 && (
          <div>
            <div className="flex flex-row justify-around p-4">
              <div>
                <List>
                  <ListItem>
                    <Zaelerstaende />
                  </ListItem>
                </List>
              </div>
              <div>
                <List>
                  <ListItem>
                    <Tonerlevels />
                  </ListItem>
                </List>
              </div>
            </div>
          </div>
        )}
        {selectedTab === 1 && (
          <div>
            <PrinterList />
          </div>
        )}
      </Box>
    </div>
  );
};

export default DruckerDashboard;
