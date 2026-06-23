import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OpenRouterClient } from './openrouter';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  } as Response;
}

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;

  beforeEach(() => {
    client = new OpenRouterClient();
    mockFetch.mockReset();
  });

  it('returns parsed JSON object from choices[0].message.content', async () => {
    const parsed = { days: [{ day: 'Monday' }] };
    mockFetch.mockResolvedValueOnce(
      makeResponse({ choices: [{ message: { content: JSON.stringify(parsed) } }] })
    );
    const result = await client.chatJSON('system prompt', 'user prompt');
    expect(result).toEqual(parsed);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ error: 'boom' }, 500));
    await expect(client.chatJSON('s', 'u')).rejects.toThrow('500');
  });

  it('throws when content is missing', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ choices: [{ message: {} }] }));
    await expect(client.chatJSON('s', 'u')).rejects.toThrow('missing content');
  });

  it('streams content deltas as tokens until [DONE]', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
      'data: [DONE]\n\n',
    ];
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, body } as Response);

    const tokens: string[] = [];
    for await (const token of client.chatStreamTokens('s', 'u', 'model-x')) {
      tokens.push(token);
    }
    expect(tokens).toEqual(['Hel', 'lo']);
  });

  it('sends Authorization header and correct URL', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce(
      makeResponse({ choices: [{ message: { content: '{}' } }] })
    );
    await client.chatJSON('system prompt', 'user prompt');
    const url = mockFetch.mock.calls[0][0] as string;
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
});
