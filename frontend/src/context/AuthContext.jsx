import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('campusmind_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusmind_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    API.post('/auth/logout').catch(() => {});
    localStorage.removeItem('campusmind_token');
    localStorage.removeItem('campusmind_refresh_token');
    localStorage.removeItem('campusmind_user');
    localStorage.removeItem('campusmind_remember');
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
      const currentToken = localStorage.getItem('campusmind_token');
      const refreshToken = localStorage.getItem('campusmind_refresh_token');

      if (currentToken || refreshToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('campusmind_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          if (refreshToken) {
            try {
              const refreshRes = await API.post(
                '/auth/refresh',
                { refreshToken },
                { headers: { 'x-refresh-token': refreshToken } }
              );
              if (refreshRes.data?.success && refreshRes.data?.data?.token) {
                const newToken = refreshRes.data.data.token;
                const newRefresh = refreshRes.data.data.refreshToken;
                localStorage.setItem('campusmind_token', newToken);
                if (newRefresh) {
                  localStorage.setItem('campusmind_refresh_token', newRefresh);
                }
                setToken(newToken);
                API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                const retryRes = await API.get('/auth/me');
                if (retryRes.data?.success && retryRes.data?.data) {
                  setUser(retryRes.data.data);
                  localStorage.setItem('campusmind_user', JSON.stringify(retryRes.data.data));
                  setLoading(false);
                  return;
                }
              }
            } catch (refreshErr) {
              console.error('Failed to restore session via refresh token:', refreshErr);
            }
          }
          console.error('Failed to load user:', error);
          logout();
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [logout]);

  const login = async (email, password, rememberMe = false) => {
    const res = await API.post('/auth/login', { email, password, rememberMe });
    if (res.data.success) {
      const { user: userData, token: userToken, refreshToken: userRefreshToken } = res.data.data;
      localStorage.setItem('campusmind_token', userToken);
      if (userRefreshToken) {
        localStorage.setItem('campusmind_refresh_token', userRefreshToken);
      }
      localStorage.setItem('campusmind_user', JSON.stringify(userData));
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
      const { user: userData, token: userToken, refreshToken: userRefreshToken } = res.data.data;
      localStorage.setItem('campusmind_token', userToken);
      if (userRefreshToken) {
        localStorage.setItem('campusmind_refresh_token', userRefreshToken);
      }
      localStorage.setItem('campusmind_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return res.data;
    }
  };

  const loginWithToken = async (userToken, userRefreshToken = null) => {
    localStorage.setItem('campusmind_token', userToken);
    if (userRefreshToken) {
      localStorage.setItem('campusmind_refresh_token', userRefreshToken);
    }
    setToken(userToken);
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('campusmind_user', JSON.stringify(res.data.data));
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
