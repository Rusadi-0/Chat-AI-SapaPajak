import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// setup folder public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// 🔥 load JSON sekali saja (lebih cepat)
const raw = fs.readFileSync(path.join(__dirname, "data.json"));
const data = JSON.parse(raw);

// endpoint chat
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();

    let info = {};

    if (userMessage.includes("alamat")) {
      info.alamat = data.alamat;
      info.maps = data.maps;
    }

    if (userMessage.includes("telepon") || userMessage.includes("kontak")) {
      info.telepon = data.telepon;
    }

    if (userMessage.includes("pbb")) {
      info.pbb = data.pbb;
    }

    if (Object.keys(info).length === 0) {
      info = data;
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
                // model: "llama3:8b",
        // model: "deepseek-coder:latest",
        // model: "phi3:mini",
        // model: "llama3.2:3b",
	model: "llama3.2:1b",

        system: `Kamu adalah Chat AI SapaPajak dari Bapenda Tabalong.
Jawab singkat, jelas, dan informatif.
Jika tidak ada di data, jawab: "Maaf, informasi tidak tersedia."`,

        prompt: `
Data:
${JSON.stringify(info)}

Pertanyaan:
${userMessage}
        `,

        stream: false,

        options: {
          temperature: 0.5,
          num_predict: 120, // 🔥 DIPERKECIL
          repeat_penalty: 1.1
        }
      })
    });

    const result = await response.json();

    res.json({
      reply: result.response
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Terjadi error di server"
    });
  }
});

app.listen(3003, () => {
  console.log("Server jalan di http://localhost:3003");
});