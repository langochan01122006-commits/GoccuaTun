import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { CHARACTERS } from "./src/characters.ts";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Get list of characters
  app.get("/api/characters", (req, res) => {
    res.json({ characters: CHARACTERS });
  });

  // Chat endpoint
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    try {
      const { characterId, messages } = req.body;
      const character = CHARACTERS.find((c) => c.id === characterId);

      if (!character) {
        return res.status(404).json({ error: "Không tìm thấy nhân vật này." });
      }

      // Check if API key exists
      if (!process.env.GEMINI_API_KEY) {
        // Return a customized charming placeholder reply in-character informing about the missing key!
        const fallbackText = `*${character.name} khẽ nhìn bạn trìu mến rồi thì thầm:*\n\n"Ta cực kỳ mến mộ và muốn đàm đạo thêm với em. Tuy nhiên, thần chủ chưa bổ sung chìa khóa pháp thuật \`GEMINI_API_KEY\` vào bảng điều khiển (Secrets panel) mất rồi. Hãy nhờ thần chủ kích hoạt chiếc chìa khóa thần kỳ ấy để kết nối duyên nợ tụi mình nhé! ✨"`;
        return res.json({ text: fallbackText });
      }

      const client = getGeminiClient();

      // Transform messages into Gemini-compatible content structure
      // messages array contains { role: 'user' | 'model', text: string }
      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const modelName = "gemini-3.5-flash";

      const apiResponse = await client.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: character.systemPrompt,
          temperature: 0.8,
        },
      });

      const responseText = apiResponse.text;
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "Xin lỗi, đã xảy ra lỗi khi kết nối với tinh hồn của nhân vật.",
        details: error.message || error,
      });
    }
  });

  // Set up Vite middleware for development
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
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});
