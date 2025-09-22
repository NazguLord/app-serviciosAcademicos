// ModalDenegarSolicitud.jsx
import { useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, Button, CircularProgress
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
  onConfirm,          // (values) => Promise | void
  titulo = "Denegar documento",
}) {

  // ✅ Este es el lugar correcto para useEffect
  useEffect(() => {
    return () => {
    //console.log("🧹 ModalDenegarSolicitud desmontado");
    //console.log("Elemento activo:", document.activeElement);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEnforceFocus>
      <DialogTitle>{titulo}</DialogTitle>

      <Formik
        initialValues={{ observacion: "" }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            document.activeElement?.blur();
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
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
