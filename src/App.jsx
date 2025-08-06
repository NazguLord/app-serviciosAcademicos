// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import { ColorModeContext, useMode } from './theme'; // ✅ agregado
import { ThemeProvider, CssBaseline } from '@mui/material'; // ✅ agregado

function App() {
   const [theme, colorMode] = useMode(); // ✅ tema


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

    <Router basename="/sv/"> {/* <- "/sv" o "/app", según tu despliegue */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
    
     </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
