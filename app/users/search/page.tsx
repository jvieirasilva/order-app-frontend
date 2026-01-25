"use client";

import { searchUsers, deleteUser, getUserById, updateUser, UserDTO, PageResponse } from "@/app/services/user.service";
import { registerAdminUser } from "@/app/services/admin-user.service";
import { isAdmin } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type Role = "ADMIN" | "USER";
type ModalMode = "CREATE" | "EDIT" | null;

export default function SearchUsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<PageResponse<UserDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("fullName");
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // ✅ Dados do usuário logado
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState<number | null>(null);
  const [filterByCompany, setFilterByCompany] = useState(true);

  // ✅ MODAL UNIFICADO (CREATE/EDIT)
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [userIdToEdit, setUserIdToEdit] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // ✅ CAMPOS DO FORMULÁRIO
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<Role>("ADMIN");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsNotLocked, setFormIsNotLocked] = useState(true);
  const [formIsChangePassword, setFormIsChangePassword] = useState(true);
  const [formProfileImage, setFormProfileImage] = useState<File | null>(null);
  const [formAvatarSrc, setFormAvatarSrc] = useState<string>("/jose.png");
  const [formAgreeTerms, setFormAgreeTerms] = useState(false);

  const [formTouched, setFormTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const formErrors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!formFullName.trim()) e.fullName = "Full name is required.";

    if (!formEmail.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(formEmail))
      e.email = "Please enter a valid email address.";

    // Password validation
    if (modalMode === "CREATE") {
      if (!formPassword) e.password = "Password is required.";
      else if (formPassword.length < 6)
        e.password = "Password must be at least 6 characters.";

      if (!formConfirmPassword) e.confirmPassword = "Please confirm your password.";
      else if (formConfirmPassword !== formPassword)
        e.confirmPassword = "Passwords do not match.";
    } else if (modalMode === "EDIT") {
      if (formPassword && formPassword.length < 6)
        e.password = "Password must be at least 6 characters.";

      if (formPassword && !formConfirmPassword)
        e.confirmPassword = "Please confirm your password.";
      else if (formPassword && formConfirmPassword !== formPassword)
        e.confirmPassword = "Passwords do not match.";
    }

    return e;
  }, [formFullName, formEmail, formPassword, formConfirmPassword, emailRegex, modalMode]);

  const isFormValid = Object.keys(formErrors).length === 0 && (modalMode === "EDIT" || formAgreeTerms);

  useEffect(() => {
    setUserIsAdmin(isAdmin());
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        
        if (user.company?.id) {
          setCurrentUserCompanyId(user.company.id);
          console.log("📍 Company do usuário logado:", user.company.id, user.company.companyName);
        }
        
        if (user.role !== "ADMIN") {
          console.log("⚠️ Acesso negado: usuário não é ADMIN");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        router.push("/");
        return;
      }
    } else {
      console.log("⚠️ Usuário não encontrado no localStorage");
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearchTerm, currentPage, pageSize, sortBy, direction, filterByCompany, currentUserCompanyId]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      
      if (filterByCompany && !currentUserCompanyId) {
        console.log("⏳ Aguardando companyId ser carregado...");
        setLoading(false);
        return;
      }
      
      const companyId = filterByCompany ? (currentUserCompanyId ?? undefined) : undefined;
      
      const data = await searchUsers({ 
        name: debouncedSearchTerm, 
        companyId,
        page: currentPage, 
        size: pageSize, 
        sortBy, 
        direction 
      });
      
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  // ✅ ABRIR MODAL PARA CRIAR
  function handleNewUser() {
    setModalMode("CREATE");
    setUserIdToEdit(null);
    resetForm();
    setFormAgreeTerms(false);
  }

  // ✅ ABRIR MODAL PARA EDITAR
  async function handleEdit(user: UserDTO) {
    setModalMode("EDIT");
    setUserIdToEdit(user.id);
    setLoadingUser(true);
    resetFormTouched();

    try {
      const userData = await getUserById(user.id);
      
      console.log("📝 Carregando usuário para edição:", userData);
      
      setFormFullName(userData.fullName);
      setFormEmail(userData.email);
      setFormRole(userData.role as Role);
      
      const userDataAny = userData as any;
      setFormIsActive(Boolean(userDataAny.active ?? userData.isActive));
      setFormIsNotLocked(Boolean(userDataAny.notLocked ?? userData.isNotLocked));
      
      setFormAvatarSrc(userData.profileImageUrl || "/jose.png");
      setFormPassword("");
      setFormConfirmPassword("");
      setFormProfileImage(null);
      setFormAgreeTerms(true);
    } catch (err: any) {
      setError("Failed to load user data");
      setModalMode(null);
    } finally {
      setLoadingUser(false);
    }
  }

  // ✅ SALVAR (CREATE OU EDIT)
  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setFormTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    try {
      setSavingUser(true);

      if (modalMode === "EDIT" && userIdToEdit) {
        // UPDATE
        await updateUser(userIdToEdit, {
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          role: formRole,
          password: formPassword || undefined,
          isActive: formIsActive,
          isNotLocked: formIsNotLocked,
          isChangePassword: !!formPassword,
          profileImage: formProfileImage || undefined,
        });

        setSuccessMsg(`User "${formFullName}" updated successfully!`);
      } else if (modalMode === "CREATE") {
        // CREATE
        if (!currentUser?.company?.id) {
          setError("Company information not found. Please contact support.");
          return;
        }

        await registerAdminUser({
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
          isActive: formIsActive,
          isNotLocked: formIsNotLocked,
          isChangePassword: formIsChangePassword,
          profileImage: formProfileImage || undefined,
          companyId: currentUser.company.id.toString(),
        });

        setSuccessMsg(`User "${formFullName}" created successfully!`);
      }

      setModalMode(null);
      loadUsers();
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save user");
    } finally {
      setSavingUser(false);
    }
  }

  // ✅ FECHAR MODAL
  function handleCloseModal() {
    setModalMode(null);
    setUserIdToEdit(null);
    resetForm();
  }

  function resetForm() {
    setFormFullName("");
    setFormEmail("");
    setFormRole("ADMIN");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormIsActive(true);
    setFormIsNotLocked(true);
    setFormIsChangePassword(true);
    setFormProfileImage(null);
    setFormAvatarSrc("/jose.png");
    resetFormTouched();
  }

  function resetFormTouched() {
    setFormTouched({ fullName: false, email: false, password: false, confirmPassword: false });
  }

  function handleDeleteClick(user: UserDTO) {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await deleteUser(userToDelete.id);
      setSuccessMsg(`User "${userToDelete.fullName}" deleted successfully!`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Error deleting user");
    } finally {
      setDeleting(false);
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setUserToDelete(null);
  }

  const inputClass = (field: keyof typeof formTouched) =>
    `form-control ${formTouched[field] && formErrors[field] ? "is-invalid" : ""}`;

  const canClear = (value: string) => !!value && !savingUser;

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

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container py-5">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Search Users</h1>
            
            <div className="d-flex gap-2 align-items-center">
              
              
              {userIsAdmin && (
                <button className="btn btn-primary" onClick={handleNewUser}>
                  + New User
                </button>
              )}
            </div>
          </div>

          <div className="card p-4 mb-4 shadow-sm">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Search by name or email</label>
                <input type="text" className="form-control" placeholder="Type to search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Sort by</label>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="fullName">Name</option>
                  <option value="email">Email</option>
                  <option value="joinDate">Registration Date</option>
                  <option value="lastLoginDate">Last Login</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Direction</label>
                <button className="btn btn-outline-secondary w-100" onClick={() => setDirection(direction === "ASC" ? "DESC" : "ASC")}>
                  {direction === "ASC" ? "↑ Ascending" : "↓ Descending"}
                </button>
              </div>
              <div className="col-md-12">
                <label className="form-label">Items per page</label>
                <div className="btn-group" role="group">
                  {[5, 10, 20, 50].map((size) => (
                    <button key={size} type="button" className={`btn ${pageSize === size ? "btn-primary" : "btn-outline-primary"}`} onClick={() => { setPageSize(size); setCurrentPage(0); }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}

          {!loading && users && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">Showing {users.numberOfElements} of {users.totalElements} user(s)</div>
                <div className="text-muted">Page {users.number + 1} of {users.totalPages}</div>
              </div>

              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Registration Date</th>
                        {userIsAdmin && <th className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {users.content.length === 0 ? (
                        <tr><td colSpan={userIsAdmin ? 7 : 6} className="text-center py-5 text-muted">No users found</td></tr>
                      ) : (
                        users.content.map((user) => (
                          <tr key={user.id}>
                            <td><img src={user.profileImageUrl || "/jose.png"} alt={user.fullName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }} /></td>
                            <td><div className="fw-semibold">{user.fullName}</div></td>
                            <td>{user.email}</td>
                            <td><span className="badge bg-secondary">{user.role}</span></td>

                            <td>
                              {(() => {
                                const userAny = user as any;
                                const active = userAny.active ?? user.isActive;
                                const notLocked = userAny.notLocked ?? user.isNotLocked;
                                return (active && notLocked) ? (
                                  <span className="badge bg-success">Active</span>
                                ) : (
                                  <span className="badge bg-danger">Inactive</span>
                                );
                              })()}
                            </td>

                            <td>{new Date(user.joinDate).toLocaleDateString("pt-BR")}</td>
                            
                            {userIsAdmin && (
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(user)} title="Edit user">
                                    <i className="bi bi-pencil"></i> Edit
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(user)} title="Delete user">
                                    <i className="bi bi-trash"></i> Delete
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {users.totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-outline-primary" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>First</button>
                  <button className="btn btn-outline-primary" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
                  <button className="btn btn-primary">Page {currentPage + 1} of {users.totalPages}</button>
                  <button className="btn btn-outline-primary" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === users.totalPages - 1}>Next</button>
                  <button className="btn btn-outline-primary" onClick={() => setCurrentPage(users.totalPages - 1)} disabled={currentPage === users.totalPages - 1}>Last</button>
                </div>
              )}
            </>
          )}

          {/* ✅ MODAL UNIFICADO (CREATE/EDIT) */}
          {modalMode && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }} tabIndex={-1}>
              <div className="modal-dialog modal-lg" style={{ margin: "1.75rem auto", maxWidth: "800px" }}>
                <div className="modal-content" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalMode === "CREATE" ? (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Register Company User
                        </>
                      ) : (
                        <>
                          <i className="bi bi-pencil me-2"></i>
                          Edit User
                        </>
                      )}
                    </h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal} disabled={savingUser}></button>
                  </div>
                  
                  {loadingUser ? (
                    <div className="modal-body text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveUser} noValidate>
                      <div className="modal-body" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                        {/* Avatar Upload */}
                        <div className="text-center mb-4">
                          <label style={{ display: "inline-block", cursor: savingUser ? "not-allowed" : "pointer" }} title="Click to change image">
                            <img src={formAvatarSrc} alt="User photo" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%", border: "3px solid #0d6efd", opacity: savingUser ? 0.6 : 1 }} />
                            <input type="file" accept="image/*" disabled={savingUser} style={{ display: "none" }} onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setFormProfileImage(file);
                              if (file) {
                                setFormAvatarSrc(URL.createObjectURL(file));
                              } else {
                                setFormAvatarSrc("/jose.png");
                              }
                            }} />
                          </label>
                          <div className="text-muted mt-2" style={{ fontSize: 14 }}>
                            📷 Click to upload photo
                          </div>
                          {formProfileImage && <div className="text-muted" style={{ fontSize: 12 }}>{formProfileImage.name}</div>}
                        </div>

                        {/* Full Name */}
                        <div className="mb-3">
                          <label className="form-label">Full Name <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input className={inputClass("fullName")} value={formFullName} onChange={(e) => setFormFullName(e.target.value)} onBlur={() => setFormTouched((t) => ({ ...t, fullName: true }))} placeholder="e.g. John Doe" disabled={savingUser} />
                            {clearBtn(() => setFormFullName(""), !canClear(formFullName), "Clear")}
                            {formTouched.fullName && formErrors.fullName && <div className="invalid-feedback d-block">{formErrors.fullName}</div>}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                          <label className="form-label">Email <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                            <input className={inputClass("email")} type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} onBlur={() => setFormTouched((t) => ({ ...t, email: true }))} placeholder="name@example.com" disabled={savingUser} />
                            {clearBtn(() => setFormEmail(""), !canClear(formEmail), "Clear")}
                            {formTouched.email && formErrors.email && <div className="invalid-feedback d-block">{formErrors.email}</div>}
                          </div>
                        </div>

                        {/* Role */}
                        <div className="mb-3">
                          <label className="form-label">Role <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                            <select className="form-select" value={formRole} onChange={(e) => setFormRole(e.target.value as Role)} disabled={savingUser}>
                              <option value="ADMIN">ADMIN</option>
                              <option value="USER">USER</option>
                            </select>
                          </div>
                          <div className="form-text">
                            {formRole === "ADMIN" ? "Admin users can manage company users and products" : "Regular users can only view and purchase products"}
                          </div>
                        </div>

                        {/* Company (só no modo CREATE) */}
                        {modalMode === "CREATE" && (
                          <div className="mb-3">
                            <label className="form-label">Company</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="bi bi-building"></i></span>
                              <input className="form-control" type="text" value={currentUser?.company?.companyName || ""} disabled readOnly />
                            </div>
                            <div className="form-text">NIF: {currentUser?.company?.nif || "N/A"}</div>
                          </div>
                        )}

                        {/* Password */}
                        <div className="mb-3">
                          <label className="form-label">
                            {modalMode === "EDIT" ? "New Password" : "Password"}{" "}
                            {modalMode === "EDIT" ? <span className="text-muted">(optional)</span> : <span className="text-danger">*</span>}
                          </label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock"></i></span>
                            <input className={inputClass("password")} type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} onBlur={() => setFormTouched((t) => ({ ...t, password: true }))} placeholder={modalMode === "EDIT" ? "Leave blank to keep current" : "••••••"} disabled={savingUser} />
                            {clearBtn(() => setFormPassword(""), !canClear(formPassword), "Clear")}
                            {formTouched.password && formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
                          </div>
                          <div className="form-text">{formPassword.length}/6 characters minimum</div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-3">
                          <label className="form-label">
                            Confirm Password {modalMode === "CREATE" && <span className="text-danger">*</span>}
                          </label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                            <input className={inputClass("confirmPassword")} type="password" value={formConfirmPassword} onChange={(e) => setFormConfirmPassword(e.target.value)} onBlur={() => setFormTouched((t) => ({ ...t, confirmPassword: true }))} placeholder="••••••" disabled={savingUser} />
                            {clearBtn(() => setFormConfirmPassword(""), !canClear(formConfirmPassword), "Clear")}
                            {formTouched.confirmPassword && formErrors.confirmPassword && <div className="invalid-feedback d-block">{formErrors.confirmPassword}</div>}
                          </div>
                        </div>

                        {/* Account Settings */}
                        <div className="card bg-light mb-3">
                          <div className="card-body">
                            <h6 className="card-title mb-3">Account Settings</h6>
                            <div className="form-check form-switch mb-2">
                              <input className="form-check-input" type="checkbox" id="formIsActive" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} disabled={savingUser} />
                              <label className="form-check-label" htmlFor="formIsActive">Active Account</label>
                            </div>
                            <div className="form-check form-switch mb-2">
                              <input className="form-check-input" type="checkbox" id="formIsNotLocked" checked={formIsNotLocked} onChange={(e) => setFormIsNotLocked(e.target.checked)} disabled={savingUser} />
                              <label className="form-check-label" htmlFor="formIsNotLocked">Account Not Locked</label>
                            </div>
                            {(modalMode === "CREATE" || (modalMode === "EDIT" && formPassword)) && (
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="formIsChangePassword" checked={formIsChangePassword} onChange={(e) => setFormIsChangePassword(e.target.checked)} disabled={savingUser} />
                                <label className="form-check-label" htmlFor="formIsChangePassword">
                                  Require Password Change on {modalMode === "CREATE" ? "First" : "Next"} Login
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Terms (só no CREATE) */}
                        {modalMode === "CREATE" && (
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" id="formAgreeTerms" checked={formAgreeTerms} onChange={(e) => setFormAgreeTerms(e.target.checked)} disabled={savingUser} />
                            <label className="form-check-label" htmlFor="formAgreeTerms">
                              I confirm that this user agrees to the{" "}
                              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={savingUser}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={savingUser || !isFormValid}>
                          {savingUser ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              {modalMode === "CREATE" ? "Creating..." : "Updating..."}
                            </>
                          ) : (
                            <>
                              <i className={`bi ${modalMode === "CREATE" ? "bi-person-plus" : "bi-check-lg"} me-2`}></i>
                              {modalMode === "CREATE" ? "Create User" : "Update User"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && userToDelete && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button type="button" className="btn-close" onClick={cancelDelete} disabled={deleting}></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to delete this user?</p>
                    <div className="alert alert-warning">
                      <strong>{userToDelete.fullName}</strong><br /><small>{userToDelete.email}</small>
                    </div>
                    <p className="text-danger"><small>This action cannot be undone.</small></p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={cancelDelete} disabled={deleting}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete User"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );   
}
