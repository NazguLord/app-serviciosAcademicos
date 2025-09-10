// DetalleSolicitudServicioAcademico.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Stack, Grid, Divider, IconButton, Button, DialogContentText 
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ModalDenegarSolicitud from "../components/ModalDenegarSolicitud";
import TimelineIcon from "@mui/icons-material/Timeline";
import CloseIcon from "@mui/icons-material/Close";
import HistorialTimeline from "../components/HistorialTimeline";
import ModalAutorizarPago from "../components/ModalPagoDocumento";

/* ---------- helpers SOLO del modal ---------- */
const formatFechaSoloDia = (input) => {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input).split(" ")[0];
  return d.toLocaleDateString("es-HN", { day: "numeric", month: "numeric", year: "numeric" });
};

const estadoColorLocal = (theme, nombre = "") => {
  const txt = String(nombre).trim().toLowerCase();
  if (txt.includes("deneg"))   return theme.palette.error.main;       // Denegado
  if (txt === "entregado")     return theme.palette.success.main;     // Entregado exacto
  if (txt.includes("proceso")) return theme.palette.warning.dark;     // En proceso (+ de entrega)
  if (txt.startsWith("pendient")) return theme.palette.warning.light; // Pendiente / Pendiente de pago
  return theme.palette.text.secondary;
};

