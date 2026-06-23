export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const OPENROUTER_DEFAULT_MODEL = 'deepseek/deepseek-chat-v3-0324';

// Fallback chain: tried in order until one returns a usable plan. The free
// models are attempted first; a capable paid model anchors the chain so
// generation still succeeds when the free models return unusable output.
export const OPENROUTER_DEFAULT_MODELS = [
  'google/gemini-3-flash-preview',
  'nvidia/nemotron-3.5-content-safety:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
];

// Cap output tokens. Without this OpenRouter reserves the model max (e.g. 65k),
// which a low-balance account cannot afford and returns HTTP 402.
export const OPENROUTER_DEFAULT_MAX_TOKENS = 8000;
