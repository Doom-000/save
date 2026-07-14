import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Star, BookOpen, Volume2, Flame, RefreshCw, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Channel, ContentCard, UserProfile } from "../types";
import { motion } from "motion/react";

interface ChannelRowProps {
  channel: Channel;
  cards: ContentCard[];
  userProfile: any;
  onCardClick: (card: ContentCard) => void;
  onToggleFavorite: (id: string) => void;
  key?: any;
}

export default function ChannelRow({
  channel,
  cards,
  userProfile,
  onCardClick,
  onToggleFavorite,
}: ChannelRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });

      setShowLeftArrow(targetScroll > 10);
    }
  };

  const checkScrollState = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 10);
    }
  };

  // Icon selector based on type
  const getCardIcon = (type: string) => {
    switch (type) {
      case "podcast":
        return <Volume2 className="h-3.5 w-3.5" />;
      case "template":
        return <RefreshCw className="h-3.5 w-3.5 text-amber-400" />;
      case "merch":
        return <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-lime-400" />;
    }
  };

  const getIndicatorColor = (id: string) => {
    switch (id) {
      case "exit-five": return "bg-emerald-500";
      case "seattle-hoops": return "bg-lime-400";
      case "gotham-athlete": return "bg-teal-400";
      default: return "bg-emerald-600";
    }
  };

  return (
    <div className="relative border-b border-white/10 py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto" id={`channel-row-${channel.id}`}>
      
      {/* Channel Information Header wrapped in a beautiful, structured glass layer */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-emerald-500/10 bg-gradient-to-r from-[#07140b]/40 to-[#050b06]/40 backdrop-blur-sm shadow-inner shadow-white/5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`w-1.5 h-4.5 ${getIndicatorColor(channel.id)} rounded-full`} />
            <h3 className="font-sans text-sm sm:text-base font-black tracking-tight text-white uppercase">
              {channel.name}
            </h3>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] font-bold text-lime-400 border border-emerald-500/20 uppercase tracking-widest">
              {channel.domain}
            </span>
          </div>
          <p className="font-sans text-xs text-gray-300 font-medium">{channel.tagline}</p>
        </div>
        <p className="max-w-md font-sans text-xs text-gray-400 md:text-right leading-relaxed border-l md:border-l-0 md:border-r border-white/10 pl-3 md:pl-0 md:pr-4">
          {channel.description}
        </p>
      </div>

      {/* Sliding Lanes Container */}
      <div className="relative group/row">
        
        {/* Left Scroll Navigation Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute top-1/2 left-0 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded border border-white/10 bg-black/80 text-white shadow-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all hover:border-white/25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right Scroll Navigation Button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute top-1/2 right-0 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded border border-white/10 bg-black/80 text-white shadow-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all hover:border-white/25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Cards Row Carousel */}
        <div
          ref={rowRef}
          onScroll={checkScrollState}
          className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth pr-10"
        >
          {cards.map((card) => {
            const isSaved = userProfile.savedIds.includes(card.id);
            const isCompleted = userProfile.completedIds.includes(card.id);

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group relative min-w-[240px] max-w-[240px] sm:min-w-[260px] sm:max-w-[260px] rounded-xl bg-gradient-to-b from-[#07140b]/90 to-[#040905]/95 border border-white/10 p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-emerald-500/5 cursor-pointer flex flex-col justify-between shadow-lg"
                onClick={() => onCardClick(card)}
              >
                
                <div>
                  {/* Category badge & Heart favorites checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[8px] font-bold text-lime-400 border border-emerald-500/20 tracking-wider uppercase">
                      {card.badge || card.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(card.id);
                      }}
                      className={`rounded-lg p-1 border transition-all duration-300 ${
                        isSaved
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                          : "border-white/10 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} />
                    </button>
                  </div>

                  {/* Card Title */}
                  <h4 className="font-sans text-sm font-bold tracking-tight text-white line-clamp-1 group-hover:text-lime-300 transition-colors duration-300">
                    {card.title}
                  </h4>

                  {/* Card Description */}
                  <p className="font-sans text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card footer details layer: Structured metadata bar for extreme readability */}
                <div className="mt-5 p-2 px-3 rounded-lg border border-white/5 bg-black/40 group-hover:bg-black/60 group-hover:border-emerald-500/10 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[8px] text-gray-400 uppercase tracking-wider">
                    {getCardIcon(card.type)}
                    <span className="font-semibold text-white/75">{card.readTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[8px] font-bold font-mono text-lime-400 bg-lime-500/10 border border-lime-500/20 px-1.5 py-0.5 rounded">
                        DONE
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] text-gray-400 font-bold border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
                        {card.difficulty.toUpperCase()}
                      </span>
                    )}

                    {card.rating && (
                      <div className="flex items-center gap-0.5 font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                        <span>{card.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
