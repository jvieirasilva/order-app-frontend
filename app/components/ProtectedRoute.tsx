"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // ✅ DEBUG - Log para ver o que está acontecendo
    console.log("🔍 ProtectedRoute: Verificando autenticação...");
    
    // ✅ Garantir que estamos no cliente
    if (typeof window === "undefined") {
      console.log("❌ ProtectedRoute: Ainda no servidor (SSR)");
      return;
    }

    // ✅ Verificar token
    const token = localStorage.getItem("accessToken");
    console.log("🔑 Token encontrado:", token ? "SIM ✅" : "NÃO ❌");
    
    if (!token) {
      console.log("🚫 Não autenticado - Redirecionando para /login");
      router.push("/login");
    } else {
      console.log("✅ Autenticado - Liberando acesso");
      setIsAuth(true);
      setIsChecking(false);
    }
  }, [router]);

  // ⏳ Mostra loading enquanto verifica
  if (isChecking) {
    console.log("⏳ Mostrando loading...");
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ❌ Não autenticado
  if (!isAuth) {
    console.log("❌ Não renderizando conteúdo (não autenticado)");
    return null;
  }

  // ✅ Renderiza conteúdo
  console.log("✅ Renderizando conteúdo protegido");
  return <>{children}</>;
}