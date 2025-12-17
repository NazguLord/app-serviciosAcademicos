// src/pages/Home.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, Tabs, Tab, Paper, CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import Swal from "sweetalert2";

import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes, denegarSolicitud, validarBiblioteca } from "../api/solicitudesApi";
import { AppContext } from "../context/AppContext";
import DetalleSolicitudServicioAcademico from "../components/DetalleSolicitudServicioAcademico";
import TablaSolicitudes from "../components/TablaSolicitudes";
import ExportButtons from "../components/ExportButtons";
import { obtenerDocumentosCampusDeEntrega } from "../api/solicitudesApi";

const estados = [
  { label: "Pendientes", value: "Pendientes" },
  { label: "Proceso", value: "Proceso" },
  { label: "Completados", value: "Completados" },
  { label: "Denegados", value: "Denegados" },
  { label: "Campus de entrega", value: "CampusDeEntrega" },
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
    observacionBeca: item.observacionBeca || "",
    DocVal: item.DocVal || "",
    CamNomEsp: item.CamNomEsp || ""
  }));

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
  const [filasVisibles, setFilasVisibles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [listaCampus, setListaCampus] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [filaSel, setFilaSel] = useState(null);
  const [tienePermisoGlobal, setTienePermisoGlobal] = useState(false);
  const estadoActual = estados[estadoTab].value;
  const [paginationModel, setPaginationModel] = useState({  page: 0,   pageSize: 10 });

  // ✅ función reutilizable para cargar solicitudes
 const cargarSolicitudes = useCallback(async () => {
  if (!campusSeleccionado) return;
  setCargando(true);
  try {
    let data = [];

    if (estadoActual === "CampusDeEntrega") {
  data = await obtenerDocumentosCampusDeEntrega(campusSeleccionado);
} else {
  data = await obtenerSolicitudes(campusSeleccionado, estadoActual);
}

    setSolicitudes(mapearSolicitudes(data));
  } catch (err) {
    console.error("Error al cargar solicitudes:", err);
  } finally {
    setCargando(false);
  }
}, [campusSeleccionado, estadoActual]);


  // ✅ Cargar campus según permisos del usuario
useEffect(() => {
  const cargarCampus = async () => {
    try {
      const campus = await obtenerCampus();

      const permisos = userData?.permissions || {};
      const sedeDef = String(userData?.SdeDef || "");
      const permisosCORE = permisos?.CORE || {};

      // 🧠 Permisos CORE que dan acceso global
      const permisosGlobales = ["CORE0313"];

      // Verifica si el usuario tiene alguno de esos permisos
      const esGlobal = permisosGlobales.some((permiso) => permisosCORE?.[permiso]);
      setTienePermisoGlobal(esGlobal); // 👈 ahora lo guardamos en el estado

      if (esGlobal) {
        // ✅ Usuario con permiso global: puede ver todos los campus
        setListaCampus(campus);
        if (campus.length > 0) setCampusSeleccionado(campus[0].CamCod);
      } else {
        // 🚫 Usuario normal: solo su campus (SdeDef)
        const filtrado = campus.filter((c) => String(c.CamCod) === sedeDef);
        setListaCampus(filtrado);
        if (filtrado.length > 0) setCampusSeleccionado(filtrado[0].CamCod);
      }
    } catch (error) {
      console.error("Error al cargar campus:", error);
    }
  };

  cargarCampus();
}, [userData]);

  // ✅ Recargar automáticamente al cambiar campus o pestaña
  useEffect(() => {
    if (campusSeleccionado) cargarSolicitudes();
  }, [campusSeleccionado, estadoTab, cargarSolicitudes]);

 // ⭐ Nuevo cálculo: basado en filas realmente visibles en la tabla
useEffect(() => {
  if (!filasVisibles.length) return;

  const cueCods = [...new Set(filasVisibles.map(f => f.CueCod))];

  let cancel = false;

  (async () => {
    const entries = await Promise.all(
      cueCods.map(async (cueCod) => {
        try {
          const r = await validarBiblioteca(cueCod);
          return [cueCod, r.ok ? (r.tienePendientes ? "PDT" : "OK") : undefined];
        } catch {
          return [cueCod, undefined];
        }
      })
    );

    if (!cancel) {
      setBibliotecaMap(Object.fromEntries(entries));
    }
  })();

  return () => { cancel = true; };
}, [filasVisibles]);

  const handleSearch = (e) => setBusqueda(e.target.value.toLowerCase());

  useEffect(() => {
    const t = setTimeout(() => {
      setFiltro(busqueda.toLowerCase());
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

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
    document.activeElement?.blur();
    setEstadoTab(newValue);
    setOpenDetalle(false);
  };

  const abrirDetalle = (row, e) => {
    e?.currentTarget?.blur?.();
     const estadoBiblioteca = bibliotecaMap[row.CueCod] || "PDT";
     setFilaSel({
      ...row,
      _estadoBiblioteca: estadoBiblioteca   // ⭐ nuevo campo
   });
    setTimeout(() => setOpenDetalle(true), 0);
  };
  const cerrarDetalle = () => setOpenDetalle(false);

  const filasMemo = useMemo(() => solicitudes, [solicitudes]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%", px: 2, py: 3 }}>
      {/* 🔷 Título */}
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
              textShadow: isDark
                ? "1px 1px 2px rgba(0,0,0,0.8)"
                : "1px 1px 2px rgba(0,0,0,0.1)",
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
            disabled={!tienePermisoGlobal}
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
      <Paper
  elevation={2}
  sx={{
    width: "100%",
    maxWidth: 900,
    mx: "auto",
    borderRadius: 2,
    mb: 2,
    px: 2,
    py: 1,
    position: "relative",
    overflowX: "auto",
    "&::-webkit-scrollbar": { height: 6 },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: 4,
    },
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    {/* Tabs dentro de Box */}
    <Tabs
      value={estadoTab}
      onChange={handleTabChange}
      textColor="primary"
      indicatorColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        flex: 1,
        "& .MuiTab-root": {
          minWidth: 150,
          fontWeight: 700,
          letterSpacing: 0.3,
        },
        "& .MuiTabs-flexContainer": {
          alignItems: "center",
        },
      }}
    >
      <Tab label="PENDIENTES" sx={{ color: theme.palette.warning.light }} />
      <Tab label="PROCESO" sx={{ color: theme.palette.warning.dark }} />
      <Tab label="COMPLETADOS" sx={{ color: theme.palette.success.main }} />
      <Tab label="DENEGADOS" sx={{ color: theme.palette.error.main }} />
      <Tab label="CAMPUS DE ENTREGA" sx={{ color: theme.palette.info.main }} />
    </Tabs>

    {/* Íconos fuera del Tabs 👇 para evitar warnings */}
    <Box sx={{ ml: 2, flexShrink: 0 }}>
      <ExportButtons
        rows={filasMemo}
        fileName={`solicitudes-${estadoActual}`}
        campus={
          listaCampus.find((c) => c.CamCod === campusSeleccionado)?.CamNomEsp ||
          "Todos"
        }
      />
    </Box>
  </Box>
</Paper>

      {/* Tabla o Loader */}
      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TablaSolicitudes
          solicitudes={filasMemo}
          busqueda={busqueda}
          cargando={cargando}
          onVerDetalle={abrirDetalle}
          bibliotecaMap={bibliotecaMap}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          onVisibleRowsChange={setFilasVisibles}
        />
      )}

      {/* Modal detalle */}
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
