//App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from "@mui/material";

import Home from './pages/Home';
import Prueba from './pages/Prueba';
import Footer from './pages/Footer';
import TopBar from './pages/TopBar';

import { ColorModeContext, useMode } from './theme';
import { ThemeProvider, CssBaseline } from '@mui/material';

import { AppProvider } from './context/AppContext';
import ProtectedRoute from './context/ProtectedRoute';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* SIN la barra al final */}
        <Router basename="/sv">
          {/* 🔐 Provee sesión y permisos a toda la app */}
          <AppProvider>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default 
              }}
            >
              <TopBar />

              <Box sx={{ flexGrow: 1, p: 2 }}>
                <Container maxWidth="xl">
                  <Routes>
                    <Route
  path="/"
  element={
    <ProtectedRoute
      element={<Home />}
     // roles={['1']}
     // campus={['99']}
     // requireAll={['CORE.CORE000']}
    />
  }
/>
                    <Route path="/prueba" element={<Prueba />} />

                    {/* ejemplos protegidos */}
                    {/* <Route path="/soloAdmin" element={<ProtectedRoute element={<SoloAdmin />} roles={['1']} />} /> */}
                    {/* <Route path="/soloCampus4" element={<ProtectedRoute element={<SoloCampus4 />} campus={['4']} />} /> */}
                  </Routes>
                </Container>
              </Box>

              <Footer />
            </Box>
          </AppProvider>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
