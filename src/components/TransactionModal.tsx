import React, { useState } from 'react';
import { X, Calendar, Package, CheckCircle2, Clock, User, MapPin, CheckCircle, Star, MessageSquare } from 'lucide-react';
import { Transaction } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './TransactionModal.css';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transactions }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { updateTransactionStatus, addReview } = useCart();
  const [reviewForm, setReviewForm] = useState<{ trId: string, rating: number, comment: string } | null>(null);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-RW', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleMarkAsReceived = (trxId: string) => {
    updateTransactionStatus(trxId, 'completed');
    alert("Thank you for confirming! Your order is now marked as Completed. Please leave a review.");
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm) {
      addReview(reviewForm.trId, reviewForm.rating, reviewForm.comment);
      setReviewForm(null);
      alert("Review submitted! Thank you for your feedback.");
    }
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <div className="header-title-group">
            <h2>📜 {t('purchaseHistory') || 'Purchase History'}</h2>
            {user && (
              <div className="history-user-info">
                <User size={14} />
                <span>{user.fullName} ({user.phoneNumber})</span>
              </div>
            )}
          </div>
          <button className="history-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="history-content">
          {transactions.length === 0 ? (
            <div className="empty-history">
              <Clock size={64} color="#adb5bd" />
              <p>No transactions found yet.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((trx) => (
                <div key={trx.id} className={`transaction-card ${trx.status}`}>
                  <div className="trx-card-header">
                    <div className="trx-id-date">
                      <span className="trx-id">{trx.id}</span>
                      <span className="trx-date"><Calendar size={12} /> {formatDate(trx.date)}</span>
                    </div>
                    <div className={`trx-status ${trx.status}`}>
                      <CheckCircle2 size={14} /> {trx.status}
                    </div>
                  </div>

                  {trx.pickupBranch && (
                    <div className="trx-pickup-info">
                      <div className="pickup-location">
                        <MapPin size={12} />
                        <span>Pickup at: <strong>{trx.pickupBranch}</strong></span>
                      </div>
                      {trx.pickupTime && (
                        <div className="pickup-time">
                          <Clock size={12} />
                          <span>Time: <strong>{new Date(trx.pickupTime).toLocaleString()}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="trx-items">
                    {trx.items.map((item, idx) => (
                      <div key={`${trx.id}-${item.id}-${idx}`} className="trx-item-row">
                        <span className="item-name">{item.name} x {item.quantity}</span>
                        <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="trx-card-footer">
                    <div className="trx-total-section">
                      <div className="deposit-line">
                        <span>MoMo Deposit Paid</span>
                        <span className="deposit-amount">{formatPrice(trx.depositPaid)}</span>
                      </div>
                      <div className="total-line">
                        <span className="total-label">Total Amount</span>
                        <span className="total-amount">{formatPrice(trx.total)}</span>
                      </div>
                      <div className="balance-line">
                        <span>Balance to pay at branch</span>
                        <span className="balance-amount">{formatPrice(trx.total - trx.depositPaid)}</span>
                      </div>
                    </div>
                    
                    {user?.role === 'customer' && (trx.status === 'accepted' || trx.status === 'picked_up') && (
                      <button 
                        className="received-btn"
                        onClick={() => handleMarkAsReceived(trx.id)}
                      >
                        <CheckCircle size={16} />
                        I received the order successfully
                      </button>
                    )}
                    
                    {trx.status === 'completed' && !trx.review && !reviewForm && (
                      <button 
                        className="review-btn-trigger"
                        onClick={() => setReviewForm({ trId: trx.id, rating: 5, comment: '' })}
                      >
                        <Star size={16} /> Rate your Experience
                      </button>
                    )}

                    {trx.review && (
                      <div className="review-display">
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < trx.review!.rating ? "#ffcc00" : "none"} 
                              color={i < trx.review!.rating ? "#ffcc00" : "#cbd5e1"} 
                            />
                          ))}
                        </div>
                        <p className="review-comment">"{trx.review.comment}"</p>
                      </div>
                    )}

                    {reviewForm && reviewForm.trId === trx.id && (
                      <form className="review-form" onSubmit={submitReview}>
                        <div className="rating-selector">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button 
                              key={num}
                              type="button"
                              className={reviewForm.rating >= num ? 'active' : ''}
                              onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                            >
                              <Star size={20} fill={reviewForm.rating >= num ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          placeholder="Tell us about your pickup experience..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                        />
                        <div className="review-actions">
                          <button type="button" className="cancel-btn" onClick={() => setReviewForm(null)}>Cancel</button>
                          <button type="submit" className="submit-btn">Post Review</button>
                        </div>
                      </form>
                    )}
                    
                    {trx.status === 'completed' && (
                      <div className="completed-badge">
                        <CheckCircle2 size={16} />
                        Order Completed Successfully
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
