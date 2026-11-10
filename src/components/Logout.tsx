import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Logout: React.FC = () => {
  const { setToken,setUsername,setSubscriptions } = useContext(AuthContext);
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username}),
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        sessionStorage.clear();
        navigate('/');  // Redirect to home page after logging out   
      } else {
        console.log("error: logging out");
      }
    } catch (error) {
      console.log("error: logging out")
    }
  };

  useEffect(() => {
    const handleLogoutOnTabClose = async () => {
      // Perform logout logic here, e.g., clearing localStorage, calling the API
      try {
        const response =await fetch(`${apiUrl}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: localStorage.getItem('username') }),
        });
        const result = await response.json();
        console.log(result);
        if (result.success) {
          sessionStorage.clear();
          navigate('/');  // Redirect to home page after logging out   
        } else {
          console.log("error: logging out");
        }
      } catch (error) {
        console.error("Error logging out", error);
      }
      localStorage.removeItem('token'); // Clear token
    };
  

    // Add event listener for tab/window close
    window.addEventListener('beforeunload', handleLogoutOnTabClose);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleLogoutOnTabClose);
    };
  }, []);

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
