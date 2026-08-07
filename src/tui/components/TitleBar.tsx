import { Box, Text } from "ink"
import { useEffect, useState } from "react"
import { ACCENT } from "../theme"

// Rampa de morados para el degradado y el barrido del título (oscuro → brillante).
const RAMP = ["#2a2560", "#4b3fb0", "#6d5ef1", "#9a8cff", "#d8d2ff"]

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

export function TitleBar() {
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
