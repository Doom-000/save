const fs = require('fs');
let content = fs.readFileSync('src/components/PortfolioHome.tsx', 'utf-8');

const packageContent = `
          {/* TAB 5: PACKAGE */}
          {activeTab === "package" && (
            <motion.div
              key="package-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="max-w-md mx-auto mt-10">
                <div className="bg-white dark:bg-[#121614] border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    แนะนำ
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#1C201E] dark:text-slate-100 mb-2">
                    สมัครแพ็คเกจแบบรายเดือน
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-6">
                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">฿67</span>
                    <span className="text-[#727875] dark:text-slate-400 font-medium">/ เดือน</span>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 mb-8 text-left border border-emerald-100 dark:border-emerald-900/50">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
                          ได้รับสิทธิพิเศษรายการส่งเรื่องการจัดการสั่งซื้อต้นไม้แบบไวและมีฟังก์ชันอื่นๆอีกในอนาคต
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all focus:ring-4 focus:ring-emerald-600/20">
                    สมัครแพ็คเกจ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
`;

content = content.replace(
  `          )}
        </AnimatePresence>`,
  `          )}
${packageContent}
        </AnimatePresence>`
);

fs.writeFileSync('src/components/PortfolioHome.tsx', content);
