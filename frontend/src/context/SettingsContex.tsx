import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../security/config"; // API Base URL

// Define the shape of Link
interface Link {
  text: string;
  url: string;
}

// Define the shape of your settings, including standardHardware with links
interface Settings {
  orderedBy?: string[];
  betriebsmittel?: string[];
  departments?: string[];
  categories?: string[];
  conditions?: string[];
  standardHardware?: { item: string; links: Link[] }[];
  itCategories?: string[]; // New property for IT categories
}

// Default settings fallback in case the backend call fails
const defaultSettings: Settings = {
  orderedBy: [],
  betriebsmittel: [],
  departments: [],
  categories: [],
  conditions: [],
  standardHardware: [],
  itCategories: [], // Default value for IT categories
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

// Create a custom hook to use the SettingsContext
export const useSettings = () => useContext(SettingsContext);

// Create a provider component to wrap your app
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from the backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from local storage
        const response = await axios.get(`${API_BASE_URL}/getConfig`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Make sure the response structure matches your new Settings structure
        if (response.data) {
          const fetchedSettings: Settings = response.data;
          setSettings(fetchedSettings); // Load the settings from the backend
        } else {
          setError("Invalid settings structure from server.");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching settings");
      } finally {
        setLoading(false); // Stop loading after the API call
      }
    };

    fetchSettings();
  }, []);

  // Function to update settings (also sends the update to the backend)
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
      setSettings(newSettings); // Update the settings globally
    } catch (err: any) {
      setError(err.message || "Error updating settings");
    } finally {
      setLoading(false); // Stop loading after the update
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
