import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, useTheme } from '@mui/material';
import { Facebook as FacebookIcon, Twitter as TwitterIcon, Instagram as InstagramIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { tokens } from "../theme";

const Footer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.CatoAccent[500],
        color: colors.softWhiteAccent[500], // Aplica el color deseado a todo el texto
        py: 1, // Reducido de 2 a 1
        borderTop: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        bottom: 0,
        width: '100%',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="space-between">
          {/** Sección de Contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom>
              Contáctanos
            </Typography>
            <Typography variant="caption">Tegucigalpa, Honduras  </Typography>
            <Typography variant="caption"></Typography>
          </Grid>

          {/** Sección de Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom>
              Síguenos
            </Typography>
            <Box display="flex" gap={1}>
              {[
                { label: 'Sitio Web', icon: <TwitterIcon />, url: 'https://x.com/UNICAH_HN' },
                { label: 'Facebook', icon: <FacebookIcon />, url: 'https://www.facebook.com/UNICAHSCJ' },
                { label: 'Instagram', icon: <InstagramIcon />, url: 'https://www.instagram.com/unicahscj/' },
                { label: 'LinkedIn', icon: <LinkedInIcon />, url: 'https://hn.linkedin.com/school/universidad-cat%C3%B3lica-de-honduras-%27nuestra-se%C3%B1ora-reina-de-la-paz%27/' },
              ].map(({ label, icon, url }) => (
                <IconButton
                  key={label}
                  aria-label={label}
                  color="inherit"
                  href={url}
                  sx={{ p: 0.5 }} // Reduce el padding de los botones
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box mt={2} textAlign="center">
          <Typography variant="caption">           
            <Link color="inherit" href="https://www.unicah.edu/">
              UNICAH
            </Link>            
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;