import { getMe } from "../lib/auth"
import { QvaPayError } from "../lib/client"
import { readAuth } from "../lib/config"

export async function whoamiCommand(opts: { json?: boolean }): Promise<void> {
  const auth = await readAuth()
  if (!auth) return notAuthenticated(opts.json)

  try {
    const me = await getMe(auth.token)
    if (opts.json) {
      console.log(JSON.stringify(me, null, 2))
    } else {
      console.log(`@${me.username}  (${me.name})`)
      console.log(`Email:   ${me.email}`)
      console.log(`Balance: ${me.balance}  (pendiente: ${me.pending_balance})`)
    }
  } catch (e) {
    // 401 -> token inválido/expirado
    if (e instanceof QvaPayError && e.status === 401)
      return notAuthenticated(opts.json)
    const msg = e instanceof QvaPayError ? e.message : "Error inesperado"
    if (opts.json) console.log(JSON.stringify({ error: msg }))
    else console.error(`✖ ${msg}`)
    process.exitCode = 1
  }
}

function notAuthenticated(json?: boolean): void {
  if (json) console.log(JSON.stringify({ error: "No autenticado" }))
  else console.error("No autenticado. Ejecuta: qvapay login")
  process.exitCode = 2
}
