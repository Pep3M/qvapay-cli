import { Box, Text } from "ink"
import { ACCENT, FG } from "../theme"

export function NoAuth() {
  return (
    <Box flexDirection="column">
      <Text color="yellow">No hay sesión.</Text>
      <Text color={FG}>
        Pulsa <Text color={ACCENT}>Enter</Text> para iniciar sesión aquí mismo.
      </Text>
    </Box>
  )
}
