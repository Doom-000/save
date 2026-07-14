import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client lazily if the key exists
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// REST API endpoint: AI Curator Chat
app.post("/api/gemini/moderate", async (req, res) => {
  const { comment } = req.body;
  const client = getAiClient();
  
  if (!client) {
    return res.json({
      is_offensive: false,
      severity: "none",
      category: "none",
      flagged_words: [],
      confidence: 1.0,
      reason: "API keys missing. Allowed by default.",
      action_recommended: "allow"
    });
  }

  const systemInstruction = `คุณคือระบบตรวจสอบข้อความคอมเมนต์ (Content Moderation System) ที่ทำหน้าที่วิเคราะห์ว่าข้อความที่ได้รับมีคำหยาบคาย คำด่า คำเหยียดหยาม คำคุกคาม หรือข้อความไม่เหมาะสมหรือไม่ โดยพิจารณาทั้งคำที่หยาบคายตรงๆ คำที่สะกดแผลงเพื่อเลี่ยงการตรวจจับ คำแสลง และบริบทเชิงประชดประชันหรือดูหมิ่น

กติกาการตัดสิน:
1. ให้พิจารณาภาษาไทย ภาษาอังกฤษ และภาษาผสม (คำทับศัพท์/พิมพ์เลี่ยง เช่น "ควาย" "ควย" "สัส" "เหี้ย" ฯลฯ)
2. คำวิจารณ์ทั่วไปที่ไม่มีคำหยาบหรือเจตนาดูหมิ่นบุคคล ไม่ถือว่าผิด
3. ข้อความที่มีคำหยาบแต่ใช้ในเชิงตลกขบขันระหว่างเพื่อนแบบไม่มีเจตนาทำร้าย ให้ประเมินความรุนแรงตามระดับ (mild/severe) แทนการตัดสินแบบขาว-ดำเสมอไป
4. หากไม่แน่ใจ ให้ประเมินเป็น "ควรตรวจสอบเพิ่มเติม" แทนการฟันธงทันที เพื่อลดโอกาส False Positive

กฎการเลือก action_recommended:
- ถ้า severity = "severe" และ confidence >= 0.8 -> "delete"
- ถ้า severity = "mild" หรือ confidence ต่ำกว่า 0.8 -> "hide_for_review"
- ถ้า is_offensive = false -> "allow"`;

  try {
    const { Type } = await import("@google/genai");
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite", // Using flash-lite for fast moderation
      contents: `ข้อความที่ต้องตรวจสอบ:\n"""\n${comment}\n"""`,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_offensive: { type: Type.BOOLEAN },
            severity: { type: Type.STRING, description: "none, mild, or severe" },
            category: { type: Type.STRING, description: "profanity, harassment, hate_speech, spam, or none" },
            flagged_words: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER, description: "0.0 to 1.0" },
            reason: { type: Type.STRING },
            action_recommended: { type: Type.STRING, description: "delete, hide_for_review, or allow" }
          },
          required: ["is_offensive", "severity", "category", "flagged_words", "confidence", "reason", "action_recommended"]
        }
      },
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText);
    return res.json(result);
  } catch (error: any) {
    console.error("Moderation API Error:", error);
    // Allow by default if API fails to not block users
    return res.json({
      is_offensive: false,
      severity: "none",
      category: "none",
      flagged_words: [],
      confidence: 1.0,
      reason: "API error. Allowed by default.",
      action_recommended: "allow"
    });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, channelContext, currentCard } = req.body;
  const client = getAiClient();

  const isRealAI = !!client;

  // Rich pre-configured local expertise mock answers to guarantee exceptional UI/UX even without API Key!
  const localExpertAnswers: Record<string, string> = {
    marketing: `### B2B Marketing Strategy Recommendation
1. **Focus on Direct Value**: B2B buyers don't want fluff. Frame your cold outreach and copy around concrete pains: "We helped SaaS X increase active trials by 22% in 45 days."
2. **Optimize the Trial Funnel (PLG)**: Ensure users reach their "Aha!" moment within the first 4 minutes of entering your product. Remove card requirements and shorten forms.
3. **Build high-intent content**: Instead of broad industry reports, publish detailed playbooks, custom spreadsheet calculators, and templates that make your buyers look like heroes in front of their bosses.`,
    basketball: `### Seattle Basketball Fans Insights & Strategy
1. **The Arena Legacy**: Key Arena's redevelopment is more than a stadium; it is a monument to Seattle's basketball heritage. Incorporating the iconic green-and-gold color palettes in merchandise maintains the high-fidelity connection with the 1996 legacy team.
2. **Community Action**: Support grassroots local basketball academies in Washington state. True fan clubs are built around high-density watch parties at local sports grilles, combined with trivia and limited-edition fan gear.
3. **Fan Engagement**: Integrate digital stats comparisons for retroactive Sonic heroes with active prospects.`,
    fitness: `### NY High-Performance Training Strategy
1. **Metabolic Conditioning (HiiT)**: Keep rest intervals strictly under 45 seconds to maximize athletic conditioning. Focus on compound movements (thrusters, kettlebell swings, rowing) to maximize caloric expenditure.
2. **Precision Macro Grids**: Set your protein intake to 1.8g - 2.2g per kg of lean mass. Caloric deficits should be progressive (no more than 15-20% below TDEE) to avoid training fatigue.
3. **Active Recovery**: Implement structural joint mobility sequences on off-days to protect athletic longevity in NYC's high-stress environment.`,
  };

  let chosenFallbackKey = "marketing";
  if (channelContext && channelContext.toLowerCase().includes("hoops")) {
    chosenFallbackKey = "basketball";
  } else if (channelContext && channelContext.toLowerCase().includes("gotham")) {
    chosenFallbackKey = "fitness";
  }

  const systemInstruction = `You are a World-Class Content Curator, B2B Strategist, Fitness Coach, and Basketball Culture Expert. 
Your goal is to answer queries professionally, using concise markdown with clean formatting.
Current channel domain: ${channelContext || "General Hub"}.
Related item context: ${currentCard ? JSON.stringify(currentCard) : "None"}.
Provide high-value, actionable advice, guides, or bullet-points. Keep your answer highly scannable using headers and bullet points.`;

  if (isRealAI && client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt || "Suggest an optimized checklist for my hub",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "No response received from the curator.";
      return res.json({
        success: true,
        text: responseText,
        isMock: false,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      // Fallback on error
      return res.json({
        success: true,
        text: `### Curator Assistant Response (Offline Mode)\n\n${localExpertAnswers[chosenFallbackKey]}\n\n*(Note: Gemini API is currently unavailable, showing offline curation expertise.)*`,
        isMock: true,
        warning: "Gemini API error. Operating in expert-offline mode.",
      });
    }
  } else {
    // Graceful offline experience - deliver high-quality custom answers with warning
    let customText = localExpertAnswers[chosenFallbackKey];
    if (prompt && prompt.trim().length > 3) {
      customText = `### Curator Guide Response (Preview Mode)
      
You asked: "${prompt}"

Here are expert tips tailored for **${channelContext || "Content Hub"}**:

1. **Strategic Execution**: For any content task, prioritize 1 actionable template or playbook over 10 theoretical posts.
2. **Consistency Over Scale**: It is better to have 3 high-quality channels updated weekly than 10 dry feeds.
3. **Personalization**: Customize metrics and KPIs. In B2B marketing, trace the value; in basketball, celebrate the culture; in training, track the metabolic progression.

*Configure your GEMINI_API_KEY in the AI Studio UI Secrets panel to unlock real-time Gemini AI chat capabilities!*`;
    }

    return res.json({
      success: true,
      text: customText,
      isMock: true,
      warning: "GEMINI_API_KEY is not defined in environments. Displaying pre-architected local expert advice.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Content Hub Server] Live on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || "development"}]`);
  });
}

startServer();
