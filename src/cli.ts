#!/usr/bin/env bun
import { Command } from "commander"
import pkg from "../package.json" with { type: "json" }
import { loginCommand } from "./commands/login"
import { logoutCommand } from "./commands/logout"
import { whoamiCommand } from "./commands/whoami"
import { tuiStub } from "./tui/app"

const program = new Command()

program
  .name("qvapay")
  .description("CLI para la wallet personal de QvaPay")
  .version(pkg.version, "-V, --version")
  .option("--json", "salida en JSON (para agentes y scripts)")
  .option("--verbose", "log detallado a stderr (token redactado)")

program
  .command("login")
  .description("Iniciar sesión (email + PIN por correo)")
  .action(loginCommand)
program.command("logout").description("Cerrar sesión").action(logoutCommand)
program
  .command("whoami")
  .description("Muestra el usuario autenticado")
  .action(() => whoamiCommand(program.opts()))

// Sin subcomando -> TUI (por ahora, stub). Con subcomando -> Commander.
if (process.argv.length <= 2) {
  console.log(tuiStub())
  process.exit(0)
}

program.parseAsync().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
