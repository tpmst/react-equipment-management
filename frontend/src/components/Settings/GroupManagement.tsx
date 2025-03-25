import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../security/config";
import { useAuth } from "../../context/AuthenticationContext";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

const GroupManagement: React.FC = () => {
  const { authToken } = useAuth();
  const { t } = useTranslation();
  const [groups, setGroups] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [allPermissions] = useState([
    "dashboard",
    "pdf",
    "xlsx",
    "tabelle",
    "drucker",
    "einkauf",
    "telefon",
    "settings",
    "it",
  ]);

  // Fetch groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      if (!authToken) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/groups`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setGroups(response.data);
      } catch (error) {
        setError("Error fetching groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [authToken]);

  // Handle opening edit modal
  const handleEditClick = (group: string) => {
    setSelectedGroup(group);
    setGroupName(group);
    setPermissions(groups[group] || []);
    setIsEditModalOpen(true);
  };

  // Handle updating a group
  const handleUpdateGroup = async () => {
    if (!selectedGroup || !authToken) return;

    try {
      await axios.put(
        `${API_BASE_URL}/groups/edit/${selectedGroup}`,
        { newGroupName: groupName, newPermissions: permissions },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setGroups((prev) => {
        const updatedGroups = { ...prev };
        delete updatedGroups[selectedGroup];
        updatedGroups[groupName] = permissions;
        return updatedGroups;
      });
      setIsEditModalOpen(false);
    } catch (error) {
      setError("Error updating group");
    }
  };

  // Handle deleting a group
  const handleDeleteClick = async (group: string) => {
    if (!authToken) return;
    try {
      await axios.delete(`${API_BASE_URL}/groups/delete/${group}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setGroups((prev) => {
        const updatedGroups = { ...prev };
        delete updatedGroups[group];
        return updatedGroups;
      });
    } catch (error) {
      setError("Error deleting group");
    }
  };

  // Handle adding a new group
  const handleAddGroup = async () => {
    if (!authToken) return;
    try {
      await axios.post(
        `${API_BASE_URL}/groups/add`,
        { groupName, permissions },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setGroups((prev) => ({ ...prev, [groupName]: permissions }));
      setIsAddModalOpen(false);
      setGroupName("");
      setPermissions([]);
    } catch (error) {
      setError("Error adding group");
    }
  };

  return (
    <div className="p-6">

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>{t("loading")}...</p>
      ) : (
        <List>
          {Object.keys(groups).map((group) => (
            <ListItem key={group} className="border-b">
              <ListItemText
                primary={group}
                secondary={groups[group].join(", ")}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEditClick(group)}>
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(group)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Button
        startIcon={<Add />}
        variant="contained"
        color="primary"
        className="mt-4"
        onClick={() => setIsAddModalOpen(true)}
      >
        {t("groups.addGroup")}
      </Button>

      {/* Edit Group Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle>{t("groups.editGroup")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("groups.groupName")}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            className="mb-4"
          />
          <h3 className="text-lg">{t("groups.permissions")}</h3>
          {allPermissions.map((perm) => (
            <div key={perm} className="flex items-center">
              <Checkbox
                checked={permissions.includes(perm)}
                onChange={(e) =>
                  setPermissions((prev) =>
                    e.target.checked
                      ? [...prev, perm]
                      : prev.filter((p) => p !== perm)
                  )
                }
              />
              <span>{perm}</span>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleUpdateGroup} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Group Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <DialogTitle>{t("groups.addGroup")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("groups.groupName")}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            className="mb-4"
          />
          <h3 className="text-lg">{t("groups.permissions")}</h3>
          {allPermissions.map((perm) => (
            <div key={perm} className="flex items-center">
              <Checkbox
                checked={permissions.includes(perm)}
                onChange={(e) =>
                  setPermissions((prev) =>
                    e.target.checked
                      ? [...prev, perm]
                      : prev.filter((p) => p !== perm)
                  )
                }
              />
              <span>{perm}</span>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddGroup} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupManagement;
