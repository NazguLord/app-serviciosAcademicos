// src/components/BotonActualizarRegistro.jsx
import React from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { actualizarEstadoSolicitud } from "../api/solicitudesApi";

export default function BotonActualizarRegistro({ solicitud, onUpdate }) {
  const handleClick = async () => {
    const s = solicitud;

    const confirm = await Swal.fire({
      title: "¿Confirmar actualización?",
      text: "¿Desea marcar el estado de Registro como OK?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#d33",
      reverseButtons: true,
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = 20000;
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = {
        DocCod: s?.DocCod,
        Dependencia: "REGISTRO",
        Estado: "OK",
      };

      const resp = await actualizarEstadoSolicitud(payload);

      if (resp?.status === "OK") {
        // 🔹 Actualizar el valor local del chip inmediatamente
        s.EstReg = "OK";

        await Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: "Registro marcado como OK correctamente.",
          timer: 1500,
          showConfirmButton: false,
          didOpen: () => {
            const swalContainer = document.querySelector(".swal2-container");
            if (swalContainer) swalContainer.style.zIndex = 20000;
          },
        });

        // 🔹 Llamar al refresco del padre (tabla)
        if (onUpdate) onUpdate();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: resp?.message || "No se pudo completar la acción.",
          didOpen: () => {
            const swalContainer = document.querySelector(".swal2-container");
            if (swalContainer) swalContainer.style.zIndex = 20000;
          },
        });
      }
    } catch (error) {
      console.error("Error al actualizar estado de Registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = 20000;
        },
      });
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      sx={{ fontWeight: 700 }}
      onClick={handleClick}
    >
      Registro OK
    </Button>
  );
}
