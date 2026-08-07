import { Box, Text, useInput } from "ink"
import Spinner from "ink-spinner"
import { useState } from "react"
import { login, requestPin } from "../../lib/auth"
import { writeAuth } from "../../lib/config"
import { ACCENT, errMsg, FG, MUTED, RED } from "../theme"

const REMEMBER_MS = 180 * 24 * 60 * 60 * 1000

type Step = "email" | "password" | "requesting" | "pin" | "submitting"

const LABEL: Record<Step, string> = {
  email: "Email",
  password: "Contraseña",
  requesting: "Solicitando PIN por correo…",
  pin: "Revisa tu correo, y escribe el PIN recibido",
  submitting: "Iniciando sesión…",
}

export function LoginView({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)

  const busy = step === "requesting" || step === "submitting"

  function edit(fn: (v: string) => string): void {
    setError(null)
    if (step === "email") setEmail(fn)
    else if (step === "password") setPassword(fn)
    else if (step === "pin") setPin(fn)
  }

  async function next(): Promise<void> {
    if (step === "email") {
      if (!email.includes("@")) return setError("Email inválido")
      setStep("password")
    } else if (step === "password") {
      if (!password) return setError("Contraseña requerida")
      setStep("requesting")
      try {
        await requestPin(email, password)
        setStep("pin")
      } catch (e) {
        setError(errMsg(e))
        setStep("password")
      }
    } else if (step === "pin") {
      if (!pin) return setError("PIN requerido")
      setStep("submitting")
      try {
        const res = await login(email, password, pin)
        await writeAuth({
          token: res.accessToken,
          expiresAt: Date.now() + REMEMBER_MS,
          email: res.me.email,
          username: res.me.username,
        })
        onDone()
      } catch (e) {
        setError(errMsg(e))
        setStep("pin")
      }
    }
  }

  useInput((input, key) => {
    if (busy) return
    if (key.escape) return onCancel()
    if (key.return) {
      next()
      return
    }
    if (key.backspace || key.delete) return edit((v) => v.slice(0, -1))
    if (input && !key.ctrl && !key.meta) edit((v) => v + input)
  })

  // Enmascara los campos sensibles al mostrarlos.
  const shown =
    step === "email"
      ? email
      : step === "password"
        ? "•".repeat(password.length)
        : "•".repeat(pin.length)

  return (
    <Box flexDirection="column">
      <Text color={ACCENT}>Iniciar sesión</Text>
      <Box marginTop={1}>
        <Text color={MUTED}>{LABEL[step]} </Text>
        {busy ? (
          <Text color={ACCENT}>
            <Spinner type="dots" />
          </Text>
        ) : (
          <Text color={FG}>
            {shown}
            <Text color={ACCENT}>▏</Text>
          </Text>
        )}
      </Box>
      {error ? <Text color={RED}>✖ {error}</Text> : null}
      <Box marginTop={1}>
        <Text color={MUTED}>Enter continuar · Esc cancelar</Text>
      </Box>
    </Box>
  )
}
