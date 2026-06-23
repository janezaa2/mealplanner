// Incrementally pulls complete day objects out of a growing JSON string as a
// meal plan streams in token-by-token.

// Index just after the `[` that opens the "days" array, or -1.
function findDaysArrayStart(buffer: string): number {
  const keyIdx = buffer.indexOf('"days"');
  if (keyIdx === -1) return -1;
  const bracketIdx = buffer.indexOf('[', keyIdx);
  return bracketIdx === -1 ? -1 : bracketIdx + 1;
}

// Given buffer[start] === '{', returns the index of its matching '}', or -1 if
// the object is not yet complete. Respects strings and escapes.
function matchObjectEnd(buffer: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < buffer.length; i++) {
    const ch = buffer[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  return -1;
}

export function createDayExtractor() {
  let buffer = '';
  let arrayStart = -1;
  let cursor = 0;

  return {
    push(token: string): Record<string, unknown>[] {
      buffer += token;
      const out: Record<string, unknown>[] = [];

      if (arrayStart === -1) {
        arrayStart = findDaysArrayStart(buffer);
        if (arrayStart === -1) return out;
        cursor = arrayStart;
      }

      while (cursor < buffer.length) {
        while (cursor < buffer.length && /[\s,]/.test(buffer[cursor])) cursor++;
        if (cursor >= buffer.length || buffer[cursor] === ']') break;
        if (buffer[cursor] !== '{') break;

        const end = matchObjectEnd(buffer, cursor);
        if (end === -1) break;

        const slice = buffer.slice(cursor, end + 1);
        try {
          out.push(JSON.parse(slice) as Record<string, unknown>);
        } catch {
          // Wait for more tokens on a malformed slice.
        }
        cursor = end + 1;
      }

      return out;
    },
  };
}
