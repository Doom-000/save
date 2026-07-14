import { useState, useEffect } from "react";
import { X, Play, Pause, Heart, CheckCircle2, Clock, Volume2, Calendar, Star, Trophy, ShoppingCart, Info, Check } from "lucide-react";
import { ContentCard, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DetailModalProps {
  card: ContentCard | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onSaveWorkbookAnswers: (cardId: string, answers: Record<string, string>) => void;
  onAddToCart: (item: { id: string; name: string; price: string; size: string }) => void;
}

export default function DetailModal({
  card,
  isOpen,
  onClose,
  userProfile,
  onToggleFavorite,
  onToggleCompleted,
  onSaveWorkbookAnswers,
  onAddToCart,
}: DetailModalProps) {
  if (!card) return null;

  const isSaved = userProfile.savedIds.includes(card.id);
  const isCompleted = userProfile.completedIds.includes(card.id);

  // Podcast state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(12); // Simulated seconds
  const [podcastDuration, setPodcastDuration] = useState(1800); // 30 minutes in seconds

  // Workout stopwatch timer
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds

  // Workbook answers state
  const [workbookInputs, setWorkbookInputs] = useState<Record<string, string>>(() => {
    return userProfile.notes[card.id] ? JSON.parse(userProfile.notes[card.id]) : {};
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Apparel Store state
  const [selectedSize, setSelectedSize] = useState("");
  const [activeMerchIdx, setActiveMerchIdx] = useState(0);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Reset states on card switch
  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(12);
    setTimerActive(false);
    setTimeRemaining(card.id === "ga-1" ? 900 : card.id === "ga-4" ? 480 : 600);
    setWorkbookInputs(userProfile.notes[card.id] ? JSON.parse(userProfile.notes[card.id]) : {});
    setSaveStatus("idle");
    setSelectedSize("");
    setActiveMerchIdx(0);
    setCartSuccess(false);
  }, [card.id]);

  // Podcast ticking simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && card.type === "podcast") {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= podcastDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, card.type]);

  // Workout stopwatch countdown timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && card.channelId === "gotham-athlete" && (card.type === "workout" || card.type === "template")) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, card.channelId, card.type]);

  // Formatter for seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleWorkbookSave = (e: any) => {
    e.preventDefault();
    setSaveStatus("saving");
    setTimeout(() => {
      onSaveWorkbookAnswers(card.id, workbookInputs);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  const handleWorkbookChange = (key: string, val: string) => {
    setWorkbookInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddToCartSubmit = () => {
    const merchItem = card.merchItems?.[activeMerchIdx];
    if (!merchItem) return;

    const size = selectedSize || merchItem.sizes[0] || "One Size";
    onAddToCart({
      id: `${merchItem.id}-${size}`,
      name: `${merchItem.name} (${size})`,
      price: merchItem.price,
      size: size,
    });

    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" id={`detail-modal-${card.id}`}>
          
          {/* Blur black backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Core detail card workspace */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden rounded-xl border border-white/10 bg-[#050b06] shadow-2xl"
          >
            
            {/* LEFT / TOP SPLIT: The Content Reader & Visual Layout */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
              <div>
                {/* Meta details */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[9px] font-bold text-white/50 border border-white/10 uppercase tracking-widest">
                    {card.badge || card.type}
                  </span>
                  <span className="font-mono text-[9px] text-white/30">•</span>
                  <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{card.readTime}</span>
                </div>

                {/* Primary Titles */}
                <h2 className="font-display text-xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-3">
                  {card.title}
                </h2>

                <p className="font-sans text-xs md:text-sm text-white/50 leading-relaxed mb-8">
                  {card.description}
                </p>

                {/* Full, Curated Markdown-like Article Body */}
                {card.fullContent && (
                  <div className="font-sans text-xs text-white/70 leading-relaxed space-y-4 prose prose-invert">
                    {card.fullContent.split("\n\n").map((para, idx) => {
                      if (para.startsWith("###")) {
                        return (
                          <h3 key={idx} className="font-display text-base font-bold text-white pt-4 pb-1">
                            {para.replace("###", "").trim()}
                          </h3>
                        );
                      }
                      if (para.startsWith("####")) {
                        return (
                          <h4 key={idx} className="font-display text-sm font-semibold text-white/90 pt-2">
                            {para.replace("####", "").trim()}
                          </h4>
                        );
                      }
                      if (para.startsWith("*")) {
                        return (
                          <ul key={idx} className="list-disc pl-5 space-y-1 text-white/60">
                            {para.split("\n").map((item, i) => (
                              <li key={i}>{item.replace("*", "").trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (para.startsWith("1.")) {
                        return (
                          <ol key={idx} className="list-decimal pl-5 space-y-1.5 text-white/60">
                            {para.split("\n").map((item, i) => (
                              <li key={i}>{item.replace(/^\d+\.\s*/, "").trim()}</li>
                            ))}
                          </ol>
                        );
                      }
                      return <p key={idx}>{para}</p>;
                    })}
                  </div>
                )}
              </div>

              {/* Progress & Favorites Control Bar */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => onToggleFavorite(card.id)}
                  className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-bold transition-all ${
                    isSaved
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} />
                  <span>{isSaved ? "Saved to Shelf" : "Save to Shelf"}</span>
                </button>

                <button
                  onClick={() => onToggleCompleted(card.id)}
                  className={`flex items-center gap-1.5 rounded border px-4 py-1.5 text-xs font-bold transition-all ${
                    isCompleted
                      ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isCompleted ? "Mark as Unfinished" : "Mark as Completed"}</span>
                </button>
              </div>

            </div>

            {/* RIGHT / BOTTOM SPLIT: Interactive Module Panels (Timers, Inputs, Players) */}
            <div className="w-full md:w-80 bg-white/[0.01] p-6 md:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar border-t md:border-t-0 border-white/5">
              
              {/* Close Button top-right */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="rounded-full bg-white/5 p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  id="modal-close-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* INTERACTIVE MODULE TYPE 1: PODCAST PLAYER */}
              {card.type === "podcast" && (
                <div className="flex-1 flex flex-col justify-center items-center py-6" id="interactive-podcast-module">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-950 p-[1.5px] mb-6 shadow-lg shadow-emerald-500/10">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-black">
                      <Volume2 className="h-8 w-8 text-emerald-400" />
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white text-center leading-tight mb-1">
                    {card.title.replace("Podcast:", "")}
                  </h3>
                  <p className="font-sans text-[10px] text-white/40 text-center uppercase tracking-widest mb-6">
                    {card.author}
                  </p>

                  {/* Wave Equalizer visualization, active only during playback */}
                  <div className="flex items-end justify-center gap-1 h-10 w-full mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                      const delays = ["0.1s", "0.4s", "0.2s", "0.6s", "0.3s", "0.5s", "0.7s", "0.2s", "0.4s", "0.1s"];
                      return (
                        <div
                          key={bar}
                          className={`w-1 rounded-full bg-emerald-500 ${isPlaying ? "wave-bar" : "h-1.5"}`}
                          style={{
                            height: isPlaying ? "100%" : "6px",
                            animationDelay: delays[bar - 1],
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Progress Timeline Slider bar */}
                  <div className="w-full px-2 mb-4">
                    <div className="relative h-1 w-full bg-white/10 rounded-full cursor-pointer">
                      <div
                        className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(audioProgress / podcastDuration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px] text-white/35 mt-2">
                      <span>{formatTime(audioProgress)}</span>
                      <span>{formatTime(podcastDuration)}</span>
                    </div>
                  </div>

                  {/* Play Controller */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                  </button>
                </div>
              )}

              {/* INTERACTIVE MODULE TYPE 2: WORKOUT COUNTDOWN TIMER */}
              {(card.type === "workout" || card.id === "ga-4") && (
                <div className="flex-1 flex flex-col justify-center items-center py-6" id="interactive-timer-module">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-lime-950 p-[1.5px] mb-6 shadow-lg shadow-emerald-500/10">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-black">
                      <span className="font-mono text-lg font-bold text-emerald-400">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white text-center leading-tight mb-1">
                    Metabolic Counter Active
                  </h3>
                  <p className="font-sans text-[10px] text-white/40 text-center uppercase tracking-widest mb-6">
                    {card.title}
                  </p>

                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                    >
                      {timerActive ? "Pause Countdown" : "Begin Countdown"}
                    </button>
                    <button
                      onClick={() => {
                        setTimerActive(false);
                        setTimeRemaining(card.id === "ga-1" ? 900 : 480);
                      }}
                      className="rounded-xl border border-white/5 bg-white/5 text-white/50 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition-all"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 w-full">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Trophy className="h-4 w-4" />
                      <span className="font-display text-xs font-semibold uppercase tracking-wider">NYC Streak Goals</span>
                    </div>
                    <p className="font-sans text-[10px] text-white/50 leading-relaxed">
                      Complete this circuit and mark it as finished to increment your athletic daily streak metrics.
                    </p>
                  </div>
                </div>
              )}

              {/* INTERACTIVE MODULE TYPE 3: STRATEGIC WORKBOOK (B2B SaaS Templates) */}
              {card.type === "template" && card.workbookQuestions && (
                <form onSubmit={handleWorkbookSave} className="flex-1 flex flex-col justify-between" id="interactive-workbook-module">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 mb-2 border-b border-white/5 pb-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-display text-[10px] font-bold text-white uppercase tracking-wider">
                        Interactive Workbook Sheets
                      </span>
                    </div>

                    {card.workbookQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <label className="font-sans text-[10px] font-medium text-white/60">
                          {q.q}
                        </label>
                        <textarea
                          rows={2}
                          placeholder={q.placeholder}
                          value={workbookInputs[idx] || ""}
                          onChange={(e) => handleWorkbookChange(idx.toString(), e.target.value)}
                          className="w-full rounded border border-white/10 bg-white/5 p-2.5 text-xs font-sans text-white placeholder-gray-500 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className="w-full mt-6 rounded bg-emerald-600 text-white py-2.5 text-xs font-bold hover:bg-emerald-500 transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15"
                  >
                    {saveStatus === "saving" && <span>Saving Playbook...</span>}
                    {saveStatus === "saved" && (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        <span>Saved to Profile</span>
                      </>
                    )}
                    {saveStatus === "idle" && <span>Lock in Strategic Answers</span>}
                  </button>
                </form>
              )}

              {/* INTERACTIVE MODULE TYPE 4: MERCHANDISING STORE (Sonics apparel) */}
              {card.type === "merch" && card.merchItems && (
                <div className="flex-1 flex flex-col justify-between" id="interactive-store-module">
                  <div>
                    <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-display text-[10px] font-bold text-white uppercase tracking-wider">
                        Seattle Fans Shop Drop
                      </span>
                    </div>

                    {/* Merch slider / list toggles */}
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                      {card.merchItems.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveMerchIdx(idx);
                            setSelectedSize("");
                          }}
                          className={`flex items-center justify-between rounded p-2 cursor-pointer border transition-all ${
                            activeMerchIdx === idx
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-white/5 bg-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.image}</span>
                            <span className="font-sans text-xs font-semibold text-white truncate max-w-[130px]">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-semibold text-emerald-400">
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Size list selector */}
                    <div className="space-y-2">
                      <label className="font-sans text-[10px] font-semibold text-white/60">
                        Select Vintage Size
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {card.merchItems[activeMerchIdx].sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`rounded border px-2.5 py-1 text-[10px] font-mono tracking-wider transition-all ${
                              (selectedSize || card.merchItems[activeMerchIdx].sizes[0]) === size
                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 font-semibold"
                                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCartSubmit}
                    className="w-full mt-6 rounded bg-emerald-600 text-white py-2.5 text-xs font-bold hover:bg-emerald-500 transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    {cartSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Secure Apparel Drop</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* General metadata fallback info */}
              {card.type === "article" && (
                <div className="flex-1 flex flex-col justify-end">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-lime-400 mb-2">
                      <Info className="h-4 w-4" />
                      <span className="font-display text-xs font-semibold uppercase tracking-wider">Curated Guide</span>
                    </div>
                    <p className="font-sans text-[10px] text-white/50 leading-relaxed mb-3">
                      This article is a part of the curated **{card.channelId.replace("-", " ")}** learning track.
                    </p>
                    <div className="flex items-center justify-between font-mono text-[9px] text-white/35 pt-2 border-t border-white/5">
                      <span>Rating: {card.rating || "5.0"}</span>
                      <span>{card.views || "1.5k views"}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
