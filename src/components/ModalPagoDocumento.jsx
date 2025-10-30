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
import { autorizarSolicitud } from "../api/solicitudesApi";

export default function ModalPagoDocumento({ open, onClose, onSubmit, solicitud }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
  }, []);

  const handleClose = () => {
    document.activeElement?.blur();
    onClose();
  };

  const handleAutorizar = async () => {
    try {
      setLoading(true);
      document.activeElement?.blur();
      handleClose();

      setTimeout(async () => {
        Swal.fire({
          title: "Autorizando pago...",
          text: "Por favor espere",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        const payload = {
          DocCod: solicitud.DocCod,
          estadoreg: solicitud.estadoreg ?? "",
          estadocont: solicitud.estadocont ?? "",
          estadocond: solicitud.estadocond ?? "",
        };

        const resp = await autorizarSolicitud(payload);

        if (resp?.status === "OK") {
          Swal.fire({
            icon: "success",
            title: "Pago autorizado",
            text: "El documento fue autorizado correctamente. El interesado podrá proceder con el pago.",
            timer: 2500,
            showConfirmButton: false,
          });
          onSubmit?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: resp?.payload?.message || "No se pudo autorizar el pago",
          });
        }
      }, 0);
    } catch (err) {
      console.error("Error al autorizar:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al autorizar el pago",
      });
    } finally {
      setLoading(false);
    }
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
