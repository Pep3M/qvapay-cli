import { Box, Text } from "ink"
import { ACCENT, FG } from "../theme"

export function NoAuth() {
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
