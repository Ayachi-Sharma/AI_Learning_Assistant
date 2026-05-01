import * as gemini from "./geminiService.js";
import * as groq from "./groqService.js";
import * as openai from "./openaiService.js";

const PROVIDERS = {
  gemini,
  groq,
  openai
};

const ORDER = process.env.AI_PROVIDER_ORDER.split(",");

const isRetryableError = (err) =>
  err?.status === 429 ||           // quota
  err?.status === 503 ||           // overloaded
  err?.status === 500 ||
  err?.message?.toLowerCase().includes("quota") ||
  err?.message?.toLowerCase().includes("overloaded") ||
  err?.message?.toLowerCase().includes("unavailable") ||
  err?.message?.toLowerCase().includes("resource_exhausted");

export const generateWithFallback = async (prompt) => {
  let lastError;

  for (const providerName of ORDER) {
    const provider = PROVIDERS[providerName];
    if (!provider?.generateText) continue;

    try {
      
      console.log(`🧠 Trying AI Provider: ${providerName}`);
      // return await provider.generateText(prompt);
      const result = await provider.generateText(prompt);
      console.log(`✅ ${providerName} succeeded`);
      return result;

    } catch (err) {
      console.error(`❌ ${providerName} failed`);
      lastError = err;
      
      if (!isRetryableError(err)) {
        console.error("⛔ Non-retryable error, stopping fallback");
        break;
      }
      // if (!isQuotaError(err)) break;
    }
  }

  throw lastError || new Error("All AI providers failed");
};
