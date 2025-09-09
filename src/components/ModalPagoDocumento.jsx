// src/components/ModalPagoDocumento.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  paginas: Yup.number()
    .required("El número de páginas es requerido")
    .min(1, "Debe ser al menos 1 página")
    .integer("Debe ser un número entero"),
  valor: Yup.number()
    .required("El valor es requerido")
    .min(1, "Debe ser mayor a 0"),
});

const ModalPagoDocumento = ({ open, onClose, onSubmit, solicitud }) => {
  const handleClose = () => {
    // Evita warning de focus
    document.activeElement?.blur();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        Autorizar documento
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          ¿Está seguro que desea autorizar la solicitud de documento? <br />
          <strong>
            (EL SOLICITANTE NO ESTÁ SOLVENTE EN UNO O MÁS DEPARTAMENTOS).
          </strong>
        </Typography>

        <Formik
          initialValues={{
            paginas: "",
            valor: solicitud?.valor || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            // Aquí va tu lógica de backend (cuando tengas el endpoint)
            // Ejemplo: await axios.post("/api/autorizarPago", { ...values, idSolicitud: solicitud.id })
            onSubmit(values);

            setSubmitting(false);
            resetForm();
            handleClose();
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form>
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

              <DialogActions sx={{ mt: 3 }}>
                <Button onClick={handleClose} variant="outlined" color="inherit">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Guardar
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPagoDocumento;
