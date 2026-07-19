import { useEffect, useRef, useState } from "react";
import { X, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import client from "../../api/client";

import { useChatWidget } from "../../context/ChatContext";

export default function ChatWidget() {
  const { isOpen, closeChat } = useChatWidget();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm Tareq - Let's talk. What do you want to know about me?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null); // set when bot needs contact info
  const [imageFile, setImageFile] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close on mobile back button
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ chatOpen: true }, "");
      const handlePop = () => closeChat();
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [isOpen, closeChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const sendMessage = async () => {
    if (!input.trim() && !imageFile) return;

    const userText = input.trim();
    const userMsg = { role: "user", content: userText, image: imageFile ? URL.createObjectURL(imageFile) : null };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let image_base64 = null;
      if (imageFile) {
        image_base64 = await fileToBase64(imageFile);
      }
      setImageFile(null);

      const history = messages
        .filter((m) => !m.image)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await client.post("/api/ai/chat", {
        message: userText,
        history,
        image_base64,
        pending_personal_question: pendingQuestion,
      });

      const data = res.data;

      if (data.rate_limited) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.awaiting_contact_info) {
        // remember the ORIGINAL question that triggered this, only set once
        setPendingQuestion((prev) => prev || userText);
      } else {
        setPendingQuestion(null);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong on my end. Try again in a bit!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl h-[85vh] md:h-[75vh] bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-accent/10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h3 className="font-display font-semibold text-text">talk with tareq.ai</h3>
              </div>
              <button onClick={closeChat} className="text-textDim hover:text-text">
                <X size={22} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-accent text-bg font-medium"
                        : "bg-surfaceHover text-text border border-border"
                    }`}
                  >
                    {m.image && (
                      <img src={m.image} alt="attachment" className="rounded-lg mb-2 max-h-40" />
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surfaceHover border border-border rounded-2xl px-4 py-2.5 text-textDim text-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 bg-bg/50">
              {imageFile && (
                <div className="mb-2 flex items-center gap-2 text-xs text-textDim">
                  <ImageIcon size={14} /> {imageFile.name}
                  <button onClick={() => setImageFile(null)} className="text-red-400 ml-1">✕</button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl border border-border text-textDim hover:text-accent hover:border-accent/40 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Tareq..."
                  className="flex-1 resize-none bg-surfaceHover border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-textDim focus:outline-none focus:border-accent/50"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="p-3 rounded-xl bg-accent text-bg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}