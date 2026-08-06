import { Box, render, Text, useApp, useInput } from "ink"
import Spinner from "ink-spinner"
import { useCallback, useEffect, useState } from "react"
import { getUser } from "../lib/auth"
import { readAuth } from "../lib/config"
import type { Transaction, User } from "../lib/types"
import { listTransactions } from "../lib/wallet"

type Section = "balance" | "tx" | "help"

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
  const [section, setSection] = useState<Section>("balance")
  const [loading, setLoading] = useState(!initialUser && !fixture)
  const [error, setError] = useState<string | null>(null)
  const [noAuth, setNoAuth] = useState(false)

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

  // Carga de transacciones al entrar en la sección (una vez).
  useEffect(() => {
    if (section !== "tx" || txs || fixture || !token) return
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
  }, [section, txs, token, fixture])

  useInput((input, key) => {
    if (input === "q" || key.escape || (key.ctrl && input === "c")) exit()
    else if (input === "b") setSection("balance")
    else if (input === "t") setSection("tx")
    else if (input === "?") setSection("help")
    else if (input === "r" && !fixture) {
      setTxs(undefined)
      loadProfile()
    }
  })

  if (noAuth) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No hay sesión.</Text>
        <Text>
          Ejecuta <Text color="cyan">qvapay login</Text> y vuelve a abrir la
          interfaz.
        </Text>
        <Text dimColor>q para salir</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Header user={user} loading={loading} />
      <Box flexDirection="column" paddingX={1} minHeight={8}>
        {error ? (
          <Text color="red">✖ {error}</Text>
        ) : section === "balance" ? (
          <BalanceView user={user} loading={loading} />
        ) : section === "tx" ? (
          <TxView txs={txs} />
        ) : (
          <HelpView />
        )}
      </Box>
      <Footer section={section} />
    </Box>
  )
}

function Header({ user, loading }: { user?: User; loading: boolean }) {
  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      justifyContent="space-between"
    >
      <Text bold color="cyan">
        QvaPay
      </Text>
      {loading ? (
        <Spinner type="dots" />
      ) : (
        <Text dimColor>{user ? `@${user.username}` : ""}</Text>
      )}
      <Text color="green">{user ? `💰 ${user.balance}` : ""}</Text>
    </Box>
  )
}

function BalanceView({ user, loading }: { user?: User; loading: boolean }) {
  if (loading || !user) {
    return (
      <Text>
        <Spinner type="dots" /> cargando…
      </Text>
    )
  }
  return (
    <Box flexDirection="column">
      <Text dimColor>Balance disponible</Text>
      <Text bold color="green">
        {user.balance}
      </Text>
    </Box>
  )
}

function TxView({ txs }: { txs?: Transaction[] }) {
  if (!txs) {
    return (
      <Text>
        <Spinner type="dots" /> cargando…
      </Text>
    )
  }
  if (txs.length === 0) return <Text dimColor>Sin transacciones.</Text>
  return (
    <Box flexDirection="column">
      {txs.slice(0, 15).map((t) => (
        <Text key={t.uuid}>
          <Text dimColor>{(t.created_at ?? "").slice(0, 10)}</Text>
          {"  "}
          <Text color={t.status === "paid" ? "green" : "yellow"}>
            {String(t.amount).padStart(9)}
          </Text>
          {"  "}
          {t.description ?? ""}
        </Text>
      ))}
    </Box>
  )
}

function HelpView() {
  return (
    <Box flexDirection="column">
      <Text bold>Atajos</Text>
      <Text>
        <Text color="cyan">b</Text> balance · <Text color="cyan">t</Text>{" "}
        transacciones · <Text color="cyan">?</Text> ayuda ·{" "}
        <Text color="cyan">r</Text> refrescar · <Text color="cyan">q</Text>{" "}
        salir
      </Text>
      <Text> </Text>
      <Text bold>Comandos directos equivalentes</Text>
      <Text dimColor>qvapay balance · qvapay tx list · qvapay whoami</Text>
    </Box>
  )
}

function Footer({ section }: { section: Section }) {
  const item = (k: string, label: string, s: Section) => (
    <Text color={section === s ? "cyan" : undefined} dimColor={section !== s}>
      {" "}
      {k} {label}
    </Text>
  )
  return (
    <Box paddingX={1}>
      {item("b", "balance", "balance")}
      <Text dimColor> · </Text>
      {item("t", "transacciones", "tx")}
      <Text dimColor> · </Text>
      {item("?", "ayuda", "help")}
      <Text dimColor> · r refrescar · q salir</Text>
    </Box>
  )
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Error inesperado"
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
  render(<App />)
}
