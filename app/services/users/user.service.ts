import { api } from "../api";

export type Role = "ADMIN" | "USER";

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  isNotLocked: boolean;
  isChangePassword: boolean;
  profileImage?: File; // 👈 Adicionar campo opcional para a imagem
};

export async function registerUser(payload: RegisterPayload) {
  console.log("Register payload:", payload);
  
  // Criar FormData para enviar multipart/form-data
  const formData = new FormData();
  
  // Adicionar todos os campos ao FormData
  formData.append("fullName", payload.fullName);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  formData.append("isActive", String(payload.isActive));
  formData.append("isNotLocked", String(payload.isNotLocked));
  formData.append("isChangePassword", String(payload.isChangePassword));
  
  // Adicionar a imagem se foi fornecida
  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }
  
  debugger;
  
  // Enviar com Content-Type: multipart/form-data
  const response = await api.post("/api/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  console.log("Register response:", response.data);
  return response.data;
}