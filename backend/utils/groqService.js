// GPT lines

import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateText = async (prompt) => {
  const res = await groq.chat.completions.create({
    // model: "llama-3.1-70b-versatile",
    // change
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content;
};
