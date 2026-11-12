import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import "./ChatBot.css";

const QUICK_REPLIES = [
  "⚡ Best phones",
  "💻 Laptop deals",
  "🎧 Headphones",
  "💰 Under Rs.50,000",
  "📦 Track my order",
  "↩️ Return policy",
];

// Auto-reply keywords — instant response without API call
const AUTO_REPLIES = {
  hello: "👋 Hey there! Welcome to ElectroMart! How can I help you today? You can ask me about products, prices, orders, or anything else!",
  hi: "👋 Hi! Great to see you at ElectroMart! What are you looking for today?",
  "how are you": "I'm doing great and ready to help you find the perfect electronics! 😄 What are you looking for?",
  thanks: "You're welcome! 😊 Feel free to ask if you need anything else!",
  "thank you": "You're welcome! 😊 Happy shopping at ElectroMart!",
  bye: "Goodbye! 👋 Come back anytime. Happy shopping at ElectroMart!",
  shipping: "🚚 ElectroMart offers fast delivery across Sri Lanka! Standard delivery takes 2-3 business days. Express delivery is available for next-day delivery in Colombo.",
  delivery: "🚚 We deliver across Sri Lanka! Standard: 2-3 business days. Express: next-day in Colombo. Free delivery on orders above Rs.10,000!",
  return: "↩️ Our return policy: You can return any product within 7 days of delivery if it's defective or not as described. Contact us at contact page for returns.",
  refund: "💳 Refunds are processed within 5-7 business days after we receive the returned item. Amount will be credited to your original payment method.",
  payment: "💳 We accept Credit/Debit cards, Bank transfers, and Cash on Delivery. All payments are 100% secure!",
  warranty: "🛡️ All products come with manufacturer warranty. Electronics typically have 1 year warranty. Check individual product pages for specific warranty details.",
  contact: "📞 You can reach us through our Contact page. Our team is available Mon-Sat, 9AM-6PM. We typically respond within 2-4 hours!",
  discount: "🏷️ Check our Products page for current deals! We regularly offer discounts on top brands. You can also ask me for budget-specific recommendations!",
  offer: "🏷️ We have great deals available! Tell me your budget and I'll find the best products for you!",
};

const WELCOME_MESSAGE = {
  id: 1,
  role: "bot",
  text: "⚡ Welcome to ElectroMart! I'm ElectroBot, your personal electronics assistant!\n\nI can help you:\n• Find the perfect product for your budget\n• Compare products and features\n• Answer questions about orders & delivery\n• Guide you through our store\n\nWhat are you looking for today?",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getAutoReply = (text) => {
    const lower = text.toLowerCase();
    for (const keyword of Object.keys(AUTO_REPLIES)) {
      if (lower.includes(keyword)) {
        return AUTO_REPLIES[keyword];
      }
    }
    return null;
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isTyping) return;

    setInput("");
    const userMsg = { id: Date.now(), role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    // Check auto-reply first
    const autoReply = getAutoReply(userText);
    if (autoReply) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "bot", text: autoReply },
        ]);
      }, 500);
      return;
    }

    // Call AI API
    setIsTyping(true);
    try {
      const res = await API.post("/api/ai/chat", {
        message: userText,
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: res.data.response },
      ]);
    } catch (err) {
      console.error("ChatBot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: `⚠️ AI connection error: ${err.response?.status ? 'HTTP ' + err.response.status : (err.code || err.message)}. Please check if ai-service is running.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">⚡</div>
            <div className="chatbot-header-info">
              <h4>ElectroBot</h4>
              <span>
                <span className="online-dot"></span> Online — here to help
              </span>
            </div>
            <button className="chatbot-header-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.role === "user" ? "user" : "bot"}`}
              >
                {msg.role === "bot" && (
                  <div className="message-avatar">⚡</div>
                )}
                {msg.role === "user" && (
                  <div className="message-avatar user-avatar">👤</div>
                )}
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="message-avatar">⚡</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="chatbot-quick-replies">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                className="quick-reply-btn"
                onClick={() => sendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask me anything about electronics..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={isTyping}
            >
              <svg viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button — Electric bolt icon */}
      <button className="chatbot-toggle-btn" onClick={handleOpen}>
        <span className="chatbot-pulse"></span>
        {isOpen ? (
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          // Electric bolt icon
          <svg viewBox="0 0 24 24">
            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
          </svg>
        )}
      </button>
    </div>
  );
}