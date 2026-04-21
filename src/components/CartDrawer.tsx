import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './CartDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentOpen: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onPaymentOpen }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { t } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleMomoPayment = () => {
    onClose();
    onPaymentOpen();
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{t('yourCart')} ({cartCount})</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={64} />
              <p>{t('emptyCart')}</p>
              <button className="btn btn-primary" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">{formatPrice(item.price)}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-actions">
              <button className="btn btn-momo btn-block momo-main-btn" onClick={handleMomoPayment}>
                <div className="btn-content">
                  <span className="btn-text">
                    <CreditCard size={20} />
                    {t('payWithMomo')}
                  </span>
                  <span className="btn-amount">{formatPrice(cartTotal)}</span>
                </div>
              </button>
              <button className="btn btn-primary btn-block checkout-btn">
                {t('checkout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
