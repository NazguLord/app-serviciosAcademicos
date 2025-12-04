// src/components/ModalAdjuntarDocumentoServicioAcademico.jsx
import React, { useState, useContext  } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Box, Typography
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { AppContext } from "../context/AppContext"; 

const BASE_URL = import.meta.env.VITE_API_BASE;

export default function ModalAdjuntarDocumentoServicioAcademico({
  open,
  onClose,
  solicitud,
  onUpdate,
  onSuccess,
}) {
  const { userData } = useContext(AppContext); 
  const [subiendo, setSubiendo] = useState(false);

  const validationSchema = Yup.object().shape({
    archivo: Yup.mixed()
      .required("Debe seleccionar un archivo.")
      .test(
        "tipo",
        "Solo se permiten archivos PDF, JPG o PNG.",
        (value) =>
          value &&
          ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
      )
      .test(
        "tamaño",
        "El archivo no debe superar los 5 MB.",
        (value) => value && value.size <= 5 * 1024 * 1024
      ),
  });

  async function enviarCorreo(tipo, correo, adjuntoBase64, adjuntoNombre) {
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
          adjuntoBase64,
          adjuntoNombre
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


  function convertirArchivoABase64(archivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  }

  const handleSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append("archivo", values.archivo);
    formData.append("DocCod", solicitud.DocCod);
    formData.append("CueReg", solicitud.CueReg);
    formData.append("UsrUsr", userData.UsrUsr || "");
    formData.append("Accion", "Subida de documento final");

    try {
      setSubiendo(true);
      let adjuntoBase64 = await convertirArchivoABase64(values.archivo);
      let adjuntoNombre = values.archivo.name;

      enviarCorreo("documento_enviado_campus", [solicitud.CueMail], adjuntoBase64, adjuntoNombre)


      const res = await axios.post(
        `${BASE_URL}asolicitud_documentos/subirDocumentoFinal.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        // ✅ Primero actualizamos y cerramos el modal
        onUpdate?.();
        onClose?.();
        onSuccess?.();
        try { resetForm(); } catch { }

        // ✅ Luego mostramos el Swal por encima del Dialog
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Documento subido correctamente",
            text: "El estado de la solicitud fue actualizado a 'En proceso de entrega'.",
            timer: 2300,
            showConfirmButton: false,
            didOpen: () => {
              const c = document.querySelector(".swal2-container");
              if (c) c.style.zIndex = 20000; // Asegurar que quede arriba del MUI Dialog
            },
          });
        }, 250);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al subir",
          text: res.data.error || "No se pudo subir el archivo.",
          didOpen: () => {
            const c = document.querySelector(".swal2-container");
            if (c) c.style.zIndex = 20000;
          },
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "Ocurrió un problema durante la carga del archivo.",
        didOpen: () => {
          const c = document.querySelector(".swal2-container");
          if (c) c.style.zIndex = 20000;
        },
      });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // ❗ ayuda a que se desmonte completamente al cerrar (sin tapar el Swal)
      keepMounted={false}
    >
      <DialogTitle>Adjuntar documento final del servicio</DialogTitle>

      <Formik
        initialValues={{ archivo: null }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Seleccione el documento final para el servicio solicitado por:
                <strong> {solicitud?.AluNom || solicitud?.CueNom || "—"}</strong>.
              </Typography>

              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#1976d2" },
                }}
                onClick={() => document.getElementById("fileInputFinal").click()}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: "gray" }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {values.archivo
                    ? values.archivo.name
                    : "Seleccione o arrastre un archivo (.pdf, .jpg, .png)"}
                </Typography>
                <input
                  id="fileInputFinal"
                  name="archivo"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    setFieldValue("archivo", e.currentTarget.files[0])
                  }
                />
              </Box>

              {errors.archivo && touched.archivo && (
                <Typography color="error" sx={{ mt: 1, textAlign: "center" }}>
                  {errors.archivo}
                </Typography>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose} disabled={subiendo}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={!subiendo && <CloudUploadIcon />}
                disabled={subiendo}
                sx={{ fontWeight: 700 }}
              >
                {subiendo ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Subiendo...
                  </>
                ) : (
                  "Subir y actualizar"
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
