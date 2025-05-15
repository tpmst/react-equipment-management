import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSettings } from "../../context/SettingsContex";
import { t } from "i18next";

interface Settings {
  orderedBy: string[];
  betriebsmittel: string[];
  departments: string[];
  categories: string[];
  conditions: string[];
  itCategories: string[];
}

const SelectSettings = () => {
  const [newItem, setNewItem] = useState<Record<keyof Settings, string>>({
    orderedBy: "",
    betriebsmittel: "",
    departments: "",
    categories: "",
    conditions: "",
    itCategories: "",
  });

  const { settings, updateSettings, loading, error } = useSettings();
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        orderedBy: settings.orderedBy || [],
        betriebsmittel: settings.betriebsmittel || [],
        departments: settings.departments || [],
        categories: settings.categories || [],
        conditions: settings.conditions || [],
        itCategories: settings.itCategories || [],
      });
    }
  }, [settings]);

  const handleInputChange = (
    field: keyof Settings,
    index: number,
    value: string
  ) => {
    if (!localSettings) return;
    const updated = { ...localSettings };
    updated[field][index] = value;
    setLocalSettings(updated);
  };

  const handleAddItem = (field: keyof Settings) => {
    if (!localSettings || !newItem[field]) return;
    const updatedSettings = { ...localSettings };
    updatedSettings[field] = [...updatedSettings[field], newItem[field]];
    setLocalSettings(updatedSettings);
    setNewItem({ ...newItem, [field]: "" });
  };

  const handleRemoveItem = (field: keyof Settings, index: number) => {
    if (!localSettings) return;
    const updatedSettings = { ...localSettings };
    updatedSettings[field].splice(index, 1);
    setLocalSettings(updatedSettings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSettings) {
      updateSettings(localSettings);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Box sx={{ padding: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* Scrollbar at top */}
        <Box
          sx={{
            transform: "rotateX(180deg)",
            overflowX: "auto",
            display: "flex",
            gap: 3,
            pb: 2,
            alignItems: "stretch",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          {Object.keys(localSettings || {}).map((field) => (
            <Box
              key={field}
              sx={{
                bgcolor: "#e9e7d8",
                transform: "rotateX(180deg)",
                minWidth: 320,
                maxWidth: 320,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                mx: 0.25, // ⬅ horizontal margin
                my: 0.5, // ⬅ vertical margin (also gives shadow space)
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "#e9e7d8",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      mb: 2,
                      textTransform: "capitalize",
                    }}
                  >
                    {field}
                  </Typography>

                  <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                    {(localSettings as any)[field].map(
                      (item: string, index: number) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", gap: 1, mb: 1 }}
                        >
                          <TextField
                            className="bg-[#e8e6db]"
                            variant="outlined"
                            value={item}
                            onChange={(e) =>
                              handleInputChange(
                                field as keyof Settings,
                                index,
                                e.target.value
                              )
                            }
                            fullWidth
                            size="small"
                          />
                          <Tooltip title={t("buttons.delete")}>
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleRemoveItem(field as keyof Settings, index)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <TextField
                      variant="outlined"
                      value={newItem[field as keyof Settings]}
                      onChange={(e) =>
                        setNewItem({ ...newItem, [field]: e.target.value })
                      }
                      placeholder={t("placeholders.addItem", { field })}
                      fullWidth
                      size="small"
                    />
                    <Tooltip title={t("buttons.add")}>
                      <IconButton
                        color="primary"
                        onClick={() => handleAddItem(field as keyof Settings)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              paddingX: 4,
              paddingY: 1,
              fontWeight: "bold",
              borderRadius: 3,
            }}
          >
            {t("buttons.save")}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SelectSettings;
