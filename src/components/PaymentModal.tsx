import React, { useState } from 'react';
import { X, Phone, CreditCard, CheckCircle2, Loader2, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  selectedBranch: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, selectedBranch }) => {
  const { t } = useLanguage();
  const { recordTransaction } = useCart();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const DEPOSIT_AMOUNT = 1000;

  if (!isOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate MOMO payment process
    setTimeout(() => {
      if (user) {
        recordTransaction(user.id, selectedBranch, DEPOSIT_AMOUNT);
      }
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setPhoneNumber('');
      }, 4000);
    }, 2500);
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close" onClick={onClose}>
          <X size={24} />
        </button>

        {status === 'success' ? (
          <div className="payment-success-state">
            <CheckCircle2 size={80} color="#22c55e" />
            <h2>Order Pending</h2>
            <p>Your deposit of <strong>{formatPrice(DEPOSIT_AMOUNT)}</strong> has been received.</p>
            <p>Your order is now <strong>Pending</strong>. You will be notified once the manager at <strong>{selectedBranch}</strong> accepts it.</p>
            <div className="pickup-hint">
              <Clock size={16} />
              <span>Non-refundable deposit of {formatPrice(DEPOSIT_AMOUNT)}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <div className="momo-logo-container">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" alt="MTN Logo" />
                <span>MoMo</span>
              </div>
              <h2>Pay Deposit to Order</h2>
              <p className="payment-subtitle">A non-refundable deposit of {formatPrice(DEPOSIT_AMOUNT)} is required to place your pick-up order.</p>
            </div>

            <div className="selected-branch-banner">
              <MapPin size={18} />
              <span>Pickup at: <strong>{selectedBranch}</strong></span>
            </div>

            <form className="payment-form" onSubmit={handlePayment}>
              <div className="amount-display">
                <label>Deposit Amount</label>
                <div className="total-value">{formatPrice(DEPOSIT_AMOUNT)}</div>
                <span className="remaining-info">Balance of {formatPrice(amount - DEPOSIT_AMOUNT)} to be paid at branch.</span>
              </div>

              <div className="form-group">
                <label>{t('enterMomoNumber')}</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="078 / 079 XXX XXXX" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required 
                    disabled={status === 'processing'}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-momo btn-block"
                disabled={status === 'processing'}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Confirm Deposit {formatPrice(DEPOSIT_AMOUNT)}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
