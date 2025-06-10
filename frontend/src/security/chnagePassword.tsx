import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate to programmatically navigate between routes
import { API_BASE_URL } from "./config"; // Import the base URL for API requests

const ChangePassword: React.FC = () => {
  // State variables to hold the form inputs and potential error messages
  const [username, setUsername] = useState(""); // State to hold the username input
  const [password, setCurrentPassword] = useState(""); // State to hold the current password input
  const [newPassword, setNewPassword] = useState(""); // State to hold the new password input
  const [error, setError] = useState(""); // State to hold any error messages
  const [success, setSuccess] = useState(""); // State to hold success messages

  const navigate = useNavigate(); // Initialize useNavigate to redirect users after successful password change

  // Function to handle the change password form submission
  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      const response2 = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password, // Verwende `password` statt `password`
      });

      const { accessToken } = response2.data; // Extract the token from the response
      const token = accessToken;
      console.log(token);
      // Send a PUT request to the change-password endpoint
      const response = await axios.post(
        `${API_BASE_URL}/users/change-password`,
        {
          token, // Include the access token in the request body
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token stored in localStorage
          },
        }
      );

      // Display a success message if the request is successful
      setSuccess(response.data.message || "Password changed successfully");
      setError(""); // Clear any previous error messages

      // Clear the form fields
      setUsername("");
      setCurrentPassword("");
      setNewPassword("");

      // Optionally navigate to another page after success
      setTimeout(() => navigate("/login"), 5000); // Redirect to login page after 2 seconds
    } catch (error: any) {
      // Display an error message if the request fails
      setError(
        error.response?.data?.message ||
          "An error occurred while changing the password"
      );
      setSuccess(""); // Clear any previous success messages
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      {/* Change Password Form Title */}
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>

      {/* Display Error Message if password change fails */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Display Success Message if password change succeeds */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{success}</p>
        </div>
      )}

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword}>
        {/* Username Input Field */}
        <div className="mb-4">
          <label className="block mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update the username state on input change
            className="w-full p-2 border border-gray-300 rounded"
            required // Ensure this field is required
          />
        </div>

        {/* Current Password Input Field */}
        <div className="mb-4">
          <label className="block mb-2">Current Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setCurrentPassword(e.target.value)} // Update the current password state on input change
            className="w-full p-2 border border-gray-300 rounded"
            required // Ensure this field is required
          />
        </div>

        {/* New Password Input Field */}
        <div className="mb-4">
          <label className="block mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Update the new password state on input change
            className="w-full p-2 border border-gray-300 rounded"
            required // Ensure this field is required
          />
        </div>

        {/* Submit Button for Changing Password */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Change Password
        </button>
      </form>

      {/* Go Back to Login Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/login")} // Navigate back to the login page
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-300"
        >
          Go Back to Login
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
