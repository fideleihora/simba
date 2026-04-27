import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'customer' as UserRole
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { t } = useLanguage();
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setRememberMe((e.target as HTMLInputElement).checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await register({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }, rememberMe);
      } else {
        await login(formData.phoneNumber, formData.password, rememberMe);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="auth-success-state">
            <CheckCircle2 size={80} color="#22c55e" />
            <h2>{mode === 'signin' ? 'Welcome Back!' : 'Account Created!'}</h2>
            <p>
              {mode === 'signin' 
                ? 'You have successfully signed in to your account.' 
                : 'Your Simba account has been created successfully.'}
            </p>
            <div className="success-loader"></div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2>{mode === 'signin' ? t('signIn') : t('signUp')}</h2>
              <p>{mode === 'signin' ? 'Welcome back! Please enter your details.' : 'Create your Simba account to start shopping.'}</p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="form-group">
                    <label>Account Type</label>
                    <div className="input-wrapper">
                      <ShieldCheck size={18} className="input-icon" />
                      <select 
                        name="role" 
                        className="role-select"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="customer">Customer</option>
                        <option value="branch_manager">Branch Manager</option>
                        <option value="CEO">CEO</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="John Doe" 
                        value={formData.fullName}
                        onChange={handleChange}
                        required 
                        autoFocus={mode === 'signup'}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Mobile Number</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    placeholder="07XX XXX XXX" 
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required 
                    autoFocus={mode === 'signin'}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="form-group">
                  <label>Email Address <span className="optional-tag">(Optional)</span></label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                  <button 
                    type="button" 
                    className="show-password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                </div>

                <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    name="rememberMe" 
                    checked={rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                {mode === 'signin' && (
                  <button type="button" className="forgot-password">Forgot password?</button>
                )}
                </div>

                <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>

                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? t('signIn') : t('signUp')}
                    <ArrowRight size={18} />
                  </>
                )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
