export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  messages?: Message[];
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string; errors?: Record<string, string[]> }
    | null;

  if (!response.ok) {
    const message =
      payload && 'message' in payload && payload.message
        ? payload.message
        : 'Permintaan tidak dapat diproses.';
    throw new Error(message);
  }

  return payload && 'data' in payload ? payload.data : (payload as T);
}
export { cn } from 'cn';
