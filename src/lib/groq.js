// src/lib/groq.js

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// =========================
// CHAT AI
// =========================
export const groqChat = async (prompt) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content:
              "You are a professional medical AI assistant. Give short, accurate and easy-to-understand answers.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Groq Chat Error");
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// =========================
// GROQ VISION
// =========================
export const groqVision = async (imageBase64) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "system",
            content:
              "You are an expert pharmacist. Identify medicines from images and explain their medical uses only.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                // 🔄 SYSTEM OVERWRITE: Strictly locks down output parameters to Name and Uses
                text: "Analyze this image. On the very first line, print ONLY the clear medicine name (e.g. Diptamp-500 (Paracetamol Tablets IP 500mg)). On the lines below it, explain clearly and concisely exactly when this medicine is used and what symptoms or conditions it treats. Do not include dosage, side effects, or extra commentary." 
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Vision Error");
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    throw err;
  }
};