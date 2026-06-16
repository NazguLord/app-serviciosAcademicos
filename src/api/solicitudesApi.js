// src/api/solicitudesApi.js
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE_SAP = import.meta.env.VITE_SAP_API_BASE;

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

/**
 * Obtiene el historial de acciones (timeline) por DocCod
 * Devuelve SIEMPRE un array (normalizado), o [] si hay error/vacío
 */
export async function obtenerHistorialAcciones(docCod) {
  if (!docCod) return [];
  try {
    const { data } = await axios.get(
      `${API_BASE}asolicitud_documentos/obtener_log2.php`,
      { params: { DocCod: docCod } }
    );

    // Tu shape exacto:
    // { total, pagenum, pagesize, data: [ { LogCod, DocCod, UsrUsr, LogDsc, LogFch } ] }
    const rows = Array.isArray(data?.data) ? data.data : [];
    return rows.map((r) => ({
      fecha: r.LogFch || "",
      accion: r.LogDsc || "",
      usuario: r.UsrUsr || "",
      docCod: r.DocCod || "",
      raw: r,
    }));
  } catch (err) {
    console.error("Error al obtener historial:", err);
    return [];
  }
}

export async function autorizarSolicitud(payload) {
  // El endpoint espera form-urlencoded
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ""));

  const res = await fetch(`${API_BASE}asolicitud_documentos/autorizar2.php`, {
    method: "POST",
    body, // application/x-www-form-urlencoded automáticamente
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error("No se pudo autorizar");
  }
  return json; // { status: "OK" | "ER", payload: {...} }
}

export async function actualizarEstadoSolicitud(payload) {
  const formData = new FormData();
  formData.append("DocCod", payload.DocCod);
  formData.append("Dependencia", payload.Dependencia);
  formData.append("Estado", payload.Estado);

  try {
    const res = await fetch(
      `${API_BASE}asolicitud_documentos/actualizar_estado_dependencia.php`,
      {
        method: "POST",
        body: formData,
      }
    );

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("⚠️ Error al parsear JSON:", text);
      json = { status: "ER", message: "Respuesta no válida del servidor" };
    }

    return json;
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    return { status: "ER", message: error.message };
  }
}


export async function validarBiblioteca(cueCod) {
  try {
    const { data } = await axios.get(
      `${API_BASE}asolicitud_documentos/validar_biblioteca.php`,
      { params: { CueCod: cueCod } }
    );

    if (data.status === "OK") {
      return {
        ok: true,
        identidad: data.identidad,
        tienePendientes: data.tienePendientes,
        libros: data.libros,
      };
    } else {
      return { ok: false, message: data.message };
    }
  } catch (error) {
    console.error("Error al validar Biblioteca:", error);
    return { ok: false, message: error.message };
  }
}

export const notificarAlumno = async (docCod, usrUsr) => {
  try {
    // Usamos FormData para compatibilidad con PHP
    const body = new FormData();
    body.append("DocCod", docCod);
    body.append("UsrUsr", usrUsr);

    const response = await axios.post(
      `${API_BASE}asolicitud_documentos/notificarAlumno.php`,
      body,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error al notificar alumno:", error);
    return { success: false, message: error.message };
  }
};

export const verificarNotificacion = async (docCod) => {
  try {
    const response = await axios.get(
      `${API_BASE}asolicitud_documentos/verificarNotificacion.php`,
      { params: { DocCod: docCod } }
    );
    return response.data;
  } catch (error) {
    console.error("⚠️ Error al verificar notificación:", error);
    return { notificado: false };
  }
};

export const obtenerDocumentosCampusDeEntrega = async (campus) => {
  try {
   const response = await axios.get(
  `${API_BASE}asolicitud_documentos/documentosCampusDeEntrega.php`,
  { params: { CampusDeEntrega: campus } }
);
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener documentos de campus de entrega:", error);
    return [];
  }
};

export async function crearFacturaSapServiciosAcademicos(docCod) {
  
  const { data } = await axios.post(
    `${API_BASE_SAP}MandarFacturasSapServiciosAcademicos/${docCod}`
  );

  return data;
}
