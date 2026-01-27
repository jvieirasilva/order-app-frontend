// app/services/company.service.ts
import { api } from "./api";

export interface CompanyRequest {
  companyName: string;
  tradeName?: string;
  nif: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}
 
export interface CompanyResponse {
  id: number;
  companyName: string;
  tradeName?: string;
  nif: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  totalProducts?: number;
  activeProducts?: number;
  totalAdministrators?: number;
}

/**
 * Buscar empresa por ID
 */
export async function getCompanyById(id: number): Promise<CompanyResponse> {
  const response = await api.get(`/api/companies/${id}`);
  return response.data;
}

/**
 * Buscar empresa por ID com estatísticas
 */
export async function getCompanyByIdWithStats(id: number): Promise<CompanyResponse> {
  const response = await api.get(`/api/companies/${id}/stats`);
  return response.data;
}

/**
 * Atualizar empresa
 */
export async function updateCompany(
  id: number,
  data: CompanyRequest
): Promise<CompanyResponse> {
  const response = await api.put(`/api/companies/${id}`, data);
  return response.data;
}

/**
 * Criar nova empresa
 */
export async function createCompany(data: CompanyRequest): Promise<CompanyResponse> {
  const response = await api.post("/api/companies", data);
  return response.data;
}

/**
 * Buscar todas as empresas
 */
export async function getAllCompanies(): Promise<CompanyResponse[]> {
  const response = await api.get("/api/companies");
  return response.data;
}

/**
 * Buscar empresas ativas
 */
export async function getActiveCompanies(): Promise<CompanyResponse[]> {
  const response = await api.get("/api/companies/active");
  return response.data;
}