"use client";

import { useMemo, useState } from "react";
import { registerUser } from "@/app/services/auth.service";

type Role = "ADMIN" | "USER";

const DEFAULT_AVATAR = "/jose.png"; // ou "/default-avatar.png"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>("/jose.png");

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

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Full name is required.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email))
      e.email = "Please enter a valid email address.";

    if (!role) e.role = "Role is required.";

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

      setSuccessMsg("User registered successfully!");
      setFullName("");
      setEmail("");
      setRole("ADMIN");
      setPassword("");
      setConfirmPassword("");
      setProfileImage(null);
      setAvatarSrc("/jose.png");
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
        "Failed to edit user.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  const selectClass = (field: keyof typeof touched) =>
    `form-select ${touched[field] && errors[field] ? "is-invalid" : ""}`;

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
      <h1 className="mb-4 text-center">Edit user</h1>

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

          <div className="text-end">
            <label
              style={{
                display: "inline-block",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Click to select an image"
            >
              <img
                src={avatarSrc}
                alt="User photo"
                style={{
                  width: 90,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  opacity: loading ? 0.7 : 1,
                }}
              />

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
                  } else {
                    setAvatarSrc("/jose.png");
                  }
                }}
              />
            </label>

            {profileImage && (
              <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                {profileImage.name}
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

        {/* Role */}
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            className={selectClass("role")}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            onBlur={() => setTouched((t) => ({ ...t, role: true }))}
            disabled={loading}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
          {touched.role && errors.role && (
            <div className="invalid-feedback d-block">{errors.role}</div>
          )}
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