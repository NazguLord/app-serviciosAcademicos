// ModalDenegarSolicitud.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, Button
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const schema = Yup.object({
  observacion: Yup.string()
    .trim()
    .min(5, "Muy corta")
    .max(500, "Máximo 500 caracteres")
    .required("Requerido"),
});

export default function ModalDenegarSolicitud({
  open,
  onClose,
  onConfirm,          // (values) => Promise | void  (devolver promesa si harás fetch)
  titulo = "Denegar documento",
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>

      <Formik
        initialValues={{ observacion: "" }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
             await onConfirm?.(values.observacion); 
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, touched, errors, values, handleChange }) => (
          <Form>
            <DialogContent dividers>
              <Typography sx={{ mb: 2 }}>
                ¿Está seguro que desea denegar la solicitud de documento?
              </Typography>

              <TextField
                name="observacion"
                label="Observación"
                value={values.observacion}
                onChange={handleChange}
                error={touched.observacion && Boolean(errors.observacion)}
                helperText={
                  touched.observacion && errors.observacion
                    ? errors.observacion
                    : `${values.observacion.length}/500`
                }
                fullWidth
                multiline
                minRows={3}
                inputProps={{ maxLength: 500 }}
                autoFocus
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                loading={isSubmitting}
              >
                Guardar
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
