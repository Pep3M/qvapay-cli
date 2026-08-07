import { Box, Text } from "ink"
import Spinner from "ink-spinner"
import type { Transaction } from "../../lib/types"
import { DIM, FG, GREEN, LINE, MUTED, money, RED } from "../theme"

export function TxView({ txs }: { txs?: Transaction[] }) {
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
