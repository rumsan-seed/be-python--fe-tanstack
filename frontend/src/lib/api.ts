const API_BASE = "/api/v1"

function getApiKey(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("app_api_key")
}

export function setApiKey(key: string) {
  localStorage.setItem("app_api_key", key)
}

export function clearApiKey() {
  localStorage.removeItem("app_api_key")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }
  if (apiKey) {
    headers["X-API-Key"] = apiKey
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

// --- Auth ---
export const auth = {
  checkRequired: () => request<{ required: boolean }>("/auth/required"),
  check: () => request<{ status: string; auth_required: boolean }>("/auth/check"),
}

// --- Notes ---
export interface Note {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

export const notes = {
  list: () => request<Note[]>("/notes"),
  get: (id: number) => request<Note>(`/notes/${id}`),
  create: (title: string, body = "") =>
    request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify({ title, body }),
    }),
  update: (id: number, data: Partial<Pick<Note, "title" | "body">>) =>
    request<Note>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/notes/${id}`, { method: "DELETE" }),
}
