#!/usr/bin/env bun
import { Command } from "commander"
import pkg from "../package.json" with { type: "json" }
import { balanceCommand } from "./commands/balance"
import { loginCommand } from "./commands/login"
import { logoutCommand } from "./commands/logout"
import { txGetCommand, txListCommand } from "./commands/tx"
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
program
  .command("balance")
  .description("Balance disponible y pendiente")
  .action(() => balanceCommand(program.opts()))

const tx = program.command("tx").description("Transacciones")
tx.command("list")
  .description("Lista las últimas transacciones")
  .option("--limit <n>", "máximo a mostrar")
  .option("--page <n>", "página")
  .action((opts) => txListCommand({ ...program.opts(), ...opts }))
tx.command("get <uuid>")
  .description("Detalle de una transacción")
  .action((uuid) => txGetCommand(uuid, program.opts()))

// Sin subcomando -> TUI (por ahora, stub). Con subcomando -> Commander.
if (process.argv.length <= 2) {
  console.log(tuiStub())
  process.exit(0)
}

program.parseAsync().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
