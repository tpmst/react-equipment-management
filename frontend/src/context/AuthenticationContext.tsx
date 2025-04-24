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
  login: (token: string, refreshToken: string) => void; // Function to log in and store credentials
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
    const validateToken = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        const decoded = decodeToken(storedToken);
        if (decoded) {
          const expirationTime = decoded.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeLeft = expirationTime - currentTime;

          if (timeLeft > 0 && timeLeft <= 5 * 60 * 1000) {
            // If the token is about to expire in 5 minutes, renew it
            await renewToken();
          } else if (timeLeft <= 0) {
            // If the token is expired, log out
            logout();
          }
        } else {
          logout(); // Log out if the token is invalid
        }
      } else {
        logout(); // Log out if no token is found
      }
    };

    // Validate token on component mount
    validateToken();

    // Periodically validate the token every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to log in: stores token and user role in state and localStorage
  const login = async (token: string, refreshToken: string) => {
    try {
      const decoded = decodeToken(token);
      if (decoded) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken); // Store the refresh token
        localStorage.setItem("userGroup", decoded.group);
        localStorage.setItem("userName", decoded.username);
        setAuthToken(token);
        setUserGroup(decoded.group);
        setUserName(decoded.username);
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw error; // Rethrow the error to handle it in the calling component
    }
  };

  // Function to log out: removes token and user role from state and localStorage
  const logout = () => {
    localStorage.removeItem("token"); // Remove stored token
    localStorage.removeItem("userGroup"); // Remove stored user group
    localStorage.removeItem("userName");
    localStorage.removeItem("refreshToken");
    setAuthToken(null); // Reset state
    setUserGroup(null);
    setUserName(null);
  };

  // Function to renew the token
  const renewToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken"); // Retrieve the refresh token
      if (!refreshToken) {
        logout(); // Log out if no refresh token is available
        return;
      }

      // Call the API to renew the token
      const response = await fetch("/users/renew-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;

        // Decode the new token and update state and localStorage
        const decoded = decodeToken(newToken);
        if (decoded) {
          localStorage.setItem("token", newToken);
          localStorage.setItem("userGroup", decoded.group);
          localStorage.setItem("userName", decoded.username);
          setAuthToken(newToken);
          setUserGroup(decoded.group);
          setUserName(decoded.username);
        }
      } else {
        logout(); // Log out if the token renewal fails
      }
    } catch (error) {
      console.error("Error renewing token:", error);
      logout(); // Log out on error
    }
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
