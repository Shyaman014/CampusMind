import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusmind_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    API.post('/auth/logout').catch(() => {});
    localStorage.removeItem('campusmind_token');
    localStorage.removeItem('campusmind_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token, logout]);

  const login = async (email, password, rememberMe = false) => {
    const res = await API.post('/auth/login', { email, password, rememberMe });
    if (res.data.success) {
      const { user: userData, token: userToken } = res.data.data;
      localStorage.setItem('campusmind_token', userToken);
      if (rememberMe) {
        localStorage.setItem('campusmind_remember', 'true');
      } else {
        localStorage.removeItem('campusmind_remember');
      }
      setToken(userToken);
      setUser(userData);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    if (res.data.success) {
      const { user: userData, token: userToken } = res.data.data;
      localStorage.setItem('campusmind_token', userToken);
      setToken(userToken);
      setUser(userData);
      return res.data;
    }
  };

  const loginWithToken = async (userToken) => {
    localStorage.setItem('campusmind_token', userToken);
    setToken(userToken);
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        return res.data.data;
      }
    } catch (error) {
      console.error('Failed to load user with token:', error);
      logout();
      throw error;
    }
  };

  const logoutAllDevices = async () => {
    try {
      await API.post('/auth/logout-all');
    } catch (err) {
      console.error('Logout all devices failed:', err);
    } finally {
      logout();
    }
  };

  const resendVerificationEmail = async (email) => {
    const res = await API.post('/auth/resend-verification', { email });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        logoutAllDevices,
        resendVerificationEmail,
        setUser,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
