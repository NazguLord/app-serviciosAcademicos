import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "./AppContext";

export default function ProtectedRoute({ element, roles = [], campus = [] }) {
  const { userData, sessionValid, loading } = useContext(AppContext);

  // mientras valida
  if (loading || sessionValid === null) return null; // pon tu spinner si quieres

  // sin sesión -> ir al login
  if (sessionValid === false) {
    const login = import.meta.env.VITE_RUTA_LOGIN || "/";
    const returnTo = encodeURIComponent(window.location.href);
    window.location.href = `${login}?return=${returnTo}`;
    return null;
  }

  // permisos (ajusta a tu shape exacto)
  const role = String(userData?.idRol ?? userData?.UsrRol ?? "");
  const cam  = String(userData?.idCampus ?? userData?.SdeDef ?? "");

  const roleOK = roles.length === 0 || roles.includes(role);
  const camOK  = campus.length === 0 || campus.includes(cam);

  return roleOK && camOK ? element : <Navigate to="/" replace />;
}
