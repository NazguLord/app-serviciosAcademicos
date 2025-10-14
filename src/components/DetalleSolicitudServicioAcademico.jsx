// src/components/DetalleSolicitudServicioAcademico.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Stack, Grid, Divider,
  IconButton, Button, DialogContentText, CircularProgress
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import TimelineIcon from "@mui/icons-material/Timeline";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ModalDenegarSolicitud from "../components/ModalDenegarSolicitud";
import ModalAutorizarPago from "../components/ModalPagoDocumento";
import ModalAdjuntarComprobante from "../components/ModalAdjuntarComprobante";
import { actualizarEstadoSolicitud } from "../api/solicitudesApi";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import { validarBiblioteca } from "../api/solicitudesApi";
const HistorialTimeline = lazy(() => import("../components/HistorialTimeline"));

/* ---------- helpers ---------- */
const formatFechaSoloDia = (input) => {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input).split(" ")[0];
  return d.toLocaleDateString("es-HN", { day: "numeric", month: "numeric", year: "numeric" });
};

const estadoColorLocal = (theme, nombre = "") => {
  const txt = String(nombre).trim().toLowerCase();
  if (txt.includes("deneg")) return theme.palette.error.main;
  if (txt === "entregado") return theme.palette.success.main;
  if (txt.includes("proceso")) return theme.palette.warning.dark;
  if (txt.startsWith("pendient")) return theme.palette.warning.light;
  return theme.palette.text.secondary;
};

const ChipSemaforo = React.memo(function ChipSemaforo({ valor }) {
  const theme = useTheme();
  const v = String(valor ?? "").trim().toUpperCase();
  const ok = v === "OK";
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
});

