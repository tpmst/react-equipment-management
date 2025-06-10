import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./security/Login"; // Ensure this path is correct
import PrivateRoute from "./security/PrivateRoute"; // Ensure this path is correct
import { AuthProvider } from "./context/AuthenticationContext"; // Ensure this path is correct
import HomePage from "./pages/Home/HomePage";
import { ThemeProvider } from "./context/themeContext";
import ChangePassword from "./security/chnagePassword";
import AnfragePage from "./pages/Anfragen/RequestPage";
import LoginForRequest from "./pages/Anfragen/LoginForRequest";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router basename="/edv-bestellung">
          <Routes>
            {/* Public Route */}
            <Route path="/login-admin" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage></HomePage>
                </PrivateRoute>
              }
            />

            {/* Request a device */}

            <Route path="/login" element={<LoginForRequest />}></Route>
            <Route
              path="/request"
              element={
                <PrivateRoute>
                  <AnfragePage />
                </PrivateRoute>
              }
            />

            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
