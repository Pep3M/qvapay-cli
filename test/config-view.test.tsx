// Navegación del ConfigView: sub-tabs (Pagos/Agentes) y selección de agente.
// No pulsa Enter en Agentes (no toca el FS). XDG temporal por si Pagos escribe.
import { beforeAll, expect, test } from "bun:test"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { render } from "ink-testing-library"
import { AGENTS } from "../src/commands/skill"
import { ConfigView } from "../src/tui/components/ConfigView"

const UP = "\x1b[A"
const DOWN = "\x1b[B"
const RIGHT = "\x1b[C"
const tick = () => new Promise((r) => setTimeout(r, 20))
const noop = () => {}

beforeAll(async () => {
  process.env.XDG_CONFIG_HOME = await mkdtemp(join(tmpdir(), "qvapay-cv-"))
})

test("arranca en la sub-tab Pagos con la política", async () => {
  const { lastFrame } = render(<ConfigView onEditing={noop} />)
  await tick() // readConfig es async (antes muestra "Cargando…")
  expect(lastFrame()).toContain("Permitir send")
  expect(lastFrame()).toContain("Whitelist")
})

test("→ cambia a Agentes: primer agente y destino proyecto", async () => {
  const { lastFrame, stdin } = render(<ConfigView onEditing={noop} />)
  stdin.write(RIGHT)
  await tick()
  expect(lastFrame()).toContain(`❯ ${AGENTS[0]}`)
  expect(lastFrame()).toContain("proyecto (cwd)")
})

test("en Agentes: ↓ avanza y ↑ envuelve al último", async () => {
  const { lastFrame, stdin } = render(<ConfigView onEditing={noop} />)
  stdin.write(RIGHT)
  await tick()
  stdin.write(DOWN)
  await tick()
  expect(lastFrame()).toContain(`❯ ${AGENTS[1]}`)
  stdin.write(UP)
  await tick()
  stdin.write(UP) // desde el primero, envuelve al último
  await tick()
  expect(lastFrame()).toContain(`❯ ${AGENTS[AGENTS.length - 1]}`)
})

test("en Agentes: g alterna a destino global", async () => {
  const { lastFrame, stdin } = render(<ConfigView onEditing={noop} />)
  stdin.write(RIGHT)
  await tick()
  stdin.write("g")
  await tick()
  expect(lastFrame()).toContain("global (home)")
})
