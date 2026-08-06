// Helpers compartidos por los comandos: sesión y errores con exit codes.
import { QvaPayError } from "../lib/client"
import { readAuth } from "../lib/config"

export interface GlobalOpts {
  json?: boolean
  verbose?: boolean
}

// Devuelve el token o null (y fija exit 2 + mensaje) si no hay sesión.
export async function requireToken(opts: GlobalOpts): Promise<string | null> {
  const auth = await readAuth()
  if (auth) return auth.token
  notAuthenticated(opts.json)
  return null
}

export function notAuthenticated(json?: boolean): void {
  if (json) console.log(JSON.stringify({ error: "No autenticado" }))
  else console.error("No autenticado. Ejecuta: qvapay login")
  process.exitCode = 2
}

// Imprime un error y fija el exit code (401 -> 2 no autenticado, resto -> 1).
export function fail(e: unknown, json?: boolean): void {
  if (e instanceof QvaPayError && e.status === 401) {
    notAuthenticated(json)
    return
  }
  const msg = e instanceof QvaPayError ? e.message : "Error inesperado"
  if (json) console.log(JSON.stringify({ error: msg }))
  else console.error(`✖ ${msg}`)
  process.exitCode = 1
}
