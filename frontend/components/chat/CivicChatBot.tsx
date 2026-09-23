'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, RotateCcw, Minus, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm **CivicCare AI** — your assistant for civic facilities in Kochi.\n\nI have live data on nearby **public toilets** and **drinking water points**. Ask me about availability, conditions, how to report issues, or track your complaint.\n\nHow can I help you?",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  'Nearest clean water point',
  'Nearest public toilet',
  'Which facilities are clean?',
  'How to report a broken facility?',
  'Track my complaint ticket',
];

function RichText({ text }: { text: string }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={i}>{seg.slice(2, -2)}</strong>;
        }
        return seg.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </>
  );
}

export default function CivicCareAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: data.reply ?? 'Sorry, I could not fetch a response right now.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen || isMinimized) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Network error. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isOpen, isMinimized, userLocation]);

  const handleOpen = () => { setIsOpen(true); setIsMinimized(false); setHasUnread(false); };
  const handleClose = () => { setIsOpen(false); setIsMinimized(false); };
  const handleReset = () => { setMessages([WELCOME_MESSAGE]); setInput(''); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && (
        <button
          id="civiccare-ai-fab"
          onClick={handleOpen}
          aria-label="Open CivicCare AI"
          title="CivicCare AI"
          className="fixed bottom-6 right-6 z-50 group"
        >
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white font-black flex items-center justify-center z-10">
              !
            </span>
          )}
          <div className="w-14 h-14 rounded-full bg-[#3D1860] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#1a0b2e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg">
            CivicCare AI
          </span>
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          id="civiccare-ai-window"
          role="dialog"
          aria-label="CivicCare AI"
          className="fixed bottom-6 right-6 z-50 flex flex-col"
          style={{
            width: 'min(380px, calc(100vw - 1.5rem))',
            height: isMinimized ? 'auto' : 'min(560px, calc(100dvh - 5rem))',
          }}
        >
          <div className="flex flex-col h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">

            {/* Header */}
            <div className="flex-shrink-0 bg-[#3D1860] px-4 py-3 flex items-center gap-3">
              <div className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#3D1860]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">CivicCare AI</div>
                <div className="text-white/60 text-[11px]">Live civic data · Kochi</div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={handleReset} title="New conversation"
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMinimized(p => !p)} title={isMinimized ? 'Expand' : 'Minimise'}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleClose} title="Close"
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 bg-gray-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                      {/* Avatar */}
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#3D1860] flex items-center justify-center mt-0.5">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#3D1860] text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                      }`}>
                        <RichText text={msg.content} />
                        <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing */}
                  {isLoading && (
                    <div className="flex gap-2.5">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#3D1860] flex items-center justify-center mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-3.5 py-3 rounded-xl rounded-tl-sm bg-white border border-gray-200 shadow-sm flex items-center gap-1.5">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#3D1860] animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                        <span className="text-[11px] text-gray-400 ml-1">Checking live data…</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Quick questions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.map((p) => (
                        <button key={p} onClick={() => sendMessage(p)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[#3D1860] hover:bg-[#3D1860] hover:text-white hover:border-[#3D1860] transition-colors">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#3D1860] focus-within:ring-1 focus-within:ring-[#3D1860]/20 transition-all">
                    <input
                      ref={inputRef}
                      id="civiccare-ai-input"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about toilets, water points…"
                      disabled={isLoading}
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-50"
                    />
                    <button
                      id="civiccare-ai-send"
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      aria-label="Send"
                      className="w-7 h-7 rounded-md bg-[#3D1860] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#643579] transition-colors flex-shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                 
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
