// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Products from './components/Products';
import Cart from './components/Cart';
import Payments from './components/Payments';
import AuthCallback from './components/AuthCallback';
import Login from './components/Login';
import Chat from './components/Chat';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// AuthNav component is simplified, as login links are now in the main nav
function AuthNav() {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="auth-buttons">
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // When not logged in, this part is handled by the main navigation
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* We need to use a small component here to get access to the useAuth hook */}
          <Navigation />
          
          <div className="container">
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/chat" element={<Chat />} /> {/* Add the new route for the Chat */}
              
              {/* --- PROTECTED ROUTES --- */}
              {/* These routes are only available if the user is authenticated */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/payments" element={<Payments />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// A new component for the navigation bar to access the auth context
function Navigation() {
    const { isAuthenticated } = useAuth();
    const authApiUrl = process.env.API_AUTH_URL || 'http://localhost:8001';
    const googleLoginUrl = `${authApiUrl}/login/google`;

    return (
        <nav className="nav-bar">
            <div className="nav-links">
              <Link to="/">Products</Link>
              <Link to="/chat">Chat with bot</Link> {/* Add the new link to the Chat */}

              {/* --- PROTECTED LINKS --- */}
              {/* These links are only shown if the user is authenticated */}
              {isAuthenticated && (
                <>
                  <Link to="/cart">Card</Link>
                  <Link to="/payments">Payments</Link>
                </>
              )}
            </div>
            
            {/* Render login options only if not authenticated */}
            {!isAuthenticated ? (
                <div className="auth-buttons">
                    <Link to="/login"><button>Login</button></Link>
                    <button onClick={() => window.location.href = googleLoginUrl}>Login with Google</button>
                </div>
            ) : (
                <AuthNav />
            )}
        </nav>
    );
}

export default App;