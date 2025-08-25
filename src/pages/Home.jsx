// src/pages/Home.jsx
import React, { useState, useEffect, useContext  } from "react";
import {  Box,  Typography,  Select,  MenuItem,  FormControl,  InputLabel,  TextField,  Tabs,  Tab,  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes } from "../api/solicitudesApi";
import { AppContext } from "../context/AppContext"; 

const estados = [
  { label: "Pendientes", value: "Pendientes" },
  { label: "Completados", value: "Completados" },
  { label: "Denegados", value: "Denegados" },
];

const traducirEstado = (estado) => {
  switch (estado) {
    case "PDT":
      return "Pendiente";
    case "COM":
      return "Completado";
    case "DEN":
      return "Denegado";
    default:
      return estado;
  }
};

const mapearSolicitudes = (datos = []) =>
  datos.map((item, idx) => ({
    id: `${item.CueCod}-${item.DocCod}-${item.DocEst}-${idx}`,
    CueCod: item.CueCod || "N/A",
    AluNom: item.CueNom || "Sin nombre",
    DocNom: item.DocNom || "Documento",
    ReqObs: item.DocSolObs || "-",
    CorNom: item.PlaNomEsp || "-",
    BibNom: item.DocBibl || "N/A",
    BecNom: "-",
    FacNom: item.PlaAre || "-",
    EstNom: traducirEstado(item.DocEst),
  }));

function Home() {
  const { userData, sessionValid } = useContext(AppContext); 

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
      if (campusSeleccionado) {
        setCargando(true);
        const data = await obtenerSolicitudes(campusSeleccionado, estadoActual);
        setSolicitudes(mapearSolicitudes(data));
        setCargando(false);
      }
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

  const columnas = [
    { field: "CueCod", headerName: "Cuenta", width: 140 },
    { field: "AluNom", headerName: "Alumno", width: 200 },
    { field: "DocNom", headerName: "Documento", width: 170 },
    { field: "ReqObs", headerName: "Requiere", width: 200 },
    { field: "CorNom", headerName: "Carrera", width: 150 },
    { field: "BibNom", headerName: "Biblioteca", width: 120 },
    { field: "BecNom", headerName: "Programa Becas", width: 150 },
    { field: "FacNom", headerName: "Facultad", width: 120 },
    { field: "EstNom", headerName: "Estado", width: 130 },
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
      <Typography variant="h4" gutterBottom textAlign="center">
        Servicios Académicos
      </Typography>

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
          <Tab label="PENDIENTES" sx={{ color: "#1976d2" }} />
          <Tab label="COMPLETADOS" sx={{ color: "#2e7d32" }} />
          <Tab label="DENEGADOS" sx={{ color: "#d32f2f" }} />
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
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: theme.palette.mode === "dark" ? "#003366" : "#1976d2",
      color: "#fff",
      fontWeight: "bold",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid",
      borderColor: theme.palette.divider,
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
      </Box>
    </Box>
  );
}

export default Home;
