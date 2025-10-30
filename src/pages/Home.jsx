// src/pages/Home.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, Tabs, Tab, Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import useMediaQuery from "@mui/material/useMediaQuery";
import Swal from 'sweetalert2';

import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes, denegarSolicitud, validarBiblioteca } from "../api/solicitudesApi";
import { AppContext } from "../context/AppContext";
import DetalleSolicitudServicioAcademico from "../components/DetalleSolicitudServicioAcademico";
import TablaSolicitudes from "../components/TablaSolicitudes";
import ExportButtons from "../components/ExportButtons";

const estados = [
  { label: "Pendientes", value: "Pendientes" },
  { label: "Proceso", value: "Proceso" },
  { label: "Completados", value: "Completados" },
  { label: "Denegados", value: "Denegados" },
];

const traducirEstado = (estado) => {
  const map = {
    PDT: "Pendiente",
    PGD: "En proceso",
    DNG: "Denegado",
    PDTP: "Pendiente de pago",
    CMP: "En proceso de entrega",
    FIN: "Entregado",
  };
  const code = String(estado ?? "").trim().toUpperCase();
  return map[code] ?? (code || "-");
};

const mapearSolicitudes = (datos = []) =>
  datos.map((item, idx) => ({
    id: `${item.CueCod}-${item.DocCod}-${item.DocEst}-${idx}`,
    DocCod: item.DocCod || "",
    CueCod: item.CueCod || "N/A",
    AluNom: item.CueNom || "Sin nombre",
    DocNom: item.DocNom || "Documento",
    EstReg: item.estadoreg || "-",
    CorNom: item.estadocond || "-",
    EstCont: item.estadocont || "N/A",
    BecNom: item.estadobeca || "-",
    DocEstRaw: String(item.DocEst || "").trim().toUpperCase(),
    EstNom: traducirEstado(item.DocEst),
    CueMail: item.CueMail || "-",
    CueTel: item.CueTel || "-",
    PlaNomEsp: item.PlaNomEsp || "-",
    DocLeng: item.DocLeng || "-",
    DocFchCre: item.DocFchCre || null,
    DocSolObs: item.DocSolObs || "-",
  }));

// 🔹 Nuevo componente memoizado solo para el modal
const DetalleWrapper = React.memo(({ open, filaSel, onClose, onDenegar, onUpdate }) => (
  <DetalleSolicitudServicioAcademico
    open={open}
    solicitud={filaSel}
    onClose={onClose}
    onDenegar={onDenegar}
    onUpdate={onUpdate}
  />
));

