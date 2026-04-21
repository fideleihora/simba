import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Phone, MapPin, Heart, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

interface NavbarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onCartToggle: () => void;
  onAuthOpen: (mode: 'signin' | 'signup') => void;
  categories: string[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  searchTerm, 
  onCartToggle, 
  onAuthOpen,
  categories,
  onSelectCategory,
  selectedCategory
}) => {
  const { cartCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string | null) => {
    onSelectCategory(category);
    setIsCategoryMenuOpen(false);
  };

  return (
    <header className="main-header sticky">
      {/* Utility Bar */}
      <div className="utility-bar">
        <div className="container utility-content">
          <div className="utility-left">
            <span><MapPin size={14} /> {t('location')}</span>
            <span><Phone size={14} /> +250 788 000 000</span>
            <div className="language-switcher">
              <button 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                title="English"
              >
                🇺🇸 EN
              </button>
              <button 
                className={`lang-btn ${language === 'rw' ? 'active' : ''}`}
                onClick={() => setLanguage('rw')}
                title="Kinyarwanda"
              >
                🇷🇼 RW
              </button>
              <button 
                className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
                onClick={() => setLanguage('fr')}
                title="Français"
              >
                🇫🇷 FR
              </button>
            </div>
          </div>
          <div className="utility-right">
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signin'); }}>{t('aboutUs')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signin'); }}>{t('contact')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signin'); }}>{t('signIn')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signup'); }} className="signup-link">{t('signUp')}</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo-section">
            <Menu className="mobile-menu-icon" />
            <div className="logo" onClick={() => handleCategorySelect(null)} style={{cursor: 'pointer'}}>
              <img src="/assets/SIMBA_LOGO.png" alt="Simba Logo" />
              <div className="logo-text">
                <span className="brand-name">Simba</span>
                <span className="brand-tagline">Supermarket</span>
              </div>
            </div>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            <button className="search-btn">
              <Search size={20} />
            </button>
          </div>

          <div className="nav-actions">
            <button className="nav-action-item">
              <Heart size={24} />
              <span className="action-label">{t('favorites')}</span>
            </button>
            <button className="nav-action-item" onClick={onCartToggle}>
              <div className="cart-icon-wrapper">
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
              <span className="action-label">{t('cart')}</span>
            </button>
            <button className="nav-action-item profile-btn" onClick={() => onAuthOpen('signin')}>
              <User size={24} />
              <span className="action-label">{t('account')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Category/Service Bar */}
      <div className="service-bar">
        <div className="container service-content">
          <div className="category-dropdown-container" ref={menuRef}>
            <button 
              className={`category-menu-btn ${isCategoryMenuOpen ? 'open' : ''}`}
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            >
              <Menu size={18} />
              {selectedCategory || t('allCategories')}
              <ChevronDown size={16} className={`chevron ${isCategoryMenuOpen ? 'rotate' : ''}`} />
            </button>

            {isCategoryMenuOpen && (
              <div className="category-dropdown-menu">
                <button 
                  className={`category-dropdown-item ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(null)}
                >
                  {t('allProducts')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="service-links">
            <a href="#" className="active">{t('supermarket')}</a>
            <a href="#">{t('restaurant')}</a>
            <a href="#">{t('promotions')}</a>
            <a href="#">{t('newArrivals')}</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
