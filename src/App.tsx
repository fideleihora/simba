import React, { useState, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useProducts } from './hooks/useProducts';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import TransactionModal from './components/TransactionModal';
import ContactForm from './components/ContactForm';
import FavoritesDrawer from './components/FavoritesDrawer';
import BranchesModal from './components/BranchesModal';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { cartTotal, transactions } = useCart();
  const { user } = useAuth();
  const {
    products,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    store
  } = useProducts();

  const [view, setView] = useState<'home' | 'shop'>('home');

  const userTransactions = useMemo(() => {
    return transactions.filter(t => t.userId === user?.id);
  }, [transactions, user]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBranchesOpen, setIsBranchesOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  // Featured sections
  const promotions = useMemo(() => products.filter(p => p.price > 50000).slice(0, 4), [products]);
  const newArrivals = useMemo(() => products.slice(4, 8), [products]);
  const frequentlyBought = useMemo(() => products.slice(10, 14), [products]);

  const handleAuthOpen = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleStartShopping = () => {
    setView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setView('home');
    setSelectedCategory(null);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Navbar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onCartToggle={() => setIsCartOpen(true)}
        onFavoritesToggle={() => setIsFavoritesOpen(true)}
        onBranchesOpen={() => setIsBranchesOpen(true)}
        onAuthOpen={handleAuthOpen}
        categories={categories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat) {
            setView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        selectedCategory={selectedCategory}
        onHistoryOpen={() => setIsHistoryOpen(true)}
        onLogoClick={handleLogoClick}
      />
      
      <main>
        {view === 'home' ? (
          <>
            <Hero tagline={store.tagline} />
            
            <div className="featured-section">
              <div className="container">
                <div className="section-cta-top">
                  <button 
                    className="start-shopping-btn"
                    onClick={handleStartShopping}
                  >
                    START SHOPPING NOW
                  </button>
                </div>
              </div>
            </div>

            <div className="featured-section frequently-bought">
              <div className="container">
                <h2 className="section-title">✨ Frequently Bought</h2>
                <div className="product-grid">
                  {frequentlyBought.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleStartShopping}>
                    View All Products
                  </button>
                </div>
              </div>
            </div>

            <div className="big-promo-slider-container">
              <div className="big-promo-slider">
                <div className="big-promo-item">🚀 30 MINUTES DELIVERY</div>
                <div className="big-promo-item">🥬 FRESH PRODUCTS</div>
                <div className="big-promo-item mtn">📱 MTN MOMO PAY</div>
                <div className="big-promo-item airtel">💳 AIRTEL MONEY</div>
              </div>
            </div>

            <ContactForm />
          </>
        ) : (
          <div className="shop-view-container">
            <div className="container" style={{ padding: '40px 24px' }}>
              <button className="back-to-home" onClick={() => setView('home')}>
                ← Back to Home
              </button>
              
              <div className="shop-featured-header">
                <h1 className="page-title">Shop Our Collection</h1>
                
                <div className="featured-row">
                  <div className="featured-col">
                    <h2 className="section-title">🔥 {t('promotions')}</h2>
                    <div className="product-grid compact">
                      {promotions.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="featured-col">
                    <h2 className="section-title">🆕 {t('newArrivals')}</h2>
                    <div className="product-grid compact">
                      {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="all-products-browser">
                <h2 className="section-title">📦 {t('allProducts')}</h2>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                <ProductGrid products={products} />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer store={store} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onPaymentOpen={() => setIsPaymentOpen(true)}
        onAuthOpen={handleAuthOpen}
      />

      <AuthModal
        key={authModal.isOpen ? 'open' : 'closed'}
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={cartTotal}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <BranchesModal
        isOpen={isBranchesOpen}
        onClose={() => setIsBranchesOpen(false)}
      />

      <TransactionModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={userTransactions}
      />

      <style>{`
        .shop-view-container {
          background-color: var(--light);
          min-height: 100vh;
        }
        .back-to-home {
          background: none;
          color: var(--primary);
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .back-to-home:hover {
          text-decoration: underline;
        }
        .page-title {
          font-size: 32px;
          font-weight: 900;
          color: var(--dark);
          margin-bottom: 30px;
          text-align: center;
        }
        .shop-featured-header {
          margin-bottom: 60px;
        }
        .featured-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 20px;
        }
        .product-grid.compact {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        @media (max-width: 1024px) {
          .featured-row {
            grid-template-columns: 1fr;
          }
        }
        .big-promo-slider-container {
          width: 100%;
          height: 120px;
          overflow: hidden;
          background: var(--dark);
          margin: 40px 0;
          display: flex;
          align-items: center;
          position: relative;
        }
        .big-promo-slider {
          display: flex;
          width: 400%; /* 4 items */
          height: 100%;
          animation: big-slide 16s step-end infinite;
        }
        .big-promo-item {
          width: 25%; /* 1/4 of container */
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-weight: 900;
          font-size: 36px;
          text-align: center;
          padding: 0 20px;
        }
        .big-promo-item.mtn {
          color: #FFCC00;
        }
        .big-promo-item.airtel {
          color: #FF0000;
        }
        @keyframes big-slide {
          0%, 25% { transform: translateX(0); }
          25.01%, 50% { transform: translateX(-25%); }
          50.01%, 75% { transform: translateX(-50%); }
          75.01%, 100% { transform: translateX(-75%); }
        }
        @media (max-width: 768px) {
          .big-promo-item {
            font-size: 24px;
          }
          .big-promo-slider-container {
            height: 80px;
          }
        }
        .section-cta-top {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .start-shopping-btn {
          background-color: var(--secondary);
          color: var(--dark);
          padding: 16px 40px;
          border-radius: 50px;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
          border: 2px solid var(--dark);
          transition: var(--transition);
          cursor: pointer;
        }
        .start-shopping-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
          background-color: var(--secondary-hover);
        }
        .featured-section {
          padding: 60px 24px;
        }
        .featured-section .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        @media (max-width: 600px) {
          .featured-section .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }
        .nav-link-btn {
          background: none;
          color: #adb5bd;
          font-size: 13px;
          font-weight: 500;
          display: none;
        }
        .cart-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        .btn-momo {
          background-color: #ffcc00; /* MTN Yellow */
          color: #000;
          font-weight: 900;
          text-transform: uppercase;
          border-radius: 14px;
          height: 60px;
          border: none;
          width: 100%;
          transition: var(--transition);
          box-shadow: 0 4px 0 #ccaa00;
        }
        .btn-momo:hover {
          background-color: #ffd633;
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #ccaa00;
        }
        .btn-momo:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #ccaa00;
        }
        .momo-main-btn .btn-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0 16px;
        }
        .btn-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
        }
        .btn-amount {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
