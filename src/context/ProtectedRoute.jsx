import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "./AppContext";

/**
 * Props nuevas (opcionales):
 * - requireAll: string[]  -> debe tener TODOS estos permisos ('MOD.PRM')
 * - requireAny: string[]  -> debe tener AL MENOS UNO de estos permisos
 * - forbidAny:  string[]  -> NO debe tener ninguno de estos permisos
 *
 * Props existentes (se mantienen):
 * - roles:  string[]      -> ids de rol permitidos
 * - campus: string[]      -> campus permitidos
 * - element: ReactNode    -> componente a renderizar
 */
export default function ProtectedRoute({
  element,
  roles = [],
  campus = [],
  requireAll = [],
  requireAny = [],
  forbidAny = [],
}) {
  const { userData, sessionValid, loading } = useContext(AppContext);

  // ---------- Permisos (sin hooks) ----------
  // Si el AppProvider expone un Set normalizado en userData.permissionsCtx.set, lo usamos.
  const permissions = (userData && userData.permissionsCtx) || null;

  const canPath = (p) => {
    // 1) vía Set('MOD.PRM') normalizado
    const set = permissions?.set;
    if (set instanceof Set) return set.has(p);

    // 2) fallback: objeto crudo que viene de PHP
    const [mod, prm] = String(p).split(".");
    const raw = userData?.permissions?.[mod]?.[prm];
    return !!raw && (raw.PdtEst ?? "ACT") === "ACT";
  };

  const checkPerms = () => {
    if (!requireAll.length && !requireAny.length && !forbidAny.length) return true;
    if (requireAll.length && !requireAll.every(canPath)) return false;
    if (requireAny.length && !requireAny.some(canPath)) return false;
    if (forbidAny.length && forbidAny.some(canPath)) return false;
    return true;
  };

  const permsOK = checkPerms();

  // ---------- Sesión (igual que lo tenías) ----------
  if (loading || sessionValid === null) return null; // aquí puedes poner un Spinner

  if (sessionValid === false) {
    const login = import.meta.env.VITE_RUTA_LOGIN || "/";
    const returnTo = encodeURIComponent(window.location.href);
    window.location.href = `${login}?return=${returnTo}`;
    return null;
  }

  // ---------- Roles/Campus (igual que lo tuyo) ----------
  const role = String(userData?.idRol ?? userData?.UsrRol ?? "");
  const cam  = String(userData?.idCampus ?? userData?.SdeDef ?? "");

  const roleOK = roles.length === 0 || roles.includes(role);
  const camOK  = campus.length === 0 || campus.includes(cam);

  return roleOK && camOK && permsOK ? element : <Navigate to="/" replace />;
}
