import { api } from "./api";

// ✅ Tipos baseados nos DTOs do backend
export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
 
export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  productDescription: string;
  productImageUrl: string | null;
  quantity: number;
  priceAtAddition: number;
  subtotal: number;
  maxStock: number;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  userEmail: string;
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// ✅ Adicionar produto ao carrinho
// POST /api/cart/add
export async function addToCart(request: AddToCartRequest): Promise<CartResponse> {
  const response = await api.post("/api/cart/add", request);
  return response.data;
}

// ✅ Buscar carrinho do usuário logado
// GET /api/cart
export async function getCart(): Promise<CartResponse> {
  const response = await api.get("/api/cart");
  return response.data;
}

// ✅ Atualizar quantidade de item no carrinho
// PUT /api/cart/items/{cartItemId}
export async function updateCartItem(
  cartItemId: number,
  request: UpdateCartItemRequest
): Promise<CartResponse> {
  const response = await api.put(`/api/cart/items/${cartItemId}`, request);
  return response.data;
}

// ✅ Remover item do carrinho
// DELETE /api/cart/items/{cartItemId}
export async function removeCartItem(cartItemId: number): Promise<CartResponse> {
  const response = await api.delete(`/api/cart/items/${cartItemId}`);
  return response.data;
}

// ✅ Limpar carrinho (remover todos os itens)
// DELETE /api/cart/clear
export async function clearCart(): Promise<void> {
  await api.delete("/api/cart/clear");
}
