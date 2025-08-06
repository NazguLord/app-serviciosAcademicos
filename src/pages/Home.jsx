//Home.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function Home() {
  const [campus, setCampus] = useState("");

  const handleCampusChange = (event) => {
    setCampus(event.target.value);
  };

  const campusOptions = [
    { id: 1, nombre: "Campus Tegucigalpa" },
    { id: 2, nombre: "Campus San Pedro Sula" },
    { id: 3, nombre: "Campus La Ceiba" },
  ];

  const registros = [
    {
      id: 1,
      cuenta: "20201234567",
      alumno: "Juan Pérez",
      documento: "Constancia",
      registro: "✔",
      contabilidad: "✔",
      biblioteca: "✘",
      becas: "✔",
      fecha: "2025-08-06",
    },
    {
      id: 2,
      cuenta: "20207654321",
      alumno: "María López",
      documento: "Historial",
      registro: "✔",
      contabilidad: "✘",
      biblioteca: "✔",
      becas: "✘",
      fecha: "2025-08-05",
    },
  ];

  const columns = [
    { field: "cuenta", headerName: "Cuenta", flex: 1 },
    { field: "alumno", headerName: "Alumno", flex: 1.5 },
    { field: "documento", headerName: "Documento", flex: 1 },
    { field: "registro", headerName: "Registro", flex: 0.7 },
    { field: "contabilidad", headerName: "Contabilidad", flex: 1 },
    { field: "biblioteca", headerName: "Biblioteca", flex: 1 },
    { field: "becas", headerName: "Becas", flex: 1 },
    { field: "fecha", headerName: "Fecha Solicitud", flex: 1.2 },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
       width="100vw"
      p={2}
      gap={3}
      sx={{ boxSizing: "border-box" }}
    >
      <Typography variant="h4" align="center">
        Servicios Académicos
      </Typography>

      <Box display="flex" justifyContent="center">
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="campus-label">Seleccionar Campus</InputLabel>
          <Select
            labelId="campus-label"
            value={campus}
            onChange={handleCampusChange}
            label="Seleccionar Campus"
          >
            {campusOptions.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', overflow: 'auto' }}>
        <DataGrid
          rows={registros}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 100]}
          disableRowSelectionOnClick
          sx={{
            width: "100%",
            height: '100%',
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default Home;
