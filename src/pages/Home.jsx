// src/pages/Home.jsx
import React, { useState, useEffect, useContext  } from "react";
import {  Box,  Typography,  Select,  MenuItem,  FormControl,  InputLabel,  TextField,  Tabs,  Tab,  Paper,
Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Chip, Stack, Divider, DialogActions, Grid } from "@mui/material";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import { alpha } from "@mui/material/styles";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";


import { DataGrid } from "@mui/x-data-grid";
import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes } from "../api/solicitudesApi";
import { AppContext } from "../context/AppContext"; 
import SchoolIcon from "@mui/icons-material/School";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const estados = [
  { label: "Pendientes", value: "Pendientes" },
  { label: "Proceso", value: "Proceso" },
  { label: "Completados", value: "Completados" },
  { label: "Denegados", value: "Denegados" },
];

const traducirEstado = (estado) => {
  const map = {
    PDT:  "Pendiente",
    PGD:  "En proceso",
    DNG:  "Denegado",
    PDTP: "Pendiente de pago",
    CMP:  "En proceso de entrega",
    FIN:  "Entregado",
  };
  const code = String(estado ?? "").trim().toUpperCase();
  return map[code] ?? (code || "-");
};


const mapearSolicitudes = (datos = []) =>
  datos.map((item, idx) => ({
    id: `${item.CueCod}-${item.DocCod}-${item.DocEst}-${idx}`,
    CueCod: item.CueCod || "N/A",
    AluNom: item.CueNom || "Sin nombre",
    DocNom: item.DocNom || "Documento",
    EstReg: item.estadoreg  || "-",
    CorNom: item.estadocond || "-",
    EstCont: item.estadocont  || "N/A",
    BecNom: item.estadobeca|| "-",    
    DocEstRaw: String(item.DocEst || "").trim().toUpperCase(),
    EstNom: traducirEstado(item.DocEst),
    CueMailIns: item.CueMailIns || "-",
    CueTel: item.CueTel || "-",
    PlaNomEsp: item.PlaNomEsp || "-",
    DocLeng: item.DocLeng || "-",
    DocFchCre: item.DocFchCre || null,  // ISO/fecha del backend
    DocSolObs: item.DocSolObs || "-",   // observaciones
  }));

function Home() {
const { userData, sessionValid } = useContext(AppContext); 
const theme = useTheme();
const isMdDown = useMediaQuery(theme.breakpoints.down("md")); // <=960px
const isSmDown = useMediaQuery(theme.breakpoints.down("sm")); // <=600px
const headerDocumento = isSmDown ? "Doc." : "Documento";
const headerBecas     = isMdDown ? "Becas" : "Programa Becas";

// visibilidad por breakpoint
const columnVisibilityModel = {
   BecNom: !isMdDown,   // oculta "Becas" en md y abajo
  EstNom: !isSmDown, 
};

const handleOpenDetalle = (row) => {
  console.log("Detalle de:", row);
  // aquí abrirás el modal/route; por ahora es un placeholder
};

const formatFechaSoloDia = (input) => {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    // fallback: corta por espacio si viene "dd/mm/aaaa hh:mm"
    return String(input).split(" ")[0];
  }
  // ajusta el locale si quieres otro
  return d.toLocaleDateString("es-HN", { day: "numeric", month: "numeric", year: "numeric" });
};

