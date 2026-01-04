"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";

// Componente interno que usa useSearchParams
function ConfirmRegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de confirmação não encontrado na URL");
      return;
    }

    confirmEmail(token);
  }, [searchParams]);

  async function confirmEmail(token: string) {
    try {
      const response = await api.get(`/api/auth/confirm-email?token=${token}`);
      
      setStatus("success");
      setMessage(response.data.message || "Email confirmado com sucesso!");
      
      // Redirecionar para login após 5 segundos
      setTimeout(() => {
        router.push("/login");
      }, 5000);
      
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Erro ao confirmar email. Por favor, tente novamente.");
    }
  }

  function handleGoToLogin() {
    router.push("/login");
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <div className="card-body p-5 text-center">
                
                {/* LOADING STATE */}
                {status === "loading" && (
                  <>
                    <div className="mb-4">
                      <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <h3 className="mb-3">Confirmando seu email...</h3>
                    <p className="text-muted">Por favor, aguarde enquanto verificamos suas informações.</p>
                  </>
                )}

                {/* SUCCESS STATE */}
                {status === "success" && (
                  <>
                    {/* Ícone de sucesso */}
                    <div className="mb-4">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: "100px", 
                          height: "100px", 
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                        }}
                      >
                        <i className="bi bi-check-circle" style={{ fontSize: "4rem", color: "white" }}></i>
                      </div>
                    </div>

                    {/* Título */}
                    <h2 className="mb-3" style={{ color: "#10b981", fontWeight: "bold" }}>
                      Email Confirmado! 🎉
                    </h2>

                    {/* Mensagem */}
                    <p className="text-muted mb-4">{message}</p>

                    {/* Info Box */}
                    <div className="alert alert-success mb-4" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Sua conta está ativa!</strong>
                      <br />
                      <small>Você já pode fazer login e começar a usar o Order App.</small>
                    </div>

                    {/* Features */}
                    <div className="text-start mb-4 p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <p className="mb-2 fw-semibold">✓ Gerenciar pedidos e produtos</p>
                      <p className="mb-2 fw-semibold">✓ Acessar relatórios detalhados</p>
                      <p className="mb-2 fw-semibold">✓ Configurar sua conta</p>
                      <p className="mb-0 fw-semibold">✓ E muito mais!</p>
                    </div>

                    {/* Botões */}
                    <button 
                      className="btn btn-primary btn-lg w-100 mb-3"
                      onClick={handleGoToLogin}
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Fazer Login Agora
                    </button>

                    {/* Contador de redirecionamento */}
                    <p className="text-muted small mb-0">
                      <i className="bi bi-clock-history me-1"></i>
                      Você será redirecionado automaticamente em alguns segundos...
                    </p>
                  </>
                )}

                {/* ERROR STATE */}
                {status === "error" && (
                  <>
                    {/* Ícone de erro */}
                    <div className="mb-4">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: "100px", 
                          height: "100px", 
                          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" 
                        }}
                      >
                        <i className="bi bi-x-circle" style={{ fontSize: "4rem", color: "white" }}></i>
                      </div>
                    </div>

                    {/* Título */}
                    <h2 className="mb-3" style={{ color: "#ef4444", fontWeight: "bold" }}>
                      Erro na Confirmação
                    </h2>

                    {/* Mensagem de erro */}
                    <div className="alert alert-danger mb-4" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <strong>Ops!</strong>
                      <br />
                      <small>{message}</small>
                    </div>

                    {/* Possíveis causas */}
                    <div className="text-start mb-4 p-3" style={{ background: "#fff3cd", borderRadius: "10px", border: "1px solid #ffc107" }}>
                      <p className="mb-2 fw-semibold" style={{ color: "#856404" }}>Possíveis causas:</p>
                      <ul className="mb-0" style={{ color: "#856404" }}>
                        <li>Link expirado (válido por 24 horas)</li>
                        <li>Link já foi utilizado</li>
                        <li>Token inválido ou corrompido</li>
                      </ul>
                    </div>

                    {/* Botões */}
                    <button 
                      className="btn btn-primary btn-lg w-100 mb-2"
                      onClick={handleGoToLogin}
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Ir para Login
                    </button>

                    <button 
                      className="btn btn-outline-secondary btn-lg w-100"
                      onClick={() => router.push("/users/register")}
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Registrar Nova Conta
                    </button>
                  </>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted small mb-0">
                    © 2025 Order App. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que exporta envolvido em Suspense
export default function ConfirmRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    }>
      <ConfirmRegisterContent />
    </Suspense>
  );
}