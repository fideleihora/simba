import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useStock } from '../context/StockContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const { getStock } = useStock();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const favorite = isFavorite(product.id);
  
  // Default to showing branch 1 stock
  const currentStock = getStock('1', product.id);
  const inStock = currentStock > 0;

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-area">
        <img src={product.image} alt={product.name} />
        <button 
          className={`favorite-toggle ${favorite ? 'active' : ''}`}
          onClick={() => toggleFavorite(product)}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-details">
        <p className="category-label">{product.category}</p>
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price-row">
          <div className="price-info">
            <span className="price-text">{formatPrice(product.price)}</span>
            <span className="unit-text">/ {product.unit}</span>
          </div>
          <span className={`stock-indicator ${currentStock < 10 ? 'low' : ''}`}>
            {currentStock} left
          </span>
        </div>
        <button 
          className="btn btn-primary btn-block add-btn"
          onClick={() => addToCart(product)}
          disabled={!inStock}
        >
          <ShoppingCart size={18} />
          {inStock ? t('addToCart') : t('outOfStock')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
