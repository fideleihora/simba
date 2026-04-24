import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Hero.css';

interface HeroProps {
  tagline: string;
}

const Hero: React.FC<HeroProps> = ({ tagline }) => {
  const { t } = useLanguage();

  return (
    <div className="hero">
      <div className="container hero-container">
        <div className="hero-grid">
          <div className="hero-main-banner">
            <div className="banner-content">
              <span className="promo-badge"><Zap size={14} /> {t('promoBadge')}</span>
              <h1>{tagline}</h1>
              <p>Get the best quality groceries and household items at unbeatable prices. Delivered right to your doorstep in Kigali.</p>
              <div className="hero-cta">
                <button className="btn btn-secondary btn-lg">{t('shopSupermarket')} <ChevronRight size={20} /></button>
                <button className="btn btn-outline btn-lg">{t('viewDeals')}</button>
              </div>
            </div>
            <div className="banner-image">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="Fresh Groceries" />
            </div>
          </div>
          
          <div className="hero-side-banners">
            <div className="side-banner promo-1">
              <div className="side-content">
                <h3>{t('bakeryTitle')}</h3>
                <p>{t('bakerySub')}</p>
                <a href="#">{t('orderNow')} <ChevronRight size={14} /></a>
              </div>
            </div>
            <div className="side-banner promo-2">
              <div className="side-content">
                <h3>{t('restaurantTitle')}</h3>
                <p>{t('restaurantSub')}</p>
                <a href="#">{t('viewMenu')} <ChevronRight size={14} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
