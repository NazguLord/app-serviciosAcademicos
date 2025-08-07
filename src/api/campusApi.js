//campusApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export const obtenerCampus = async () => {
  try {
    const response = await axios.get(`${API_BASE}asolicitud_documentos/lista_campus.php`);
    return response.data?.data || [];
  } catch (error) {
    console.error("Error al obtener los campus:", error);
    return [];
  }
};