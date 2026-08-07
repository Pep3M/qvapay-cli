import { Box, Text } from "ink"
import Spinner from "ink-spinner"
import type { Transaction, User } from "../../lib/types"
import { ACCENT, FG, LINE, MUTED } from "../theme"
import { Sparkline } from "./Sparkline"
import { Stat } from "./Stat"

export function BalanceView({
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
