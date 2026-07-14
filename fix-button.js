const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioHome.tsx', 'utf8');
const target = `{/* Delete Button - Always visible & high contrast */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStickyNote(note.id);
                              }}
                              className="absolute top-2.5 right-2.5 text-rose-600 hover:text-white hover:bg-rose-600 transition-all p-1.5 rounded-full bg-white/95 dark:bg-[#0c120e]/80 shadow-sm border border-rose-200/50 dark:border-rose-950/40 z-20 flex items-center justify-center cursor-pointer"
                              title="ดึงโน้ตนี้ออก"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3px]" />
                            </button>`;
const replacement = `{/* Delete Button - Show only for admin or creator */}
                            {(user.role === 'admin' || (note.authorEmail && note.authorEmail === user.email)) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStickyNote(note.id);
                                }}
                                className="absolute top-2.5 right-2.5 text-rose-600 hover:text-white hover:bg-rose-600 transition-all p-1.5 rounded-full bg-white/95 dark:bg-[#0c120e]/80 shadow-sm border border-rose-200/50 dark:border-rose-950/40 z-20 flex items-center justify-center cursor-pointer"
                                title="ดึงโน้ตนี้ออก"
                              >
                                <X className="w-3.5 h-3.5 stroke-[3px]" />
                              </button>
                            )}`;
code = code.replaceAll(target, replacement);
fs.writeFileSync('src/components/PortfolioHome.tsx', code, 'utf8');
