//AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [sessionValid, setSessionValid] = useState(null); // null=cargando
  const [themeMode, setThemeMode] = useState('dark');
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const validarSesion = async () => {
    try {
      setLoading(true);
      const url = import.meta.env.VITE_API_VALIDATE || '/sv/api/session_validate_react.php';
      const res = await fetch(url, { method: 'GET', credentials: 'include' }); // same-origin via proxy
      const data = await res.json();
      //console.log('🔁 Respuesta de sesión:', data);

      if (data?.status === 'OK') {
        setUserData(data.userdata || {});
        setSessionValid(true);
      } else {
        setUserData({});
        setSessionValid(false);
      }
    } catch (err) {
      console.error('❌ Error al validar sesión:', err);
      setUserData({});
      setSessionValid(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { validarSesion(); }, []);

  const logout = () => {
    const loginUrl = import.meta.env.VITE_RUTA_LOGIN || '/';
    const returnTo = encodeURIComponent(window.location.href);
    window.location.href = `${loginUrl}?return=${returnTo}`;
  };

  return (
    <AppContext.Provider
      value={{
        // tema
        themeMode,
        toggleTheme,
        // sesión
        userData,
        setUserData,
        sessionValid,
        setSessionValid,
        loading,
        refreshSession: validarSesion,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
