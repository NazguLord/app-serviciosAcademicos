import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx';
import 'sweetalert2/dist/sweetalert2.min.css';



createRoot(document.getElementById('root')).render(
  <StrictMode>
       <AppProvider>
          <App />
       </AppProvider>  
  </StrictMode>,
)
