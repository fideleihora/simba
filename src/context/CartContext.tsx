import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Transaction } from '../types';
import { useStock } from './StockContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  transactions: Transaction[];
  recordTransaction: (userId: string, pickupBranch?: string, depositPaid?: number, pickupTime?: string) => void;
  updateTransactionStatus: (transactionId: string, status: Transaction['status']) => void;
  addReview: (transactionId: string, rating: number, comment: string) => void;
  assignOrderToStaff: (transactionId: string, staffId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deductStock } = useStock();
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

  const addReview = (transactionId: string, rating: number, comment: string) => {
    setTransactions(prev => prev.map(tr => 
      tr.id === transactionId ? { 
        ...tr, 
        review: { rating, comment, date: new Date().toISOString() } 
      } : tr
    ));
  };

  const assignOrderToStaff = (transactionId: string, staffId: string) => {
    setTransactions(prev => prev.map(tr => 
      tr.id === transactionId ? { ...tr, assignedStaffId: staffId as any, status: 'preparing' } : tr
    ));
  };

  const recordTransaction = (userId: string, pickupBranch?: string, depositPaid: number = 0, pickupTime?: string) => {
    if (cart.length === 0) return;

    const branchMapping: Record<string, string> = {
      'Simba City Center (UTC)': '1',
      'Simba Gishushu': '2',
      'Simba Nyarutarama': '3',
      'Simba Kimironko': '4',
      'Simba Kicukiro': '5',
      'Simba Nyamirambo': '6',
      'Simba Kimihurura': '7',
      'Simba Kanombe': '8',
      'Simba Gisozi': '9',
      'Simba Gisenyi': '10',
    };
    
    const branchId = branchMapping[pickupBranch || ''] || '1';
    deductStock(branchId, cart.map(item => ({ id: item.id, quantity: item.quantity })));

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      pickupBranch,
      pickupTime,
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
        updateTransactionStatus,
        addReview,
        assignOrderToStaff
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
