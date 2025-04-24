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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

const UserManagement: React.FC = () => {
  const { authToken } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<
    { username: string; group: string; email: string }[]
  >([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Optional for edit
  const [userGroup, setUserGroup] = useState("");
  const [email, setEmail] = useState("");

  // Fetch users and groups from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) return;
      setLoading(true);
      try {
        const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUsers(usersResponse.data);

        const groupsResponse = await axios.get(`${API_BASE_URL}/groups`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setGroups(Object.keys(groupsResponse.data));
      } catch (error) {
        setError("Error fetching users and groups");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken]);

  // Handle opening edit modal
  const handleEditClick = (user: {
    username: string;
    group: string;
    email: string;
  }) => {
    setSelectedUser(user.username);
    setUsername(user.username);
    setUserGroup(user.group);
    setEmail(user.email); // Set the email for editing
    setPassword(""); // Password reset optional
    setIsEditModalOpen(true);
  };

  // Handle updating a user
  const handleUpdateUser = async () => {
    if (!selectedUser || !authToken) return;

    try {
      await axios.put(
        `${API_BASE_URL}/users/edit/${selectedUser}`,
        {
          newUsername: username,
          newPassword: password || undefined,
          newGroup: userGroup,
          newEmail: email, // Include the new email in the request
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.username === selectedUser
            ? { username, group: userGroup, email } // Update email in the local state
            : user
        )
      );
      setIsEditModalOpen(false);
      setUsername("");
      setPassword("");
      setUserGroup("");
      setEmail(""); // Clear email field
    } catch (error) {
      setError("Error updating user");
    }
  };

  // Handle deleting a user
  const handleDeleteClick = async (username: string) => {
    if (!authToken) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/delete/${username}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers((prev) => prev.filter((user) => user.username !== username));
    } catch (error) {
      setError("Error deleting user");
    }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    if (!authToken) return;
    try {
      await axios.post(
        `${API_BASE_URL}/users/add`,
        { username, password, group: userGroup, email }, // Include email in the request
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUsers((prev) => [...prev, { username, group: userGroup, email }]); // Add email to the local state
      setIsAddModalOpen(false);
      setUsername("");
      setPassword("");
      setUserGroup("");
      setEmail(""); // Clear email field
    } catch (error) {
      setError("Error adding user");
    }
  };

  return (
    <div className="p-6">
      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>{t("loading")}...</p>
      ) : (
        <List>
          {users.map((user) => (
            <ListItem key={user.username} className="border-b">
              <ListItemText
                primary={user.username}
                secondary={`${user.group} - ${user.email}`}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEditClick(user)}>
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(user.username)}
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
        {t("users.addUser")}
      </Button>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle>{t("users.editUser")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("users.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            className="mb-4"
          />
          <TextField
            label={t("users.newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            className="mb-4"
            type="password"
          />
          <TextField
            label={t("users.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            className="mb-4"
          />
          <FormControl fullWidth className="mb-4">
            <InputLabel>{t("users.group")}</InputLabel>
            <Select
              value={userGroup}
              onChange={(e) => setUserGroup(e.target.value)}
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleUpdateUser} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <DialogTitle>{t("users.addUser")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("users.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            className="mb-4" // Abstand unten
          />
          <div className="mb-4"></div> {/* Abstand zwischen Feldern */}
          <TextField
            label={t("users.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            className="mb-4" // Abstand unten
            type="password"
          />
          <div className="mb-4"></div> {/* Abstand zwischen Feldern */}
          <TextField
            label={t("users.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            className="mb-4" // Abstand unten
          />
          <div className="mb-4"></div> {/* Abstand zwischen Feldern */}
          <FormControl fullWidth className="mb-4">
            <InputLabel>{t("users.group")}</InputLabel>
            <Select
              value={userGroup}
              onChange={(e) => setUserGroup(e.target.value)}
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddUser} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
