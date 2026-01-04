"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const emailError = useMemo(() => {
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email address";
    return null;
  }, [email, emailRegex]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setTouched(true);

    if (emailError) return;

    try {
      setLoading(true);
      
      // ✅ CHAMADA AO BACKEND
      await forgotPassword(email);
      
      setSuccess(true);
      setEmail("");
      setTouched(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

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
                {/* Back Button */}
                <Link href="/login" className="btn btn-link text-decoration-none mb-3 p-0">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to login
                </Link>

                {/* Icon */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-key" style={{ fontSize: "2.5rem" }}></i>
                  </div>
                  <h3 className="fw-bold">Forgot Password?</h3>
                  <p className="text-muted">
                    Enter your email and we'll send you a link to reset your password
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Password reset link sent! Check your email.
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control ${touched && emailError ? "is-invalid" : ""}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                        disabled={loading}
                        autoComplete="email"
                      />
                      {touched && emailError && (
                        <div className="invalid-feedback">{emailError}</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
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