import React from 'react';
import { X, Calendar, Package, CheckCircle2, Clock, User } from 'lucide-react';
import { Transaction } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './TransactionModal.css';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transactions }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

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
                <div key={trx.id} className="transaction-card">
                  <div className="trx-card-header">
                    <div className="trx-id-date">
                      <span className="trx-id">{trx.id}</span>
                      <span className="trx-date"><Calendar size={12} /> {formatDate(trx.date)}</span>
                    </div>
                    <div className={`trx-status ${trx.status}`}>
                      <CheckCircle2 size={14} /> {trx.status}
                    </div>
                  </div>

                  <div className="trx-items">
                    {trx.items.map((item, idx) => (
                      <div key={`${trx.id}-${item.id}-${idx}`} className="trx-item-row">
                        <span className="item-name">{item.name} x {item.quantity}</span>
                        <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="trx-footer">
                    <span className="total-label">Total</span>
                    <span className="total-amount">{formatPrice(trx.total)}</span>
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
