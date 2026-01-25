import { api } from "./api";

export interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profileImageUrl: string;
  isActive: boolean;
  isNotLocked: boolean;
  joinDate: string;
  lastLoginDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SearchUsersParams {
  name?: string;
  companyId?: number;  // ✅ NOVO
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  role: string;
  password?: string;
  isActive: boolean;
  isNotLocked: boolean;
  isChangePassword: boolean;
  profileImage?: File;
}

/**
 * ✅ ATUALIZADO - Busca usuários com suporte a filtro por company
 */
export async function searchUsers(params: SearchUsersParams = {}): Promise<PageResponse<UserDTO>> {
  const { 
    name = "", 
    companyId,  // ✅ NOVO
    page = 0, 
    size = 10, 
    sortBy = "fullName", 
    direction = "ASC" 
  } = params;
  
  const response = await api.get("/api/auth/users/search", {
    params: {
      name,
      companyId,  // ✅ NOVO - será enviado apenas se definido
      page,
      size,
      sortBy,
      direction,
    },
  });
  
  return response.data;
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: number): Promise<UserDTO> {
  const response = await api.get(`/api/auth/users/${id}`);
  return response.data;
}

/**
 * Atualiza usuário existente
 */
export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserDTO> {
  const formData = new FormData();
  
  formData.append("fullName", payload.fullName);
  formData.append("email", payload.email);
  formData.append("role", payload.role);
  formData.append("isActive", String(payload.isActive));
  formData.append("isNotLocked", String(payload.isNotLocked));
  formData.append("isChangePassword", String(payload.isChangePassword));
  
  if (payload.password) {
    formData.append("password", payload.password);
  }
  
  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }
  
  const response = await api.put(`/api/auth/users/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

/**
 * Deleta usuário
 */
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/auth/users/${id}`);
}