const isDark = theme.palette.mode === "dark";
  useEffect(() => {
  console.log("👤 userData desde AppContext:", userData);
  console.log("🔐 sessionValid:", sessionValid);
}, [userData, sessionValid]);

  const [campusSeleccionado, setCampusSeleccionado] = useState("");
  const [estadoTab, setEstadoTab] = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [listaCampus, setListaCampus] = useState([]);
  const [cargando, setCargando] = useState(false);

  const estadoActual = estados[estadoTab].value;

  useEffect(() => {
    const cargarCampus = async () => {
      const campus = await obtenerCampus();
      setListaCampus(campus);
      if (campus.length > 0) {
        setCampusSeleccionado(campus[0].CamCod);
      }
    };
    cargarCampus();
  }, []);

  useEffect(() => {
  const cargarSolicitudes = async () => {
    if (!campusSeleccionado) return;
    setCargando(true);

    // ahora el backend entiende "Proceso"
    const data = await obtenerSolicitudes(campusSeleccionado, estadoActual);

    setSolicitudes(mapearSolicitudes(data));
    setCargando(false);
  };
  cargarSolicitudes();
}, [campusSeleccionado, estadoTab]);

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  const filteredRows = solicitudes.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(busqueda)
    )
  );

  const renderEstado = (value) => {
  const v = String(value ?? "").trim().toUpperCase();
  const color =
    v === "OK"
      ? theme.palette.success.main
      : v === "PDT"
      ? theme.palette.error.main
      : theme.palette.text.secondary;

  return (
    <span style={{ color, fontWeight: 700 }}>
      {v || "-"}
    </span>
  );
};


const [openDetalle, setOpenDetalle] = useState(false);
const [filaSel, setFilaSel] = useState(null);

const abrirDetalle = (row, e) => {
  e?.currentTarget?.blur?.();              // quita el foco del botón que abrió
  setFilaSel(row);
  setTimeout(() => setOpenDetalle(true), 0); // opcional, ayuda a Chrome
};
const cerrarDetalle = () => setOpenDetalle(false);

// Color del estado “general” (columna Estado)
const colorEstado = (txt) =>
  txt === "Denegado"   ? theme.palette.error.main
: txt === "Entregado" ? theme.palette.success.main
:                       theme.palette.warning.main;

const estadoColor = (nombre = "") => {
  const txt = String(nombre).trim().toLowerCase();

  // 1) Denegado
  if (txt.includes("deneg")) return theme.palette.error.main;

  // 2) Entregado (match exacto para no confundir con "entrega")
  if (txt === "entregado") return theme.palette.success.main;

  // 3) Proceso (cubre "en proceso" y "en proceso de entrega")
  if (txt.includes("proceso")) return theme.palette.warning.dark;

  // 4) Pendiente / Pendiente de pago
  if (txt.startsWith("pendient")) return theme.palette.warning.light;

  return theme.palette.text.secondary;
};

