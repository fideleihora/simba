import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Search, Loader2, MessageSquare, User } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import './GroqSearch.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GroqSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroqSearch: React.FC<GroqSearchProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Simba AI assistant. I can help you find products, suggest recipes, or answer questions about our supermarket. What are you looking for today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useProducts();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulated Groq API logic
    // In a real app, you'd call Groq API here
    setTimeout(() => {
      const lowerInput = userMessage.toLowerCase();
      let response = '';

      // Simple keyword matching for demo purposes
      if (lowerInput.includes('find') || lowerInput.includes('search') || lowerInput.includes('looking for')) {
        const found = products.filter(p => 
          lowerInput.includes(p.name.toLowerCase()) || 
          lowerInput.includes(p.category.toLowerCase())
        ).slice(0, 3);

        if (found.length > 0) {
          response = `I found some items for you: ${found.map(p => p.name).join(', ')}. Would you like me to add them to your cart?`;
        } else {
          response = "I couldn't find exactly that, but we have many similar items in our fresh produce and grocery sections. Try searching for specific categories like 'Cosmetics' or 'Baby Products'.";
        }
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = "Hi there! How can I assist you with your shopping at Simba today?";
      } else {
        response = "That's interesting! As your Simba AI, I can help you navigate our aisles or find the best deals. Feel free to ask about our branches or current promotions!";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="groq-overlay" onClick={onClose}>
      <div className="groq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="groq-header">
          <div className="groq-title">
            <div className="groq-bot-icon">
              <Bot size={24} />
            </div>
            <div>
              <h3>Simba AI Search</h3>
              <span>Powered by Groq</span>
            </div>
          </div>
          <button className="groq-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="groq-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message-wrapper ${m.role}`}>
              <div className="message-avatar">
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-bubble">
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-bubble loading">
                <Loader2 size={16} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="groq-input-area" onSubmit={handleSend}>
          <div className="input-container">
            <Sparkles size={18} className="sparkle-icon" />
            <input 
              type="text" 
              placeholder="Ask me anything... (e.g. Find me a heater)" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <Send size={20} />
            </button>
          </div>
        </form>

        <div className="groq-footer-hints">
          <div className="hint-item"><Search size={12} /> Search Products</div>
          <div className="hint-item"><MessageSquare size={12} /> Get Suggestions</div>
          <div className="hint-item"><Sparkles size={12} /> AI Powered</div>
        </div>
      </div>
    </div>
  );
};

export default GroqSearch;
