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


export async function denegarSolicitud(payload) {
  // El endpoint espera form-urlencoded (como en tu captura "Datos de formulario")
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ""));

  const res = await fetch(`${API_BASE}asolicitud_documentos/denegar2.php`, {
    method: "POST",
    body, // sin headers: fetch pondrá automáticamente application/x-www-form-urlencoded
  });

  // Si la API siempre responde JSON {status, payload}
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error("No se pudo denegar");
  }
  return json; // { status: "OK" | "ER", payload: {...} }
}