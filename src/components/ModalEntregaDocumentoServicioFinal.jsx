// src/components/ModalEntregaDocumentoServicioFinal.jsx
import {  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  TextField,  Typography,
} from "@mui/material";
import { useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AppContext } from "../context/AppContext"; 

export default function ModalEntregaDocumentoServicioFinal({  open,  onClose,  solicitud,  onEntregado,
}) {
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AppContext);
  const BASE_URL = import.meta.env.VITE_API_BASE;

  // ✅ Maneja el cierre del modal y limpieza del campo
  const handleClose = () => {
    setComentario("");
    onClose();
  };

  const handleConfirmar = async () => {
  if (!comentario.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Falta el comentario",
      text: "Por favor, ingrese un comentario sobre la entrega del documento.",
      confirmButtonColor: "#1976d2",
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = 20000;
      },
    });
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(
      `${BASE_URL}asolicitud_documentos/actualizarDocumentoServicioFinal.php`,
      {
        DocCod: solicitud.DocCod,
        ComentarioServicioEntregado: comentario,
        UsrUsr: userData?.UsrUsr || userData?.username || "", // 👈 se envía el usuario que realiza la acción
      }
    );

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Entrega confirmada",
        text: "El documento fue marcado como entregado correctamente.",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = 20000;
        },
        timer: 2000,
        showConfirmButton: false,
      });

      onEntregado?.();
      handleClose();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: res.data.message || "No se pudo actualizar el estado.",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = 20000;
        },
        confirmButtonColor: "#d33",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "Ocurrió un problema al comunicarse con el servidor.",
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = 20000;
      },
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>
        Confirmar entrega de documento
      </DialogTitle>

      <DialogContent>
        <Typography mb={1}>
          Ingrese un comentario sobre la entrega del documento al interesado:
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={`Ejemplo: ${
            solicitud?.nombreDocumento ||
            "Documento"
          } entregado personalmente al alumno.`}
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="success"
          disabled={loading || !comentario.trim()}
        >
          {loading ? "Actualizando..." : "Confirmar entrega"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
