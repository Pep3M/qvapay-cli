import { Box, Text, useInput } from "ink"
import { useState } from "react"
import { AGENTS, installSkill } from "../../commands/skill"
import { ACCENT, errMsg, FG, GREEN, MUTED, RED } from "../theme"

// Instalar la skill de QvaPay en el agente elegido. ↑/↓ mueve, g alterna
// global/proyecto, Enter instala.
export function ConfigView() {
  const [sel, setSel] = useState(0)
  const [global, setGlobal] = useState(false)
  const [result, setResult] = useState<
    { ok: true; path: string } | { ok: false; msg: string } | null
  >(null)

  useInput((input, key) => {
    if (key.upArrow || input === "k") {
      setSel((s) => (s - 1 + AGENTS.length) % AGENTS.length)
    } else if (key.downArrow || input === "j") {
      setSel((s) => (s + 1) % AGENTS.length)
    } else if (input === "g") {
      setGlobal((g) => !g)
    } else if (key.return) {
      const agent = AGENTS[sel]
      installSkill(agent, { global })
        .then((path) => setResult({ ok: true, path }))
        .catch((e) => setResult({ ok: false, msg: errMsg(e) }))
    }
  })

  return (
    <Box flexDirection="column">
      <Text color={ACCENT}>Integrar la skill de QvaPay en un agente</Text>
      <Box marginTop={1} flexDirection="column">
        {AGENTS.map((a, i) => {
          const on = i === sel
          return (
            <Text key={a} color={on ? FG : MUTED}>
              {on ? "❯ " : "  "}
              <Text color={on ? ACCENT : MUTED}>{a}</Text>
            </Text>
          )
        })}
      </Box>
      <Box marginTop={1}>
        <Text color={MUTED}>
          Destino:{" "}
          <Text color={FG}>{global ? "global (home)" : "proyecto (cwd)"}</Text>
        </Text>
      </Box>
      {result ? (
        <Box marginTop={1}>
          {result.ok ? (
            <Text color={GREEN}>✔ Instalada en {result.path}</Text>
          ) : (
            <Text color={RED}>✖ {result.msg}</Text>
          )}
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Text color={MUTED}>
          <Text color="#9a9ec2">↑↓</Text> elegir {"  "}
          <Text color="#9a9ec2">g</Text> global/proyecto {"  "}
          <Text color="#9a9ec2">Enter</Text> instalar
        </Text>
      </Box>
    </Box>
  )
}
