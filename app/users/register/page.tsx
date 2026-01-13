"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/services/auth.service";
import PublicNavbar from "@/app/components/PublicNavbar";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>("/picture.png");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    else if (formData.fullName.length < 3) e.fullName = "Name must be at least 3 characters";

    if (!formData.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(formData.email)) e.email = "Invalid email address";

    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) 
      e.confirmPassword = "Passwords do not match";

    return e;
  }, [formData, emailRegex]);

  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    try {
      setLoading(true);
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "USER", // Usuário padrão para registro público
        isActive: true,
        isNotLocked: true,
        isChangePassword: false, // Não forçar mudança de senha
        profileImage: profileImage || undefined, // Foto de perfil (opcional)
      });

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  return (
    <>
      {/* Public Navbar */}
      <PublicNavbar />

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  {/* Logo/Brand */}
                  <div className="text-center mb-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="bi bi-person-plus" style={{ fontSize: "2.5rem" }}></i>
                    </div>
                    <h3 className="fw-bold">Create Account</h3>
                    <p className="text-muted">Join Order App today</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Registration Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Profile Photo */}
                    <div className="mb-4 text-center">
                      <label
                        style={{
                          display: "inline-block",
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        title="Click to upload profile photo"
                      >
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "4px solid #0d6efd",
                            opacity: loading ? 0.7 : 1,
                            transition: "all 0.3s ease",
                          }}
                          className="shadow-sm"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          disabled={loading}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setProfileImage(file);
                            if (file) {
                              setAvatarSrc(URL.createObjectURL(file));
                            } else {
                              setAvatarSrc("/jose.png");
                            }
                          }}
                        />
                      </label>
                      <div className="mt-2 text-muted small">
                        <i className="bi bi-camera me-1"></i>
                        Click to upload photo
                      </div>
                      {profileImage && (
                        <div className="text-muted small mt-1">
                          <i className="bi bi-check-circle-fill text-success me-1"></i>
                          {profileImage.name}
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className={inputClass("fullName")}
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                          disabled={loading}
                          autoComplete="name"
                        />
                        {touched.fullName && errors.fullName && (
                          <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                      </div>
                    </div>

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
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                          disabled={loading}
                          autoComplete="new-password"
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

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={inputClass("confirmPassword")}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
                          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                          disabled={loading}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          <i className={`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                        </button>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        )}
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="form-check mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        required
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="terms">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary text-decoration-none">
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Account...
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </button>
                  </form>

                  {/* Sign In Link */}
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary fw-semibold text-decoration-none">
                        Sign In
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
    </>
  );
}
