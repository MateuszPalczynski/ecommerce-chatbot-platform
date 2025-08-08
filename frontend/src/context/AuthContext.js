// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // <-- Dodaj ten import

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginOauth = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // --- NOWA FUNKCJA DO LOGOWANIA PRZEZ JWT ---
  const loginJwt = async (email, password) => {
    const response = await axios.post('http://localhost:8001/login/jwt', {
      username: email, // Backend oczekuje 'username'
      password: password,
    });
    const newToken = response.data.access_token;
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/';
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loginOauth, loginJwt, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);