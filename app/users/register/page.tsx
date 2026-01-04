"use client";

import { useMemo, useState, useEffect } from "react";
import { registerUser } from "@/app/services/auth.service";

type Role = "ADMIN" | "USER";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>("/picture.png");
  const [isMobile, setIsMobile] = useState(false);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    role: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // ✅ DETECTAR SE É MOBILE/TABLET
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      setIsMobile(mobile);
    };

    checkMobile();
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Full name is required.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email))
      e.email = "Please enter a valid email address.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password)
      e.confirmPassword = "Passwords do not match.";

    return e;
  }, [fullName, email, role, password, confirmPassword, emailRegex]);

  const isValid = Object.keys(errors).length === 0;

  function markAllTouched() {
    setTouched({
      fullName: true,
      email: true,
      role: true,
      password: true,
      confirmPassword: true,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    markAllTouched();
    if (!isValid) return;

    try {
      setLoading(true);

      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        isActive: true,
        isNotLocked: true,
        isChangePassword: true,
        profileImage: profileImage ?? undefined,
      });

      setSuccessMsg("User registered successfully! Check your email to confirm your account.");
      setFullName("");
      setEmail("");
      setRole("USER");
      setPassword("");
      setConfirmPassword("");
      setProfileImage(null);
      setAvatarSrc("/picture.png");
      setTouched({
        fullName: false,
        email: false,
        role: false,
        password: false,
        confirmPassword: false,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register user.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  const clearBtn = (onClick: () => void, disabled: boolean, aria: string) => (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      title="Clear"
    >
      ×
    </button>
  );

  const canClear = (value: string) => !!value && !loading;

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <h1 className="mb-4 text-center">Register user</h1>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm" noValidate>
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1">User details</h5>
            <div className="text-muted" style={{ fontSize: 14 }}>
              Fill in the information below to create a new user.
            </div>
          </div>

          {/* ✅ SEÇÃO DA FOTO COM BOTÕES GALLERY E CAMERA */}
          <div className="text-end">
            <label
              style={{
                display: "inline-block",
                position: "relative",
              }}
            >
              {/* SE TEM IMAGEM SELECIONADA */}
              {avatarSrc !== "/picture.png" ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={avatarSrc}
                    alt="User photo"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "3px solid #667eea",
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                  />

                  {/* BOTÃO REMOVER FOTO */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setProfileImage(null);
                      setAvatarSrc("/picture.png");
                    }}
                    disabled={loading}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      background: "#dc3545",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "3px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      cursor: loading ? "not-allowed" : "pointer",
                      padding: 0,
                    }}
                    title="Remove photo"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                /* PLACEHOLDER SVG */
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    border: "3px dashed #dee2e6",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginBottom: 8 }}
                  >
                    <path
                      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6c757d",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    Select your
                    <br />
                    picture
                  </div>
                </div>
              )}
            </label>

            {/* ✅ BOTÕES GALLERY E CAMERA */}
            {avatarSrc === "/picture.png" && (
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {/* BOTÃO GALLERY */}
                <label
                  style={{
                    flex: 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#667eea",
                      color: "white",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: "center",
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.background = "#5568d3";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#667eea";
                    }}
                  >
                    📂 Gallery
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={loading}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setProfileImage(file);
                      if (file) {
                        const localUrl = URL.createObjectURL(file);
                        setAvatarSrc(localUrl);
                      }
                    }}
                  />
                </label>

                {/* ✅ BOTÃO CAMERA - APENAS NO MOBILE */}
                {isMobile && (
                  <label
                    style={{
                      flex: 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#10b981",
                        color: "white",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center",
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.background = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#10b981";
                      }}
                    >
                      📸 Camera
                    </div>
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
                          const localUrl = URL.createObjectURL(file);
                          setAvatarSrc(localUrl);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {/* NOME DO ARQUIVO */}
            {profileImage && (
              <div
                className="text-muted"
                style={{
                  fontSize: 11,
                  marginTop: 8,
                  maxWidth: 120,
                  wordBreak: "break-word",
                }}
              >
                📎 {profileImage.name}
              </div>
            )}
          </div>
        </div>

        {/* Full name */}
        <div className="mb-3">
          <label className="form-label">Full name</label>
          <div className="input-group">
            <input
              className={inputClass("fullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              placeholder="e.g. John Doe"
              autoComplete="name"
            />
            {clearBtn(
              () => setFullName(""),
              !canClear(fullName),
              "Clear full name"
            )}
            {touched.fullName && errors.fullName && (
              <div className="invalid-feedback d-block">{errors.fullName}</div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <div className="input-group">
            <input
              className={inputClass("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="name@example.com"
              autoComplete="email"
            />
            {clearBtn(() => setEmail(""), !canClear(email), "Clear email")}
            {touched.email && errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              className={inputClass("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="••••••"
              autoComplete="new-password"
            />
            {clearBtn(
              () => setPassword(""),
              !canClear(password),
              "Clear password"
            )}
            {touched.password && errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>
        </div>

        {/* Confirm password */}
        <div className="mb-4">
          <label className="form-label">Confirm password</label>
          <div className="input-group">
            <input
              className={inputClass("confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              placeholder="••••••"
              autoComplete="new-password"
            />
            {clearBtn(
              () => setConfirmPassword(""),
              !canClear(confirmPassword),
              "Clear confirm password"
            )}
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}