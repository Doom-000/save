const fs = require('fs');
let content = fs.readFileSync('src/components/PortfolioHome.tsx', 'utf-8');

content = content.replace(
  `useState<"library" | "estimator" | "projects" | "feedback">("library")`,
  `useState<"library" | "estimator" | "projects" | "feedback" | "package">("library")`
);

content = content.replace(
  `            <Smile className="w-4 h-4" />
            ความคิดเห็นลูกค้า
          </button>`,
  `            <Smile className="w-4 h-4" />
            ความคิดเห็นลูกค้า
          </button>
          
          <button
            onClick={() => setActiveTab("package")}
            className={\`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all \${
              activeTab === "package" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }\`}
          >
            <Award className="w-4 h-4" />
            สมัครแพ็คเกจ
          </button>`
);

fs.writeFileSync('src/components/PortfolioHome.tsx', content);
