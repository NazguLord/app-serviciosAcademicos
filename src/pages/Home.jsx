// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerCampus } from "../api/campusApi";
import { obtenerSolicitudes } from "../api/solicitudesApi";

const estados = [
  { label: "Pendientes", value: "Pendientes" },
  { label: "Completados", value: "Completados" },
  { label: "Denegados", value: "Denegados" },
];

const traducirEstado = (estado) => {
  switch (estado) {
    case "PDT": return "Pendiente";
    case "COM": return "Completado";
    case "DEN": return "Denegado";
    default: return estado;
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
    { field: "CueCod", headerName: "Cuenta", flex: 1 },
    { field: "AluNom", headerName: "Alumno", flex: 1.5 },
    { field: "DocNom", headerName: "Documento", flex: 1 },
    { field: "ReqObs", headerName: "Requiere", flex: 1 },
    { field: "CorNom", headerName: "Carrera", flex: 1 },
    { field: "BibNom", headerName: "Biblioteca", flex: 1 },
    { field: "BecNom", headerName: "Beca", flex: 1 },
    { field: "FacNom", headerName: "Facultad", flex: 1 },
    { field: "EstNom", headerName: "Estado", flex: 1 },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Filtros y título */}
      <Box sx={{ px: 2, pt: 2 }}>
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
      </Box>

      {/* Tabla */}
      <Box sx={{ flexGrow: 1, px: 2, pb: 6 }}>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ width: '100%', minWidth: 800 }}>
            <DataGrid
              rows={filteredRows}
              columns={columnas}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              autoHeight
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
              localeText={{
                noRowsLabel: "No hay solicitudes disponibles.",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
