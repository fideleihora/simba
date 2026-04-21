import React, { useState } from 'react';
import { X, Phone, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount }) => {
  const { t } = useLanguage();
  const { recordTransaction } = useCart();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

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
        recordTransaction(user.id);
      }
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setPhoneNumber('');
      }, 3000);
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
            <h2>{t('paymentSuccess')}</h2>
            <p>Thank you for shopping with Simba Supermarket!</p>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <div className="momo-logo-container">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" alt="MTN Logo" />
                <span>MoMo</span>
              </div>
              <h2>{t('momoTitle')}</h2>
            </div>

            <form className="payment-form" onSubmit={handlePayment}>
              <div className="amount-display">
                <label>{t('amountToPay')}</label>
                <div className="total-value">{formatPrice(amount)}</div>
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
                    {t('processingPayment')}
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    {t('confirmPayment')}
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
