import { Text } from "ink"
import type { Transaction } from "../../lib/types"
import { DIM, GREEN, RED } from "../theme"

const BLOCKS = "▁▂▃▄▅▆▇█"

export function Sparkline({ txs }: { txs: Transaction[] }) {
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
