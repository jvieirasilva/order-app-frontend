import { api } from "./api";

export interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  role: string;
  isActive: boolean | number;      // ✅ Aceitar boolean OU number
  isNotLocked: boolean | number;   // ✅ Aceitar boolean OU number
  isChangePassword: boolean;
  joinDate: string;
  lastLoginDate?: string;
  lastLoginDateDisplay?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchUsersParams {
  name?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}
export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  isNotLocked?: boolean;
  isChangePassword?: boolean;
  profileImage?: File;
}
export async function searchUsers(params: SearchUsersParams = {}): Promise<PageResponse<UserDTO>> {
  const {
    name = "",
    page = 0,
    size = 10,
    sortBy = "fullName",
    direction = "ASC",
  } = params;

  const response = await api.get("/api/auth/users/search", {
    params: {
      name,
      page,
      size,
      sortBy,
      direction,
    },
  });

  return response.data;
}

export async function getUserById(id: number): Promise<UserDTO> {
  const response = await api.get(`/api/auth/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserDTO> {
  const formData = new FormData();
  
  if (payload.fullName) formData.append("fullName", payload.fullName);
  if (payload.email) formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.role) formData.append("role", payload.role);
  if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
  if (payload.isNotLocked !== undefined) formData.append("isNotLocked", String(payload.isNotLocked));
  if (payload.isChangePassword !== undefined) formData.append("isChangePassword", String(payload.isChangePassword));
  if (payload.profileImage) formData.append("profileImage", payload.profileImage);

  const response = await api.put(`/api/auth/users/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/auth/users/${id}`);
}


