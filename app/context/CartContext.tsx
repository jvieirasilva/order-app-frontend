"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import * as cartService from "../services/cart.service";
import { CartItemResponse, CartResponse } from "../services/cart.service";

interface CartContextType {
  // Estado
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isCartOpen: boolean;
  
  // Ações
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ CORRIGIDO: Só carregar carrinho se tiver token
  useEffect(() => {
    // Verificar se tem token (usuário logado)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      
      if (token) {
        // Só carregar se estiver logado
        refreshCart();
      } else {
        console.log("⚠️ No token found, skipping cart load");
      }
    }
  }, []);

  // ✅ Buscar carrinho do backend
  const refreshCart = async () => {
    // Verificar se tem token antes de tentar carregar
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        console.log("⚠️ No token, cannot load cart");
        // Limpar carrinho local
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
        return;
      }
    }
    
    try {
      setIsLoading(true);
      const cart = await cartService.getCart();
      updateCartState(cart);
      console.log("✅ Cart loaded successfully");
    } catch (error: any) {
      console.error("Error loading cart:", error);
      
      // Se for erro 401/403 (não autorizado), só limpar o carrinho
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("⚠️ Not authenticated, clearing cart");
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Adicionar item ao carrinho
  const addItem = async (productId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const cart = await cartService.addToCart({ productId, quantity });
      updateCartState(cart);
      
      // ✅ Abrir carrinho automaticamente
      setIsCartOpen(true);
      
      console.log(`✅ Product ${productId} added to cart!`);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      
      // Mostrar mensagem de erro ao usuário
      const errorMessage = error.response?.data?.message || error.message || "Error adding to cart";
      alert(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Atualizar quantidade
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const cart = await cartService.updateCartItem(cartItemId, { quantity });
      updateCartState(cart);
      
      console.log(`✅ Cart item ${cartItemId} updated!`);
    } catch (error: any) {
      console.error("Error updating cart:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Error updating cart";
      alert(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Remover item
  const removeItem = async (cartItemId: number) => {
    try {
      setIsLoading(true);
      const cart = await cartService.removeCartItem(cartItemId);
      updateCartState(cart);
      
      console.log(`✅ Cart item ${cartItemId} removed!`);
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Error removing from cart";
      alert(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Limpar carrinho
  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartService.clearCart();
      
      // Limpar estado local
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      
      console.log("✅ Cart cleared!");
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Error clearing cart";
      alert(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Atualizar estado local com dados do backend
  const updateCartState = (cart: CartResponse) => {
    setItems(cart.items || []);
    setTotalItems(cart.totalItems || 0);
    setTotalPrice(cart.totalPrice || 0);
  };

  // ✅ Abrir/Fechar carrinho
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isLoading,
        isCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Hook para usar o carrinho
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
