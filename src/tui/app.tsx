import { Box, render, Text, useApp, useInput } from "ink"
import { useCallback, useEffect, useState } from "react"
import { getUser } from "../lib/auth"
import { clearAuth, readAuth } from "../lib/config"
import type { Transaction, User } from "../lib/types"
import { listTransactions } from "../lib/wallet"
import { BalanceView } from "./components/BalanceView"
import { ComingSoon } from "./components/ComingSoon"
import { connOf } from "./components/ConnStatus"
import { Footer } from "./components/Footer"
import { LoginView } from "./components/LoginView"
import { NoAuth } from "./components/NoAuth"
import { TabStrip } from "./components/TabStrip"
import { TitleBar } from "./components/TitleBar"
import { TxView } from "./components/TxView"
import { errMsg, FG, GREEN, LINE, MUTED, RED } from "./theme"

interface AppProps {
  initialUser?: User
  initialTxs?: Transaction[]
  fixture?: boolean // datos inyectados, sin red (para dev.tsx)
}

export function App({ initialUser, initialTxs, fixture }: AppProps) {
  const { exit } = useApp()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | undefined>(initialUser)
  const [txs, setTxs] = useState<Transaction[] | undefined>(initialTxs)
  const [tab, setTab] = useState(1)
  const [loading, setLoading] = useState(!initialUser && !fixture)
  const [error, setError] = useState<string | null>(null)
  const [noAuth, setNoAuth] = useState(false)
  const [overlay, setOverlay] = useState<null | "confirm" | "login">(null)

  const doLogout = useCallback(async () => {
    await clearAuth()
    setToken(null)
    setUser(undefined)
    setTxs(undefined)
    setTab(1)
    setNoAuth(true)
    setOverlay(null)
  }, [])

  // Carga el perfil desde la API. Reutilizada en el montaje y al pulsar 'r'.
  const loadProfile = useCallback(async () => {
    setError(null)
    setLoading(true)
    const auth = await readAuth()
    if (!auth) {
      setNoAuth(true)
      setLoading(false)
      return
    }
    setToken(auth.token)
    try {
      setUser(await getUser(auth.token))
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!fixture && !initialUser) loadProfile()
  }, [fixture, initialUser, loadProfile])

  // Carga de transacciones al entrar en la pestaña (una vez).
  useEffect(() => {
    if (tab !== 4 || txs || fixture || !token) return
    let alive = true
    ;(async () => {
      try {
        const list = await listTransactions(token, { take: 20 })
        if (alive) setTxs(list)
      } catch (e) {
        if (alive) setError(errMsg(e))
      }
    })()
    return () => {
      alive = false
    }
  }, [tab, txs, token, fixture])

  useInput((input, key) => {
    if (overlay === "login") return // LoginView captura sus propias teclas
    if (overlay === "confirm") {
      if (input === "s" || input === "S") doLogout()
      else if (key.escape || input === "n" || input === "N") setOverlay(null)
      return
    }
    if (input === "q" || (key.ctrl && input === "c")) return exit()
    if (noAuth) {
      if (!fixture && (key.return || input === "l")) setOverlay("login")
      return
    }
    if (key.escape) tab === 1 ? exit() : setTab(1)
    else if (["1", "2", "3", "4", "5"].includes(input)) setTab(Number(input))
    else if (input === "r" && !fixture) {
      setTxs(undefined)
      loadProfile()
    } else if (input === "x" && !fixture) setOverlay("confirm")
  })

  const recent = txs ?? user?.latest_transactions ?? []
  const conn = connOf({ user, loading, noAuth, error })

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={LINE}
      paddingX={1}
    >
      <TitleBar />
      <TabStrip active={tab} />
      <Box flexDirection="column" paddingY={1} minHeight={14}>
        {overlay === "login" ? (
          <LoginView
            onDone={() => {
              setOverlay(null)
              setNoAuth(false)
              loadProfile()
            }}
            onCancel={() => setOverlay(null)}
          />
        ) : overlay === "confirm" ? (
          <Box flexDirection="column">
            <Text color={FG}>¿Cerrar la sesión actual?</Text>
            <Box marginTop={1}>
              <Text color={MUTED}>
                <Text color={GREEN}>s</Text> sí {"  "}
                <Text color={RED}>n</Text> no
              </Text>
            </Box>
          </Box>
        ) : noAuth ? (
          <NoAuth />
        ) : error ? (
          <Text color={RED}>✖ {error}</Text>
        ) : tab === 1 ? (
          <BalanceView user={user} txs={recent} loading={loading} />
        ) : tab === 2 ? (
          <ComingSoon
            title="Nuevo envío"
            note="Disponible en Fase 4 · requiere PIN por correo"
          />
        ) : tab === 3 ? (
          <ComingSoon title="Mercado P2P" note="Próximamente" />
        ) : tab === 4 ? (
          <TxView txs={txs} />
        ) : (
          <ComingSoon
            title="Tienda"
            note="Gift cards · Recargas · eSIM · Próximamente"
          />
        )}
      </Box>
      <Footer conn={conn} />
    </Box>
  )
}

// Arranca la TUI. En un contexto sin TTY (pipe, agente) muestra un texto de ayuda.
export function startTui() {
  if (!process.stdin.isTTY) {
    console.log(
      [
        "QvaPay CLI — la interfaz interactiva necesita una terminal.",
        "Usa los comandos directos: qvapay balance · qvapay tx list · qvapay --help",
      ].join("\n")
    )
    return
  }
  const { waitUntilExit } = render(<App />)
  // Al salir (q), termina el proceso aunque quede algún handle de stdin colgado.
  waitUntilExit().finally(() => process.exit(0))
}
