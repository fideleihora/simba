import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Search, Loader2, MessageSquare, User, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import './GroqSearch.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

// In a real production app, NEVER expose your API key like this.
// For this project, we'll use a placeholder or check localStorage.
const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY') || '';

const GroqSearch: React.FC<GroqSearchProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Simba AI assistant. I have access to our entire product catalog. How can I help you find what you need today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { products } = useProducts();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!GROQ_API_KEY) {
      setError("Groq API Key not found. Please set VITE_GROQ_API_KEY in your .env file.");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare context: A simplified version of the catalog to save tokens
      const catalogContext = products.map(p => 
        `- ${p.name} (${p.category}): ${p.price} RWF, In Stock: ${p.inStock ? 'Yes' : 'No'}`
      ).join('\n');

      const systemMessage: Message = {
        role: 'system',
        content: `You are Simba Supermarket AI, a friendly and helpful Rwandese online supermarket assistant. 
        Your goal is to help users find products from our catalog and provide information.
        Use the following product catalog as your primary source of truth:
        
        ${catalogContext}
        
        Guidelines:
        1. Be polite, friendly and professional.
        2. If a product is mentioned, confirm if we have it and mention the price.
        3. If it's NOT in the catalog, politely say we don't carry it yet but suggest alternatives.
        4. Keep responses concise but helpful.
        5. Use Markdown for formatting (bold names, list prices).
        6. You can answer general grocery related questions too.`
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [systemMessage, ...newMessages.filter(m => m.role !== 'system')],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Groq');
      }

      const data = await response.json();
      const assistantContent = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err: any) {
      console.error('Groq API Error:', err);
      setError(err.message || "I'm having trouble connecting to my brain right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
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
              <h3>Simba AI Assistant</h3>
              <span>Powered by Llama 3.3 70B</span>
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
                <div className="message-text">{m.content}</div>
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
          {error && (
            <div className="groq-error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
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
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>

        <div className="groq-footer-hints">
          <div className="hint-item"><Search size={12} /> Search Catalog</div>
          <div className="hint-item"><MessageSquare size={12} /> Recipe Advice</div>
          <div className="hint-item"><Sparkles size={12} /> Smart Recommendations</div>
        </div>
      </div>
    </div>
  );
};

export default GroqSearch;
