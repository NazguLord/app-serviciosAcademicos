// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from "@mui/material";
import Home from './pages/Home';
import Prueba from './pages/Prueba';
import Footer from './pages/Footer';
import TopBar from './pages/TopBar';

import { ColorModeContext, useMode } from './theme';
import { ThemeProvider, CssBaseline } from '@mui/material';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Router basename="/sv/">
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
                  <Route path="/" element={<Home />} />
                  <Route path="/prueba" element={<Prueba />} />
                </Routes>
              </Container>
            </Box>

            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
