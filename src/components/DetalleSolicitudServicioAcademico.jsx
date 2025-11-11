// src/components/DetalleSolicitudServicioAcademico.jsx
import React, { useState, useEffect, lazy, Suspense, useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Chip, Stack, Grid, Divider,
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
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import ModalDenegarSolicitud from "../components/ModalDenegarSolicitud";
import ModalAutorizarPago from "../components/ModalPagoDocumento";
import ModalAdjuntarComprobante from "../components/ModalAdjuntarComprobante";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { validarBiblioteca } from "../api/solicitudesApi";
import ModalAdjuntarDocumentoServicioAcademico from "../components/ModalAdjuntarDocumentoServicioAcademico";
import defaultUser from "../assets/default-user.jpg";
const HistorialTimeline = lazy(() => import("../components/HistorialTimeline"));
import VisualizarDocumentoFinalServicio from "../components/VisualizarDocumentoFinalServicio";
import ModalEntregaDocumentoServicioFinal from "../components/ModalEntregaDocumentoServicioFinal";
import BotonNotificarAlumno from "../components/BotonNotificarAlumno";
import BotonActualizarRegistro from "../components/BotonActualizarRegistro";
import axios from "axios";

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

  let color = theme.palette.warning.main;
  let icon = <HorizontalRuleRoundedIcon />;
  let label = "Pendiente";

  if (v === "OK" || v === "SOLVENTE") {
    color = theme.palette.success.main;
    icon = <CheckCircleRoundedIcon />;
    label = "Solvente";
  } else if (v === "INSOLVENTE") {
    color = theme.palette.error.main;
    icon = <CancelRoundedIcon />;
    label = "Insolvente";
  } else if (v === "PDT" || v === "PENDIENTE") {
    color = theme.palette.warning.main;
    icon = <HorizontalRuleRoundedIcon />;
    label = "Pendiente";
  }

  return (
    <Chip
      size="small"
      variant="outlined"
      icon={icon}
      label={label}
      sx={{
        color,
        borderColor: color,
        fontWeight: 700,
        height: 28,
        bgcolor: alpha(color, 0.08),
      }}
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
  const { userData } = useContext(AppContext);
  const s = solicitud; // se usa después

 const permisosCORE = userData?.permissions?.CORE || {};
 const permisosBotonAdjuntar = ["CORE0312"]; // 🔸 puedes agregar más si deseas
 const tienePermisoAdjuntar = permisosBotonAdjuntar.some((permiso) => permisosCORE?.[permiso]);

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
  const [openAdjuntar, setOpenAdjuntar] = useState(false);
  const [estadoDocLocal, setEstadoDocLocal] = useState(s?.DocEst || "");
  const [etiquetaEstado, setEtiquetaEstado] = useState(s?.EstNom || "");
  const [openEntrega, setOpenEntrega] = useState(false);
  const [docFinal, setDocFinal] = useState(null);
  const [notificado, setNotificado] = useState(false);

  const BASE_URL = "http://unicahdev.registro.cp.unicah.edu";


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

  useEffect(() => {
    setEstadoDocLocal(s?.DocEst || "");
    setEtiquetaEstado(s?.EstNom || "");
  }, [s?.DocCod, s?.DocEst, s?.EstNom]);

  /* ✅ Traer documentos al abrir el modal */
  useEffect(() => {
    if (open && s?.CueCod) {
    //  console.log("🔍 Datos enviados al endpoint:");
    //  console.log("CueCod:", s?.CueCod);
    //  console.log("CueReg:", s?.CueReg);
    //  console.log("DocCod:", s?.DocCod);
    //  console.log("DocReg:", s?.DocReg);


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

         // console.log("👉 Usando CueRegFinal:", cueRegFinal);

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


  useEffect(() => {
    if (!s?.DocCod || !["FIN", "ENTREGADO"].includes(String(etiquetaEstado || "").trim().toUpperCase())) return;

    const fetchDocFinal = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/asolicitud_documentos/mostrarDocumentoFinal.php?DocCod=${s.DocCod}`);
        const data = await res.json();

        if (data.success && data.data) {
          setDocFinal(data.data);
          console.log("📄 Documento final cargado:", data.data);
        } else {
          console.warn("⚠️ No se encontró documento final:", data);
        }
      } catch (error) {
        console.error("Error al obtener documento final:", error);
      }
    };

    fetchDocFinal();
  }, [s?.DocCod, etiquetaEstado]);

  /* ✅ Verificar si todos los chips están en OK */
  const todosOk =
  ["OK", "SOLVENTE"].includes(String(s?.BecNom).toUpperCase()) &&
  ["OK", "SOLVENTE"].includes(String(s?.EstCont).toUpperCase()) &&
  ["OK", "SOLVENTE"].includes(String(s?.EstReg).toUpperCase()) &&
  ["OK", "SOLVENTE"].includes(String(estadoBiblioteca || "").toUpperCase());

  // ⚠️ Este return puede ir tranquilo después de los hooks
 // console.log("🧠 Datos de solicitud:", s);
 // console.log("📄 Valor real de DocEst:", s?.EstNom);
  if (!s) return null;

  const puedeDenegar = String(s?.EstNom || "").toLowerCase().startsWith("pendient");
  const puedeAutorizar = String(s?.EstNom || "").toLowerCase() === "pendiente" && todosOk;

  const safeClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => onClose?.(), 0);
  };

  async function enviarCorreo(tipo, correo, obs) {
      try {
        if (!Array.isArray(correo) || correo.length === 0) {
          console.warn("No hay correos válidos.");
          return;
        }
  
        for (const c of correo) {
          const correoDestino = typeof c === "string" ? c : c.correo;
  
          const payload = {
            tipo,
            correo: correoDestino,
            Obs: obs
          };
  
          const url = `${BASE_URL}/api/asolicitud_documentos/enviarCorreo.php`;
  
          const res = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          });
  
          if (res.data?.success) {
            console.log(`Correo enviado correctamente a ${correoDestino}`);
          } else {
            console.warn(`No se pudo enviar el correo a ${correoDestino}:`, res.data);
          }
        }
  
      } catch (error) {
        console.error("Error al enviar correos:", error);
      }
    }


  

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
            label={etiquetaEstado || "-"}
            sx={{
              bgcolor: alpha(estadoColorLocal(theme, etiquetaEstado || ""), 0.12),
              color: estadoColorLocal(theme, etiquetaEstado || ""),
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
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Correo:</Typography><Typography>{s?.CueMail && s.CueMail !== "-" ? <a href={`mailto:${s.CueMail}`}>{s.CueMail}</a> : "-"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography fontWeight={700}>Fecha de solicitud:</Typography>{formatFechaSoloDia(s?.DocFchCre)}</Grid>
          </Grid>
          <Divider />
          {/* Dependencias */}
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1}><Typography><b>Becas</b></Typography><ChipSemaforo valor={s?.BecNom} /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Contabilidad</b></Typography><ChipSemaforo valor={s?.EstCont} /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Biblioteca</b></Typography><ChipSemaforo valor={estadoBiblioteca} /></Stack>
            <Stack direction="row" spacing={1}><Typography><b>Registro</b></Typography><ChipSemaforo valor={s?.EstReg} /></Stack>
          </Stack>

          {/* Documentos adjuntos */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          {/* Imagen del alumno */}
<Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start", alignItems: "center", ml: 2 }}>
  <Box
    sx={{
      border: "1px solid #ccc",
      borderRadius: 2,
      width: 130,
      height: 160,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mr: 3,
      backgroundColor: "#f9f9f9",
    }}
  >
    {s?.CueCod ? (
      <img
        src={`http://unicahdev.registro.cp.unicah.edu/data/fotos/${s.CueReg}.jpg`}
        alt="Foto del alumno"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          e.target.src = defaultUser;
        }}
      />
    ) : (
      <Typography variant="body2" color="text.secondary">
        Sin foto
      </Typography>
    )}
  </Box>
 
</Box>
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

          {/* ✅ Mostrar documento final solo si el estado es “En proceso de entrega” */}
          {String(etiquetaEstado || "").trim().toUpperCase() === "EN PROCESO DE ENTREGA" && (
            <VisualizarDocumentoFinalServicio docCod={s?.DocCod} />
          )}

          {/* Bloque “Servicio Académico entregado” */}
          {["FIN", "ENTREGADO"].includes(String(etiquetaEstado || "").trim().toUpperCase()) && (
            <Box
              sx={{
                mt: 3,
                width: "75%",
                mx: "auto",
                display: "flex",
                justifyContent: "flex-start",
                pl: 13.5, // 👈 conserva tu alineación derecha
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                  minWidth: 380,
                }}
              >
                {/* Encabezado */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <CheckCircleRoundedIcon sx={{ color: "success.main" }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="success.main"
                  >
                    Servicio Académico entregado
                  </Typography>
                </Box>

                {/* Comentario */}
                {docFinal?.ComentarioServicioEntregado ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      lineHeight: 1.5,
                      mb: 2,
                      whiteSpace: "pre-line",
                      textAlign: "left",
                    }}
                  >
                    <strong style={{ color: "#2e7d32" }}>Comentario de entrega:</strong>{" "}
                    {docFinal.ComentarioServicioEntregado}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontStyle: "italic",
                      mb: 2,
                      textAlign: "center",
                    }}
                  >
                    No se agregó comentario de entrega.
                  </Typography>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Botón */}
                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      if (docFinal?.DocPath) {
                        window.open(`${BASE_URL}${docFinal.DocPath}`, "_blank", "noopener,noreferrer");
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: "Documento no disponible",
                          text: "No se encontró el archivo final para esta solicitud.",
                          confirmButtonText: "Entendido",
                        });
                      }
                    }}
                    sx={{
                      fontWeight: 700,
                      px: 3,
                      py: 0.8,
                      borderRadius: 1.5,
                      boxShadow: "none",
                    }}
                  >
                    Ver documento
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

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
         {/*
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
    */}
          <Divider />

          <Typography fontWeight={700}>Observaciones:</Typography>
          <Typography sx={{ whiteSpace: "pre-line" }}>{s?.DocSolObs || "-"}</Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" startIcon={<TimelineIcon />} onClick={() => setOpenHist(true)}>Vitacora de acciones</Button>
       {/*  
        {String(s?.EstNom || "").toLowerCase() === "pendiente de pago" && (
          <Button variant="contained" color="primary" onClick={() => setOpenComprobante(true)}>Pagar</Button>
        )}
      */}
        {/* ✅ Nuevo botón de “Marcar como OK (Registro)” */}
        {mostrarBotonRegistro &&
  String(s?.EstNom || "").toLowerCase() !== "denegado" && (
    <BotonActualizarRegistro solicitud={s} onUpdate={onUpdate} />
  )}
        {puedeAutorizar && (
          <Button variant="outlined" color="success" onClick={() => setOpenAutorizar(true)}>Proceder pago</Button>
        )}
        {puedeDenegar && (
          <Button variant="outlined" color="error" onClick={() => setOpenDenegar(true)}>Denegar</Button>
        )}
        {/* ✅ Mostrar botón solo si el estado actual es "En proceso" (PGD) */}
        {["PGD", "EN PROCESO"].includes(
  String(estadoDocLocal || etiquetaEstado || "").trim().toUpperCase()
) && tienePermisoAdjuntar && (
  <Button
    variant="contained"
    color="primary"
    sx={{ fontWeight: 700 }}
    onClick={() => setOpenAdjuntar(true)}
  >
    Adjuntar documento final
  </Button>
)}
        {/* ✅ Mostrar botón solo si el estado actual es "En proceso de entrega" (CMP) */}
        {["CMP", "EN PROCESO DE ENTREGA"].includes(
          String(estadoDocLocal || etiquetaEstado || "").trim().toUpperCase()
        ) && (
            <>
              {/* 🔹 Si NO ha sido notificado, mostrar botón azul */}
              {!notificado && (
                <BotonNotificarAlumno
                  solicitud={solicitud}
                  docCod={s?.DocCod}
                  usrUsr={s?.CueCod} // puedes cambiar por usuario del sistema si aplica
                  onNotificadoChange={setNotificado}
                />
              )}

              {/* 🔹 Si ya fue notificado, mostrar botón verde */}
              {notificado && (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ fontWeight: 700 }}
                  onClick={() => setOpenEntrega(true)}
                >
                  Marcar como entregado
                </Button>
              )}
            </>
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
            enviarCorreo("denegado_solicitud_alumno", [solicitud.CueMail], observacion)
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
     {/*
      {openComprobante && (
        <ModalAdjuntarComprobante open={openComprobante} solicitud={s} onClose={() => setOpenComprobante(false)} />
      )}
    */} 
      {/* ✅ Modal para adjuntar documento final */}
      {openAdjuntar && (
        <ModalAdjuntarDocumentoServicioAcademico
          open={openAdjuntar}
          onClose={() => setOpenAdjuntar(false)}
          solicitud={s}
          onUpdate={onUpdate}
          onSuccess={() => {
            // actualiza el chip y oculta el botón sin recargar todo
            setEstadoDocLocal("CMP");
            setEtiquetaEstado("En proceso de entrega");
            setOpenAdjuntar(false);
          }}
        />
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

      {/* ✅ Modal para confirmar entrega física del documento */}
      {openEntrega && (
        <ModalEntregaDocumentoServicioFinal
          open={openEntrega}
          onClose={() => setOpenEntrega(false)}
          solicitud={s}
          onEntregado={() => {
            setOpenEntrega(false);
            setEstadoDocLocal("FIN");
            setEtiquetaEstado("Entregado");

            // 🔹 Refrescar tabla principal o mover a pestaña “Completados”
            if (onUpdate) onUpdate();

            // 🔹 Confirmación visual rápida
            Swal.fire({
              icon: "success",
              title: "Entrega confirmada",
              text: "El documento ha sido marcado como entregado.",
              timer: 1800,
              showConfirmButton: false,
              didOpen: () => {
                const swalContainer = document.querySelector(".swal2-container");
                if (swalContainer) swalContainer.style.zIndex = 20000;
              },
            });
          }}
        />
      )}
    </Dialog>
  );
}
