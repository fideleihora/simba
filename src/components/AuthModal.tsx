import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle auth here
    alert(`${mode === 'signin' ? 'Signing in...' : 'Creating account...'}`);
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-header">
          <h2>{mode === 'signin' ? t('signIn') : t('signUp')}</h2>
          <p>{mode === 'signin' ? 'Welcome back! Please enter your details.' : 'Create your Simba account to start shopping.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="John Doe" required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input type="tel" placeholder="+250 7XX XXX XXX" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address <span className="optional-tag">(Optional)</span></label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="john@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block auth-submit">
            {mode === 'signin' ? t('signIn') : t('signUp')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button className="mode-toggle" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