// Chip para Registro/Biblioteca/Contabilidad
const chipSemaforo = (valor) => {
  const v = String(valor ?? "").trim().toUpperCase();
  const ok  = v === "OK";
  const pdt = v === "PDT" || v === "PDTP";

  const color = ok
    ? theme.palette.success.main
    : pdt
    ? theme.palette.error.main
    : theme.palette.text.secondary;

  return (
    <Chip
      size="small"
      variant="outlined"
      icon={ok ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
      label={v || "-"}
      sx={{ color, borderColor: color, fontWeight: 700, height: 28 }}
    />
  );
};

// ✓ / × centrado y en color
const renderCheck = (value) => {
  const v = String(value ?? "").trim().toUpperCase();
  const isOK  = v === "OK";
  const isPDT = v === "PDT" || v === "PDTP";

  if (isOK) {
    return <CheckCircleRoundedIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />;
  }
  if (isPDT) {
    return <CancelRoundedIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />;
  }
  return <HorizontalRuleRoundedIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />;
};

const renderEllipsis = (text) => (
  <span title={text} style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
    {text}
  </span>
);

  const columnas = [
  // 1) Pegadas y con elipsis donde aplica
  { field: "CueCod", headerName: "Cuenta",   width:160, minWidth: 110, headerAlign: "center" },
  {
    field: "AluNom", headerName: "Alumno",
    width:280, minWidth: 170, headerAlign: "center",
    renderCell: (p) => renderEllipsis(p.value),
  },
  // Documento un poco más compacto para acercar "Registro"
  { field: "DocNom", headerName: "Documento",  width: 220,  minWidth: 100, headerAlign: "center" },

  // 2) Cuatro columnas cortas (✓ / ×)
  {
    field: "EstReg", headerName: "Registro",
    flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
    sortable: false, disableColumnMenu: true,
    renderCell: (p) => renderCheck(p.value),
  },
  {
    field: "CorNom", headerName: "Biblioteca",
    flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
    sortable: false, disableColumnMenu: true,
    renderCell: (p) => renderCheck(p.value),
  },
  {
    field: "EstCont", headerName: "Contabilidad",
    flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
    sortable: false, disableColumnMenu: true,
    renderCell: (p) => renderCheck(p.value),
  },
  {
    field: "BecNom", headerName: "Becas",
    flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
    sortable: false, disableColumnMenu: true,
     renderCell: (p) => renderCheck(p.value),
  },

  // 3) Estado corto (antes de Detalle)
  { field: "EstNom", headerName: "Estado", flex: 0.38, minWidth: 82, headerAlign: "center", align: "center", 
    renderCell: ({ value }) => (
    <span style={{ color: estadoColor(value), fontWeight: 700 }}>
      {value ?? "-"}
    </span>
  ),
    },

  {
  field: "Detalle",
  headerName: "Detalle",
  flex: 0.26,
  minWidth: 56,
  headerAlign: "center",
  align: "center",
  sortable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    <Tooltip title="Ver detalle">
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); abrirDetalle(params.row, e); }}
        aria-label="Ver detalle"
        sx={{
          color: theme.palette.info.main, // color del ícono
          bgcolor: alpha(theme.palette.info.main, 0.12), // fondo suave
          "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.22) },
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.info.main, 0.28)}`,
          borderRadius: 2, // esquinas suaves (8px)
        }}
      >
        <ManageSearchRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ),
},
];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        px: 2,
        py: 3,
        boxSizing: "border-box",
      }}
    >
      {/* Título y filtros */}
      <Box
  sx={{
    textAlign: "center",
    mb: 4,
    mt: 1,
  }}
>
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 1,
    }}
  >
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

  {/* Línea decorativa con degradado */}
  <Box
    sx={{
      height: 4,
      width: 160,
      margin: "12px auto 0",
      borderRadius: 2,
      background: isDark
        ? "linear-gradient(90deg, #1976d2, #42a5f5)"
        : "linear-gradient(90deg, #0d47a1, #64b5f6)",
      boxShadow: isDark
        ? "0 0 8px rgba(66,165,245,0.6)"
        : "0 0 4px rgba(66,165,245,0.3)",
    }}
  />
</Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
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
      <Paper
        elevation={2}
        sx={{
          maxWidth: 500,
          width: "100%",
          mx: "auto",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Tabs
          value={estadoTab}
          onChange={(e, newValue) => setEstadoTab(newValue)}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
         <Tab label="PENDIENTES"  sx={{ color: theme.palette.warning.light }} />
         <Tab label="PROCESO"     sx={{ color: theme.palette.warning.dark  }} />
         <Tab label="COMPLETADOS" sx={{ color: theme.palette.success.main  }} />
         <Tab label="DENEGADOS"   sx={{ color: theme.palette.error.main    }} />
        </Tabs>
      </Paper>

      {/* DataGrid */}
      <Box
  sx={{
    flexGrow: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
      <DataGrid
  rows={filteredRows}
  columns={columnas}
  columnVisibilityModel={columnVisibilityModel}
  density={isMdDown ? "compact" : "standard"}
  initialState={{
    pagination: {
      paginationModel: { pageSize: 10, page: 0 },
    },
  }}
  pageSizeOptions={[10, 25, 50]}
  sx={(theme) => ({
    borderRadius: 2,
    width: "100%",
    flex: 1,
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    backgroundColor:
      theme.palette.mode === "dark" ? "#0f172a" : "#fff", // fondo oscuro

     "& .MuiDataGrid-columnHeaderTitleContainer": {
      justifyContent: "center",
    },

    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: theme.palette.mode === "dark" ? "#003366" : "#1976d2",
      color: "#fff",
      fontWeight: "bold",
       minHeight: isSmDown ? 44 : 56,
      maxHeight: isSmDown ? 44 : 56,
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid",
      borderColor: theme.palette.divider,
       fontSize: isSmDown ? 13 : 14,
    },
    "& .MuiDataGrid-row": {
      backgroundColor:
        theme.palette.mode === "dark" ? "#1e293b" : "#fff",
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor:
        theme.palette.mode === "dark" ? "#0f172a" : "#f1f1f1",
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
     "& .MuiDataGrid-columnHeaderTitle": {
      backgroundColor:
        theme.palette.mode === "dark" ? "#0f172a" : "#f1f1f1",
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
  })}
  localeText={{
    noRowsLabel: "No hay solicitudes disponibles.",
  }}
  loading={cargando}
/>
<Dialog open={openDetalle} onClose={cerrarDetalle} maxWidth="sm" fullWidth transitionDuration={{ appear: 120, enter: 120, exit: 90 }}>
  <DialogTitle sx={{ pr: 8, py: 1.5 }}>
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 4 }}>
    <Typography variant="h6" fontWeight={700}>
      Detalle de solicitud
    </Typography>

    <Chip
  label={filaSel?.EstNom || "-"}
  sx={{
    bgcolor: alpha(estadoColor(filaSel?.EstNom || ""), 0.12),
    color:   estadoColor(filaSel?.EstNom || ""),
    fontWeight: 700,
  }}
/>
  </Box>

  <IconButton
    onClick={cerrarDetalle}
    sx={{ position: "absolute", right: 8, top: 8 }}
    aria-label="Cerrar"
  >
    <CloseRoundedIcon />
  </IconButton>
</DialogTitle>

  <DialogContent dividers>
  <Stack spacing={2}>
    {/* Datos principales */}
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Cuenta:</Typography>
        <Typography variant="body2">{filaSel?.CueCod || "-"}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Alumno:</Typography>
        <Typography variant="body2">{filaSel?.AluNom || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Correo institucional:</Typography>
        <Typography variant="body2">
          {filaSel?.CueMailIns && filaSel.CueMailIns !== "-"
            ? <a href={`mailto:${filaSel.CueMailIns}`}>{filaSel.CueMailIns}</a>
            : "-"}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Teléfono:</Typography>
        <Typography variant="body2">{filaSel?.CueTel || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Carrera / Plan:</Typography>
        <Typography variant="body2">{filaSel?.PlaNomEsp || "-"}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Documento:</Typography>
        <Typography variant="body2">
          {filaSel?.DocNom || "-"}{filaSel?.DocLeng && ` (${filaSel.DocLeng})`}
        </Typography>
      </Grid>
       <Grid item xs={12} sm={6}>
        <Typography variant="body2" fontWeight={700}>Fecha de solicitud:</Typography>
        {formatFechaSoloDia(filaSel?.DocFchCre)}
      </Grid>
    </Grid>

    <Divider />

    {/* Dependencias */}
    <Stack
  direction="row"
  spacing={3}
  justifyContent="center"
  alignItems="center"
  flexWrap="wrap"
  sx={{ textAlign: "center" }}
>
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2"><b>Registro</b></Typography>
    {chipSemaforo(filaSel?.EstReg)}
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2"><b>Biblioteca</b></Typography>
    {chipSemaforo(filaSel?.CorNom)}
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2"><b>Contabilidad</b></Typography>
    {chipSemaforo(filaSel?.EstCont)}
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2"><b>Becas</b></Typography>
    {chipSemaforo(filaSel?.BecNom)}
  </Stack>

</Stack>

    <Divider />

    <Grid container spacing={2}>   
      

      <Grid item xs={12}>
        <Typography variant="body2" fontWeight={700}>Observaciones:</Typography>
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {filaSel?.DocSolObs || "-"}
        </Typography>
      </Grid>
    </Grid>
  </Stack>
</DialogContent>
</Dialog>
      </Box>
    </Box>
  );
}

export default Home;
