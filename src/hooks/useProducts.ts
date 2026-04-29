import { useState, useMemo } from 'react';
import productDataRaw from '../data/simba_products.json';
import { Product, StoreData } from '../types';
import { useStock } from '../context/StockContext';

const productData = productDataRaw as StoreData;

export const useProducts = () => {
  const { products: allProductsFromStock } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(allProductsFromStock.map((p) => p.category));
    return Array.from(cats);
  }, [allProductsFromStock]);

  const filteredProducts = useMemo(() => {
    return allProductsFromStock.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [allProductsFromStock, searchTerm, selectedCategory]);

  return {
    products: filteredProducts,
    allProducts: allProductsFromStock,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    store: productData.store
  };
};
