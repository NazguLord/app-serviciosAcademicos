// src/components/ModalPagoDocumento.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { autorizarSolicitud, crearFacturaSapServiciosAcademicos } from "../api/solicitudesApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE;

export default function ModalPagoDocumento({ open, onClose, onSubmit, solicitud }) {
  const [loading, setLoading] = useState(false);

  const traerSwalAlFrente = () => {
    const swalContainer = document.querySelector(".swal2-container");
    if (swalContainer) swalContainer.style.zIndex = 20000;
  };

  useEffect(() => {
    return () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
  }, []);

  async function enviarCorreo(tipo, correo, docCod) {
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
          DocCod: docCod
        };

        const url = `${BASE_URL}asolicitud_documentos/enviarCorreo.php`;

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

  const handleClose = () => {
    document.activeElement?.blur();
    onClose();
  };

const handleAutorizar = async () => {
  setLoading(true);
  document.activeElement?.blur();
  handleClose();

  setTimeout(async () => {
    try {
      Swal.fire({
        title: "Autorizando pago...",
        text: "Por favor espere",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          traerSwalAlFrente();
          Swal.showLoading();
        },
      });

      const payload = {
        DocCod: solicitud.DocCod,
        estadoreg: solicitud.estadoreg ?? "",
        estadocont: solicitud.estadocont ?? "",
        estadocond: solicitud.estadocond ?? "",
      };

      const resp = await autorizarSolicitud(payload);
      const docCodParte = solicitud.DocCod.split("-").pop();

      if (resp?.status === "OK") {
        Swal.update({
          title: "Enviando solicitud a SAP...",
          text: "Este proceso puede tardar unos segundos. Por favor espere.",
        });
        traerSwalAlFrente();
        Swal.showLoading();

        const sapResp = await crearFacturaSapServiciosAcademicos(docCodParte);

        if (!sapResp?.ok) {
          throw new Error(
            sapResp?.message || "No se pudo crear la factura abierta en SAP"
          );
        }

        Swal.fire({
          icon: "success",
          title: "Pago autorizado",
          text: "El documento fue autorizado correctamente. El interesado podrá proceder con el pago.",
          timer: 2500,
          showConfirmButton: false,
          didOpen: traerSwalAlFrente,
        });

        onSubmit?.();
        enviarCorreo("autorizado_pago_alumno", [solicitud.CueMail], docCodParte);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resp?.payload?.message || "No se pudo autorizar el pago",
          didOpen: traerSwalAlFrente,
        });
      }
    } catch (err) {
      console.error("Error al autorizar o crear factura SAP:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Ocurrió un error al autorizar el pago",
        didOpen: traerSwalAlFrente,
      });
    } finally {
      setLoading(false);
    }
  }, 0);
};

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEnforceFocus
      disableRestoreFocus
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        Autorizar el pago de documento solicitado
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ¿Está seguro que desea autorizar el pago de la solicitud de este documento?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Al autorizar el pago, el interesado será notificado para que realice el pago del servicio
          solicitado y pueda proceder a cancelarlo.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleAutorizar}
          variant="contained"
          color="success"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "Procesando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
