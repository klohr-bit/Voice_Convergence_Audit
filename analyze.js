// api/analyze.js
// Serverless function for the Anti-Convergence Engine
// Compatible with Vercel, Netlify Functions, or Cloudflare Workers

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Load the system prompt at cold start (cached for subsequent requests)
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "engine_system_prompt.md"),
  "utf-8"
);

export default async function handler(req, res) {
  // CORS for browser-based access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, mode } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' field" });
    }

    // Build the user message
    const userMessage = mode
      ? `Mode: ${mode}\n\nWriting:\n${text}`
      : `Writing:\n${text}`;

    // Call Claude
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const result = response.content[0].text;

    return res.status(200).json({
      result,
      usage: response.usage,
    });
  } catch (err) {
    console.error("Engine error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ============================================================
// TO USE WITH OPENAI INSTEAD OF ANTHROPIC:
// ============================================================
//
// import OpenAI from "openai";
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//
// Replace the client.messages.create call with:
//
// const response = await client.chat.completions.create({
//   model: "gpt-4o",
//   max_tokens: 4000,
//   messages: [
//     { role: "system", content: SYSTEM_PROMPT },
//     { role: "user", content: userMessage },
//   ],
// });
//
// const result = response.choices[0].message.content;
//
// ============================================================
