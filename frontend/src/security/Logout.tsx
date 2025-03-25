import { useState, useEffect } from "react";

const useAuth = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the token from local storage on mount
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    setAuthToken(null); // Clear token in state
  };

  const handleLogin = (token: string) => {
    localStorage.setItem("token", token); // Save token to storage
    setAuthToken(token); // Update token in state
  };

  return { authToken, handleLogin, handleLogout };
};

export default useAuth;
