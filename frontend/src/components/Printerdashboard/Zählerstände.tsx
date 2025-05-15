import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Dashboard component for displaying printer data in a table
const Zaelerstaende = () => {
  const { t } = useTranslation(); // Use translation hook
  const [data, setData] = useState<any[]>([]); // Store parsed JSON data
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);

    if (token) {
      setAuthToken(token);
    } else {
      setError(t("error.noToken")); // Set error message using translation
      return;
    }

    const fetchPrinterCounts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/printercounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (error: any) {
        setError(
          `${t("error.fetchPrinterCounts")} ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrinterCounts();
  }, [authToken, t]);

  // Improved copy-to-clipboard function with fallback
  const copyToClipboard = (value: string) => {
    if (!navigator.clipboard) {
      fallbackCopyToClipboard(value);
      return;
    }

    navigator.clipboard.writeText(value).catch((err) => {
      console.error(`Failed to copy using clipboard API: ${err}`);
      fallbackCopyToClipboard(value); // Use fallback if clipboard API fails
    });
  };

  // Fallback method using `document.execCommand("copy")`
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("Copied using fallback method");
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

  if (error) {
    return (
      <div>
        {t("error.general")}: {error}
      </div>
    );
  }

  if (loading) {
    return <div>{t("status.loading")}...</div>;
  }

  return (
    <div className="overflow-auto p-4">
      <table className="min-w-full bg-white border border-gray-300 dark:bg-[#1e293b]">
        <thead>
          <tr>
            <th className="px-4 py-2 bg-[#cccabc] text-black border sticky top-0 dark:text-gray-100 dark:bg-gray-700">
              {t("table.name")}
            </th>
            <th className="px-4 py-2 bg-[#cccabc] text-black border sticky top-0 dark:text-gray-100 dark:bg-gray-700">
              {t("table.ipAddress")}
            </th>
            <th className="px-4 py-2 bg-[#cccabc] text-black border sticky top-0 dark:text-gray-100 dark:bg-gray-700">
              {t("table.printsBlackWhite")}
            </th>
            <th className="px-4 py-2 bg-[#cccabc] text-black border sticky top-0 dark:text-gray-100 dark:bg-gray-700">
              {t("table.printsColor")}
            </th>
            <th className="px-4 py-2 bg-[#cccabc] text-black border sticky top-0 dark:text-gray-100 dark:bg-gray-700">
              {t("table.status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((device, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border bg-[#e9e7d8]  text-black dark:bg-gray-600  dark:text-gray-100">
                {device.Name}
              </td>
              <td className="px-4 py-2 border bg-[#e9e7d8]  text-black dark:bg-gray-600  dark:text-gray-100">
                {device.IP}
              </td>
              <td className="px-4 py-4 bg-[#e9e7d8]  text-black dark:bg-gray-600  dark:text-gray-100 ">
                <div className="flex justify-between items-center">
                  <div>{device.PrintsBlackWhite}</div>
                  <ContentCopyIcon
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
                    onClick={() => copyToClipboard(device.PrintsBlackWhite)}
                  />
                </div>
              </td>
              <td className="px-4 py-4 bg-[#e9e7d8] text-black dark:bg-gray-600 dark:text-gray-100">
                <div className="flex justify-between items-center">
                  <div>{device.PrintsColor}</div>
                  <ContentCopyIcon
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
                    onClick={() => copyToClipboard(device.PrintsColor)}
                  />
                </div>
              </td>

              <td
                className={`px-4 py-2 border bg-[#e9e7d8] dark:bg-gray-600  ${
                  device.Status === "Online" ? "text-green-600" : "text-red-600"
                }`}
              >
                {device.Status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Zaelerstaende;
