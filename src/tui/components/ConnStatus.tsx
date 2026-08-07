import { Text } from "ink"
import type { User } from "../../lib/types"
import { GREEN, RED } from "../theme"

// Estado de conexión real, derivado del ciclo de carga del perfil.
export type Conn = "connecting" | "online" | "noauth" | "error"

export function connOf(p: {
  user?: User
  loading: boolean
  noAuth: boolean
  error: string | null
}): Conn {
  if (p.noAuth) return "noauth"
  if (p.error) return "error"
  if (p.loading || !p.user) return "connecting"
  return "online"
}

const CONN_UI: Record<Conn, { color: string; label: string; dot: string }> = {
  connecting: { color: "#febc2e", label: "conectando…", dot: "◌" },
  online: { color: GREEN, label: "conectado", dot: "●" },
  noauth: { color: "#febc2e", label: "sin sesión", dot: "○" },
  error: { color: RED, label: "sin conexión", dot: "●" },
}

export function ConnStatus({ state }: { state: Conn }) {
  const s = CONN_UI[state]
  return (
    <Text color={s.color}>
      {s.dot} {s.label}
    </Text>
  )
}
