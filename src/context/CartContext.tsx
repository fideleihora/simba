import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Transaction } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  transactions: Transaction[];
  recordTransaction: (userId: string, pickupBranch?: string, depositPaid?: number) => void;
  updateTransactionStatus: (transactionId: string, status: Transaction['status']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('simba-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('simba-transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  useEffect(() => {
    localStorage.setItem('simba-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('simba-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const updateTransactionStatus = (transactionId: string, status: Transaction['status']) => {
    setTransactions(prev => prev.map(tr => 
      tr.id === transactionId ? { ...tr, status } : tr
    ));
  };

  const recordTransaction = (userId: string, pickupBranch?: string, depositPaid: number = 0) => {
    if (cart.length === 0) return;

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      pickupBranch,
      depositPaid
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    clearCart();
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        transactions,
        recordTransaction,
        updateTransactionStatus
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
