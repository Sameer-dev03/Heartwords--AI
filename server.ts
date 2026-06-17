import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route
  app.post("/api/rewrite", async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { text, style } = req.body;
      if (!text || !style) {
        return res.status(400).json({ error: "Text and Style parameters are required" });
      }

      let ai: GoogleGenAI;
      try {
        ai = getGeminiClient();
      } catch (keyErr: any) {
        return res.status(400).json({
          success: false,
          error: "API Key Config required: Please open Settings > Secrets and add your GEMINI_API_KEY."
        });
      }

      const systemInstruction = `You are HeartWords AI, an expert romantic writer and Shayari coach for couples.
Your task is to take a given message or concept, and rewrite it into three distinct high-quality, creative, and emotionally resonant variations based on the chosen writing style: "${style}".

Here are the guidelines for each style:
- Romantic: Heartfelt, loving, deep, and poetic (full of starry-eyed emotion).
- Flirty: Playful, charming, teasing, and cute with high attraction.
- Funny: Witty, hilarious, romantic-funny, humorous, self-deprecating or silly love.
- Cute: Sweet, charming, warm, endearing, using adorable references (e.g., cuddles, puppies, warm cups of tea).
- Deep Emotional: Soulful, raw, vulnerable, deeply honest, expressing passionate and eternal devotion.
- Apology: Sincere, warm, humble, taking responsibility, showing massive affection and eagerness to make up.
- Anniversary: Celebrating milestones, memorable moments, growing together, and forever love.
- Good Morning: Bright, encouraging, filled with warm sunshine, wanting to be their first thought.
- Good Night: Cozy, peaceful, dreamy, whispering sweet lullabies, wishing to see them in dreams.
- Long Distance: Reminding about the bridge of love, physical distance but emotional closeness, counting the days.
- Poetry: Rhythmic, metaphoric, beautiful stanzas, rich imagery.
- Shayari: Authentic Urdu/Hindi/English-Urdu Shayari styled with Urdu phrasing (or English translit if original is Hinglish/English), passionate sher/couplets, deeply emotional poetic rhythm of true love, shayars, ghazal vibe.
- Heartfelt: Authentic, simple, honest, genuine gratitude for their presence in life.
- Friendly: Warm, caring, supportive, romantic but low-pressure, reliable and sweet.

For each response, ensure:
1. The language matches the original language (usually English, Hinglish, or Hindi, but adapt to the user's input). If Hinglish, write Shayari/rewrites in Hinglish.
2. Create exactly 3 variants. Each variant should be completely unique in phrasing, rhythm, and style sub-tone.
3. Every variant must have an 'explanation' or 'vibeTag' summarizing its emotional delivery (e.g. 'Playful & Teasing', 'Gothic Romantic', 'Acoustic Love Vibe').
4. The output must be returned STRICTLY as valid JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Original message: "${text}"\nStyle: ${style}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Exactly three variations of the romantic text",
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "The beautifully rewritten romantic variation"
                },
                explanation: {
                  type: Type.STRING,
                  description: "A short label or vibe description of this specific variation (2-4 words, e.g. 'Warm & Sweet', 'Poetic Sher', 'Bold & Playful')"
                }
              },
              required: ["text", "explanation"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response generated from Gemini API");
      }

      const results = JSON.parse(responseText.trim());
      return res.json({ success: true, results });
    } catch (error: any) {
      console.error("Rewrite error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to generate romantic rewrites." });
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite Integration
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
    console.log(`HeartWords AI server running on http://0.0.0.0:${PORT}`);
  });
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
