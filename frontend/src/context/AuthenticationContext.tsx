import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Define the structure of the authentication context state
interface AuthContextType {
  authToken: string | null; // Stores the authentication token (JWT or session token)
  userGroup: string | null; // Stores the user role/group (e.g., "admin", "user")
  login: (token: string, group: string) => void; // Function to log in and store credentials
  logout: () => void; // Function to log out and clear credentials
  isAuthenticated: boolean; // Boolean flag indicating if the user is authenticated
  userName: string | null;
}

// Create the Authentication Context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to easily access the authentication context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to check if a JWT token is expired
const getTokenExpiration = (token: string): boolean => {
  try {
    // Decode the JWT token (Base64 decode payload part)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now(); // Compare expiration time with current time
  } catch (error) {
    return false; // If the token is invalid or parsing fails, consider it expired
  }
};

const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// Authentication Provider to manage global authentication state
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize authentication token from localStorage to persist login state
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  // Initialize user group from localStorage
  const [userGroup, setUserGroup] = useState<string | null>(() =>
    localStorage.getItem("userGroup")
  );
  // Initialize user group from localStorage
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem("userName")
  );

  // On component mount, check if the stored token is valid and restore authentication state
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedGroup = localStorage.getItem("userGroup");
    const storedUser = localStorage.getItem("userName");

    // If a token is found and is still valid, restore authentication state
    if (storedToken && getTokenExpiration(storedToken)) {
      setAuthToken(storedToken);
      setUserGroup(storedGroup);
      setUserName(storedUser);
    } else {
      logout(); // If the token is expired or invalid, log out the user
    }
  }, []);

  // Function to log in: stores token and user role in state and localStorage
  const login = (token: string) => {
    const decoded = decodeToken(token);
    if (decoded) {
      localStorage.setItem("token", token);
      localStorage.setItem("userGroup", decoded.group);
      localStorage.setItem("userName", decoded.username);
      setAuthToken(token);
      setUserGroup(decoded.group);
      setUserName(decoded.username);
    }
  };

  // Function to log out: removes token and user role from state and localStorage
  const logout = () => {
    localStorage.removeItem("token"); // Remove stored token
    localStorage.removeItem("userGroup"); // Remove stored user group
    localStorage.removeItem("userName");
    setAuthToken(null); // Reset state
    setUserGroup(null);
    setUserName(null);
  };

  // Determine if the user is authenticated (true if a valid token is present)
  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider
      value={{ authToken, userGroup, login, logout, isAuthenticated, userName }}
    >
      {children} {/* Provide authentication context to child components */}
    </AuthContext.Provider>
  );
};
