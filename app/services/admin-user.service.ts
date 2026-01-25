import { api } from "./api";

export interface RegisterAdminUserData {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  isNotLocked: boolean;
  isChangePassword: boolean;
  profileImage?: File;
  companyId: string;
}

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profileImageUrl: string;
  isActive: boolean;
  isNotLocked: boolean;
  joinDate: string;
  company: {
    id: number;
    companyName: string;
    nif: string;
  };
}

/**
 * Registrar novo usuário da empresa (apenas ADMIN)
 */
export async function registerAdminUser(data: RegisterAdminUserData): Promise<AdminUserResponse> {
  const formData = new FormData();
  
  formData.append("fullName", data.fullName);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("role", data.role);
  formData.append("isActive", data.isActive.toString());
  formData.append("isNotLocked", data.isNotLocked.toString());
  formData.append("isChangePassword", data.isChangePassword.toString());
  formData.append("companyId", data.companyId);
  
  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }
  
  const response = await api.post("/api/useradmin/registerAdmin", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}
