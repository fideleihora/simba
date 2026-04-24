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
  const newArrivals = useMemo(() => products.slice(0, 4), [products]);

  const handleAuthOpen = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
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
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onHistoryOpen={() => setIsHistoryOpen(true)}
      />
      
      <main>
        <Hero tagline={store.tagline} />
        
        <div className="featured-section">
          <div className="container">
            <div className="section-cta-top">
              <button 
                className="start-shopping-btn"
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                START SHOPPING NOW
              </button>
            </div>
            <h2 className="section-title">{t('promotions')}</h2>
            <div className="product-grid">
              {promotions.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductGrid products={products} />

        <div className="featured-section">
          <div className="container">
            <h2 className="section-title">{t('newArrivals')}</h2>
            <div className="product-grid">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        <ContactForm />
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
