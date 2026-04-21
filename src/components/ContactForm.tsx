import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, MessageSquare, User, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './ContactForm.css';

interface Feedback {
  id: string;
  userId?: string;
  name: string;
  contact: string;
  message: string;
  date: string;
}

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName,
        contact: user.phoneNumber || user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newFeedback: Feedback = {
      id: `FB-${Date.now()}`,
      userId: user?.id,
      ...formData,
      date: new Date().toISOString()
    };

    // Functional part: Save to localStorage (Simulating sending to database)
    const existingFeedback = JSON.parse(localStorage.getItem('simba-feedback') || '[]');
    localStorage.setItem('simba-feedback', JSON.stringify([newFeedback, ...existingFeedback]));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Clear message but keep name/contact for potential next message
    setFormData(prev => ({ ...prev, message: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="contact-section" id="contact-us">
      <div className="container">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2 className="section-title">{t('contactTitle') || 'Get in Touch'}</h2>
            <p className="contact-desc">
              {t('contactDesc') || 'Have a question or feedback? We\'d love to hear from you. Fill out the form and our team will get back to you shortly.'}
            </p>
            
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon"><Phone size={20} /></div>
                <div>
                  <h4>{t('callUs') || 'Call Us'}</h4>
                  <p>+250 788 000 000</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <h4>{t('emailUs') || 'Email Us'}</h4>
                  <p>info@simba.rw</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            {isSubmitted ? (
              <div className="success-message">
                <CheckCircle size={60} color="#22c55e" />
                <h3>{t('thankYou') || 'Thank You!'}</h3>
                <p>{t('messageSent') || 'Your message has been sent successfully. We will contact you soon.'}</p>
                <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>
                  {t('sendAnother') || 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">{t('fullName') || 'Full Name'}</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder={t('namePlaceholder') || 'Enter your name'}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact">{t('contactInfo') || 'Email or Phone Number'}</label>
                  <div className="input-wrapper">
                    <MessageSquare size={18} className="input-icon" />
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      placeholder={t('contactPlaceholder') || 'email@example.com or 078...'}
                      value={formData.contact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('messageLabel') || 'Your Message / Question'}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder={t('messagePlaceholder') || 'How can we help you?'}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t('sending') || 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('sendMessage') || 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
