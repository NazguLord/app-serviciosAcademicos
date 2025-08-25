//AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [sessionValid, setSessionValid] = useState(null);
  const [themeMode, setThemeMode] = useState('dark');

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const validarSesion = async () => {
      try {
         const response = await fetch('http://login.sec.unicah.net/api/session_validate_react.php', {
          method: 'GET',
          credentials: 'include', // 🔐 importante para enviar cookies PHP
        });

        const data = await response.json();
        console.log("🔁 Respuesta de sesión:", data);

        if (data.status === "OK") {
          setUserData(data.userdata);
          setSessionValid(true);
        } else {
          setSessionValid(false);
        }
      } catch (error) {
        console.error("❌ Error al validar sesión:", error);
        setSessionValid(false);
      }
    };

    validarSesion();
  }, []);

  return (
    <AppContext.Provider
      value={{
        themeMode,
        toggleTheme,
        userData,
        setUserData,
        sessionValid,
        setSessionValid,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};