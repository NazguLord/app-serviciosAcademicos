// src/api/solicitudesApi.js
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

export const obtenerSolicitudes = async (campus, estado) => {
  try {
    const response = await axios.get(`${API_BASE}asolicitud_documentos/buscar2.php`, {
      params: { CamCod: campus, DocEst: estado }
    });

    // Asegura que response.data.data sea un array
    const solicitudes = response.data?.data;
    return Array.isArray(solicitudes) ? solicitudes : [];

  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return [];
  }
};