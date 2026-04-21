import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Phone, MapPin, Heart, Globe, Sun, Moon, ChevronDown, X, History, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onCartToggle: () => void;
  onAuthOpen: (mode: 'signin' | 'signup') => void;
  categories: string[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
  onHistoryOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  searchTerm, 
  onCartToggle, 
  onAuthOpen,
  categories,
  onSelectCategory,
  selectedCategory,
  onHistoryOpen
}) => {
  const { cartCount, transactions } = useCart();
  const { favoritesCount } = useFavorites();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const userTransactionsCount = transactions.filter(t => t.userId === user?.id).length;
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleHistoryClick = () => {
    if (isAuthenticated) {
      onHistoryOpen();
    } else {
      onAuthOpen('signin');
    }
  };

  return (
    <header className="main-header sticky">
      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}></div>
      
      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo">
            <img src="/assets/SIMBA_LOGO.png" alt="Simba Logo" />
            <div className="logo-text">
              <span className="brand-name">Simba</span>
            </div>
          </div>
          <button className="close-mobile-menu" onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-menu-content">
          {isAuthenticated && (
            <div className="mobile-user-info">
              <div className="user-avatar">
                <User size={24} />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-phone">{user?.phoneNumber}</span>
              </div>
            </div>
          )}

          <div className="mobile-search-container">
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
          </div>

          <div className="mobile-menu-section">
            <h3>{t('allCategories')}</h3>
            <div className="mobile-category-list">
              <button 
                className={`mobile-category-item ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => handleCategorySelect(null)}
              >
                {t('allProducts')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`mobile-category-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-menu-section">
            <h3>{t('settings')}</h3>
            <div className="mobile-settings">
              <div className="setting-item">
                <span>{theme === 'light' ? t('darkMode') || 'Dark Mode' : t('lightMode') || 'Light Mode'}</span>
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
              <div className="setting-item">
                <span>{t('language')}</span>
                <div className="language-switcher">
                  <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
                  <button onClick={() => setLanguage('rw')} className={language === 'rw' ? 'active' : ''}>RW</button>
                  <button onClick={() => setLanguage('fr')} className={language === 'fr' ? 'active' : ''}>FR</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-menu-section">
            <h3>{t('account')}</h3>
            <div className="mobile-auth-links">
              {!isAuthenticated ? (
                <>
                  <button onClick={() => { onAuthOpen('signin'); toggleMobileMenu(); }}>{t('signIn')}</button>
                  <button onClick={() => { onAuthOpen('signup'); toggleMobileMenu(); }} className="signup-btn">{t('signUp')}</button>
                </>
              ) : (
                <>
                  <button onClick={() => { handleHistoryClick(); toggleMobileMenu(); }}>
                    📜 {t('purchaseHistory') || 'Purchase History'} ({userTransactionsCount})
                  </button>
                  <button onClick={() => { logout(); toggleMobileMenu(); }} className="logout-btn">
                    <LogOut size={18} /> {t('logout') || 'Logout'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mobile-menu-section">
            <h3>{t('services')}</h3>
            <div className="mobile-service-links">
              <a href="#">{t('supermarket')}</a>
              <a href="#">{t('restaurant')}</a>
              <a href="#">{t('promotions')}</a>
              <a href="#">{t('newArrivals')}</a>
            </div>
          </div>
        </div>
      </div>

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
            {!isAuthenticated ? (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signin'); }}>{t('signIn')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onAuthOpen('signup'); }} className="signup-link">{t('signUp')}</a>
              </>
            ) : (
              <div className="user-menu">
                <span className="user-greeting">Hi, {user?.fullName.split(' ')[0]}</span>
                <button onClick={logout} className="logout-link"><LogOut size={16} /> {t('logout') || 'Logout'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo-section">
            <Menu className="mobile-menu-icon" onClick={toggleMobileMenu} />
            <div className="logo" onClick={() => handleCategorySelect(null)} style={{cursor: 'pointer'}}>
              <img src="/assets/SIMBA_LOGO.png" alt="Simba Logo" />
              <div className="logo-text">
                <span className="brand-name">Simba</span>
                <span className="brand-tagline">Supermarket</span>
              </div>
            </div>
          </div>

          <div className="search-bar desktop-search">
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
            <button className="nav-action-item" onClick={handleHistoryClick}>
              <div className="cart-icon-wrapper">
                <History size={24} />
                {userTransactionsCount > 0 && <span className="cart-badge" style={{backgroundColor: 'var(--primary)', borderColor: 'var(--white)'}}>{userTransactionsCount}</span>}
              </div>
              <span className="action-label">{t('purchaseHistory') || 'Records'}</span>
            </button>
            <button className="nav-action-item">
              <div className="cart-icon-wrapper">
                <Heart size={24} />
                {favoritesCount > 0 && <span className="cart-badge">{favoritesCount}</span>}
              </div>
              <span className="action-label">{t('favorites')}</span>
            </button>
            <button className="nav-action-item" onClick={onCartToggle}>
              <div className="cart-icon-wrapper">
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
              <span className="action-label">{t('cart')}</span>
            </button>
            <button className="nav-action-item profile-btn" onClick={() => !isAuthenticated && onAuthOpen('signin')}>
              <User size={24} />
              <span className="action-label">{isAuthenticated ? user?.fullName.split(' ')[0] : t('account')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar (Only visible on mobile) */}
      <div className="mobile-search-bar">
        <div className="container">
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
        </div>
      </div>

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
