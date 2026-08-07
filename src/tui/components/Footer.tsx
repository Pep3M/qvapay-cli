import { Box, Text } from "ink"
import { DIM } from "../theme"
import { type Conn, ConnStatus } from "./ConnStatus"

export function Footer({ conn }: { conn: Conn }) {
  return (
    <Box justifyContent="space-between" paddingX={1}>
      <Text color={DIM}>
        <Text color="#9a9ec2">1-5</Text> vista {"  "}
        <Text color="#9a9ec2">r</Text> refrescar {"  "}
        <Text color="#9a9ec2">Esc</Text> volver {"  "}
        <Text color="#9a9ec2">x</Text> salir sesión {"  "}
        <Text color="#9a9ec2">q</Text> salir
      </Text>
      <ConnStatus state={conn} />
    </Box>
  )
}
