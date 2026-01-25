"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { registerAdminUser } from "@/app/services/admin-user.service";
import { getUserById, updateUser } from "@/app/services/user.service";
import { isAdmin } from "@/app/services/auth.service";

type Role = "ADMIN" | "USER";

export default function RegisterCompanyUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id"); // Se tiver ID, é edição
  const isEditMode = !!userId;

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dados do usuário logado
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Campos do formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isNotLocked, setIsNotLocked] = useState(true);
  const [isChangePassword, setIsChangePassword] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>("/jose.png");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // Validações
  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Full name is required.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email))
      e.email = "Please enter a valid email address.";

    // ✅ NOVO - Password é opcional no modo de edição
    if (!isEditMode) {
      if (!password) e.password = "Password is required.";
      else if (password.length < 6)
        e.password = "Password must be at least 6 characters.";

      if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
      else if (confirmPassword !== password)
        e.confirmPassword = "Passwords do not match.";
    } else {
      // No modo de edição, só valida se password foi preenchido
      if (password && password.length < 6)
        e.password = "Password must be at least 6 characters.";

      if (password && !confirmPassword)
        e.confirmPassword = "Please confirm your password.";
      else if (password && confirmPassword !== password)
        e.confirmPassword = "Passwords do not match.";
    }

    return e;
  }, [fullName, email, password, confirmPassword, emailRegex, isEditMode]);

  const isValid = Object.keys(errors).length === 0 && (isEditMode || agreeTerms);

  // Verificar se usuário é ADMIN
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setUserIsAdmin(user.role === "ADMIN");
        
        if (user.role !== "ADMIN") {
          console.log("⚠️ Acesso negado: usuário não é ADMIN");
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        router.push("/");
      }
    } else {
      console.log("⚠️ Usuário não encontrado no localStorage");
      router.push("/");
    }
  }, [router]);

  // ✅ NOVO - Carregar dados do usuário se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && userId) {
      loadUserData(Number(userId));
    }
  }, [isEditMode, userId]);

  async function loadUserData(id: number) {
    try {
      setLoadingUser(true);
      const userData = await getUserById(id);
      
      console.log("📝 Carregando usuário para edição:", userData);
      
      setFullName(userData.fullName);
      setEmail(userData.email);
      setRole(userData.role as Role);
      
      const userDataAny = userData as any;
      setIsActive(Boolean(userDataAny.active ?? userData.isActive));
      setIsNotLocked(Boolean(userDataAny.notLocked ?? userData.isNotLocked));
      
      setAvatarSrc(userData.profileImageUrl || "/jose.png");
      setAgreeTerms(true); // Já aceito quando foi criado
      
    } catch (err: any) {
      console.error("Erro ao carregar usuário:", err);
      setError("Failed to load user data. Please try again.");
      
      // Redirecionar de volta após 2 segundos
      setTimeout(() => {
        router.push("/users/search");
      }, 2000);
    } finally {
      setLoadingUser(false);
    }
  }

  // Submit do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Marcar todos os campos como touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    try {
      setLoading(true);

      if (isEditMode && userId) {
        // ✅ MODO EDIÇÃO
        await updateUser(Number(userId), {
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          password: password || undefined,
          isActive,
          isNotLocked,
          isChangePassword: !!password,
          profileImage: profileImage || undefined,
        });

        setSuccessMsg(`User "${fullName}" updated successfully!`);
      } else {
        // ✅ MODO CRIAÇÃO
        if (!currentUser?.company?.id) {
          setError("Company information not found. Please contact support.");
          return;
        }

        await registerAdminUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          isActive,
          isNotLocked,
          isChangePassword,
          profileImage: profileImage || undefined,
          companyId: currentUser.company.id.toString(),
        });

        setSuccessMsg(`User "${fullName}" created successfully!`);
      }
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/users/search");
      }, 2000);
      
    } catch (err: any) {
      console.error("Registration/Update error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        `Failed to ${isEditMode ? "update" : "create"} user. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof typeof touched) =>
    `form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`;

  const canClear = (value: string) => !!value && !loading;

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

  if (!userIsAdmin) {
    return null;
  }

  if (loadingUser) {
    return (
      <ProtectedRoute>
        <>
          <Navbar />
          <div className="container py-5">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading user data...</span>
              </div>
              <p className="mt-3 text-muted">Loading user data...</p>
            </div>
          </div>
        </>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: "#0d6efd",
                  }}
                >
                  <i 
                    className={`bi ${isEditMode ? 'bi-pencil-fill' : 'bi-person-plus-fill'} text-white`} 
                    style={{ fontSize: 28 }}
                  ></i>
                </div>
                <h1 className="mb-2">
                  {isEditMode ? "Edit User" : "Register Company User"}
                </h1>
                <p className="text-muted">
                  {isEditMode ? "Update user information" : "Create a new user account for"}{" "}
                  {!isEditMode && <strong>{currentUser?.company?.companyName || "your company"}</strong>}
                </p>
              </div>

              {/* Mensagens de sucesso/erro */}
              {successMsg && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{successMsg}</div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* Card do formulário */}
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Avatar Upload */}
                    <div className="text-center mb-4">
                      <label
                        htmlFor="avatar-upload"
                        style={{
                          display: "inline-block",
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        title="Click to upload photo"
                      >
                        <img
                          src={avatarSrc}
                          alt="User photo"
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "3px solid #0d6efd",
                            opacity: loading ? 0.6 : 1,
                          }}
                        />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
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
                      <div className="text-muted mt-2" style={{ fontSize: 14 }}>
                        📷 Click to upload photo
                      </div>
                      {profileImage && (
                        <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                          {profileImage.name}
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="mb-3">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          className={inputClass("fullName")}
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, fullName: true }))
                          }
                          placeholder="e.g. John Doe"
                          disabled={loading}
                        />
                        {clearBtn(
                          () => setFullName(""),
                          !canClear(fullName),
                          "Clear full name"
                        )}
                        {touched.fullName && errors.fullName && (
                          <div className="invalid-feedback d-block">
                            {errors.fullName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          className={inputClass("email")}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, email: true }))
                          }
                          placeholder="name@example.com"
                          disabled={loading}
                        />
                        {clearBtn(
                          () => setEmail(""),
                          !canClear(email),
                          "Clear email"
                        )}
                        {touched.email && errors.email && (
                          <div className="invalid-feedback d-block">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role */}
                    <div className="mb-3">
                      <label className="form-label">
                        Role <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-shield-check"></i>
                        </span>
                        <select
                          className="form-select"
                          value={role}
                          onChange={(e) => setRole(e.target.value as Role)}
                          disabled={loading}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                        </select>
                      </div>
                      <div className="form-text">
                        {role === "ADMIN"
                          ? "Admin users can manage company users and products"
                          : "Regular users can only view and purchase products"}
                      </div>
                    </div>

                    {/* Company (readonly) - só mostra se NÃO estiver editando */}
                    {!isEditMode && (
                      <div className="mb-3">
                        <label className="form-label">Company</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-building"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            value={currentUser?.company?.companyName || ""}
                            disabled
                            readOnly
                          />
                        </div>
                        <div className="form-text">
                          NIF: {currentUser?.company?.nif || "N/A"}
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label">
                        {isEditMode ? "New Password" : "Password"}{" "}
                        {isEditMode ? (
                          <span className="text-muted">(optional)</span>
                        ) : (
                          <span className="text-danger">*</span>
                        )}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          className={inputClass("password")}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, password: true }))
                          }
                          placeholder={isEditMode ? "Leave blank to keep current" : "••••••"}
                          disabled={loading}
                        />
                        {clearBtn(
                          () => setPassword(""),
                          !canClear(password),
                          "Clear password"
                        )}
                        {touched.password && errors.password && (
                          <div className="invalid-feedback d-block">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      <div className="form-text">
                        {password.length}/6 characters minimum
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label className="form-label">
                        Confirm Password{" "}
                        {!isEditMode && <span className="text-danger">*</span>}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          className={inputClass("confirmPassword")}
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, confirmPassword: true }))
                          }
                          placeholder="••••••"
                          disabled={loading}
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

                    {/* Account Settings */}
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Account Settings</h6>
                        
                        <div className="form-check form-switch mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor="isActive">
                            Active Account
                          </label>
                        </div>

                        <div className="form-check form-switch mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isNotLocked"
                            checked={isNotLocked}
                            onChange={(e) => setIsNotLocked(e.target.checked)}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor="isNotLocked">
                            Account Not Locked
                          </label>
                        </div>

                        {isEditMode && password && (
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isChangePassword"
                              checked={isChangePassword}
                              onChange={(e) => setIsChangePassword(e.target.checked)}
                              disabled={loading}
                            />
                            <label className="form-check-label" htmlFor="isChangePassword">
                              Require Password Change on Next Login
                            </label>
                          </div>
                        )}

                        {!isEditMode && (
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isChangePassword"
                              checked={isChangePassword}
                              onChange={(e) => setIsChangePassword(e.target.checked)}
                              disabled={loading}
                            />
                            <label className="form-check-label" htmlFor="isChangePassword">
                              Require Password Change on First Login
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms - só mostra no modo de criação */}
                    {!isEditMode && (
                      <div className="form-check mb-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="agreeTerms">
                          I confirm that this user agrees to the{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer">
                            Terms and Conditions
                          </a>
                        </label>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={loading || !isValid}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {isEditMode ? "Updating..." : "Creating User..."}
                        </>
                      ) : (
                        <>
                          <i className={`bi ${isEditMode ? 'bi-check-lg' : 'bi-person-plus'} me-2`}></i>
                          {isEditMode ? "Update User" : "Create User Account"}
                        </>
                      )}
                    </button>

                    {/* Back Button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => router.push("/users/search")}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Users List
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}
