// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, Tabs, Tab, Paper, Tooltip, IconButton
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import { DataGrid } from "@mui/x-data-grid";

import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes, denegarSolicitud } from "../api/solicitudesApi";
import { AppContext } from "../context/AppContext";
import SchoolIcon from "@mui/icons-material/School";
import useMediaQuery from "@mui/material/useMediaQuery";
import Swal from 'sweetalert2';



import DetalleSolicitudServicioAcademico from "../components/DetalleSolicitudServicioAcademico";

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
    CueMailIns: item.CueMailIns || "-",
    CueTel: item.CueTel || "-",
    PlaNomEsp: item.PlaNomEsp || "-",
    DocLeng: item.DocLeng || "-",
    DocFchCre: item.DocFchCre || null,
    DocSolObs: item.DocSolObs || "-",
  }));

function Home() {
  const { userData, sessionValid } = useContext(AppContext);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md")); // <=960px
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm")); // <=600px
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

  // visibilidad por breakpoint
  const columnVisibilityModel = {
    BecNom: !isMdDown,
    EstNom: !isSmDown,
  };

  useEffect(() => {
    const cargarCampus = async () => {
      const campus = await obtenerCampus();
      setListaCampus(campus);
      if (campus.length > 0) setCampusSeleccionado(campus[0].CamCod);
    };
    cargarCampus();
  }, []);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      if (!campusSeleccionado) return;
      setCargando(true);
      const data = await obtenerSolicitudes(campusSeleccionado, estadoActual);
      setSolicitudes(mapearSolicitudes(data));
      setCargando(false);
    };
    cargarSolicitudes();
  }, [campusSeleccionado, estadoTab]);

  const handleSearch = (e) => setBusqueda(e.target.value.toLowerCase());

  const filteredRows = solicitudes.filter((row) =>
    Object.values(row).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(busqueda)
    )
  );

  const handleDenegar = async (row, observacion) => {
  try {
    setCargando(true);

    Swal.fire({
      title: 'Denegando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
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

    // (Opcional) actualización optimista rápida: borrar la fila local si estás en Pendientes/Proceso
    if (estadoActual === 'Pendientes' || estadoActual === 'Proceso') {
      setSolicitudes(prev => prev.filter(s => s.DocCod !== row.DocCod));
    }

    // Refetch para quedar 100% consistentes
    const data = await obtenerSolicitudes(campusSeleccionado, estadoActual);
    setSolicitudes(mapearSolicitudes(data));

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
    Swal.close();      // <- asegura que el loader no quede abierto
    setCargando(false);
  }
};


  // --- Modal state/handlers ---
  const [openDetalle, setOpenDetalle] = useState(false);
  const [filaSel, setFilaSel] = useState(null);

  const abrirDetalle = (row, e) => {
    e?.currentTarget?.blur?.();
    setFilaSel(row);
    setTimeout(() => setOpenDetalle(true), 0);
  };
  const cerrarDetalle = () => setOpenDetalle(false);

  // --- Colores para columna Estado (y tabs) ---
  const estadoColor = (nombre = "") => {
    const txt = String(nombre).trim().toLowerCase();
    if (txt.includes("deneg")) return theme.palette.error.main;        // Denegado
    if (txt === "entregado") return theme.palette.success.main;        // Entregado exacto
    if (txt.includes("proceso")) return theme.palette.warning.dark;    // En proceso (+ de entrega)
    if (txt.startsWith("pendient")) return theme.palette.warning.light;// Pendiente / de pago
    return theme.palette.text.secondary;
  };

  // ✓ / × centrado y en color
  const renderCheck = (value) => {
    const v = String(value ?? "").trim().toUpperCase();
    const isOK = v === "OK";
    const isPDT = v === "PDT" || v === "PDTP";
    if (isOK) {
      return <CheckCircleRoundedIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />;
    }
    if (isPDT) {
      return <CancelRoundedIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />;
    }
    return <HorizontalRuleRoundedIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />;
    // (Si quisieras un guion horizontal para N/A)
  };

  const renderEllipsis = (text) => (
    <span
      title={text}
      style={{
        display: "inline-block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );

  const columnas = [
    { field: "CueCod", headerName: "Cuenta", width: 160, minWidth: 110, headerAlign: "center" },
    {
      field: "AluNom",
      headerName: "Alumno",
      width: 280,
      minWidth: 170,
      headerAlign: "center",
      renderCell: (p) => renderEllipsis(p.value),
    },
    { field: "DocNom", headerName: "Documento", width: 220, minWidth: 100, headerAlign: "center" },

    { field: "EstReg", headerName: "Registro", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
      sortable: false, disableColumnMenu: true, renderCell: (p) => renderCheck(p.value) },
    { field: "CorNom", headerName: "Biblioteca", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
      sortable: false, disableColumnMenu: true, renderCell: (p) => renderCheck(p.value) },
    { field: "EstCont", headerName: "Contabilidad", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
      sortable: false, disableColumnMenu: true, renderCell: (p) => renderCheck(p.value) },
    { field: "BecNom", headerName: "Becas", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center",
      sortable: false, disableColumnMenu: true, renderCell: (p) => renderCheck(p.value) },

    {
      field: "EstNom",
      headerName: "Estado",
      flex: 0.38,
      minWidth: 82,
      headerAlign: "center",
      align: "center",
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
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalle(params.row, e);
            }}
            aria-label="Ver detalle"
            sx={{
              color: theme.palette.info.main,
              bgcolor: alpha(theme.palette.info.main, 0.12),
              "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.22) },
              boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.info.main, 0.28)}`,
              borderRadius: 2,
            }}
          >
            <ManageSearchRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%", px: 2, py: 3, boxSizing: "border-box" }}>
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
            height: 4, width: 160, margin: "12px auto 0", borderRadius: 2,
            background: isDark ? "linear-gradient(90deg, #1976d2, #42a5f5)" : "linear-gradient(90deg, #0d47a1, #64b5f6)",
            boxShadow: isDark ? "0 0 8px rgba(66,165,245,0.6)" : "0 0 4px rgba(66,165,245,0.3)",
          }}
        />
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Campus</InputLabel>
          <Select value={campusSeleccionado} onChange={(e) => setCampusSeleccionado(e.target.value)} label="Campus">
            {listaCampus.map((campus) => (
              <MenuItem key={campus.CamCod} value={campus.CamCod}>
                {campus.CamNomEsp}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Buscar" variant="outlined" value={busqueda} onChange={handleSearch} sx={{ minWidth: 300 }} />
      </Box>

      {/* Tabs */}
      <Paper elevation={2} sx={{ maxWidth: 500, width: "100%", mx: "auto", borderRadius: 2, mb: 2 }}>
        <Tabs value={estadoTab} onChange={(e, v) => setEstadoTab(v)} centered textColor="primary" indicatorColor="primary">
          <Tab label="PENDIENTES"  sx={{ color: theme.palette.warning.light }} />
          <Tab label="PROCESO"     sx={{ color: theme.palette.warning.dark  }} />
          <Tab label="COMPLETADOS" sx={{ color: theme.palette.success.main  }} />
          <Tab label="DENEGADOS"   sx={{ color: theme.palette.error.main    }} />
        </Tabs>
      </Paper>

      {/* DataGrid */}
      <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <DataGrid
          rows={filteredRows}
          columns={columnas}
          columnVisibilityModel={columnVisibilityModel}
          density={isMdDown ? "compact" : "standard"}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={(theme) => ({
            borderRadius: 2,
            width: "100%",
            flex: 1,
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
            backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",

            "& .MuiDataGrid-columnHeaderTitleContainer": { justifyContent: "center" },
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
              backgroundColor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#f1f1f1",
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#f1f1f1",
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            },
          })}
          localeText={{ noRowsLabel: "No hay solicitudes disponibles." }}
          loading={cargando}
        />

        {/* Modal de detalle (componente separado) */}
        <DetalleSolicitudServicioAcademico
          open={openDetalle}
          solicitud={filaSel}
          onClose={cerrarDetalle}
          onDenegar={handleDenegar}
        />
      </Box>
    </Box>
  );
}

export default Home;
