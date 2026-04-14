import { useState, useRef, useEffect } from "react";

function FitnessBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 💪 Main Tejas AI Fitness Coach hun!\n\nMujhse poochho:\n• Exercise tips 🏋️\n• Muscle pain solutions 💊\n• Diet & nutrition 🥗\n• Supplements 💉\n• Workout plans 📋\n• Weight loss/gain ⚖️\n\nKya jaanna chahte ho?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.log(err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oops! Kuch error aa gaya. Dobara try karo! 🙏"
      }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Chest pain after workout?",
    "Best protein diet?",
    "Beginner workout plan?",
    "Whey protein lena chahiye?",
    "Weight loss tips?",
    "Muscle gain kaise kare?",
  ];

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}
        style={{ position: "fixed", bottom: "24px", right: "24px", width: "56px", height: "56px", borderRadius: "50%", background: "#D85A30", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(216,90,48,0.4)", zIndex: 1000, fontSize: "24px" }}>
        {isOpen ? "✕" : "💬"}
      </div>

      {isOpen && (
        <div style={{ position: "fixed", bottom: "90px", right: "24px", width: "380px", height: "560px", background: "white", borderRadius: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "#D85A30", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🤖</div>
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "white", fontSize: "15px" }}>Tejas AI Coach</p>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
                Online — Fitness Expert
              </p>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "12px", color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
              <p style={{ margin: 0 }}>Powered by</p>
              <p style={{ margin: 0, fontWeight: "600" }}>Claude AI</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🤖</div>
                )}
                <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "#D85A30" : "#f5f5f5", color: msg.role === "user" ? "white" : "#333", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#D85A30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "white", flexShrink: 0 }}>
                    {JSON.parse(localStorage.getItem("user"))?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
                <div style={{ background: "#f5f5f5", padding: "12px 16px", borderRadius: "16px 16px 16px 4px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D85A30", animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => setInput(q)}
                  style={{ padding: "5px 10px", background: "#FAECE7", color: "#993C1D", border: "none", borderRadius: "20px", fontSize: "11px", cursor: "pointer", fontWeight: "500" }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Fitness question poochho..."
              style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #f0f0f0", borderRadius: "20px", fontSize: "13px", outline: "none", color: "#333" }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: loading || !input.trim() ? "#f0f0f0" : "#D85A30", color: loading || !input.trim() ? "#aaa" : "white", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

export default FitnessBot;