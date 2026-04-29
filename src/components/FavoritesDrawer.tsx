import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './FavoritesDrawer.css';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ isOpen, onClose }) => {
  const { favorites, toggleFavorite, favoritesCount } = useFavorites();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <>
      <div className={`favorites-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`favorites-drawer ${isOpen ? 'open' : ''}`}>
        <div className="favorites-header">
          <div className="favorites-title">
            <Heart size={24} fill="var(--primary)" color="var(--primary)" />
            <h2>{t('favorites') || 'Favorites'} ({favoritesCount})</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="favorites-content">
          {favorites.length === 0 ? (
            <div className="empty-favorites">
              <Heart size={64} color="#adb5bd" />
              <p>Your wishlist is empty.</p>
              <button className="btn btn-primary" onClick={onClose}>
                Explore Products
              </button>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map((product) => (
                <div key={product.id} className="fav-item">
                  <div className="fav-item-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="fav-item-details">
                    <h4>{product.name}</h4>
                    <p className="fav-item-price">{formatPrice(product.price)}</p>
                    <div className="fav-item-actions">
                      <button 
                        className={`btn-add-fav ${!product.inStock ? 'out-of-stock' : ''}`} 
                        onClick={() => {
                          if (product.inStock) {
                            handleAddToCart(product);
                          } else {
                            alert(`${product.name}: ${t('outOfStock')}`);
                          }
                        }}
                      >
                        <ShoppingCart size={16} />
                        {product.inStock ? t('addToCart') : t('outOfStock')}
                      </button>
                      <button className="btn-remove-fav" onClick={() => toggleFavorite(product)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesDrawer;
