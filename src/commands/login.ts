import * as p from "@clack/prompts"
import { login, requestPin } from "../lib/auth"
import { QvaPayError } from "../lib/client"
import { writeAuth } from "../lib/config"

const REMEMBER_MS = 180 * 24 * 60 * 60 * 1000

export async function loginCommand(): Promise<void> {
  p.intro("QvaPay · Iniciar sesión")

  const email = await p.text({
    message: "Email",
    validate: (v) => (v.includes("@") ? undefined : "Email inválido"),
  })
  if (p.isCancel(email)) return cancel()

  const password = await p.password({ message: "Contraseña" })
  if (p.isCancel(password)) return cancel()

  const s = p.spinner()
  s.start("Solicitando PIN por correo…")
  try {
    await requestPin(email, password)
    s.stop("PIN enviado. Revisa tu correo.")
  } catch (e) {
    s.stop("Error al solicitar el PIN")
    return fail(e)
  }

  const pin = await p.password({ message: "PIN recibido por correo" })
  if (p.isCancel(pin)) return cancel()

  s.start("Iniciando sesión…")
  try {
    const res = await login(email, password, pin)
    await writeAuth({
      token: res.accessToken,
      expiresAt: Date.now() + REMEMBER_MS,
      email: res.me.email,
      username: res.me.username,
    })
    s.stop(`Sesión iniciada como @${res.me.username}`)
    p.outro(`Balance disponible: ${res.me.balance}`)
  } catch (e) {
    s.stop("Error al iniciar sesión")
    return fail(e)
  }
}

function cancel(): void {
  p.cancel("Cancelado.")
  process.exitCode = 1
}

function fail(e: unknown): void {
  const msg = e instanceof QvaPayError ? e.message : "Error inesperado"
  p.outro(`✖ ${msg}`)
  process.exitCode = 1
}