const ChipSemaforo = ({ valor }) => {
  const theme = useTheme();
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

/* ---------- componente ---------- */
export default function DetalleSolicitudServicioAcademico({ open, solicitud, onClose, onDenegar }) {
  const theme = useTheme();
  const [openDenegar, setOpenDenegar] = useState(false);
  const [openHist, setOpenHist] = useState(false);
  const [openAutorizar, setOpenAutorizar] = useState(false);
  const s = solicitud;
  if (!s) return null;
  
  const puedeDenegar = String(s?.EstNom || "").toLowerCase().startsWith("pendient");
  const puedeAutorizar = String(s?.EstNom || "").toLowerCase() === "pendiente";

  return (
    <Dialog open={open}  onClose={() => {document.activeElement?.blur(); onClose?.() }} maxWidth="sm" fullWidth transitionDuration={{ appear: 120, enter: 120, exit: 90 }} disableEnforceFocus >
      <DialogTitle sx={{ pr: 8, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 4 }}>
          <Typography variant="h6" fontWeight={700}>Detalle de solicitud</Typography>
          <Chip
            label={s?.EstNom || "-"}
            sx={{
              bgcolor: alpha(estadoColorLocal(theme, s?.EstNom || ""), 0.12),
              color:   estadoColorLocal(theme, s?.EstNom || ""),
              fontWeight: 700,
            }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="Cerrar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Datos principales */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Cuenta:</Typography>
              <Typography variant="body2">{s?.CueCod || "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Alumno:</Typography>
              <Typography variant="body2">{s?.AluNom || "-"}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Correo institucional:</Typography>
              <Typography variant="body2">
                {s?.CueMailIns && s.CueMailIns !== "-" ? <a href={`mailto:${s.CueMailIns}`}>{s.CueMailIns}</a> : "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Teléfono:</Typography>
              <Typography variant="body2">{s?.CueTel || "-"}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Carrera / Plan:</Typography>
              <Typography variant="body2">{s?.PlaNomEsp || "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Documento:</Typography>
              <Typography variant="body2">
                {s?.DocNom || "-"}{s?.DocLeng && ` (${s.DocLeng})`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={700}>Fecha de solicitud:</Typography>
              {formatFechaSoloDia(s?.DocFchCre)}
            </Grid>
          </Grid>

          <Divider />

          {/* Dependencias */}
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ textAlign: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2"><b>Registro</b></Typography>
              <ChipSemaforo valor={s?.EstReg} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2"><b>Biblioteca</b></Typography>
              <ChipSemaforo valor={s?.CorNom} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2"><b>Contabilidad</b></Typography>
              <ChipSemaforo valor={s?.EstCont} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2"><b>Becas</b></Typography>
              <ChipSemaforo valor={s?.BecNom} />
            </Stack>
          </Stack>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight={700}>Observaciones:</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{s?.DocSolObs || "-"}</Typography>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Box sx={{ flex: 1 }} />
        <Button
        sx={{
    borderColor: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.grey[400],
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.text.primary,
    "&:hover": {
      borderColor: (theme) =>
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary,
      bgcolor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },
  }}
          variant="outlined"
          startIcon={<TimelineIcon />}
          onClick={() => setOpenHist(true)}
        >
          Ver historial
        </Button>
        {/* ✅ nuevo botón para autorizar */}
        {puedeAutorizar && (
          <Button
            variant="outlined"
            color="success"
            onClick={() => setOpenAutorizar(true)}
            sx={(theme) => ({
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
      "&:hover": {
        borderColor: theme.palette.success.dark,
        bgcolor: theme.palette.mode === "dark"
          ? "rgba(46, 125, 50, 0.12)" // ~ success.main con alpha
          : "rgba(46, 125, 50, 0.04)",
      },
      fontWeight: 700,
    })}
          >
            Autorizar Pago
          </Button>
        )}
        {puedeDenegar && (
          <Button variant="outlined" color="error" onClick={() => setOpenDenegar(true)}>
            Denegar
          </Button>
        )}
        <Button sx={{
    borderColor: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.grey[400],
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.text.primary,
    "&:hover": {
      borderColor: (theme) =>
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary,
      bgcolor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },
  }}onClick={onClose}>Cerrar</Button>
      </DialogActions>

      {/* Modal de confirmación y observación */}
      {openDenegar && (
    <ModalDenegarSolicitud
  open={openDenegar}
  onClose={() => { document.activeElement?.blur(); setOpenDenegar(false)}}
  onConfirm={async (observacion) => {
    // ✅ 1) Quitar el foco del botón activo para evitar el warning
    document.activeElement?.blur();

    // ✅ 2) Cerrar los modales inmediatamente
    setOpenDenegar(false);
    onClose?.();

    // ✅ 3) Disparar la acción después
    setTimeout(() => {
      onDenegar?.(s, observacion); // handleDenegar muestra el loader y el éxito/error
    }, 0);
  }}
/>
)}

{/* ✅ Modal Autorizar */}
      {openAutorizar && (
        <ModalAutorizarPago
          open={openAutorizar}
          solicitud={s}
          onClose={() => { document.activeElement?.blur(); setOpenAutorizar(false); }}
          onSubmit={(values) => {
            console.log("Valores enviados:", values);
            // TODO: aquí llamas a tu endpoint cuando lo tengas
            // await axios.post("/api/autorizarPago", { ...values, idSolicitud: s.DocCod })
          }}
        />
      )}

{/* Dialog del Historial */}
      <Dialog
        open={openHist}
        onClose={() => { document.activeElement?.blur(); setTimeout(() => setOpenHist(false), 0); }}
        fullWidth
        maxWidth="md"
        disableRestoreFocus
      >
        <DialogTitle
  sx={{
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1.25rem", // más grande que el default
     color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.primary.main,
    position: "relative",
    borderBottom: "1px solid",
    borderColor: (theme) => theme.palette.divider,
    py: 1.5,
  }}
>
  Historial de acciones
  <IconButton
    onMouseDown={(e) => e.preventDefault()}
    aria-label="Cerrar"
    onClick={() => setOpenHist(false)}
    sx={{
      position: "absolute",
      right: 8,
      top: 8,
      color: (theme) =>
        theme.palette.mode === "dark"
          ? theme.palette.grey[300]
          : theme.palette.grey[500],
      "&:hover": {
        color: (theme) => theme.palette.error.main,
      },
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>
        <DialogContent dividers>
          {s?.DocCod ? (
            <HistorialTimeline docCod={s.DocCod} height={420} />
          ) : (
            <DialogContentText>
              No se encontró el DocCod de esta solicitud.
            </DialogContentText>
          )}
        </DialogContent>
      </Dialog>

</Dialog>
  );
}
