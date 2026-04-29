import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Search, Loader2, MessageSquare, User, AlertCircle, ShoppingCart, Plus, Check, MapPin, Package, CreditCard, Trash2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { branches } from '../data/branches';
import './GroqSearch.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onCartOpen?: () => void;
}

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY') || '';

const GroqSearch: React.FC<GroqSearchProps> = ({ isOpen, onClose, onCartOpen }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Simba AI assistant. I can help you find products, suggest recipes, or answer any questions about our supermarket. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<number[]>([]);
  const { allProducts } = useProducts();
  const { addToCart, cart, cartTotal, transactions, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleAction = (action: string) => {
    switch (action) {
      case 'CLEAR_CART':
        clearCart();
        setMessages(prev => [...prev, { role: 'assistant', content: 'I have cleared your shopping cart as requested.' }]);
        break;
      case 'GO_TO_CHECKOUT':
        onClose();
        if (onCartOpen) onCartOpen();
        break;
      default:
        break;
    }
  };

  const localSearchFallback = (query: string): string => {
    const searchTerms = query.toLowerCase().split(' ');
    const matchedProducts = allProducts.filter(p => 
      searchTerms.some(term => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
      )
    ).slice(0, 5);

    if (matchedProducts.length === 0) {
      return "I couldn't find any products matching your search in our catalog. Would you like to try searching for something else, like 'fruit', 'milk', or 'heaters'?";
    }

    let response = `I found some products that might match what you're looking for:\n\n`;
    matchedProducts.forEach(p => {
      response += `- **${p.name}**: ${p.price.toLocaleString()} RWF (${p.category}) [ID:${p.id}]\n`;
    });
    response += `\nI'm currently in 'Offline Mode' because no API key was found, but I can still help you browse the catalog!`;
    return response;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    // If no API key, use fallback immediately
    if (!GROQ_API_KEY) {
      setTimeout(() => {
        const fallbackContent = localSearchFallback(userMessage);
        setMessages(prev => [...prev, { role: 'assistant', content: fallbackContent }]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const catalogContext = allProducts.map(p => 
        `ID:${p.id} | ${p.name} | ${p.category} | ${p.price} RWF | ${p.inStock ? 'In Stock' : 'Out of Stock'}`
      ).join('\n');

      const userContext = isAuthenticated ? `
        CURRENT USER: ${user?.fullName}
        PHONE: ${user?.phoneNumber}
        ROLE: ${user?.role}
      ` : 'USER STATUS: Not Logged In';

      const cartContext = cart.length > 0 ? `
        CURRENT CART:
        ${cart.map(item => `- ${item.name} x${item.quantity} (${item.price * item.quantity} RWF)`).join('\n')}
        TOTAL: ${cartTotal} RWF
      ` : 'CART STATUS: Empty';

      const transactionContext = transactions.length > 0 ? `
        RECENT ORDERS:
        ${transactions.slice(0, 3).map(t => `- ID:${t.id} | Date:${t.date.split('T')[0]} | Total:${t.total} RWF | Status:${t.status}`).join('\n')}
      ` : 'ORDER HISTORY: None';

      const branchContext = `
        BRANCH LOCATIONS:
        ${branches.map(b => `- ${b.name}`).join('\n')}
      `;

      const systemMessage: Message = {
        role: 'system',
        content: `You are Simba AI, the official assistant for Simba Supermarket in Rwanda.
        
        ${userContext}
        ${cartContext}
        ${transactionContext}
        ${branchContext}
        
        CATALOG DATA:
        ${catalogContext}
        
        INSTRUCTIONS:
        1. Be friendly, helpful, and professional.
        2. When users ask for products, search the catalog and recommend the most relevant ones.
        3. ALWAYS mention the price and if it's in stock.
        4. CRITICAL: To show a product card with an add-to-cart button, include its ID like this: [ID:12345].
        5. SYSTEM ACTIONS: You can trigger actions by including these tags:
           - [ACTION:CLEAR_CART] to empty the cart.
           - [ACTION:GO_TO_CHECKOUT] to open the cart/checkout drawer.
        6. INFO CARDS: To show information about a branch or order status, you can use these tags:
           - [BRANCH:Branch Name] to show a branch location card.
           - [ORDER:OrderID] to show an order status card.
        7. If asked about order status, check the RECENT ORDERS above and provide the current status.
        8. Use Markdown for formatting. Keep responses concise.`
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [systemMessage, ...newMessages.slice(-7)], // Last 7 messages for context
          temperature: 0.6,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('API limit reached or connection issue.');
      }

      const data = await response.json();
      const assistantContent = data.choices[0].message.content;
      
      // Check for actions in the content
      if (assistantContent.includes('[ACTION:CLEAR_CART]')) {
        handleAction('CLEAR_CART');
      }
      if (assistantContent.includes('[ACTION:GO_TO_CHECKOUT]')) {
        handleAction('GO_TO_CHECKOUT');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err: any) {
      console.error('Groq Error:', err);
      const fallbackContent = localSearchFallback(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackContent }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (productId: number) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      setAddedItems(prev => [...prev, productId]);
      setTimeout(() => {
        setAddedItems(prev => prev.filter(id => id !== productId));
      }, 2000);
    }
  };

  const renderMessageContent = (content: string) => {
    // Clean tags for display
    let displayContent = content.replace(/\[ACTION:.*?\]/g, '');
    
    // Split content by product ID tags [ID:12345], branch [BRANCH:Name], and order [ORDER:ID]
    const parts = displayContent.split(/(\[ID:\d+\]|\[BRANCH:.*?\]|\[ORDER:.*?\])/g);
    
    return (
      <div className="message-text">
        {parts.map((part, index) => {
          // Product ID Match
          const productMatch = part.match(/\[ID:(\d+)\]/);
          if (productMatch) {
            const productId = parseInt(productMatch[1]);
            const product = allProducts.find(p => p.id === productId);
            if (!product) return null;

            return (
              <div key={index} className="chat-product-card">
                <img src={product.image} alt={product.name} />
                <div className="chat-product-info">
                  <span className="name">{product.name}</span>
                  <span className="price">{product.price.toLocaleString()} RWF</span>
                </div>
                <button 
                  onClick={() => handleAddToCart(productId)}
                  className={`chat-add-btn ${addedItems.includes(productId) ? 'added' : ''}`}
                >
                  {addedItems.includes(productId) ? <Check size={14} /> : <Plus size={14} />}
                </button>
              </div>
            );
          }

          // Branch Match
          const branchMatch = part.match(/\[BRANCH:(.*?)\]/);
          if (branchMatch) {
            const branchName = branchMatch[1].trim();
            const branch = branches.find(b => b.name.includes(branchName) || branchName.includes(b.name));
            if (!branch) return null;

            return (
              <div key={index} className="chat-info-card branch">
                <MapPin size={18} className="card-icon" />
                <div className="card-content">
                  <span className="title">{branch.name}</span>
                  <span className="subtitle">Official Simba Supermarket Branch</span>
                </div>
              </div>
            );
          }

          // Order Match
          const orderMatch = part.match(/\[ORDER:(.*?)\]/);
          if (orderMatch) {
            const orderId = orderMatch[1].trim();
            const transaction = transactions.find(t => t.id === orderId);
            if (!transaction) return null;

            return (
              <div key={index} className="chat-info-card order">
                <Package size={18} className="card-icon" />
                <div className="card-content">
                  <span className="title">Order {transaction.id}</span>
                  <span className={`status-badge ${transaction.status}`}>{transaction.status.toUpperCase()}</span>
                  <span className="subtitle">Total: {transaction.total.toLocaleString()} RWF</span>
                </div>
              </div>
            );
          }

          // Simple Markdown bolding
          const boldParts = part.split(/(\*\*.*?\*\*)/g);
          return (
            <span key={index}>
              {boldParts.map((bp, i) => {
                if (bp.startsWith('**') && bp.endsWith('**')) {
                  return <strong key={i}>{bp.slice(2, -2)}</strong>;
                }
                return bp;
              })}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="groq-overlay" onClick={onClose}>
      <div className="groq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="groq-header">
          <div className="groq-title">
            <div className="groq-bot-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>Simba AI</h3>
              <div className="groq-status">
                <span className="status-dot"></span>
                <span>Online & Ready</span>
              </div>
            </div>
          </div>
          <button className="groq-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="groq-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message-wrapper ${m.role}`}>
              <div className="message-bubble">
                {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="groq-error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="groq-input-container">
          <form className="groq-input-form" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask for products, recipes, or help..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <div className="groq-footer-hints">
            <button onClick={() => setInput('Find me some fresh fruits')}>🍎 Fruits</button>
            <button onClick={() => setInput('What is the status of my order?')}>📦 My Orders</button>
            <button onClick={() => setInput('Where is your City Center branch?')}>📍 Branches</button>
            <button onClick={() => setInput('Clear my shopping cart')}>🧹 Clear Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroqSearch;

