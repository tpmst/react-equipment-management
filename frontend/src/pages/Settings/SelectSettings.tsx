import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
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
  itCategories: string[]; // New property for IT categories
}

const SelectSettings = () => {
  const [newItem, setNewItem] = useState<Record<keyof Settings, string>>({
    orderedBy: "",
    betriebsmittel: "",
    departments: "",
    categories: "",
    conditions: "",
    itCategories: "", // New field for IT categories
  });
  const { settings, updateSettings, loading, error } = useSettings();
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        orderedBy: settings.orderedBy || [],
        betriebsmittel: settings.betriebsmittel || [],
        departments: settings.departments || [],
        categories: settings.categories || [],
        conditions: settings.conditions || [],
        itCategories: settings.itCategories || [], // Initialize itCategories
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localSettings) {
      updateSettings(localSettings);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const color = "#e9e7d8";

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Horizontal scrollable container */}
        <div
          className="flex overflow-x-auto space-x-6 pb-4"
          style={{
            whiteSpace: "nowrap",
            paddingBottom: "1rem",
            scrollbarWidth: "thin",
          }}
        >
          {Object.keys(localSettings || {}).map((field) => (
            <div
              className="inline-block"
              key={field}
              style={{
                minWidth: "320px",
                maxWidth: "320px",
                flexShrink: 0,
              }}
            >
              <Card
                variant="outlined"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  backgroundColor: color,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    style={{ textAlign: "center", fontWeight: "bold" }}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Typography>
                  {localSettings &&
                    (localSettings as any)[field].map(
                      (item: string, index: number) => (
                        <div
                          key={index}
                          className="mb-2 flex items-center"
                          style={{ gap: "8px" }}
                        >
                          <TextField
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
                          />
                          <IconButton
                            onClick={() =>
                              handleRemoveItem(field as keyof Settings, index)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      )
                    )}

                  <div
                    className="mb-2 flex items-center"
                    style={{ gap: "8px" }}
                  >
                    <TextField
                      variant="outlined"
                      value={newItem[field as keyof Settings]}
                      onChange={(e) =>
                        setNewItem({ ...newItem, [field]: e.target.value })
                      }
                      placeholder={`Add new ${field}`}
                      fullWidth
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleAddItem(field as keyof Settings)}
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: "1rem" }}
        >
          {t("buttons.save")}
        </Button>
      </form>
    </div>
  );
};

export default SelectSettings;
