// src/pages/TopBar.jsx
import { Box, IconButton, useTheme, Avatar, Tooltip } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout"; // Ícono de Logout
import axios from "axios"; // Importa Axios
import logo from "../assets/CircularFondoAzul.png";
import logo2 from "../assets/CircularFullColor.png";
import { AppContext } from "../context/AppContext";

const Topbar = () => {
  const { logout } = useContext(AppContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);


const salir = () => {
  axios.post(
    import.meta.env.VITE_API_LOGOUT, // 👈 Vite usa import.meta.env
    {},
    { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
  )
  .then(() => {
    window.location.href = import.meta.env.VITE_RUTA_LOGIN; // 👈 también aquí
  })
  .catch(error => console.error('Error al cerrar sesión:', error));
};


  return (
   <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.CatoAccent[500],
    height: 80,
    width: '100%', // ✅ CRUCIAL: asegura que ocupe todo el ancho
    px: 2,          // ✅ opcional, para dar padding interno
    boxSizing: 'border-box', // ✅ asegura que el padding no rompa el ancho
  }}
>
      {/* Logo */}
      <Box display="flex" borderRadius="3px">
        <Box display="flex" alignItems="center">         
          <Avatar
            variant="square"
            src={theme.palette.mode === "light" ? logo : logo2}
            alt="Logo"
            sx={{
              backgroundColor: "transparent",
              verticalAlign: "middle",
              width: { xs: "80px", sm: "90px", md: "90px" },
              height: "auto",
            }}
          />
        </Box>
      </Box>

      {/* Iconos de la derecha */}
      <Box display="flex">
        {/* Cambio de tema */}
        <IconButton sx={{ color: colors.softWhiteAccent[400] }} onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Logout */}
        <Tooltip title="Cerrar sesión">
          <IconButton sx={{ color: colors.softWhiteAccent[400] }} onClick={salir}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Topbar;