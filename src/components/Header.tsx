import { useState } from "react";
import { Search, Heart, ShoppingBag, LayoutGrid, SlidersHorizontal, Sparkles, User, X, Trash2, CheckCircle2, LogOut, Database } from "lucide-react";
import { UserProfile, ContentCard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  user: UserProfile;
  activeTab: "channels" | "bento";
  setActiveTab: (tab: "channels" | "bento") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedCards: ContentCard[];
  onCardClick: (card: ContentCard) => void;
  onRemoveFavorite: (id: string) => void;
  onClearCart: () => void;
  onRemoveCartItem: (id: string) => void;
  onToggleAiPanel: () => void;
  showAiPanel: boolean;
  onLogout: () => void;
  onResetAllData?: () => void;
  onDeleteAccount?: (email: string) => void;
}

export default function Header({
  user,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  savedCards,
  onCardClick,
  onRemoveFavorite,
  onClearCart,
  onRemoveCartItem,
  onToggleAiPanel,
  showAiPanel,
  onLogout,
  onResetAllData,
  onDeleteAccount,
}: HeaderProps) {
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const cartItemsCount = Object.values(user.merchCart).reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = Object.values(user.merchCart).reduce(
    (sum, item) => sum + item.qty * parseFloat(item.price.replace("$", "")),
    0
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050b06]/90 backdrop-blur-md shadow-2xl" id="header-container">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-8 lg:px-10">
         
         {/* Brand Identity & High-Density Links */}
         <div className="flex items-center gap-6 sm:gap-10">
           <div 
             className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-lime-400 to-teal-400 bg-clip-text text-transparent select-none cursor-pointer" 
             onClick={() => setActiveTab("channels")}
           >
             GRID_HUB
           </div>
           <div className="hidden md:flex gap-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
             <span 
               onClick={() => setActiveTab("channels")} 
               className={`cursor-pointer transition-colors ${activeTab === "channels" ? "text-white underline underline-offset-4 decoration-2 decoration-emerald-500" : "hover:text-white"}`}
             >
               Library
             </span>
             <span 
               onClick={() => setActiveTab("bento")} 
               className={`cursor-pointer transition-colors ${activeTab === "bento" ? "text-white underline underline-offset-4 decoration-2 decoration-lime-500" : "hover:text-white"}`}
             >
               Channels
             </span>
             <span className="text-white/20 cursor-default select-none">|</span>
             <span className="text-lime-400/80 cursor-default select-none flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
               Live
             </span>
           </div>
         </div>
 
         {/* Dynamic Live Search Bar (Surgical & Sharp borders) */}
         <div className="relative flex max-w-md flex-1 items-center px-4 md:px-8">
           <div className="relative w-full">
             <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
             <input
               type="text"
               placeholder="Search assets..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full rounded border border-white/10 bg-white/5 py-1.5 pr-10 pl-9 text-xs font-sans text-white placeholder-gray-500 transition-all focus:border-emerald-500/40 focus:bg-emerald-950/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
               id="global-search-input"
             />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-2.5 right-3 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <span className="absolute right-3 top-2 text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono hidden sm:inline">⌘K</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Layout Mode Toggles */}
          <div className="hidden md:flex items-center rounded border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setActiveTab("channels")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === "channels"
                  ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Channels</span>
            </button>
            <button
              onClick={() => setActiveTab("bento")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === "bento"
                  ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Bento</span>
            </button>
          </div>

          {/* AI Co-Pilot Toggle */}
          <button
            onClick={onToggleAiPanel}
            className={`relative flex h-8 items-center gap-1.5 rounded border transition-all px-3 ${
              showAiPanel
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white"
            }`}
            title="Ask AI Co-pilot"
          >
            <Sparkles className={`h-3 w-3 ${showAiPanel ? "animate-pulse" : ""}`} />
            <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">AI Guide</span>
          </button>

          {/* Saved / Favorites Hub */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSavedDropdown(!showSavedDropdown);
                setShowCartDropdown(false);
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded border transition-all ${
                showSavedDropdown
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white"
              }`}
              id="favorites-trigger"
            >
              <Heart className="h-3.5 w-3.5" />
              {savedCards.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded bg-emerald-500 text-[9px] font-bold text-white font-mono">
                  {savedCards.length}
                </span>
              )}
            </button>

            {/* Favorites Dropdown */}
            <AnimatePresence>
              {showSavedDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 rounded border border-emerald-500/20 bg-[#050b06] p-4 shadow-2xl backdrop-blur-lg"
                  id="favorites-dropdown"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-sans text-[11px] font-black uppercase tracking-wider text-gray-300">My Saved Shelf</span>
                    <Heart className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                  </div>
                  {savedCards.length === 0 ? (
                    <p className="py-6 text-center font-sans text-xs text-gray-500">No items saved yet.</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          className="group flex items-center justify-between rounded border border-white/5 bg-white/5 p-2 transition-all hover:bg-white/10"
                        >
                          <div
                            onClick={() => {
                              onCardClick(card);
                              setShowSavedDropdown(false);
                            }}
                            className="flex-1 cursor-pointer pr-2"
                          >
                            <h4 className="line-clamp-1 font-sans text-xs font-semibold text-white group-hover:text-emerald-400">
                              {card.title}
                            </h4>
                            <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                              {card.channelId.replace("-", " ")}
                            </span>
                          </div>
                          <button
                            onClick={() => onRemoveFavorite(card.id)}
                            className="text-white/30 hover:text-rose-500"
                            title="Remove"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Merch Shopping Cart */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCartDropdown(!showCartDropdown);
                setShowSavedDropdown(false);
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded border transition-all ${
                showCartDropdown
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white"
              }`}
              id="cart-trigger"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded bg-emerald-500 text-[9px] font-bold text-white font-mono animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Cart Dropdown */}
            <AnimatePresence>
              {showCartDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 rounded border border-emerald-500/20 bg-[#050b06] p-4 shadow-2xl backdrop-blur-lg"
                  id="cart-dropdown"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-sans text-[11px] font-black uppercase tracking-wider text-gray-300">Seattle NBA Team Shop</span>
                    <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  {cartItemsCount === 0 ? (
                    <p className="py-6 text-center font-sans text-xs text-gray-500">Your shopping cart is empty.</p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {Object.entries(user.merchCart).map(([id, item]) => (
                          <div
                            key={id}
                            className="flex items-center justify-between rounded border border-white/5 bg-white/5 p-2"
                          >
                            <div className="flex-1 pr-2">
                              <h4 className="line-clamp-1 font-sans text-xs font-semibold text-white">{item.name}</h4>
                              <div className="flex gap-2 font-mono text-[8px] text-gray-500 mt-0.5 uppercase tracking-wider">
                                <span>Size: {item.size}</span>
                                <span>•</span>
                                <span>Qty: {item.qty}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-emerald-400">{item.price}</span>
                              <button
                                onClick={() => onRemoveCartItem(id)}
                                className="text-white/30 hover:text-rose-500"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-sans text-xs text-gray-400 font-medium">Total:</span>
                          <span className="font-mono text-sm font-black text-emerald-400">${totalCartPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={onClearCart}
                            className="flex-1 rounded border border-white/10 py-1.5 text-center font-sans text-[10px] font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              alert(`Order Simulated! Thank you for supporting Seattle NBA fans.\nTotal order: $${totalCartPrice.toFixed(2)}`);
                              onClearCart();
                              setShowCartDropdown(false);
                            }}
                            className="flex-[2] rounded bg-emerald-600 py-1.5 text-center font-sans text-[10px] font-black text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/10 uppercase tracking-wider"
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Badge (High Density Interactive Dropdown) */}
          <div className="relative">
            <button
              onClick={() => {
                const nextState = !showProfileDropdown;
                setShowProfileDropdown(nextState);
                setShowSavedDropdown(false);
                setShowCartDropdown(false);
                setConfirmDelete(false);
                setConfirmReset(false);
              }}
              className="flex items-center gap-2 rounded border border-white/10 bg-white/5 py-1 pr-3 pl-1.5 transition-all hover:bg-white/10 hover:border-emerald-500/30"
              id="profile-trigger"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-600 p-[1px] overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-sans text-[9px] font-black text-white leading-none uppercase tracking-wider">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  <span className="font-mono text-[8px] text-gray-400 leading-none">
                    {user.completedIds.length} DONE
                  </span>
                </div>
              </div>
            </button>

            {/* Profile Detail Dropdown Card */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 rounded-xl border border-emerald-500/30 bg-[#030804]/95 backdrop-blur-xl p-5 shadow-[0_12px_40px_-8px_rgba(16,185,129,0.25)] z-50 text-left overflow-hidden"
                  id="profile-dropdown"
                >
                  {/* Decorative High-tech Corner Accents */}
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400/60" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400/60" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400/60" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400/60" />

                  {/* Top Security Node Label */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 text-[9px] font-mono tracking-widest text-emerald-500/70 select-none">
                    <span>GRID SECURE SEC-ID</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="h-1 w-1 rounded-full bg-emerald-400 absolute" />
                      ACTIVE
                    </span>
                  </div>

                  {/* Centered Avatar and User info - Google-like centered concept but Cyberpunk styled */}
                  <div className="flex flex-col items-center text-center mt-1 mb-4">
                    <div className="relative group mb-3 cursor-pointer">
                      {/* Interactive Dual Glow Ring */}
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500 opacity-60 blur-sm group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 animate-spin-slow" style={{ animationDuration: '8s' }} />
                      <div className="relative h-20 w-20 rounded-full bg-slate-950 p-[2.5px] overflow-hidden">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    
                    <h4 className="font-sans text-sm font-black text-white uppercase tracking-normal mb-0.5">{user.name}</h4>
                    <p className="font-mono text-[10px] text-gray-400 max-w-[240px] truncate mb-3">{user.email}</p>
                    
                    {/* Centered capsule setting button (Google "Manage account" layout resemblance) */}
                    <button
                      type="button"
                      onClick={() => alert("GRID_HUB: System Access & Encryption Keys are fully configured on local storage. / จัดการข้อมูลและกุญแจความปลอดภัยเสร็จสิ้นในเครื่องแล้ว")}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-[10px] font-sans font-bold text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all cursor-pointer"
                    >
                      <SlidersHorizontal className="h-2.5 w-2.5" />
                      <span>Manage Security Passport / จัดการหนังสือเดินทางข้อมูล</span>
                    </button>
                  </div>

                  {/* High Density Cyber Stats */}
                  <div className="grid grid-cols-2 gap-2 pb-4 mb-4 border-b border-white/5">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center relative overflow-hidden group hover:border-lime-500/30 transition-colors">
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-lime-500" />
                      <p className="font-mono text-sm font-black text-lime-400 leading-none mb-1">{user.completedIds.length}</p>
                      <p className="font-sans text-[8px] text-gray-500 uppercase tracking-widest font-bold">Audited Hubs</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-emerald-500" />
                      <p className="font-mono text-sm font-black text-emerald-400 leading-none mb-1">{user.savedIds.length}</p>
                      <p className="font-sans text-[8px] text-gray-500 uppercase tracking-widest font-bold">Saved Items</p>
                    </div>
                  </div>

                  {/* Account operations */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onLogout();
                      }}
                      className="w-full rounded bg-red-600/15 hover:bg-red-600/25 border border-red-500/20 py-2 text-center font-sans text-[10px] font-black text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Sign Out / ล็อกเอาท์</span>
                    </button>

                    {/* Delete profile option */}
                    {confirmDelete ? (
                      <div className="rounded border border-rose-500/30 bg-rose-950/20 p-2.5 text-left space-y-2 animate-in fade-in duration-200">
                        <p className="font-sans text-[9px] text-rose-300 leading-normal">
                          คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "{user.name}" ออกจากอุปกรณ์นี้? (ประวัติและการบันทึกทั้งหมดของบัญชีนี้จะหายไป)
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setConfirmDelete(false);
                              setShowProfileDropdown(false);
                              if (onDeleteAccount) onDeleteAccount(user.email);
                            }}
                            className="flex-1 rounded bg-rose-600 text-white py-1 text-center font-sans text-[9px] font-bold hover:bg-rose-500 transition-all uppercase tracking-wider cursor-pointer"
                          >
                            ลบบัญชี / Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 rounded bg-white/5 border border-white/10 text-gray-400 py-1 text-center font-sans text-[9px] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmDelete(true);
                          setConfirmReset(false);
                        }}
                        className="w-full rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 py-2 text-center font-sans text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>ลบข้อมูลบัญชีนี้ / Delete Profile</span>
                      </button>
                    )}

                    {/* Reset memory / Clear All Data option */}
                    {confirmReset ? (
                      <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2.5 text-left space-y-2 animate-in fade-in duration-200">
                        <p className="font-sans text-[9px] text-amber-300 leading-normal">
                          คำเตือน: คุณต้องการลบข้อมูลทั้งหมดออกจากเว็บไซต์ (ล้างความจำเครื่อง ลบทุกบัญชีและประวัติทั้งหมด) ใช่หรือไม่?
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setConfirmReset(false);
                              setShowProfileDropdown(false);
                              if (onResetAllData) onResetAllData();
                            }}
                            className="flex-1 rounded bg-amber-600 text-black py-1 text-center font-sans text-[9px] font-bold hover:bg-amber-500 transition-all uppercase tracking-wider cursor-pointer"
                          >
                            ลบจากเว็บ / Clear
                          </button>
                          <button
                            onClick={() => setConfirmReset(false)}
                            className="flex-1 rounded bg-white/5 border border-white/10 text-gray-400 py-1 text-center font-sans text-[9px] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmReset(true);
                          setConfirmDelete(false);
                        }}
                        className="w-full rounded bg-gray-500/10 hover:bg-gray-500/20 border border-white/5 py-1.5 text-center font-sans text-[9px] font-medium text-gray-400 hover:text-gray-300 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <Database className="h-2.5 w-2.5" />
                        <span>ลบข้อมูลออกจากเว็บไซต์ / Clear Website Data</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Mobile Navigation bar (Sharp high density toggles) */}
      <div className="flex md:hidden border-t border-white/10 bg-[#040905]/95 px-4 py-2 justify-center gap-4">
        <button
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-1.5 rounded px-4 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "channels"
              ? "bg-emerald-600/20 text-emerald-400 shadow-sm border border-emerald-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span>Channels</span>
        </button>
        <button
          onClick={() => setActiveTab("bento")}
          className={`flex items-center gap-1.5 rounded px-4 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "bento"
              ? "bg-emerald-600/20 text-emerald-400 shadow-sm border border-emerald-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <LayoutGrid className="h-3 w-3" />
          <span>Bento Grid</span>
        </button>
      </div>

    </header>
  );
}
