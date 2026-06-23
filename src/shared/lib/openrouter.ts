import {
  OPENROUTER_BASE_URL,
  OPENROUTER_DEFAULT_MAX_TOKENS,
  OPENROUTER_DEFAULT_MODELS,
} from '@/shared/const/openrouter.const';

type OpenRouterError = Error & { status?: number };

// Ordered model fallback chain. Env OPENROUTER_MODELS (comma-separated) wins,
// then a single OPENROUTER_MODEL, then the built-in default chain.
export function getModelChain(): string[] {
  const fromList = process.env.OPENROUTER_MODELS?.split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  if (fromList && fromList.length > 0) return fromList;
  if (process.env.OPENROUTER_MODEL) return [process.env.OPENROUTER_MODEL];
  return OPENROUTER_DEFAULT_MODELS;
}

class OpenRouterClient {
  async chatJSON(system: string, user: string, model?: string): Promise<Record<string, unknown>> {
    const chosenModel = model ?? getModelChain()[0];
    const maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS) || OPENROUTER_DEFAULT_MAX_TOKENS;

    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      const detail = body?.error?.message ?? '';
      const err: OpenRouterError = new Error(
        `OpenRouter request failed with status ${res.status}${detail ? `: ${detail}` : ''}`
      );
      err.status = res.status;
      throw err;
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter response missing content');
    }

    return JSON.parse(extractJsonObject(content)) as Record<string, unknown>;
  }

  // Streams content token-by-token from a single model. Yields each delta string.
  async *chatStreamTokens(
    system: string,
    user: string,
    model?: string
  ): AsyncGenerator<string> {
    const chosenModel = model ?? getModelChain()[0];
    const maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS) || OPENROUTER_DEFAULT_MAX_TOKENS;

    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      const detail = body?.error?.message ?? '';
      const err: OpenRouterError = new Error(
        `OpenRouter request failed with status ${res.status}${detail ? `: ${detail}` : ''}`
      );
      err.status = res.status;
      throw err;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (isSseDone(line)) return;
        const delta = parseSseDelta(line);
        if (delta) yield delta;
      }
    }
  }
}

function isSseDone(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('data:') && trimmed.slice(5).trim() === '[DONE]';
}

// Returns the content delta from one SSE line, or null for comments / non-data
// lines / partial frames.
function parseSseDelta(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  try {
    const json = JSON.parse(trimmed.slice(5).trim()) as {
      choices?: { delta?: { content?: string } }[];
    };
    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

// Pull a JSON object out of model output that may include markdown fences or
// reasoning prose around the JSON (common with smaller / reasoning models).
function extractJsonObject(content: string): string {
  const withoutFences = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return withoutFences.slice(start, end + 1);
  }
  return withoutFences;
}

export const openrouter = new OpenRouterClient();
export { OpenRouterClient };
