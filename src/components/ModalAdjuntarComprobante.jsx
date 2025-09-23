// src/components/ModalAdjuntarComprobante.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress, Snackbar, Alert
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const ModalAdjuntarComprobante = ({ open, onClose, solicitud }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formik = useFormik({
    initialValues: { comprobante: null },
    validationSchema: Yup.object({
      comprobante: Yup.mixed()
        .required("Debe adjuntar un comprobante")
        .test(
          "fileSize",
          "El archivo no debe superar los 5 MB",
          (value) => !value || value.size <= 5 * 1024 * 1024
        )
        .test(
          "fileType",
          "Formato no válido (solo PDF/JPG/PNG)",
          (value) =>
            !value ||
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
        ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setUploadProgress(0);

      // Simulación del "upload"
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSnackbarOpen(true);
            setSubmitting(false);
            setTimeout(() => {
              onClose(); // cierra el modal al terminar
              setUploadProgress(0);
              setPreviewUrl(null);
              formik.resetForm();
            }, 1000);
          }
          return prev + 10;
        });
      }, 200);
    },
  });

  const handleFileChange = (e) => {
    const file = e.currentTarget.files[0];
    formik.setFieldValue("comprobante", file);

    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Marcar como pagado</DialogTitle>
        <DialogContent>
          <Typography>
            Adjunte el comprobante de pago para continuar con el trámite.
          </Typography>

          <Box mt={2}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            {formik.errors.comprobante && formik.touched.comprobante && (
              <Typography color="error" variant="body2">
                {formik.errors.comprobante}
              </Typography>
            )}
          </Box>

          {/* Preview */}
          {previewUrl && (
            <Box mt={2}>
              <Typography variant="subtitle2">Vista previa:</Typography>
              <img
                src={previewUrl}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: 4 }}
              />
            </Box>
          )}
          {formik.values.comprobante &&
            formik.values.comprobante.type === "application/pdf" && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Archivo PDF seleccionado: {formik.values.comprobante.name}
                </Typography>
              </Box>
            )}

          {/* Barra de progreso */}
          {uploadProgress > 0 && (
            <Box mt={2}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" align="center">
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            disabled={formik.isSubmitting || !formik.values.comprobante}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar éxito */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" variant="filled">
          Comprobante cargado correctamente
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalAdjuntarComprobante;
