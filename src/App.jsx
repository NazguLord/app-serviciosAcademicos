// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {  Box } from "@mui/material";
import Home from './pages/Home';
import Footer from './pages/Footer';
import TopBar from './pages/TopBar';

import { ColorModeContext, useMode } from './theme'; // ✅ agregado
import { ThemeProvider, CssBaseline } from '@mui/material'; // ✅ agregado

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <TopBar />

          <Box sx={{ flexGrow: 1 }}>
            <Router basename="/sv/">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </Router>
          </Box>

          <Footer />
        </Box>
        
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
