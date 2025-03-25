import axios from "axios";
import { API_BASE_URL } from "../../security/config";

export const fetchCSVFiles = async (token: string) => {
  const mainResponse = await axios.get(`${API_BASE_URL}/download-csv/03_it-einkauf.csv`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "text",
  });

  const krimskramsResponse = await axios.get(`${API_BASE_URL}/download-csv/02_it-kleinZeug.csv`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "text",
  });

  const itResponse = await axios.get(`${API_BASE_URL}/download-csv/07_it-geraete.csv`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "text",
  });

  const parseCSV = (text: string) => text.split("\n").map((row) => row.split(";"));

  return {
    mainData: parseCSV(mainResponse.data),
    krimskramsData: parseCSV(krimskramsResponse.data),
    itData: parseCSV(itResponse.data)
  };
};
