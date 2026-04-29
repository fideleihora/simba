import React, { useState, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
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
import DashboardModal from './components/DashboardModal';
import GroqSearch from './components/GroqSearch';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { cartTotal, transactions } = useCart();
  const { user, isAuthenticated } = useAuth();
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
  const [isBranchSelectionOpen, setIsBranchSelectionOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isGroqOpen, setIsGroqOpen] = useState(false);
  const [selectedBranch, setSelectedBranchName] = useState<string>('');
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

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

  const handleCheckout = () => {
    if (isAuthenticated) {
      setIsCartOpen(false);
      setIsBranchSelectionOpen(true);
    } else {
      setAuthModal({ isOpen: true, mode: 'signin' });
    }
  };

  const handleBranchSelect = (branchName: string, pickupTime: string) => {
    setSelectedBranchName(branchName);
    setSelectedPickupTime(pickupTime);
    setIsBranchSelectionOpen(false);
    setIsPaymentOpen(true);
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
        onDashboardOpen={() => setIsDashboardOpen(true)}
        onGroqOpen={() => setIsGroqOpen(true)}
        onLogoClick={handleLogoClick}
      />
      
      <main>
        {view === 'home' ? (
          <>
            <Hero tagline={store.tagline} onStartShopping={handleStartShopping} />
            
            <div className="featured-section frequently-bought">
              <div className="container">
                <h2 className="section-title">✨ Frequently Bought</h2>
                <div className="product-grid">
                  {products.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
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
                      {products.slice(4, 8).map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="featured-col">
                    <h2 className="section-title">🆕 {t('newArrivals')}</h2>
                    <div className="product-grid compact">
                      {products.slice(8, 12).map(product => (
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
        onPaymentOpen={handleCheckout}
        onAuthOpen={handleAuthOpen}
      />

      <AuthModal
        key={authModal.isOpen ? 'open' : 'closed'}
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onAuthSuccess={() => setIsDashboardOpen(true)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={cartTotal}
        selectedBranch={selectedBranch}
        pickupTime={selectedPickupTime}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      <GroqSearch
        isOpen={isGroqOpen}
        onClose={() => setIsGroqOpen(false)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <BranchesModal
        isOpen={isBranchesOpen}
        onClose={() => setIsBranchesOpen(false)}
      />

      <BranchesModal
        isOpen={isBranchSelectionOpen}
        onClose={() => setIsBranchSelectionOpen(false)}
        selectionMode={true}
        onSelect={handleBranchSelect}
      />

      <TransactionModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={userTransactions}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <StockProvider>
            <FavoritesProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </FavoritesProvider>
          </StockProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
