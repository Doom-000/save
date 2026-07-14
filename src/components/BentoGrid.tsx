import { useState } from "react";
import { Grid, Sparkles, Star, Heart, Volume2, BookOpen, RefreshCw, ShoppingBag, ListFilter, CheckCircle2 } from "lucide-react";
import { ContentCard, UserProfile } from "../types";
import { motion } from "motion/react";

interface BentoGridProps {
  cards: ContentCard[];
  userProfile: UserProfile;
  onCardClick: (card: ContentCard) => void;
  onToggleFavorite: (id: string) => void;
}

export default function BentoGrid({
  cards,
  userProfile,
  onCardClick,
  onToggleFavorite,
}: BentoGridProps) {
  const [channelFilter, setChannelFilter] = useState<"all" | "exit-five" | "seattle-hoops" | "gotham-athlete">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredCards = cards.filter((card) => {
    const matchesChannel = channelFilter === "all" || card.channelId === channelFilter;
    const matchesType = typeFilter === "all" || card.type === typeFilter;
    return matchesChannel && matchesType;
  });

  const uniqueTypes = ["all", ...Array.from(new Set(cards.map((c) => c.type)))];

  // Helper to assign asymmetric bento-grid classes to make it look highly stylized
  const getBentoClasses = (index: number) => {
    // We create a repetitive pattern of spans
    const idx = index % 6;
    switch (idx) {
      case 0:
        return "md:col-span-2 md:row-span-2 bg-gradient-to-br from-white/[0.03] to-white/[0.01]";
      case 1:
        return "md:col-span-1 md:row-span-2 bg-gradient-to-tr from-white/[0.03] to-white/[0.01]";
      case 2:
        return "md:col-span-1 md:row-span-1 bg-gradient-to-b from-white/[0.03] to-white/[0.01]";
      case 3:
        return "md:col-span-2 md:row-span-1 bg-gradient-to-r from-white/[0.03] to-white/[0.01]";
      case 4:
        return "md:col-span-1 md:row-span-2 bg-gradient-to-bl from-white/[0.03] to-white/[0.01]";
      case 5:
        return "md:col-span-1 md:row-span-1 bg-gradient-to-t from-white/[0.03] to-white/[0.01]";
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "podcast":
        return <Volume2 className="h-4 w-4 text-emerald-400" />;
      case "template":
        return <RefreshCw className="h-4 w-4 text-lime-400" />;
      case "merch":
        return <ShoppingBag className="h-4 w-4 text-teal-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-lime-400" />;
    }
  };

  const getChannelColor = (channelId: string) => {
    switch (channelId) {
      case "exit-five":
        return "border-emerald-500/25 text-emerald-400 bg-emerald-500/5";
      case "seattle-hoops":
        return "border-lime-500/25 text-lime-400 bg-lime-500/5";
      case "gotham-athlete":
        return "border-teal-500/25 text-teal-400 bg-teal-500/5";
      default:
        return "border-white/10 text-white/60";
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto" id="bento-explorer-container">
      
      {/* Advanced Layered Filtering & Content Taxonomy Controller */}
      <div className="mb-6 p-5 rounded-xl border border-emerald-500/10 bg-gradient-to-r from-[#07140b]/40 to-[#050b06]/40 backdrop-blur-sm shadow-inner shadow-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
          <div>
            <h2 className="font-sans text-sm sm:text-base font-black uppercase tracking-wider text-white">Content Taxonomy</h2>
            <p className="font-sans text-xs text-gray-400 mt-0.5">Surgical data grouping & cross-channel discovery layout</p>
          </div>
        </div>

        {/* Filter Control Board organized into readable visual subgroups */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Subgroup Label */}
          <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest hidden sm:inline">Hub Filter:</span>

          {/* Channel Filters with premium glass tabs styling */}
          <div className="flex items-center rounded-lg border border-white/5 bg-white/5 p-1 text-[10px] font-sans shadow-inner">
            <button
              onClick={() => setChannelFilter("all")}
              className={`rounded-md px-3 py-1 font-bold tracking-wider uppercase transition-all duration-250 ${
                channelFilter === "all" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-gray-400 hover:text-white"
              }`}
            >
              All Hubs
            </button>
            <button
              onClick={() => setChannelFilter("exit-five")}
              className={`rounded-md px-3 py-1 font-bold tracking-wider uppercase transition-all duration-250 ${
                channelFilter === "exit-five" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Exit Five
            </button>
            <button
              onClick={() => setChannelFilter("seattle-hoops")}
              className={`rounded-md px-3 py-1 font-bold tracking-wider uppercase transition-all duration-250 ${
                channelFilter === "seattle-hoops" ? "bg-lime-500/20 text-lime-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Seattle
            </button>
            <button
              onClick={() => setChannelFilter("gotham-athlete")}
              className={`rounded-md px-3 py-1 font-bold tracking-wider uppercase transition-all duration-250 ${
                channelFilter === "gotham-athlete" ? "bg-teal-500/20 text-teal-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Gotham
            </button>
          </div>

          {/* Separation line */}
          <div className="h-5 w-px bg-white/10 hidden sm:block mx-1" />

          {/* Type Filters Dropdown Selection */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest hidden sm:inline">Format:</span>
            <div className="relative">
              <ListFilter className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-[#050b06] text-[10px] font-mono tracking-widest uppercase font-bold text-gray-200 py-2 pr-8 pl-8.5 focus:border-emerald-500/40 focus:outline-none transition-all cursor-pointer shadow-md"
              >
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Formats" : type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Dashboard */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded bg-[#111]">
          <p className="font-sans text-xs text-gray-500">No items match your selected parameters.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px]"
          id="bento-grid-layout"
        >
          {filteredCards.map((card, index) => {
            const isSaved = userProfile.savedIds.includes(card.id);
            const isCompleted = userProfile.completedIds.includes(card.id);
            const bentoSpan = getBentoClasses(index);

            return (
              <motion.div
                layout
                key={card.id}
                whileHover={{ scale: 1.015, y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => onCardClick(card)}
                className={`relative rounded-xl border border-white/10 bg-gradient-to-b from-[#07140b]/90 to-[#040905]/95 p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-emerald-500/5 transition-all duration-300 group overflow-hidden ${bentoSpan}`}
                id={`bento-card-${card.id}`}
              >
                {/* Large Watermarked Monospaced Index Number */}
                <div className="text-5xl font-black text-white/5 font-mono absolute top-3 right-4 select-none group-hover:text-white/10 transition-colors duration-300">
                  {(index + 1).toString().padStart(2, "0")}
                </div>

                {/* Header elements layer */}
                <div className="flex items-start justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300">
                      {getCardIcon(card.type)}
                    </div>
                    <span className={`rounded px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest border uppercase ${getChannelColor(card.channelId)}`}>
                      {card.channelId.replace("-", " ")}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(card.id);
                    }}
                    className={`rounded-lg p-1.5 border transition-all duration-300 ${
                      isSaved
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                        : "border-white/10 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} />
                  </button>
                </div>

                {/* Body details layer */}
                <div className="mt-4 flex-1 flex flex-col justify-center z-10">
                  <h3 className="font-sans text-sm md:text-base font-bold text-white tracking-tight leading-tight line-clamp-2 group-hover:text-lime-300 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Footer details layer: Structured metadata bar for extreme readability */}
                <div className="mt-5 p-2 px-3 rounded-lg border border-white/5 bg-black/40 group-hover:bg-black/60 group-hover:border-emerald-500/10 transition-all duration-300 flex items-center justify-between text-[9px] font-mono text-gray-400 z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white/75">{card.readTime.toUpperCase()}</span>
                    <span className="text-gray-600">•</span>
                    <span className="uppercase text-gray-400">{card.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <span className="flex items-center gap-0.5 text-[8px] font-bold text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-500/20">
                        DONE
                      </span>
                    )}

                    {card.rating && (
                      <div className="flex items-center gap-0.5 text-emerald-400 font-bold">
                        <Star className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                        <span>{card.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}
