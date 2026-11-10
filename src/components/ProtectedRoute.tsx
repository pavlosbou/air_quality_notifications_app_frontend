import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token, setUsername } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means loading
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("ProtectedRoute Rendered");
  console.log("Protected Route Token:", token);  // Check if the token is correctly logged

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Replace with your actual backend API endpoint
        const response = await fetch(`${apiUrl}/protected`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Server response:', data);
          console.log(data.user.username);
          sessionStorage.setItem('username', data.user.username);
          setUsername(data.user.username);
          setIsAuthenticated(data.success); // Assume the server sends back `success: true/false`
        } else {
          console.error('Token verification failed');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsAuthenticated(false); // No token means unauthenticated
    }
  }, [token]);

  console.log("Authenticated", isAuthenticated);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes via Outlet
  return <Outlet />;
};

export default ProtectedRoute;
