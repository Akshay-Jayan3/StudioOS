"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: "Hi! I'm Nila from the studio. Tell me a bit about what you're looking to do with your space?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading || leadCaptured) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/lead-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
        if (json.leadCaptured) setLeadCaptured(true);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong on my end — mind trying that again?" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong on my end — mind trying that again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 sm:w-96 h-[28rem] bg-[#121212] border border-[rgba(212,175,55,0.25)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,175,55,0.15)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center text-xs font-bold text-black">N</div>
              <div>
                <p className="text-sm font-medium text-[#f6f3ee]">Nila</p>
                <p className="text-[10px] text-[#bdb8b0]">Nilaya Interiors</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#bdb8b0] hover:text-[#f6f3ee]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#d4af37] text-black"
                      : "bg-[#1c1c1c] text-[#f6f3ee] border border-[rgba(212,175,55,0.1)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1c1c1c] border border-[rgba(212,175,55,0.1)] rounded-xl px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#bdb8b0]" />
                </div>
              </div>
            )}
            {leadCaptured && (
              <div className="flex items-center gap-2 text-xs text-[#d4af37] justify-center py-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Got it — our team will reach out soon!
              </div>
            )}
          </div>

          {/* Input */}
          {!leadCaptured && (
            <div className="flex items-center gap-2 px-3 py-3 border-t border-[rgba(212,175,55,0.15)]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                placeholder="Type a message..."
                className="flex-1 bg-[#1c1c1c] text-sm text-[#f6f3ee] placeholder:text-[#6b6660] rounded-lg px-3 py-2 outline-none border border-[rgba(212,175,55,0.1)] focus:border-[rgba(212,175,55,0.4)]"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-[#d4af37] flex items-center justify-center text-black disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-[#d4af37] flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-black" />
        </button>
      )}
    </div>
  );
}
