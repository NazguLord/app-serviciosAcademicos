// src/components/ModalPagoDocumento.jsx
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2"; // 👈 importamos SweetAlert
import { autorizarSolicitud } from "../api/solicitudesApi";

const validationSchema = Yup.object({
  paginas: Yup.number()
    .required("El número de páginas es requerido")
    .min(1, "Debe ser al menos 1 página")
    .integer("Debe ser un número entero"),
  valor: Yup.number()
    .required("El valor es requerido")
    .min(1, "Debe ser mayor a 0")
    .integer("Debe ser un número entero"),
});

export default function ModalPagoDocumento({ open, onClose, onSubmit, solicitud }) {
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableEnforceFocus>
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        Autorizar documento
      </DialogTitle>

      <Formik
        initialValues={{
          paginas: solicitud?.DocPages || "",
          valor: solicitud?.DocVal || "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            document.activeElement?.blur();

            const payload = {
              DocCod: solicitud.DocCod,
              DocPages: values.paginas,
              DocVal: values.valor,
              estadoreg: solicitud.estadoreg ?? "",
              estadocont: solicitud.estadocont ?? "",
              estadocond: solicitud.estadocond ?? "",
            };

            // 🔹 Loader con SweetAlert
            Swal.fire({
              title: "Autorizando...",
              text: "Por favor espere",
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => Swal.showLoading(),
            });

            const resp = await autorizarSolicitud(payload);

            if (resp?.status === "OK") {
              Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "El documento fue autorizado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });

              onSubmit?.(); // refrescar grilla en el padre
              handleClose();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: resp?.payload?.message || "No se pudo autorizar",
              });
            }
          } catch (err) {
            console.error("Error al autorizar:", err);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Ocurrió un error al autorizar",
            });
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, isSubmitting }) => (
          <Form>
            <DialogContent dividers>
              <Typography variant="body2" sx={{ mb: 2 }}>
                ¿Está seguro que desea autorizar la solicitud de documento? <br />
                <strong>(EL SOLICITANTE NO ESTÁ SOLVENTE EN UNO O MÁS DEPARTAMENTOS).</strong>
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Páginas del documento"
                  name="paginas"
                  value={values.paginas}
                  onChange={handleChange}
                  error={touched.paginas && Boolean(errors.paginas)}
                  helperText={touched.paginas && errors.paginas}
                  fullWidth
                  type="number"
                />

                <TextField
                  label="Valor del documento"
                  name="valor"
                  value={values.valor}
                  onChange={handleChange}
                  error={touched.valor && Boolean(errors.valor)}
                  helperText={touched.valor && errors.valor}
                  fullWidth
                  type="number"
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
