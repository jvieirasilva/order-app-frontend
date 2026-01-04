"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";



export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setStatus("error");
      setMessage("Reset token not found in URL");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters long";

    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== password)
      e.confirmPassword = "Passwords do not match";

    return e;
  }, [password, confirmPassword]);

  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setTouched({ password: true, confirmPassword: true });
    
    if (!isValid || !token) return;

    try {
      setLoading(true);
      setStatus("idle");
      setMessage("");

      const response = await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setStatus("success");
      setMessage(response.data.message || "Password reset successfully!");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
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
            <div className="card shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <div className="card-body p-5">
                
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <i className="bi bi-key" style={{ fontSize: "2.5rem", color: "white" }}></i>
                  </div>
                  <h2 className="mb-2">Reset Password</h2>
                  <p className="text-muted">Enter your new password below</p>
                </div>

                {status === "success" && (
                  <div className="alert alert-success mb-4" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {message}
                    <br />
                    <small>Redirecting to login...</small>
                  </div>
                )}

                {status === "error" && message && token && (
                  <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {message}
                  </div>
                )}

                {status !== "success" && token && (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          className={inputClass("password")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                          placeholder="Enter new password"
                          disabled={loading}
                        />
                      </div>
                      {touched.password && errors.password && (
                        <div className="text-danger small mt-1">{errors.password}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type="password"
                          className={inputClass("confirmPassword")}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                          placeholder="Confirm new password"
                          disabled={loading}
                        />
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading || !isValid}
                      style={{ padding: "12px" }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Reset Password
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="btn btn-link text-decoration-none"
                        style={{ color: "#667eea" }}
                      >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}

                {!token && status === "error" && (
                  <div className="text-center">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => router.push("/forgot-password")}
                    >
                      Request New Link
                    </button>
                  </div>
                )}

              </div>
            </div>

            <div className="text-center mt-3">
              <p className="text-white small mb-0">
                © 2025 Order App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}