"use client";

import type { Produto } from "@/app/page";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem extends Produto {
  quantity: number;
}


interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Produto) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  generateWhatsAppMessage: () => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ➕ Adicionar produto
  const addToCart = (product: Produto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ❌ Remover produto
  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // 🔢 Atualizar quantidade
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  // 🧹 Limpar carrinho
  const clearCart = () => setCart([]);

  // 📊 Total de itens
  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  // 💰 Total do carrinho (convertendo string → number)
  const getTotalPrice = () =>
    cart.reduce((total, item) => {
      const price = Number(item.price?.replace(",", ".") ?? 0);
      return total + price * item.quantity;
    }, 0);

  // 📲 Mensagem WhatsApp
  const generateWhatsAppMessage = () => {
    let message = "🧸 *PEDIDO - UP Universo das Pelúcias*\n\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

    cart.forEach((item, index) => {
      const price = Number(item.price?.replace(",", ".") ?? 0);
      const subtotal = price * item.quantity;

      message += `*${index + 1}. ${item.name}*\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: R$ ${price
        .toFixed(2)
        .replace(".", ",")}\n`;
      message += `   Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━━\n";
    message += `\n💰 *TOTAL: R$ ${getTotalPrice()
      .toFixed(2)
      .replace(".", ",")}*\n\n`;
    message += "Por favor, confirme meu pedido! 😊";

    return message;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        generateWhatsAppMessage,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// 🎯 Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
