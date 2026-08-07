import { Box, Text } from "ink"
import { FG, LINE, MUTED } from "../theme"

export function Stat({ label, value }: { label: string; value: string }) {
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
