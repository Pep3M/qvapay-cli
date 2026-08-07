// Navegación del ConfigView: selección con wraparound y toggle proyecto/global.
// No pulsa Enter, así que no toca el FS (installSkill se prueba vía el CLI).
import { expect, test } from "bun:test"
import { render } from "ink-testing-library"
import { AGENTS } from "../src/commands/skill"
import { ConfigView } from "../src/tui/components/ConfigView"

const UP = "\x1b[A"
const DOWN = "\x1b[B"
const tick = () => new Promise((r) => setTimeout(r, 20))

test("selección inicial: primer agente y destino proyecto", () => {
  const { lastFrame } = render(<ConfigView />)
  expect(lastFrame()).toContain(`❯ ${AGENTS[0]}`)
  expect(lastFrame()).toContain("proyecto (cwd)")
})

test("↓ mueve al siguiente y ↑ envuelve al último", async () => {
  const { lastFrame, stdin } = render(<ConfigView />)
  stdin.write(DOWN)
  await tick()
  expect(lastFrame()).toContain(`❯ ${AGENTS[1]}`)
  stdin.write(UP)
  await tick()
  stdin.write(UP) // desde el primero, envuelve al último
  await tick()
  expect(lastFrame()).toContain(`❯ ${AGENTS[AGENTS.length - 1]}`)
})

test("g alterna a destino global", async () => {
  const { lastFrame, stdin } = render(<ConfigView />)
  stdin.write("g")
  await tick()
  expect(lastFrame()).toContain("global (home)")
})
