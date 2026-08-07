import { Box, render, Text, useApp, useInput } from "ink"
import Spinner from "ink-spinner"
import { useCallback, useEffect, useState } from "react"
import { getUser } from "../lib/auth"
import { readAuth } from "../lib/config"
import type { Transaction, User } from "../lib/types"
import { listTransactions } from "../lib/wallet"

// Paleta portada del diseño (QvaPay CLI.dc.html).
const ACCENT = "#6d5ef1"
const FG = "#e7e8f2"
const MUTED = "#7b7f9e"
const DIM = "#565a78"
const LINE = "#2a2c40"
const GREEN = "#3ddc84"
const RED = "#f0506b"

// Rampa de morados para el degradado y el barrido del título (oscuro → brillante).
const RAMP = ["#2a2560", "#4b3fb0", "#6d5ef1", "#9a8cff", "#d8d2ff"]

const TABS = [
  { num: 1, label: "Balance" },
  { num: 2, label: "Enviar" },
  { num: 3, label: "P2P" },
  { num: 4, label: "Transacciones" },
  { num: 5, label: "Tienda" },
]

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
    if (input === "q" || (key.ctrl && input === "c")) return exit()
    if (key.escape) tab === 1 ? exit() : setTab(1)
    else if (["1", "2", "3", "4", "5"].includes(input)) setTab(Number(input))
    else if (input === "r" && !fixture) {
      setTxs(undefined)
      loadProfile()
    }
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
        {noAuth ? (
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

// Arte figlet "qvapay-cli" dejado por el usuario; String.raw preserva los backslashes.
const TITLE_ASCII =
  String.raw`________                                                   .__  .__
\_____  \___  _______  ___________  ___.__.           ____ |  | |__|
 /  / \  \  \/ /\__  \ \____ \__  \<   |  |  ______ _/ ___\|  | |  |
/   \_/.  \   /  / __ \|  |_> > __ \\___  | /_____/ \  \___|  |_|  |
\_____\ \_/\_/  (____  /   __(____  / ____|          \___  >____/__|
       \__>          \/|__|       \/\/                   \/         `.split(
    "\n"
  )

// Degradado vertical (glow al centro) para el título siempre presente.
const TITLE_ROW_COLORS = [RAMP[2], RAMP[3], RAMP[4], RAMP[4], RAMP[3], RAMP[2]]

function TitleBar() {
  // Un único barrido de brillo al abrir: una banda recorre el figlet de
  // izquierda a derecha y se detiene, dejando el degradado base.
  const width = TITLE_ASCII[0]?.length ?? 60
  const [sweep, setSweep] = useState(-8)
  useEffect(() => {
    const id = setInterval(() => {
      setSweep((s) => {
        if (s > width + 8) {
          clearInterval(id)
          return s
        }
        return s + 2
      })
    }, 35)
    return () => clearInterval(id)
  }, [width])
  const done = sweep > width + 8

  return (
    <Box flexDirection="column" alignItems="center">
      {TITLE_ASCII.map((line, r) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: filas fijas del título
        <Text key={r} bold>
          {[...line].map((ch, c) => {
            if (ch === " ") return " "
            const base = TITLE_ROW_COLORS[r] ?? ACCENT
            const dist = done ? 99 : Math.abs(c - sweep)
            const color =
              dist <= 1
                ? "#ffffff"
                : dist <= 3
                  ? RAMP[4]
                  : dist <= 6
                    ? RAMP[3]
                    : base
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: celdas fijas del título
              <Text key={c} color={color}>
                {ch}
              </Text>
            )
          })}
        </Text>
      ))}
    </Box>
  )
}

