import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useAuth } from "../../context/AuthenticationContext";
import { useTranslation } from "react-i18next";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Delete, CloudDownload } from "@mui/icons-material";

const FileManagement: React.FC = () => {
  const { authToken } = useAuth();
  const { t } = useTranslation();

  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available folders from backend
  useEffect(() => {
    const fetchFolders = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/list-folders`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.folders.length > 0) {
          setFolders(response.data.folders);
          setSelectedFolder(response.data.folders[0]); // Auto-select first folder
        }
      } catch (error) {
        setError("Error fetching folders");
      }
    };
    fetchFolders();
  }, [authToken]);

  // Fetch files whenever the selected folder changes
  useEffect(() => {
    if (selectedFolder) {
      fetchFiles(selectedFolder);
    }
  }, [selectedFolder]);

  // Function to fetch files for a given folder
  const fetchFiles = async (folder: string) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/list-files/${folder}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFiles(response.data.files);
    } catch (error) {
      setError("Error fetching files");
    } finally {
      setLoading(false);
    }
  };

  // Handle file download
  const handleDownload = async (filename: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/download-file/${selectedFolder}/${filename}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Error downloading file");
    }
  };

  // Handle file deletion
  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/delete-file/${selectedFolder}/${filename}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setFiles((prev) => prev.filter((file) => file !== filename)); // Remove file from state
    } catch (error) {
      setError("Error deleting file");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-6">{t("filesettings.header2")}</h2>
      {error && <p className="text-red-500">{error}</p>}
      {/* Folder Selection Dropdown */}
      <FormControl fullWidth className="mb-4">
        <Select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          disabled={folders.length === 0}
        >
          {folders.map((folder) => (
            <MenuItem key={folder} value={folder}>
              {folder}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <p>{t("loading")}...</p>
      ) : files.length === 0 ? (
        <p>No files available in this folder</p>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem key={file} className="border-b">
              <ListItemText primary={file} />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => handleDownload(file)}
                  color="primary"
                >
                  <CloudDownload />
                </IconButton>
                <IconButton onClick={() => handleDelete(file)} color="error">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default FileManagement;
