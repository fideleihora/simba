import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();

  const isFav = isFavorite(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-actions-overlay">
          <button 
            className={`action-icon-btn ${isFav ? 'active' : ''}`} 
            title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={() => toggleFavorite(product)}
          >
            <Heart size={18} fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>
        {!product.inStock && <span className="status-badge out-of-stock">{t('soldOut')}</span>}
        {product.price > 50000 && <span className="status-badge promo">{t('sale')}</span>}
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        <div className="product-price-row">
          <div className="price-container">
            <span className="current-price">{formatPrice(product.price)}</span>
            <span className="unit">/ {product.unit}</span>
          </div>
        </div>
        <button
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
        >
          <ShoppingCart size={18} />
          {product.inStock ? t('addToCart') : t('outOfStock')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
