import { Box, Text } from "ink"
import { ACCENT, MUTED } from "../theme"

export const TABS = [
  { num: 1, label: "Balance" },
  { num: 2, label: "Enviar" },
  { num: 3, label: "P2P" },
  { num: 4, label: "Transacciones" },
  { num: 5, label: "Tienda" },
  { num: 6, label: "Config" },
]

export function TabStrip({ active }: { active: number }) {
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