function TabStrip({ active }: { active: number }) {
  return (
    <Box marginTop={1}>
      {TABS.map((t) => {
        const on = t.num === active
        return (
          <Box key={t.num} marginRight={1}>
            <Text
              bold
              color={on ? "white" : MUTED}
              backgroundColor={on ? ACCENT : undefined}
            >
              {` ${t.num} ${t.label} `}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

function BalanceView({
  user,
  txs,
  loading,
}: {
  user?: User
  txs: Transaction[]
  loading: boolean
}) {
  if (loading || !user) {
    return (
      <Text color={MUTED}>
        <Spinner type="dots" /> cargando…
      </Text>
    )
  }
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={LINE}
      paddingX={2}
      paddingY={1}
    >
      <Text color={MUTED}>Balance total · @{user.username}</Text>
      <Text bold color={FG}>{`$${Number(user.balance).toFixed(2)}`}</Text>
      <Box marginTop={1}>
        <Sparkline txs={txs} />
      </Box>
      <Box marginTop={1}>
        <Stat
          label="DISPONIBLE"
          value={`$${Number(user.balance).toFixed(2)}`}
        />
        <Stat label="SATOSHIS" value={String(user.satoshis)} />
        <Stat label="MOVIMIENTOS" value={String(txs.length)} />
      </Box>
      <Box marginTop={1}>
        <Text bold color="white" backgroundColor={ACCENT}>
          {" Enviar 2 "}
        </Text>
        <Text> </Text>
        <Text color="#c9cbe0">{" Depositar D "}</Text>
        <Text> </Text>
        <Text color="#c9cbe0">{" Retirar R "}</Text>
      </Box>
    </Box>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={LINE}
      paddingX={1}
      marginRight={1}
      minWidth={16}
    >
      <Text color={MUTED}>{label}</Text>
      <Text bold color={FG}>
        {value}
      </Text>
    </Box>
  )
}

const BLOCKS = "▁▂▃▄▅▆▇█"
function Sparkline({ txs }: { txs: Transaction[] }) {
  const vals = txs
    .slice(0, 12)
    .reverse()
    .map((t) => Number(t.amount || 0))
  if (!vals.length) return <Text color={DIM}>sin movimientos recientes</Text>
  const max = Math.max(...vals.map((v) => Math.abs(v)), 1)
  return (
    <Text>
      {vals.map((v, i) => {
        const lvl = Math.round((Math.abs(v) / max) * (BLOCKS.length - 1))
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: barras estáticas de datos
          <Text key={i} color={v < 0 ? RED : GREEN}>
            {BLOCKS[lvl]}
          </Text>
        )
      })}
    </Text>
  )
}

function TxView({ txs }: { txs?: Transaction[] }) {
  if (!txs) {
    return (
      <Text color={MUTED}>
        <Spinner type="dots" /> cargando…
      </Text>
    )
  }
  if (txs.length === 0) return <Text color={DIM}>Sin transacciones.</Text>
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={LINE}
      paddingX={2}
    >
      {txs.slice(0, 12).map((t) => {
        const n = Number(t.amount || 0)
        return (
          <Box key={t.uuid} justifyContent="space-between">
            <Box flexDirection="column">
              <Text color={FG}>{t.description ?? "—"}</Text>
              <Text color={DIM}>
                {String(t.uuid).slice(0, 8)} ·{" "}
                {(t.created_at ?? "").slice(0, 10)}
              </Text>
            </Box>
            <Text bold color={n < 0 ? RED : GREEN}>
              {money(n)}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      borderStyle="round"
      borderColor={LINE}
      paddingX={2}
      paddingY={2}
    >
      <Text color={MUTED}>{title}</Text>
      <Text color={DIM}>{note}</Text>
      <Box marginTop={1}>
        <Text color={DIM}>
          Pulsa <Text color="#9a9ec2">1</Text> para volver a Balance
        </Text>
      </Box>
    </Box>
  )
}

function NoAuth() {
  return (
    <Box flexDirection="column">
      <Text color="yellow">No hay sesión.</Text>
      <Text color={FG}>
        Ejecuta <Text color={ACCENT}>qvapay login</Text> y vuelve a abrir la
        interfaz.
      </Text>
    </Box>
  )
}

function Footer({ conn }: { conn: Conn }) {
  return (
    <Box justifyContent="space-between" paddingX={1}>
      <Text color={DIM}>
        <Text color="#9a9ec2">1-5</Text> vista {"  "}
        <Text color="#9a9ec2">r</Text> refrescar {"  "}
        <Text color="#9a9ec2">Esc</Text> volver {"  "}
        <Text color="#9a9ec2">q</Text> salir
      </Text>
      <ConnStatus state={conn} />
    </Box>
  )
}

// Estado de conexión real, derivado del ciclo de carga del perfil.
type Conn = "connecting" | "online" | "noauth" | "error"

function connOf(p: {
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

function ConnStatus({ state }: { state: Conn }) {
  const s = CONN_UI[state]
  return (
    <Text color={s.color}>
      {s.dot} {s.label}
    </Text>
  )
}

function money(n: number): string {
  return `${n < 0 ? "-" : "+"}$${Math.abs(n).toFixed(2)}`
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
  const { waitUntilExit } = render(<App />)
  // Al salir (q), termina el proceso aunque quede algún handle de stdin colgado.
  waitUntilExit().finally(() => process.exit(0))
}
