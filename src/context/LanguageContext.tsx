import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'rw' | 'fr';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navbar & Utility
  location: { en: 'Kigali, Rwanda', rw: 'Kigali, u Rwanda', fr: 'Kigali, Rwanda' },
  aboutUs: { en: 'About Us', rw: 'Twimenye', fr: 'À Propos' },
  contact: { en: 'Contact', rw: 'Twandikire', fr: 'Contact' },
  signIn: { en: 'Sign In', rw: 'Injira', fr: 'Se Connecter' },
  signUp: { en: 'Sign Up', rw: 'Iyandikishe', fr: "S'inscrire" },
  searchPlaceholder: { en: 'Search for groceries...', rw: 'Shaka ibiribwa...', fr: 'Rechercher des produits...' },
  favorites: { en: 'Favorites', rw: 'Ibikunzwe', fr: 'Favoris' },
  cart: { en: 'Cart', rw: 'Ikarita', fr: 'Panier' },
  account: { en: 'Account', rw: 'Konti', fr: 'Compte' },
  logout: { en: 'Logout', rw: 'Sohoka', fr: 'Déconnexion' },
  purchaseHistory: { en: 'Purchase History', rw: 'Amateka y’Ibihashywe', fr: 'Historique des Achats' },
  allCategories: { en: 'All Categories', rw: 'Ibyiciro Byose', fr: 'Toutes Catégories' },
  supermarket: { en: 'Supermarket', rw: 'Isoko', fr: 'Supermarché' },
  restaurant: { en: 'Restaurant', rw: 'Resitora', fr: 'Restaurant' },
  promotions: { en: 'Promotions', rw: 'Gahunda', fr: 'Promotions' },
  newArrivals: { en: 'New Arrivals', rw: 'Ibishya', fr: 'Nouveautés' },

  // Hero
  promoBadge: { en: 'Big Savings This Week', rw: 'Igabanyuka ridasanzwe', fr: 'Grosses Économies' },
  shopSupermarket: { en: 'Shop Supermarket', rw: 'Sura Isoko', fr: 'Acheter' },
  viewDeals: { en: 'View Deals', rw: 'Reba Igabanyuka', fr: 'Voir Offres' },
  bakeryTitle: { en: 'Fresh Bakery', rw: 'Imigati Ikiri Mishya', fr: 'Boulangerie Fraîche' },
  bakerySub: { en: 'Baked daily', rw: 'Byakozwe uyu munsi', fr: 'Cuit quotidiennement' },
  restaurantTitle: { en: 'Simba Restaurant', rw: 'Resitora ya Simba', fr: 'Restaurant Simba' },
  restaurantSub: { en: 'Delicious Meals', rw: 'Ibiryo Biryoshye', fr: 'Repas Délicieux' },
  orderNow: { en: 'Order Now', rw: 'Tumiza ubu', fr: 'Commander' },
  viewMenu: { en: 'View Menu', rw: 'Reba Menu', fr: 'Voir Menu' },

  // Sections
  specialPromos: { en: 'Special Promotions', rw: 'Igabanyuka ridasanzwe', fr: 'Promotions Spéciales' },
  shopByCategory: { en: 'Shop by Category', rw: 'Shakira mu Byiciro', fr: 'Acheter par Catégorie' },
  allProducts: { en: 'All Products', rw: 'Ibikoresho Byose', fr: 'Tous les Produits' },

  // Product Card
  addToCart: { en: 'Add to Cart', rw: 'Shyira mu Ikarita', fr: 'Ajouter au Panier' },
  soldOut: { en: 'Sold Out', rw: 'Byashize', fr: 'Épuisé' },
  sale: { en: 'Sale', rw: 'Guhaha', fr: 'Vente' },
  outOfStock: { en: 'Out of Stock', rw: 'Byashize', fr: 'Rupture de stock' },

  // Cart Drawer
  yourCart: { en: 'Your Shopping Cart', rw: 'Ikarita Yawe', fr: 'Votre Panier' },
  emptyCart: { en: 'Your cart is empty', rw: 'Ikarita yawe nta kintu kirimo', fr: 'Votre panier est vide' },
  checkout: { en: 'Checkout', rw: 'Ishyura', fr: 'Payer' },
  subtotal: { en: 'Subtotal', rw: 'Iteranyo', fr: 'Sous-total' },

  // Footer
  quickLinks: { en: 'Quick Links', rw: 'Imiyoboro y’ingenzi', fr: 'Liens Rapides' },
  customerService: { en: 'Customer Service', rw: 'Serivisi y’Abakiriya', fr: 'Service Client' },
  deliveryInfo: { en: 'Delivery Info', rw: 'Amakuru yo kugeza ibintu', fr: 'Infos Livraison' },
  returns: { en: 'Returns & Refunds', rw: 'Gusubiza ibintu', fr: 'Retours' },
  contactUs: { en: 'Contact Us', rw: 'Twandikire', fr: 'Contactez-nous' },
  payWithMomo: { en: 'Pay with MTN MOMO', rw: 'Ishyura na MTN MOMO', fr: 'Payer avec MTN MOMO' },
  momoTitle: { en: 'MTN Mobile Money Payment', rw: 'Kwishyura na MTN Mobile Money', fr: 'Paiement MTN Mobile Money' },
  enterMomoNumber: { en: 'Enter your MTN phone number', rw: 'Shyiramo numero ya MTN', fr: 'Entrez votre numéro MTN' },
  amountToPay: { en: 'Amount to Pay', rw: 'Ayishyurwa', fr: 'Montant à Payer' },
  confirmPayment: { en: 'Confirm Payment', rw: 'Emeza Kwishyura', fr: 'Confirmer le Paiement' },
  processingPayment: { en: 'Processing Payment...', rw: 'Turimo kwakira ubwishyu...', fr: 'Traitement du paiement...' },
  paymentSuccess: { en: 'Payment Successful!', rw: 'Ubwishyu bwageze', fr: 'Paiement Réussi !' },

  // Contact Form
  contactTitle: { en: 'Get in Touch', rw: 'Twandikire', fr: 'Contactez-nous' },
  contactDesc: { en: 'Have a question or feedback? We\'d love to hear from you.', rw: 'Ufite ikibazo cyangwa igitekerezo? Twandikire uyu munsi.', fr: 'Vous avez une question ou un commentaire ? Contactez-nous.' },
  callUs: { en: 'Call Us', rw: 'Duhamagare', fr: 'Appelez-nous' },
  emailUs: { en: 'Email Us', rw: 'Twandikire kuri Email', fr: 'Envoyez-nous un email' },
  fullName: { en: 'Full Name', rw: 'Amazina Yombi', fr: 'Nom Complet' },
  namePlaceholder: { en: 'Enter your name', rw: 'Andika amazina yawe', fr: 'Entrez votre nom' },
  contactInfo: { en: 'Email or Phone Number', rw: 'Email cyangwa Numero ya Terefoni', fr: 'Email ou Numéro de Téléphone' },
  contactPlaceholder: { en: 'email@example.com or 078...', rw: 'email@urugero.com cyangwa 078...', fr: 'email@exemple.com ou 078...' },
  messageLabel: { en: 'Your Message / Question', rw: 'Ubutumwa cyangwa Ikibazo', fr: 'Votre Message / Question' },
  messagePlaceholder: { en: 'How can we help you?', rw: 'Ni gute twagufasha?', fr: 'Comment pouvons-nous vous aider ?' },
  sendMessage: { en: 'Send Message', rw: 'Yohereza Ubutumwa', fr: 'Envoyer le Message' },
  thankYou: { en: 'Thank You!', rw: 'Murakoze!', fr: 'Merci !' },
  messageSent: { en: 'Your message has been sent successfully.', rw: 'Ubutumwa bwawe bwoherejwe neza.', fr: 'Votre message a été envoyé avec succès.' },
  sendAnother: { en: 'Send Another Message', rw: 'Yohereza ubundi butumwa', fr: 'Envoyer un autre message' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('simba-lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('simba-lang', lang);
  };

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