/* ---------- componente principal ---------- */
export default function DetalleSolicitudServicioAcademico({
  open,
  solicitud,
  onClose,
  onDenegar,
  onUpdate,
}) {
  const theme = useTheme();

  // ⚙️ Hooks siempre deben declararse ANTES de cualquier return condicional
  const [openDenegar, setOpenDenegar] = useState(false);
  const [openHist, setOpenHist] = useState(false);
  const [openAutorizar, setOpenAutorizar] = useState(false);
  const [openComprobante, setOpenComprobante] = useState(false);
  const [visorArchivo, setVisorArchivo] = useState({
  abierto: false,
  nombre: "",
  ruta: "",
  esPdf: false,
});

  const [documentos, setDocumentos] = useState([]);
  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [estadoBiblioteca, setEstadoBiblioteca] = useState(null);

  const BASE_URL = "http://unicahdev.registro.cp.unicah.edu";
  const s = solicitud; // se usa después

  useEffect(() => {
  if (!solicitud?.CueCod) return;

  async function verificarBiblioteca() {
    const res = await validarBiblioteca(solicitud.CueCod);
    if (res.ok) {
      setEstadoBiblioteca(res.tienePendientes ? "PDT" : "OK");
      console.log("📚 Resultado Biblioteca:", res);
    } else {
      console.error("Error al consultar Biblioteca:", res.message);
    }
  }

  verificarBiblioteca();
}, [solicitud?.CueCod]);

  /* ✅ Traer documentos al abrir el modal */
  useEffect(() => {
  if (open && s?.CueCod) {
    console.log("🔍 Datos enviados al endpoint:");
    console.log("CueCod:", s?.CueCod);
    console.log("CueReg:", s?.CueReg);
    console.log("DocCod:", s?.DocCod);
    console.log("DocReg:", s?.DocReg);

    const fetchDocs = async () => {
      setCargandoDocs(true);
      try {
        // 🔹 Detectar automáticamente el CueReg correcto
        let cueRegFinal = s?.CueReg || s?.DocReg || "";

        if (!cueRegFinal && s?.DocCod) {
          const match = String(s.DocCod).split("-")[0];
          cueRegFinal = match;
        }

        if (!cueRegFinal) {
          console.warn("⚠️ No se encontró ningún identificador válido para CueReg.");
          setDocumentos([]);
          setCargandoDocs(false);
          return;
        }

        console.log("👉 Usando CueRegFinal:", cueRegFinal);

        const res = await fetch(
          `${BASE_URL}/api/agestiones/documentos/buscar.php?CueCod=${s.CueCod}&CueReg=${cueRegFinal}&filterslength=0&pagenum=0&pagesize=10&page=0&limit=10`
        );

        const text = await res.text();
        let data;

        try {
          const clean = text.trim().replace(/^[^{[]+/, "");
          data = JSON.parse(clean);
        } catch (parseErr) {
          console.warn("⚠️ Error al parsear JSON, respuesta cruda:", text);
          data = { data: [] };
        }

        if (Array.isArray(data.data)) {
          setDocumentos(data.data);
        } else {
          console.warn("⚠️ No se encontró arreglo 'data' en respuesta:", data);
          setDocumentos([]);
        }
      } catch (err) {
        console.error("Error cargando documentos:", err);
        setDocumentos([]);
      } finally {
        setCargandoDocs(false);
      }
    };

    fetchDocs();
  }
}, [open, s]);

  // ⚠️ Este return puede ir tranquilo después de los hooks
  if (!s) return null;

  const puedeDenegar = String(s?.EstNom || "").toLowerCase().startsWith("pendient");
  const puedeAutorizar = String(s?.EstNom || "").toLowerCase() === "pendiente";

  const safeClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => onClose?.(), 0);
  };

  /* ✅ Función para actualizar el chip de dependencia */
  const handleActualizarChip = async (dependencia, valor) => {
    try {
      const payload = {
        DocCod: s?.DocCod,
        Dependencia: dependencia,
        Estado: valor,
      };

      const resp = await actualizarEstadoSolicitud(payload);

      if (resp?.status === "OK") {
        await Swal.fire({
          icon: "success",
          title: `Estado de ${dependencia} actualizado a ${valor}`,
          timer: 1500,
          showConfirmButton: false,
           didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = 20000; // 👈 para que quede arriba
        },
        });
         if (dependencia === "REGISTRO") s.EstReg = valor;
         if (dependencia === "BECAS") s.BecNom = valor;
        onUpdate?.();
      } else {
        Swal.fire({
        icon: "error",
        title: "Error al actualizar estado",
        text: resp?.message || "No se pudo completar la acción",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = 20000;
         },
        });
      }
    } catch (error) {
      console.error("Error actualizando chip:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el estado",
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = 20000;
      },
     });
    }
  };

  /* ✅ Verificar si todos los chips están en OK */
  const todosOk =
    String(s?.BecNom).toUpperCase() === "OK" &&
    String(s?.EstCont).toUpperCase() === "OK" &&
   // String(s?.CorNom).toUpperCase() === "OK" 
    String(s?.EstReg).toUpperCase() === "OK" &&
    String(estadoBiblioteca || "").toUpperCase() === "OK";

    const mostrarBotonRegistro = String(s?.EstReg || "").toUpperCase() === "PDT";

  /* ---------- Render principal ---------- */
  return (
    <Dialog
      open={open}
      onClose={safeClose}
      maxWidth="md"
      fullWidth
      keepMounted
      transitionDuration={{ appear: 120, enter: 120, exit: 90 }}
      disableEnforceFocus
      disableRestoreFocus
    >
      <DialogTitle sx={{ pr: 8, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 4 }}>
          <Typography variant="h6" fontWeight={700}>Detalle de solicitud</Typography>
          <Chip
            label={s?.EstNom || "-"}
            sx={{
              bgcolor: alpha(estadoColorLocal(theme, s?.EstNom || ""), 0.12),
              color: estadoColorLocal(theme, s?.EstNom || ""),
              fontWeight: 700,
            }}
          />
        </Box>
        <IconButton onClick={safeClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Datos principales */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Cuenta:</Typography><Typography>{s?.CueCod || "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Alumno:</Typography><Typography>{s?.AluNom || "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Carrera / Plan:</Typography><Typography>{s?.PlaNomEsp || "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Teléfono:</Typography><Typography>{s?.CueTel || "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Documento:</Typography><Typography>{s?.DocNom || "-"}{s?.DocLeng && ` (${s.DocLeng})`}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Correo institucional:</Typography><Typography>{s?.CueMailIns && s.CueMailIns !== "-" ? <a href={`mailto:${s.CueMailIns}`}>{s.CueMailIns}</a> : "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Fecha de solicitud:</Typography>{formatFechaSoloDia(s?.DocFchCre)}</Grid>
          </Grid>

          <Divider />

          {/* Dependencias */}
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1}><Typography><b>Becas</b></Typography><ChipSemaforo valor={s?.BecNom} label="Biblioteca"  /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Contabilidad</b></Typography><ChipSemaforo valor={s?.EstCont} /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Biblioteca</b></Typography><ChipSemaforo valor={estadoBiblioteca} /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Registro</b></Typography><ChipSemaforo valor={s?.EstReg} /></Stack>
          </Stack>

          {/* Documentos adjuntos */}
<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
  <Box sx={{ width: "75%" }}>
    <Typography fontWeight={700} sx={{ mb: 1 }}>
      Documentos adjuntos:
    </Typography>

    {cargandoDocs ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    ) : documentos.length === 0 ? (
      <Typography>No se encontraron documentos.</Typography>
    ) : (
      <Stack spacing={1}>
        {documentos.map((doc, idx) => {
          const rutaCompleta = `${BASE_URL}${doc.DocPath}`;

          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                p: 1,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  wordBreak: "break-all",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                }}
              >
                📎 {doc.DocNom}
              </Typography>

              <IconButton
                size="small"
                color="primary"
                onClick={() => window.open(rutaCompleta, "_blank", "noopener,noreferrer")}
                sx={{
                  ml: 1,
                  bgcolor: "#f5f5f5",
                  border: "1px solid #ddd",
                  "&:hover": { bgcolor: "#e0e0e0" },
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Box>
          );
        })}
      </Stack>
    )}
  </Box>
</Box>

{/* Modal visor de documento */}
{visorArchivo?.abierto && (
  <Dialog
    open={visorArchivo.abierto}
    onClose={() => setVisorArchivo({ abierto: false })}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      {visorArchivo.nombre}
      <IconButton
        onClick={() => setVisorArchivo({ abierto: false })}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent
      dividers
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
      }}
    >
      <Typography sx={{ mb: 2, textAlign: "center" }}>
        Este archivo se abrirá en una nueva pestaña para una mejor visualización.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        href={visorArchivo.ruta}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<VisibilityIcon />}
        sx={{ fontWeight: 700 }}
      >
        Abrir archivo
      </Button>
    </DialogContent>
  </Dialog>
)}

  

          {/* Botón global si todos los chips están en OK */}
          {todosOk && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: 700 }}
                onClick={() =>
                  Swal.fire({
                    icon: "info",
                    title: "Mover solicitud de estado",
                    text: "Aquí se implementará el cambio global de estado.",
                    confirmButtonText: "Entendido",
                  })
                }
              >
                Mover solicitud de estado
              </Button>
            </Box>
          )}

          <Divider />

          <Typography fontWeight={700}>Observaciones:</Typography>
          <Typography sx={{ whiteSpace: "pre-line" }}>{s?.DocSolObs || "-"}</Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" startIcon={<TimelineIcon />} onClick={() => setOpenHist(true)}>Ver historial</Button>
        {String(s?.EstNom || "").toLowerCase() === "pendiente de pago" && (
          <Button variant="contained" color="primary" onClick={() => setOpenComprobante(true)}>Pagar</Button>
        )}
        {/* ✅ Nuevo botón de “Marcar como OK (Registro)” */}
  {mostrarBotonRegistro && (
    <Button
      variant="contained"
      color="success"
      sx={{ fontWeight: 700 }}
      onClick={() => handleActualizarChip("REGISTRO", "OK")}
    >
      Registro OK
    </Button>
  )}
        {puedeAutorizar && (
          <Button variant="outlined" color="success" onClick={() => setOpenAutorizar(true)}>Autorizar Pago</Button>
        )}
        {puedeDenegar && (
          <Button variant="outlined" color="error" onClick={() => setOpenDenegar(true)}>Denegar</Button>
        )}
        <Button onClick={safeClose}>Cerrar</Button>
      </DialogActions>

      {/* Modales secundarios */}
      {openDenegar && (
        <ModalDenegarSolicitud
          open={openDenegar}
          onClose={() => { document.activeElement?.blur(); setOpenDenegar(false); }}
          onConfirm={async (observacion) => {
            document.activeElement?.blur();
            setOpenDenegar(false);
            onClose?.();
            setTimeout(() => onDenegar?.(s, observacion), 0);
          }}
        />
      )}

      {openAutorizar && (
        <ModalAutorizarPago
          open={openAutorizar}
          solicitud={s}
          onClose={() => { document.activeElement?.blur(); setOpenAutorizar(false); }}
          onSubmit={async () => { setOpenAutorizar(false); onClose?.(); setTimeout(async () => await onUpdate?.(), 0); }}
        />
      )}

      {openComprobante && (
        <ModalAdjuntarComprobante open={openComprobante} solicitud={s} onClose={() => setOpenComprobante(false)} />
      )}

      {/* Historial */}
      <Dialog open={openHist} onClose={() => setTimeout(() => setOpenHist(false), 0)} fullWidth maxWidth="md" disableRestoreFocus disableEnforceFocus>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: "1.25rem", borderBottom: "1px solid", borderColor: theme.palette.divider }}>
          Historial de acciones
          <IconButton onClick={() => setOpenHist(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {s?.DocCod ? (
            <Suspense fallback={<DialogContentText>Cargando historial...</DialogContentText>}>
              <HistorialTimeline docCod={s.DocCod} height={420} />
            </Suspense>
          ) : (
            <DialogContentText>No se encontró el DocCod de esta solicitud.</DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
