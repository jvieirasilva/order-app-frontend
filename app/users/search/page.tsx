"use client";

import { searchUsers, deleteUser, getUserById, updateUser, UserDTO, PageResponse } from "@/app/services/user.service";
import { isAdmin } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type Role = "ADMIN" | "USER";

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

  // ✅ VERIFICAR SE É ADMIN
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // ✅ ESTADO DO MODAL DE EDIÇÃO
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserDTO | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // ✅ CAMPOS DO FORMULÁRIO DE EDIÇÃO
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsNotLocked, setEditIsNotLocked] = useState(true);
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [editAvatarSrc, setEditAvatarSrc] = useState<string>("/jose.png");

  const [editTouched, setEditTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const editErrors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!editFullName.trim()) e.fullName = "Full name is required.";

    if (!editEmail.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(editEmail))
      e.email = "Please enter a valid email address.";

    // Password é OPCIONAL na edição
    if (editPassword && editPassword.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (editPassword && !editConfirmPassword)
      e.confirmPassword = "Please confirm your password.";
    else if (editPassword && editConfirmPassword !== editPassword)
      e.confirmPassword = "Passwords do not match.";

    return e;
  }, [editFullName, editEmail, editPassword, editConfirmPassword, emailRegex]);

  const isEditValid = Object.keys(editErrors).length === 0;

  // ✅ VERIFICAR SE É ADMIN AO CARREGAR
  useEffect(() => {
    setUserIsAdmin(isAdmin());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearchTerm, currentPage, pageSize, sortBy, direction]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await searchUsers({ name: debouncedSearchTerm, page: currentPage, size: pageSize, sortBy, direction });
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  // ✅ ABRIR MODAL DE EDIÇÃO
  async function handleEdit(user: UserDTO) {
    setShowEditModal(true);
    setUserToEdit(user);
    setLoadingUser(true);
    setEditTouched({ fullName: false, email: false, password: false, confirmPassword: false });

    try {
      const userData = await getUserById(user.id);
      
      console.log("User data from backend:", userData);
      
      setEditFullName(userData.fullName);
      setEditEmail(userData.email);
      setEditRole(userData.role as Role);
      
      const userDataAny = userData as any;
      setEditIsActive(Boolean(userDataAny.active ?? userData.isActive));
      setEditIsNotLocked(Boolean(userDataAny.notLocked ?? userData.isNotLocked));
      
      setEditAvatarSrc(userData.profileImageUrl || "/jose.png");
      setEditPassword("");
      setEditConfirmPassword("");
      setEditProfileImage(null);
    } catch (err: any) {
      setError("Failed to load user data");
      setShowEditModal(false);
    } finally {
      setLoadingUser(false);
    }
  }

  // ✅ SALVAR EDIÇÃO
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setEditTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!isEditValid || !userToEdit) return;

    try {
      setSavingUser(true);

      await updateUser(userToEdit.id, {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        role: editRole,
        password: editPassword || undefined,
        isActive: editIsActive,
        isNotLocked: editIsNotLocked,
        isChangePassword: !!editPassword,
        profileImage: editProfileImage || undefined,
      });

      setSuccessMsg(`User "${editFullName}" updated successfully!`);
      setShowEditModal(false);
      loadUsers();
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update user");
    } finally {
      setSavingUser(false);
    }
  }

  // ✅ FECHAR MODAL DE EDIÇÃO
  function handleCloseEditModal() {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditFullName("");
    setEditEmail("");
    setEditRole("USER");
    setEditPassword("");
    setEditConfirmPassword("");
    setEditProfileImage(null);
    setEditAvatarSrc("/jose.png");
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

  const inputClass = (field: keyof typeof editTouched) =>
    `form-control ${editTouched[field] && editErrors[field] ? "is-invalid" : ""}`;

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
            {/* ✅ Botão "New User" só para ADMIN */}
            {userIsAdmin && (
              <button className="btn btn-primary" onClick={() => router.push('/users/register')}>
                + New User
              </button>
            )}
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
                        {/* ✅ Coluna Actions só para ADMIN */}
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

                            <td>{new Date(user.joinDate).toLocaleDateString("en-US")}</td>
                            
                            {/* ✅ Botões Edit e Delete só para ADMIN */}
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

          {/* ✅ MODAL DE EDIÇÃO */}
          {showEditModal && userToEdit && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit User</h5>
                    <button type="button" className="btn-close" onClick={handleCloseEditModal} disabled={savingUser}></button>
                  </div>
                  
                  {loadingUser ? (
                    <div className="modal-body text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveEdit} noValidate>
                      <div className="modal-body">
                        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                          <div>
                            <h6 className="mb-1">User details</h6>
                            <div className="text-muted" style={{ fontSize: 14 }}>Update user information below</div>
                          </div>
                          <div className="text-end">
                            <label style={{ display: "inline-block", cursor: savingUser ? "not-allowed" : "pointer" }} title="Click to change image">
                              <img src={editAvatarSrc} alt="User photo" style={{ width: 90, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)", opacity: savingUser ? 0.7 : 1 }} />
                              <input type="file" accept="image/*" disabled={savingUser} style={{ display: "none" }} onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setEditProfileImage(file);
                                if (file) {
                                  setEditAvatarSrc(URL.createObjectURL(file));
                                } else {
                                  setEditAvatarSrc(userToEdit.profileImageUrl || "/jose.png");
                                }
                              }} />
                            </label>
                            {editProfileImage && <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{editProfileImage.name}</div>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Full name</label>
                          <div className="input-group">
                            <input className={inputClass("fullName")} value={editFullName} onChange={(e) => setEditFullName(e.target.value)} onBlur={() => setEditTouched((t) => ({ ...t, fullName: true }))} placeholder="e.g. John Doe" />
                            {clearBtn(() => setEditFullName(""), !canClear(editFullName), "Clear")}
                            {editTouched.fullName && editErrors.fullName && <div className="invalid-feedback d-block">{editErrors.fullName}</div>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <div className="input-group">
                            <input className={inputClass("email")} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} onBlur={() => setEditTouched((t) => ({ ...t, email: true }))} placeholder="name@example.com" />
                            {clearBtn(() => setEditEmail(""), !canClear(editEmail), "Clear")}
                            {editTouched.email && editErrors.email && <div className="invalid-feedback d-block">{editErrors.email}</div>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Role</label>
                          <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value as Role)} disabled={savingUser}>
                            <option value="ADMIN">ADMIN</option>
                            <option value="USER">USER</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="editIsActive" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} disabled={savingUser} />
                            <label className="form-check-label" htmlFor="editIsActive">Active</label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="editIsNotLocked" checked={editIsNotLocked} onChange={(e) => setEditIsNotLocked(e.target.checked)} disabled={savingUser} />
                            <label className="form-check-label" htmlFor="editIsNotLocked">Not Locked</label>
                          </div>
                        </div>

                        <hr />

                        <div className="mb-3">
                          <label className="form-label">New Password <span className="text-muted">(optional)</span></label>
                          <div className="input-group">
                            <input className={inputClass("password")} type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} onBlur={() => setEditTouched((t) => ({ ...t, password: true }))} placeholder="Leave blank to keep current" />
                            {clearBtn(() => setEditPassword(""), !canClear(editPassword), "Clear")}
                            {editTouched.password && editErrors.password && <div className="invalid-feedback d-block">{editErrors.password}</div>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Confirm Password</label>
                          <div className="input-group">
                            <input className={inputClass("confirmPassword")} type="password" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} onBlur={() => setEditTouched((t) => ({ ...t, confirmPassword: true }))} placeholder="••••••" />
                            {clearBtn(() => setEditConfirmPassword(""), !canClear(editConfirmPassword), "Clear")}
                            {editTouched.confirmPassword && editErrors.confirmPassword && <div className="invalid-feedback d-block">{editErrors.confirmPassword}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal} disabled={savingUser}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={savingUser}>{savingUser ? "Saving..." : "Save Changes"}</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
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
