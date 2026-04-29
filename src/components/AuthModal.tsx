import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

const branches = [
  { id: '1', name: 'Simba City Center (UTC)' },
  { id: '2', name: 'Simba Gishushu' },
  { id: '3', name: 'Simba Nyarutarama' },
  { id: '4', name: 'Simba Kimironko' },
  { id: '5', name: 'Simba Kicukiro' },
  { id: '6', name: 'Simba Nyamirambo' },
  { id: '7', name: 'Simba Kimihurura' },
  { id: '8', name: 'Simba Kanombe' },
  { id: '9', name: 'Simba Gisozi' },
  { id: '10', name: 'Simba Gisenyi' },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'customer' as UserRole,
    assignedBranchId: '1'
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

    if (mode === 'forgot') {
      setTimeout(() => {
        setIsSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setIsSuccess(false);
          setMode('signin');
        }, 3000);
      }, 1500);
      return;
    }

    try {
      if (mode === 'signup') {
        await register({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          assignedBranchId: (formData.role === 'branch_manager' || formData.role === 'branch_staff') ? formData.assignedBranchId : undefined
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
    <div className="auth-overlay glass-effect" onClick={onClose}>
      <div className="auth-modal glass-effect animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="auth-success-state">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={48} color="#0067c0" />
            </div>
            <h2>{mode === 'forgot' ? 'Email Sent!' : (mode === 'signin' ? 'Welcome Back!' : 'Account Created!')}</h2>
            <p>
              {mode === 'forgot' 
                ? 'Check your inbox for instructions to reset your password.'
                : (mode === 'signin' 
                  ? 'You have successfully signed in to your account.' 
                  : 'Your Simba account has been created successfully.')}
            </p>
          </div>
        ) : (
          <>
            <div className="auth-header">
              {mode === 'forgot' && (
                <button className="back-btn" onClick={() => setMode('signin')}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2>{mode === 'signin' ? t('signIn') : (mode === 'signup' ? t('signUp') : 'Reset Password')}</h2>
              <p>
                {mode === 'signin' 
                  ? 'Welcome back! Please enter your details.' 
                  : (mode === 'signup' 
                    ? 'Create your Simba account to start shopping.' 
                    : 'Enter your email to receive a password reset link.')}
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
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
                        <option value="branch_staff">Branch Staff</option>
                        <option value="CEO">CEO</option>
                      </select>
                    </div>
                  </div>

                  {(formData.role === 'branch_manager' || formData.role === 'branch_staff') && (
                    <div className="form-group">
                      <label>Assign Branch</label>
                      <div className="input-wrapper">
                        <MapPin size={18} className="input-icon" />
                        <select 
                          name="assignedBranchId" 
                          value={formData.assignedBranchId}
                          onChange={handleChange}
                          required
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

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

              {mode === 'forgot' ? (
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              ) : (
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
              )}

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

              {mode !== 'forgot' && (
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
              )}

              {mode === 'signin' && (
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
                  <button type="button" className="forgot-password-link" onClick={() => setMode('forgot')}>
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {mode === 'forgot' ? 'Sending...' : (mode === 'signin' ? 'Signing in...' : 'Creating account...')}
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? t('signIn') : (mode === 'signup' ? t('signUp') : 'Send Reset Link')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {mode === 'signin' ? "Don't have an account? " : (mode === 'signup' ? "Already have an account? " : "Remembered your password? ")}
                <button className="mode-toggle" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
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
