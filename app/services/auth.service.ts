import { api } from "./api";

export type Role = "ADMIN" | "USER";


export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    profileImageUrl?: string;
    role: string;
    isActive: boolean;
    isNotLocked: boolean;
    joinDate: string;
    lastLoginDate?: string;
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  isNotLocked: boolean;
  isChangePassword: boolean;
  profileImage?: File;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  isNotLocked: boolean;
  isChangePassword: boolean;
  profileImage?: File;
};

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post("/api/auth/authenticate", credentials);
  return response.data;
}



export async function registerUser(payload: RegisterPayload) {
  console.log("Register payload:", payload);
  
  const formData = new FormData();
  
  formData.append("fullName", payload.fullName);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  formData.append("isActive", String(payload.isActive));
  formData.append("isNotLocked", String(payload.isNotLocked));
  formData.append("isChangePassword", String(payload.isChangePassword));
  
  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }
  debugger
  const response = await api.post("/api/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  console.log("Register response:", response.data);
  debugger
  return response.data;
}


// ✅ CORRIGIDO - LOGOUT
export function logout() {
  if (typeof window === "undefined") return; // ✅ Verificar se está no navegador
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// ✅ CORRIGIDO - GET CURRENT USER
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  
  // ✅ Validar se é uma string válida antes de parsear
  if (!userStr || userStr === "undefined" || userStr === "null") {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("❌ Error parsing user data:", error);
    // Limpar dados corrompidos
    localStorage.removeItem("user");
    return null;
  }
}

// ✅ CORRIGIDO - CHECK IF AUTHENTICATED
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false; // ✅ Verificar se está no navegador
  return !!localStorage.getItem("accessToken");
}

// ✅ CHECK IF USER IS ADMIN
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  
  const user = getCurrentUser();
  return user?.role === "ADMIN";
}

// FORGOT PASSWORD
/**
 * Solicita reset de senha
 */
export async function forgotPassword(email: string) {
  const response = await api.post("/api/auth/forgot-password", null, {
    params: { email }
  });
  return response.data;
}

