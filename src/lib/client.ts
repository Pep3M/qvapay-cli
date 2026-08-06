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

  const text = await res.text()
  let data: (QvaPayApiError & T) | null = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // cuerpo no-JSON: se maneja abajo
    }
  }

  if (!res.ok || data?.error || data?.errors) {
    throw new QvaPayError(
      normalizeError(data) ?? `HTTP ${res.status} en ${path}`,
      res.status
    )
  }

  // 2xx pero sin JSON usable: NO devolver null en silencio, mostrar la causa.
  if (data === null) {
    const ct = res.headers.get("content-type") ?? "desconocido"
    const body = text ? text.slice(0, 160).replace(/\s+/g, " ") : "(vacío)"
    throw new QvaPayError(
      `Respuesta no-JSON de ${path} (HTTP ${res.status}, ${ct}): ${body}`,
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
