import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, RefreshCw, AlertTriangle, User, BrainCircuit } from "lucide-react";
import { ContentCard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface AICoPilotProps {
  isOpen: boolean;
  onClose: () => void;
  activeChannelId: "exit-five" | "seattle-hoops" | "gotham-athlete";
  activeCard: ContentCard | null;
}

export default function AICoPilot({ isOpen, onClose, activeChannelId, activeCard }: AICoPilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your **Grid & Channel Co-pilot**. Ask me to curate strategic templates, calibrate workout intensities, or provide insights about Seattle hoops!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          channelContext: activeChannelId,
          currentCard: activeCard,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.text }]);
        if (data.warning) {
          setWarning(data.warning);
        } else {
          setWarning(null);
        }
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.error("Co-pilot chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I ran into a connection error. Please make sure the dev server is active and running correctly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendedPrompt = async (promptText: string) => {
    setInput(promptText);
  };

  const recommendedPrompts = {
    "exit-five": [
      "Generate an outbound email follow-up hook.",
      "Explain April Dunford's 5 positioning rules.",
    ],
    "seattle-hoops": [
      "Provide Sonics KeyArena architectural details.",
      "Explain Gary Payton's 1996 defensive stats.",
    ],
    "gotham-athlete": [
      "Calculate 40/35/25 macro split for 80kg mass.",
      "Structure a desk posture relief protocol.",
    ],
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 right-0 bottom-0 z-30 w-full sm:w-96 border-l border-white/10 bg-[#050b06] shadow-2xl backdrop-blur-md flex flex-col justify-between"
          id="ai-copilot-panel"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#040905]">
            <div className="flex items-center gap-2">
              <div className="rounded bg-emerald-500/10 p-1.5 border border-emerald-500/20">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-black uppercase tracking-wider text-white">AI Curator Co-pilot</h3>
                <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                  Assisting: {activeChannelId.replace("-", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded bg-white/5 p-1 text-white/50 hover:bg-white/10 hover:text-white border border-white/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Warning Banner for missing GEMINI_API_KEY */}
          {warning && (
            <div className="bg-amber-500/5 border-b border-amber-500/10 px-4 py-2 flex gap-2 items-start text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="font-sans text-[9px] leading-relaxed">
                <span className="font-bold">Offline Preview Mode:</span> Add <code className="font-mono bg-white/5 px-1 py-0.2 rounded">GEMINI_API_KEY</code> to the secrets panel in the AI Studio sidebar to unlock real-time Gemini intelligence.
              </div>
            </div>
          )}

          {/* Message Thread Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`rounded p-1 shrink-0 ${msg.sender === "user" ? "bg-white/10 border border-white/10" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                  {msg.sender === "user" ? <User className="h-3 w-3 text-white" /> : <BrainCircuit className="h-3 w-3 text-emerald-400" />}
                </div>

                <div className={`rounded border px-3 py-2 text-xs font-sans leading-relaxed max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-[#07140b]/65 border-white/10 text-gray-300"
                }`}>
                  {/* Clean scannable markdown rendering */}
                  {msg.text.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("###")) {
                      return <h4 key={pIdx} className="font-display font-semibold text-white mt-2 mb-1">{para.replace("###", "").trim()}</h4>;
                    }
                    if (para.match(/^\d+\./)) {
                      return (
                        <ol key={pIdx} className="list-decimal pl-4 space-y-1 mt-1 text-white/80">
                          {para.split("\n").map((item, i) => (
                            <li key={i}>{item.replace(/^\d+\.\s*/, "").trim()}</li>
                          ))}
                        </ol>
                      );
                    }
                    if (para.startsWith("*")) {
                      return (
                        <ul key={pIdx} className="list-disc pl-4 space-y-1 mt-1 text-white/80">
                          {para.split("\n").map((item, i) => (
                            <li key={i}>{item.replace("*", "").trim()}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Simple inline bolding replaces **word** with <strong>word</strong>
                    const renderedText = para.split("**").map((chunk, cIdx) => {
                      return cIdx % 2 === 1 ? <strong key={cIdx} className="font-semibold text-lime-400">{chunk}</strong> : chunk;
                    });
                    return <p key={pIdx} className="mb-1">{renderedText}</p>;
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-white/40 font-mono text-[9px] tracking-widest uppercase">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                <span>Curating...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions & Prompt Input */}
          <div className="p-4 border-t border-white/5 bg-black/60">
            {/* Context recommendations prompts */}
            <div className="mb-3 space-y-1.5">
              <span className="font-display text-[8px] font-bold tracking-widest uppercase text-white/35">
                Suggested Curation
              </span>
              <div className="flex flex-col gap-1">
                {recommendedPrompts[activeChannelId].map((p, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => loadRecommendedPrompt(p)}
                    className="text-left font-sans text-[10px] text-gray-400 hover:text-white bg-white/2 hover:bg-white/5 border border-white/10 rounded py-1 px-2.5 truncate transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask Co-pilot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full rounded border border-white/10 bg-white/5 py-2 pr-12 pl-3 text-xs font-sans text-white placeholder-gray-500 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
