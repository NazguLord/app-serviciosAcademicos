// src/components/TablaSolicitudes.jsx
import React, { useMemo } from "react";
import { Box, Tooltip, IconButton, alpha, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import useMediaQuery from "@mui/material/useMediaQuery";

const TablaSolicitudes = ({
  solicitudes,
  busqueda,
  cargando,
  onVerDetalle,
  // 👇 NUEVO: mapa opcional CueCod -> "OK" | "PDT"
  bibliotecaMap = {},
  paginationModel,          // ⭐ NUEVO
  setPaginationModel,       // ⭐ NUEVO
}) => {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const columnVisibilityModel = {
    BecNom: !isMdDown,
    EstNom: !isSmDown,
  };

  const estadoColor = (nombre = "") => {
    const txt = String(nombre).trim().toLowerCase();
    if (txt.includes("deneg")) return theme.palette.error.main;
    if (txt === "entregado") return theme.palette.success.main;
    if (txt.includes("proceso")) return theme.palette.warning.dark;
    if (txt.startsWith("pendient")) return theme.palette.warning.light;
    return theme.palette.text.secondary;
  };

 const renderCheck = (value) => {
  const v = String(value ?? "").trim().toUpperCase();

  if (v === "OK" || v === "SOLVENTE") {
    return (
      <Tooltip title="Solvente">
        <CheckCircleRoundedIcon
          sx={{ fontSize: 20, color: theme.palette.success.main }}
        />
      </Tooltip>
    );
  }

  if (v === "INSOLVENTE") {
    return (
      <Tooltip title="Insolvente">
        <CancelRoundedIcon
          sx={{ fontSize: 20, color: theme.palette.error.main }}
        />
      </Tooltip>
    );
  }

  if (v === "PDT" || v === "PENDIENTE") {
    return (
      <Tooltip title="Pendiente">
        <HorizontalRuleRoundedIcon
          sx={{ fontSize: 20, color: theme.palette.warning.main }}
        />
      </Tooltip>
    );
  }

  return (
    <HorizontalRuleRoundedIcon
      sx={{ fontSize: 20, color: theme.palette.text.disabled }}
    />
  );
};

  const renderEllipsis = (text) => (
    <span
      title={text}
      style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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

    { field: "BecNom", headerName: "Becas", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center", renderCell: (p) => renderCheck(p.value) },
    { field: "EstCont", headerName: "Contabilidad", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center", renderCell: (p) => renderCheck(p.value) },

    // 👇 CAMBIADO: la celda usa el mapa si existe, si no, cae a CorNom (comportamiento actual)
    {
      field: "Biblioteca",
      headerName: "Biblioteca",
      flex: 0.28,
      minWidth: 58,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (p) => {
        const estado = bibliotecaMap?.[p.row.CueCod] ?? p.row.CorNom;
        return renderCheck(estado);
      },
    },

    { field: "EstReg", headerName: "Registro", flex: 0.28, minWidth: 58, headerAlign: "center", align: "center", renderCell: (p) => renderCheck(p.value) },

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
              const filaCompleta = solicitudes.find((s) => s.DocCod === params.row.DocCod);
              if (filaCompleta) {
                filaCompleta.CueReg = filaCompleta.CueReg || filaCompleta.DocCod?.split("-")[0] || filaCompleta.CueCod;
                filaCompleta.DocReg = filaCompleta.DocReg || filaCompleta.DocCod || "";
                onVerDetalle(filaCompleta, e);
              }
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

  const filteredRows = useMemo(
    () =>
      solicitudes.filter((row) =>
        Object.values(row).some((value) => typeof value === "string" && value.toLowerCase().includes(busqueda))
      ),
    [solicitudes, busqueda]
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <DataGrid
        rows={filteredRows}
        getRowId={(row) => row.DocCod}
        columns={columnas}
        columnVisibilityModel={columnVisibilityModel}
        density={isMdDown ? "compact" : "standard"}
         paginationModel={paginationModel}
         onPaginationModelChange={setPaginationModel}
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
    </Box>
  );
};

export default React.memo(TablaSolicitudes);
