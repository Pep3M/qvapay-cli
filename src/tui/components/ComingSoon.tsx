import { Box, Text } from "ink"
import { DIM, LINE, MUTED } from "../theme"

export function ComingSoon({ title, note }: { title: string; note: string }) {
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
