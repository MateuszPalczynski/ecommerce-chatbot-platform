// src/components/AuthCallback.js

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  // Use the renamed function from the context
  const { loginOauth } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Call the correct function
      loginOauth(token); 
      navigate('/');
    } else {
      console.error("Authentication failed: No token provided.");
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return <div>Logging in...</div>;
}

export default AuthCallback;