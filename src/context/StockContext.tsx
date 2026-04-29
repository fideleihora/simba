import React, { createContext, useContext, useState, useEffect } from 'react';
import { BranchProduct, Product } from '../types';
import productDataRaw from '../data/simba_products.json';

const allProducts = (productDataRaw as any).products as Product[];

interface StockContextType {
  branchStock: BranchProduct[];
  updateStock: (branchId: string, productId: number, newLevel: number) => void;
  getStock: (branchId: string, productId: number) => number;
  isProductInStock: (branchId: string, productId: number) => boolean;
  deductStock: (branchId: string, items: { id: number, quantity: number }[]) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const branches = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
];

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branchStock, setBranchStock] = useState<BranchProduct[]>(() => {
    const saved = localStorage.getItem('simba-branch-stock');
    if (saved) return JSON.parse(saved);

    const initialStock: BranchProduct[] = [];
    branches.forEach(branchId => {
      allProducts.forEach(product => {
        initialStock.push({
          branchId,
          productId: product.id,
          stockLevel: Math.floor(Math.random() * 50) + 10
        });
      });
    });
    return initialStock;
  });

  useEffect(() => {
    localStorage.setItem('simba-branch-stock', JSON.stringify(branchStock));
  }, [branchStock]);

  const updateStock = (branchId: string, productId: number, newLevel: number) => {
    setBranchStock(prev => {
      const existing = prev.find(s => s.branchId === branchId && s.productId === productId);
      if (existing) {
        return prev.map(s => 
          (s.branchId === branchId && s.productId === productId) 
            ? { ...s, stockLevel: Math.max(0, newLevel) } 
            : s
        );
      }
      return [...prev, { branchId, productId, stockLevel: Math.max(0, newLevel) }];
    });
  };

  const getStock = (branchId: string, productId: number) => {
    const item = branchStock.find(s => s.branchId === branchId && s.productId === productId);
    return item ? item.stockLevel : 0;
  };

  const isProductInStock = (branchId: string, productId: number) => {
    return getStock(branchId, productId) > 0;
  };

  const deductStock = (branchId: string, items: { id: number, quantity: number }[]) => {
    setBranchStock(prev => {
      const updated = [...prev];
      items.forEach(item => {
        const index = updated.findIndex(s => s.branchId === branchId && s.productId === item.id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            stockLevel: Math.max(0, updated[index].stockLevel - item.quantity)
          };
        }
      });
      return updated;
    });
  };

  return (
    <StockContext.Provider value={{ branchStock, updateStock, getStock, isProductInStock, deductStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStock must be used within a StockProvider');
  return context;
};
