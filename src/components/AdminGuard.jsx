import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAdmin, clearAdmin } from "@/lib/adminAuth";
import { adminMe } from "@/lib/adminApi";

// Permite o acesso apenas a quem tem uma sessão de administrador válida —
// login por e-mail e senha, confirmado no servidor pelo adminApi. Sem sessão,
// envia para a tela de acesso do painel.
export default function AdminGuard({ children }) {
  const [state, setState] = useState("checking");

  useEffect(() => {
    const session = getAdmin();
    if (!session?.token) {
      setState("denied");
      return;
    }
    adminMe()
      .then(() => setState("allowed"))
      .catch(() => {
        clearAdmin();
        setState("denied");
      });
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "allowed") return children;
  return <Navigate to="/admin-login" replace />;
}