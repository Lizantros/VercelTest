// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Use destructuring to import the named export

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Retrieve the JWT token from local storage
  let isAuthenticated = false;

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Use the named export here
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
        isAuthenticated = true;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
