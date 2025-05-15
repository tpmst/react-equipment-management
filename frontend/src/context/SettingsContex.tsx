import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../security/config";

// Define the shape of a Link (used in standardHardware)
interface Link {
  text: string;
  url: string;
}

// Define the shape of all configurable settings
interface Settings {
  orderedBy?: string[];
  betriebsmittel?: string[];
  departments?: string[];
  categories?: string[];
  conditions?: string[];
  standardHardware?: { item: string; links: Link[] }[];
  itCategories?: string[];
  enablePrinters?: string[]; // New toggle
  enableBetriebsmitteleintrag?: string[]; // New toggle
}

// Default settings to fall back on
const defaultSettings: Settings = {
  orderedBy: [],
  betriebsmittel: [],
  departments: [],
  categories: [],
  conditions: [],
  standardHardware: [],
  itCategories: [],
  enablePrinters: ["false"],
  enableBetriebsmitteleintrag: ["false"],
};

// Create the context
const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  loading: boolean;
  error: string | null;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
  loading: true,
  error: null,
});

// Custom hook for using the context
export const useSettings = () => useContext(SettingsContext);

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/getConfig`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          const fetchedSettings: Settings = response.data;

          // Merge with defaults to ensure new keys like enablePrinters exist
          const mergedSettings: Settings = {
            ...defaultSettings,
            ...fetchedSettings,
          };

          setSettings(mergedSettings);
        } else {
          setError("Invalid settings structure from server.");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update settings on backend and in context
  const updateSettings = async (newSettings: Settings) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      setLoading(true);

      await axios.post(`${API_BASE_URL}/updateConfig`, newSettings, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSettings(newSettings);
    } catch (err: any) {
      setError(err.message || "Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, loading, error }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
