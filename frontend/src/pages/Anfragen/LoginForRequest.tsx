import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthenticationContext"; // Import the useAuth hook to access authentication functions
import { useNavigate } from "react-router-dom"; // Import useNavigate to programmatically navigate between routes
import { API_BASE_URL } from "../../security/config"; // Import the base URL for API requests

const LoginForRequest: React.FC = () => {
  // State variables to hold the form inputs and potential error messages
  const [username, setUsername] = useState(""); // State to hold the username input
  const [password, setPassword] = useState(""); // State to hold the password input
  const [error, setError] = useState(""); // State to hold any error messages
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); // State for the email in the forgot password form
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(""); // State for success/error messages in forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false); // State to toggle the forgot password input

  const { login } = useAuth(); // Extract the login function from the AuthContext
  const navigate = useNavigate(); // Initialize useNavigate to redirect users after login

  // Function to handle the login form submission
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      // Send a POST request to the login endpoint with the username and password
      const response = await axios.post(`${API_BASE_URL}/loginRequest`, {
        username,
        password,
      });

      const { accessToken, refreshToken } = response.data; // Extract the token from the response

      // Call the login function from the context to store the token
      login(accessToken, refreshToken);

      // Navigate to the home page after successful login
      navigate("/request");
    } catch (error) {
      // If the login fails, set an error message to be displayed
      setError("Invalid username or password");
    }
  };

  // Function to handle the forgot password form submission
  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      // Send a POST request to the forgot-password endpoint
      const response = await axios.post(
        `${API_BASE_URL}/users/forgot-password`,
        {
          email: forgotPasswordEmail,
        }
      );

      // Display a success message if the request is successful
      setForgotPasswordMessage(
        response.data.message || "Password reset email sent successfully"
      );
      setForgotPasswordEmail(""); // Clear the email input field
    } catch (error: any) {
      // Display an error message if the request fails
      setForgotPasswordMessage(
        error.response?.data?.message ||
          "An error occurred while sending the password reset email"
      );
    }
  };

  // Function to navigate to the Change Password page
  const handleChangePassword = () => {
    navigate("/change-password"); // Navigate to the Change Password page
  };

  const handleNavigateToAdmin = () => {
    navigate("/login-admin"); // Navigate to the Admin Login page
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      {/* Login Form Title */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-4 items-center bg-white">
        <button
          className="flex items-center justify-center text-2xl font-bold border rounded shadow h-16 w-full bg-blue-200"
          disabled
          onClick={handleNavigateToAdmin}
          type="button"
        >
          Login
        </button>
        <button
          className="flex items-center justify-center text-2xl font-bold border rounded shadow h-16 w-full hover:bg-gray-200 transition-colors duration-300"
          onClick={handleNavigateToAdmin}
          type="button"
        >
          Admin-Login
        </button>
      </div>

      {/* Form Element that handles submission */}
      <form onSubmit={handleLogin}>
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

        {/* Password Input Field */}
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update the password state on input change
            className="w-full p-2 border border-gray-300 rounded"
            required // Ensure this field is required
          />
        </div>

        {/* Display Error Message if login fails */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Submit Button for the Form */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Login
        </button>
      </form>

      {/* Forgot Password Section */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2"></h3>
        {/*Display the Reset Password button when the forgot password input is not shown */}
        {showForgotPassword && (
          <button
            onClick={() => setShowForgotPassword(true)} // Show the forgot password input when clicked
            className="w-full bg-gray-500 text-white p-2 rounded "
          >
            Reset Password
          </button>
        )}

        {/* Forgot Password Input Field and Form */}
        {showForgotPassword && (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-4">
              <label className="block mb-2">Enter your email</label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)} // Update the email state on input change
                className="w-full p-2 border border-gray-300 rounded"
                required // Ensure this field is required
              />
            </div>

            {/* Display Success/Error Message */}
            {forgotPasswordMessage && (
              <p
                className={`mb-4 ${
                  forgotPasswordMessage.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {forgotPasswordMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gray-500 text-white p-2 rounded"
            >
              Send Reset Email
            </button>
          </form>
        )}
      </div>

      {/* Change Password Section */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Change Password</h3>
        <button
          onClick={handleChangePassword} // Navigate to the Change Password page
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default LoginForRequest;