function Home() {
  const { userData, sessionValid } = useContext(AppContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [campusSeleccionado, setCampusSeleccionado] = useState("");
  const [estadoTab, setEstadoTab] = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [bibliotecaMap, setBibliotecaMap] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [listaCampus, setListaCampus] = useState([]);
  const [cargando, setCargando] = useState(false);

  const estadoActual = estados[estadoTab].value;

  // ✅ función reutilizable para cargar solicitudes
  const cargarSolicitudes = useCallback(async () => {
    if (!campusSeleccionado) return;
    setCargando(true);
    const data = await obtenerSolicitudes(campusSeleccionado, estadoActual);
    setSolicitudes(mapearSolicitudes(data));
    setCargando(false);
  }, [campusSeleccionado, estadoActual]);

  useEffect(() => {
    const cargarCampus = async () => {
      const campus = await obtenerCampus();
      setListaCampus(campus);
      if (campus.length > 0) setCampusSeleccionado(campus[0].CamCod);
    };
    cargarCampus();
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);


  // Construir el mapa de estados de Biblioteca por CueCod
 useEffect(() => {
   if (!solicitudes?.length) {
     setBibliotecaMap({});
     return;
   }
   const cueCods = [...new Set(solicitudes.map(s => s.CueCod).filter(Boolean))];
 
   let cancel = false;
   (async () => {
     const entries = await Promise.all(
       cueCods.map(async (cueCod) => {
         try {
           const r = await validarBiblioteca(cueCod);
           const estado = r.ok ? (r.tienePendientes ? "PDT" : "OK") : undefined;
           return [cueCod, estado];
         } catch {
           return [cueCod, undefined];
         }
       })
     );
     if (!cancel) setBibliotecaMap(Object.fromEntries(entries));
   })();
   return () => { cancel = true; };
 }, [solicitudes]);

 const handleSearch = (e) => setBusqueda(e.target.value.toLowerCase());

  useEffect(() => {
  const t = setTimeout(() => {
    setFiltro(busqueda.toLowerCase());
  }, 300); // espera 300ms
  return () => clearTimeout(t);
}, [busqueda]);

  // ✅ memoizamos para que no se recree siempre
  const handleDenegar = useCallback(async (row, observacion) => {
    try {
      setCargando(true);

      Swal.fire({
        title: 'Denegando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          document.activeElement?.blur();
          Swal.showLoading();
        },
        willClose: () => {
          const root = document.getElementById('root');
          root?.removeAttribute('aria-hidden');
        }
      });

      const r = await denegarSolicitud({
        DocCod: row.DocCod,
        estadoreg: row.EstReg ?? '',
        estadocont: row.EstCont ?? '',
        estadocond: row.CorNom ?? '',
        DocSolObsAdm: (observacion || '').trim(),
      });

      if (r?.status !== 'OK') {
        throw new Error(r?.payload?.message || 'No se pudo denegar');
      }

      await cargarSolicitudes();

      await Swal.fire({
        icon: 'success',
        title: r?.payload?.message || 'Solicitud denegada',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo denegar',
        text: e?.message || 'Error de red',
      });
    } finally {
      Swal.close();
      setCargando(false);
    }
  }, [cargarSolicitudes]);

  const handleTabChange = (event, newValue) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEstadoTab(newValue);
    setOpenDetalle(false);
  };

  const [openDetalle, setOpenDetalle] = useState(false);
  const [filaSel, setFilaSel] = useState(null);

  const abrirDetalle = (row, e) => {
    e?.currentTarget?.blur?.();
    setFilaSel(row);
    setTimeout(() => setOpenDetalle(true), 0);
  };
  const cerrarDetalle = () => setOpenDetalle(false);

  // ✅ memoizar las filas evita renders innecesarios en DataGrid
  const filasMemo = useMemo(() => solicitudes, [solicitudes]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%", px: 2, py: 3 }}>
      {/* Título */}
      <Box sx={{ textAlign: "center", mb: 4, mt: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
          <SchoolIcon
            sx={{
              fontSize: 42,
              color: isDark ? "#90caf9" : "#1976d2",
              textShadow: isDark ? "0 0 5px rgba(144,202,249,0.6)" : "none",
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              color: isDark ? "#ffffff" : "#0d47a1",
              textShadow: isDark ? "1px 1px 2px rgba(0,0,0,0.8)" : "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Servicios Académicos
          </Typography>
        </Box>
        <Box
          sx={{
            height: 4,
            width: 160,
            margin: "12px auto 0",
            borderRadius: 2,
            background: isDark
              ? "linear-gradient(90deg, #1976d2, #42a5f5)"
              : "linear-gradient(90deg, #0d47a1, #64b5f6)",
          }}
        />
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Campus</InputLabel>
          <Select
            value={campusSeleccionado}
            onChange={(e) => setCampusSeleccionado(e.target.value)}
            label="Campus"
          >
            {listaCampus.map((campus) => (
              <MenuItem key={campus.CamCod} value={campus.CamCod}>
                {campus.CamNomEsp}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Buscar"
          variant="outlined"
          value={busqueda}
          onChange={handleSearch}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Tabs */}
      <Paper elevation={2} sx={{ maxWidth: 500, width: "100%", mx: "auto", borderRadius: 2, mb: 2,  px: 2, py: 1, position: "relative"}}>
        <Tabs value={estadoTab} onChange={handleTabChange} centered textColor="primary" indicatorColor="primary">
          <Tab label="PENDIENTES" sx={{ color: theme.palette.warning.light }} />
          <Tab label="PROCESO" sx={{ color: theme.palette.warning.dark }} />
          <Tab label="COMPLETADOS" sx={{ color: theme.palette.success.main }} />
          <Tab label="DENEGADOS" sx={{ color: theme.palette.error.main }} />         
        </Tabs>  
        <Box sx={{ position: "absolute",  right: -90, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 1 }}>
          <ExportButtons
            rows={filasMemo}
            fileName={`solicitudes-${estadoActual}`} 
            campus={listaCampus.find(c => c.CamCod === campusSeleccionado)?.CamNomEsp || "Todos"} 
          />
        </Box>      
      </Paper>

      {/* DataGrid */}
      <TablaSolicitudes
        solicitudes={filasMemo}
        busqueda={busqueda}
        cargando={cargando}
        onVerDetalle={abrirDetalle}
        bibliotecaMap={bibliotecaMap}
      />

      {/* Modal detalle (memoizado en DetalleWrapper) */}
      <DetalleWrapper
        open={openDetalle}
        filaSel={filaSel}
        onClose={cerrarDetalle}
        onDenegar={handleDenegar}
        onUpdate={cargarSolicitudes}
      />
    </Box>
  );
}

export default Home;
