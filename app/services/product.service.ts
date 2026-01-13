import { api } from "./api";

export interface Product {
  id: number;
  name: string;
  images: string[];
  price: number;
  stockQuantity: number;
  description: string;
  isActive: boolean;
}

export interface PageableResponse {
  content: Product[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchParams {
  term?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Busca produtos com paginação
 */
export async function searchProducts(params: SearchParams = {}): Promise<PageableResponse> {
  const { term = "", page = 0, size = 12, sort = "name" } = params;
  
  const response = await api.get("/api/products/search", {
    params: {
      term,
      page,
      size,
      sort
    }
  });
  
  return response.data;
}

/**
 * Busca produto por ID
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
}

/**
 * Interface para criação de produto
 */
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  productImages: File[];
}

/**
 * Criar novo produto com imagens
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  const formData = new FormData();
  
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('stockQuantity', data.stockQuantity.toString());
  formData.append('isActive', data.isActive.toString());
  
  // Adicionar todas as imagens (máximo 10)
  data.productImages.forEach((file) => {
    formData.append('productImages', file);
  });
  
  const response = await api.post('/api/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

/**
 * Interface para atualização de produto
 */
export interface UpdateProductData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  productImages?: File[]; // Novas imagens para adicionar
}

/**
 * Atualizar produto existente
 */
export async function updateProduct(id: number, data: UpdateProductData): Promise<Product> {
  const formData = new FormData();
  
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('stockQuantity', data.stockQuantity.toString());
  formData.append('isActive', data.isActive.toString());
  
  // Adicionar novas imagens se houver
  if (data.productImages && data.productImages.length > 0) {
    data.productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }
  
  const response = await api.put(`/api/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

/**
 * Deletar produto
 */
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/api/products/${id}`);
}