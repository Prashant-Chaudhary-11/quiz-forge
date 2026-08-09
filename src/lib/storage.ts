const API_KEY_STORAGE = "gemini_api_key";

export function getApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.trim().length > 0;
}
