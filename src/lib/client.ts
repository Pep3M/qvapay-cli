// Cliente HTTP de QvaPay. fetch nativo, base fijada, Bearer opcional.
// Nunca loguea el token.

import type { QvaPayApiError } from "./types"

export const API_BASE = "https://api.qvapay.com"

export class QvaPayError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = "QvaPayError"
    this.status = status
  }
}

type ApiInit = Omit<RequestInit, "headers"> & {
  token?: string
  headers?: Record<string, string>
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { token, headers, ...rest } = init
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const data = (await res.json().catch(() => null)) as
    | (QvaPayApiError & T)
    | null

  if (!res.ok || data?.error || data?.errors) {
    throw new QvaPayError(
      normalizeError(data) ?? `HTTP ${res.status}`,
      res.status
    )
  }
  return data as T
}

// Normaliza { error | errors | message } a un solo mensaje.
// `message` a solas NO es error (p. ej. /auth/request-pin devuelve { message }).
export function normalizeError(data: QvaPayApiError | null): string | null {
  if (!data) return null
  if (typeof data.error === "string") return data.error
  if (Array.isArray(data.errors)) return data.errors.join(", ")
  if ((data.error || data.errors) && typeof data.message === "string")
    return data.message
  return null
}
