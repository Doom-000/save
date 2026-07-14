import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, BookOpen, Calculator, Volume2, Flame, Megaphone, Activity } from "lucide-react";
import { ContentCard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HeroSpotlightProps {
  cards: ContentCard[];
  onCardClick: (card: ContentCard) => void;
}

export default function HeroSpotlight({ cards, onCardClick }: HeroSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // We select 3 highly premium spotlight cards for the top rotating carousel
  const spotlightIds = ["e5-1", "sh-1", "ga-1"];
  const spotlightCards = cards.filter((c) => spotlightIds.includes(c.id));

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % spotlightCards.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [spotlightCards.length]);

  if (spotlightCards.length === 0) return null;
  const currentCard = spotlightCards[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + spotlightCards.length) % spotlightCards.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % spotlightCards.length);
  };

  // Get icons and specific themes per spotlight domain
  const getDomainStyle = (channelId: string) => {
    switch (channelId) {
      case "exit-five":
        return {
          icon: <Megaphone className="h-4 w-4 text-amber-400" />,
          glow: "from-amber-600/20 via-amber-900/10 to-black/90",
          border: "border-amber-500/20",
          textAccent: "text-amber-400",
          actionBtn: "bg-amber-500 hover:bg-amber-400 text-black",
          badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          tagBg: "bg-amber-500/5 text-amber-300 border-amber-500/10",
        };
      case "seattle-hoops":
        return {
          icon: <Flame className="h-4 w-4 text-emerald-400" />,
          glow: "from-emerald-600/20 via-emerald-900/10 to-black/90",
          border: "border-emerald-500/20",
          textAccent: "text-emerald-400",
          actionBtn: "bg-emerald-500 hover:bg-emerald-400 text-black",
          badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          tagBg: "bg-emerald-500/5 text-emerald-300 border-emerald-500/10",
        };
      case "gotham-athlete":
        return {
          icon: <Activity className="h-4 w-4 text-teal-400" />,
          glow: "from-teal-600/20 via-teal-900/10 to-black/90",
          border: "border-teal-500/20",
          textAccent: "text-teal-400",
          actionBtn: "bg-teal-500 hover:bg-teal-400 text-black",
          badgeBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
          tagBg: "bg-teal-500/5 text-teal-300 border-teal-500/10",
        };
      default:
        return {
          icon: <BookOpen className="h-4 w-4 text-white" />,
          glow: "from-white/10 to-black/90",
          border: "border-white/20",
          textAccent: "text-white",
          actionBtn: "bg-white hover:bg-white/80 text-black",
          badgeBg: "bg-white/10 text-white",
          tagBg: "bg-white/5 text-white/70",
        };
    }
  };

  const style = getDomainStyle(currentCard.channelId);

  return (
    <section className="relative w-full px-4 sm:px-8 lg:px-10 py-6 max-w-7xl mx-auto animate-fade-in" id="hero-spotlight-section">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl h-[320px] md:h-[280px]">
        
        {/* Glow ambient backdrops */}
        <div className={`absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10 transition-all duration-1000`} />
        
        {/* Unsplash Background Cover (Vibrant Architecture/Abstract overlay) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1024&h=288&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0"></div>

        {/* Cinematic Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 z-0" />

        {/* Dynamic slides animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-20"
          >
            
            {/* Tag/Domain Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-600 text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase text-white shadow-md shadow-emerald-500/10">
                Featured Channel
              </span>
              <span className="text-xs text-gray-300 font-bold select-none">• {currentCard.channelId.replace("-", " ")}</span>
            </div>

            {/* Main title */}
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mb-2">
              {currentCard.title}
            </h2>

            {/* Description */}
            <p className="font-sans text-xs text-gray-300 max-w-xl mb-4 leading-relaxed line-clamp-2">
              {currentCard.description}
            </p>

            {/* Core Card Stats & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-1 border-t border-white/5 pt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCardClick(currentCard)}
                  className="bg-emerald-600 text-white px-5 py-2 rounded font-bold text-xs hover:bg-emerald-500 transition-all uppercase tracking-wider"
                >
                  Enter Channel
                </button>
                <button
                  onClick={() => onCardClick(currentCard)}
                  className="bg-white/5 backdrop-blur-md text-gray-300 px-5 py-2 rounded font-bold text-xs border border-white/10 hover:bg-white/10 transition-all uppercase tracking-wider"
                >
                  View Roadmap
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-4 font-mono text-[9px] text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">AUTHOR:</span>
                  <span className="text-white font-semibold">{currentCard.author.toUpperCase()}</span>
                </div>
                <span>•</span>
                <div>{currentCard.readTime.toUpperCase()}</div>
                <span>•</span>
                <div>
                  <span className="text-gray-500">DIFFICULTY:</span>{" "}
                  <span className="text-emerald-400 font-bold">{currentCard.difficulty.toUpperCase()}</span>
                </div>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Slide controller buttons */}
        <div className="absolute right-6 bottom-6 flex items-center gap-2 z-30">
          <button
            onClick={handlePrev}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-black/60 text-white hover:border-white/25 hover:bg-black/80 transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex gap-1 px-1">
            {spotlightCards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1 transition-all duration-300 rounded-sm ${
                  activeIndex === idx ? "w-4 bg-emerald-400" : "w-1 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-black/60 text-white hover:border-white/25 hover:bg-black/80 transition-all active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
