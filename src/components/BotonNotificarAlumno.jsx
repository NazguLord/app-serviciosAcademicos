// src/components/BotonNotificarAlumno.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { notificarAlumno, verificarNotificacion } from "../api/solicitudesApi";
import axios from "axios";

export default function BotonNotificarAlumno({ solicitud, docCod, usrUsr, onNotificadoChange }) {
  const [notificado, setNotificado] = useState(false);
  const BASE_URL = "http://unicahdev.registro.cp.unicah.edu";

  async function enviarCorreo(tipo, correo) {
    try {
      if (!Array.isArray(correo) || correo.length === 0) {
        console.warn("No hay correos válidos.");
        return;
      }

      for (const c of correo) {
        const correoDestino = typeof c === "string" ? c : c.correo;

        const payload = {
          tipo,
          correo: correoDestino
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

  // 🔹 Verifica al montar si ya fue notificado
  useEffect(() => {
    const fetchEstado = async () => {
      const res = await verificarNotificacion(docCod);
      setNotificado(res.notificado === true);
      onNotificadoChange?.(res.notificado === true);
    };
    if (docCod) fetchEstado();
  }, [docCod]);

  const handleNotificar = async () => {
    const confirm = await Swal.fire({
      title: "<strong style='font-size: 1.4rem; font-weight: 700; color:#004cbe;'>Confirmar notificación</strong>",
      html: `
    <div style="font-size: 1rem; margin-top: 8px; color:#333;">
      ¿Desea notificar al alumno que su documento está listo para reclamar?
      <br><br>
      <span style="font-size: 0.9rem; color:#666;">
        Esta acción registrará el aviso en el historial de la solicitud.
      </span>
    </div>
  `,
      icon: "info",
      iconColor: "#007bff", // Azul institucional
      showCancelButton: true,
      confirmButtonText: "Sí, notificar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#007bff", // Azul UNICAH
      cancelButtonColor: "#d33",
      background: "#ffffff",
      customClass: {
        popup: "swal2-border-radius",
        confirmButton: "swal2-font-bold",
        cancelButton: "swal2-font-bold",
      },
      reverseButtons: true,
      allowOutsideClick: false,
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = "20000";
      },
    });

    if (!confirm.isConfirmed) return;

    // --- Insertar log ---
    const res = await notificarAlumno(docCod, usrUsr);
    if (res.success) {
      await Swal.fire({
        icon: "success",
        title: "Alumno notificado",
        text: "La notificación fue registrada correctamente.",
        timer: 1800,
        showConfirmButton: false,
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "20000";
        },
      });
      enviarCorreo("documento_listo_retiro", [solicitud.CueMail])
      setNotificado(true);
      onNotificadoChange?.(true);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.message || "No se pudo registrar la notificación.",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "20000";
        },
      });
    }
  };

  return (
    <Button
      variant="contained"
      color="info"
      onClick={handleNotificar}
      disabled={notificado}
      sx={{ fontWeight: 700 }}
    >
      {notificado ? "Alumno notificado" : "Notificar alumno"}
    </Button>
  );
}
