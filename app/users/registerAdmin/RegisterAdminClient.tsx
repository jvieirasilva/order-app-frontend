"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { registerAdminUser } from "@/app/services/admin-user.service";
import { getUserById, updateUser } from "@/app/services/user.service";

type Role = "ADMIN" | "USER";

export default function RegisterAdminClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const isEditMode = !!userId;

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isNotLocked, setIsNotLocked] = useState(true);
  const [isChangePassword, setIsChangePassword] = useState(true);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailRegex = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    []
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email)) e.email = "Invalid email.";

    if (!isEditMode) {
      if (!password) e.password = "Password required.";
      if (password !== confirmPassword)
        e.confirmPassword = "Passwords do not match.";
    }

    return e;
  }, [fullName, email, password, confirmPassword, emailRegex, isEditMode]);

  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);

    if (user.role !== "ADMIN") {
      router.push("/");
    } else {
      setUserIsAdmin(true);
    }
  }, [router]);

  useEffect(() => {
    if (isEditMode && userId) {
      loadUserData(Number(userId));
    }
  }, [isEditMode, userId]);

  async function loadUserData(id: number) {
    try {
      setLoadingUser(true);
      const user = await getUserById(id);
      setFullName(user.fullName);
      setEmail(user.email);
      setRole(user.role as Role);
    } finally {
      setLoadingUser(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    try {
      if (isEditMode && userId) {
        await updateUser(Number(userId), {
          fullName,
          email,
          role,
          password: password || undefined,
          isActive,
          isNotLocked,
          isChangePassword: !!password,
        });
      } else {
        await registerAdminUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        companyId: currentUser.company.id.toString(), // se o tipo for string
        isActive,
        isNotLocked,
        isChangePassword,
        });
      }

      router.push("/users/search");
    } catch {
      setError("Failed to save user.");
    } finally {
      setLoading(false);
    }
  }

  if (!userIsAdmin) return null;

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container py-5">
          <h1>{isEditMode ? "Edit User" : "Register User"}</h1>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-2"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              className="form-control mb-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {!isEditMode && (
              <>
                <input
                  className="form-control mb-2"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <input
                  className="form-control mb-2"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </>
            )}

            <button className="btn btn-primary" disabled={loading}>
              Save
            </button>
          </form>
        </div>
      </>
    </ProtectedRoute>
  );
}
