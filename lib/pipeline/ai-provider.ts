export type AiModel =
  | "grok-writer"      // x-ai/grok-4.1-fast via OpenRouter — newer training data, for NEW content
  | "grok-translator"  // x-ai/grok-4-fast  via OpenRouter — for translation tasks
  | "claude-haiku"     // legacy fallback
  | "gpt-5-nano";      // legacy fallback

const OPENROUTER_MODELS: Record<string, string> = {
  "grok-writer": "x-ai/grok-4.1-fast",
  "grok-translator": "x-ai/grok-4-fast",
};

interface GenerateOptions {
  model?: AiModel;
  maxTokens?: number;
  temperature?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const AI_TIMEOUT_MS = 120_000; // 120 seconds per AI call (translations of large posts need more time)

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = AI_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Unified AI content generation interface
// Prefers Claude if ANTHROPIC_API_KEY is set, falls back to OpenAI
export async function generateContent(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const { maxTokens = 16384, temperature = 0.7 } = options;

  // Auto-select model based on available API keys. Prefer OpenRouter + Grok when available.
  let model = options.model;
  if (!model) {
    if (process.env.OPENROUTER_API_KEY) {
      model = "grok-writer";
    } else if (process.env.ANTHROPIC_API_KEY) {
      model = "claude-haiku";
    } else if (process.env.OPENAI_API_KEY) {
      model = "gpt-5-nano";
    } else {
      throw new Error(
        "No AI API key configured. Set OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY."
      );
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (model === "grok-writer" || model === "grok-translator") {
        return await callOpenRouter(OPENROUTER_MODELS[model], prompt, maxTokens, temperature);
      } else if (model === "claude-haiku") {
        return await callClaude(prompt, maxTokens, temperature);
      } else if (model === "gpt-5-nano") {
        return await callOpenAI(prompt, maxTokens, temperature);
      } else {
        throw new Error(`Unknown model: ${model}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `AI generation attempt ${attempt}/${MAX_RETRIES} failed (${model}):`,
        lastError.message
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // Fallback chain: Grok → Claude → OpenAI (whichever keys are configured)
  if ((model === "grok-writer" || model === "grok-translator") && process.env.ANTHROPIC_API_KEY) {
    console.log("[ai-provider] Grok failed, falling back to Claude Haiku");
    try {
      return await callClaude(prompt, maxTokens, temperature);
    } catch (fallbackErr) {
      console.error("[ai-provider] Claude fallback also failed:", fallbackErr);
    }
  }
  if (model === "claude-haiku" && process.env.OPENAI_API_KEY) {
    console.log("[ai-provider] Claude failed, falling back to GPT-5-nano");
    try {
      return await callOpenAI(prompt, maxTokens, 1); // GPT-5-nano only supports temp=1
    } catch (fallbackErr) {
      console.error("[ai-provider] OpenAI fallback also failed:", fallbackErr);
    }
  } else if (model === "gpt-5-nano" && process.env.ANTHROPIC_API_KEY) {
    console.log("[ai-provider] OpenAI failed, falling back to Claude Haiku");
    try {
      return await callClaude(prompt, maxTokens, temperature);
    } catch (fallbackErr) {
      console.error("[ai-provider] Claude fallback also failed:", fallbackErr);
    }
  }

  throw new Error(
    `AI generation failed after ${MAX_RETRIES} attempts + fallback: ${lastError?.message}`
  );
}

// OpenRouter API — raw fetch, OpenAI-compatible endpoint
async function callOpenRouter(
  model: string,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://go2-thailand.com",
      "X-Title": "go2thailand-pipeline",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  return content;
}

// Claude API (Anthropic) — raw fetch, no SDK required
async function callClaude(
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === "text"
  );
  if (!textBlock?.text) {
    throw new Error("No text content in Claude response");
  }

  return textBlock.text;
}

// OpenAI API — raw fetch, no SDK required
async function callOpenAI(
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    // GPT-5-nano only supports default temperature (1) — omit the parameter
    body: JSON.stringify({
      model: "gpt-5-nano-2025-08-07",
      max_completion_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  return content;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
