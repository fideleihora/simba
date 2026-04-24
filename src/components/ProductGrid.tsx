import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>No products found matching your search.</p>
      </div>
    );
  }

  return (
    <section className="product-grid-section" id="products-section">
      <div className="container">
        <h2 className="section-title">{t('allProducts')}</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
