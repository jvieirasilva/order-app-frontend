"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/app/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(email)) e.email = "Invalid email address";

    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";

    return e;
  }, [email, password, emailRegex]);

  const isValid = Object.keys(errors).length === 0;

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  setTouched({ email: true, password: true });
  if (!isValid) return;

  try {
    setLoading(true);
    console.log("🔐 Fazendo login...");
    
    const response = await login({ email, password });
    console.log("✅ Login bem-sucedido:", response);
    
    // ✅ Validar resposta
    if (!response.accessToken || !response.user) {
      console.error("❌ Resposta incompleta do servidor");
      setError("Invalid server response");
      return;
    }
    
    // ✅ Salvar no localStorage
    console.log("💾 Salvando no localStorage...");
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));
    
    // ✅ Verificar se salvou
    const savedToken = localStorage.getItem("accessToken");
    console.log("🔍 Token salvo?", savedToken ? "SIM ✅" : "NÃO ❌");
    debugger
    if (!savedToken) {
      console.error("❌ Falha ao salvar token no localStorage");
      setError("Failed to save authentication data");
      return;
    }
    
    // ✅ Redirecionar - USAR WINDOW.LOCATION ao invés de router.push
    console.log("🚀 Redirecionando para /users/search...");
    
    // Dar um pequeno delay para garantir que salvou
    setTimeout(() => {
      //window.location.href = "/users/search";
      window.location.href = "/";
    }, 100);
    
  } catch (err: any) {
    console.error("❌ Erro no login:", err);
    const message = err?.response?.data?.message || err?.message || "Invalid credentials";
    setError(message);
  } finally {
    setLoading(false);
  }
}

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
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
          <div className="col-md-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo/Brand */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-shop" style={{ fontSize: "2.5rem" }}></i>
                  </div>
                  <h3 className="fw-bold">Order App</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={inputClass("email")}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        disabled={loading}
                        autoComplete="email"
                      />
                      {touched.email && errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={inputClass("password")}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                      </button>
                      {touched.password && errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-primary text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign in" 
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link href="/users/register" className="text-primary fw-semibold text-decoration-none">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 text-muted">
              <small>© 2025 Order App. All rights reserved.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}