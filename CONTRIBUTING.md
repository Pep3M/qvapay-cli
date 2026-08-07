# Contribuir a qvapay-cli

Gracias por el interés. El proyecto es pequeño y prefiere el código que no se
escribe: antes de añadir una dependencia o una abstracción, comprueba si la
stdlib, Bun o `fetch` nativo ya lo cubren.

## Entorno

Requiere [Bun](https://bun.sh) (Node ≥ 20 solo para el bundle publicado).

```bash
bun install
bun run dev          # CLI en watch (src/cli.ts)
bun run dev:tui      # TUI en watch (src/tui/dev.tsx)
```

## Antes de abrir un PR

```bash
bun test             # los tests deben pasar
bun run typecheck    # tsc --noEmit
bun run lint         # biome check .
bun run format       # biome format --write . (autofix)
```

## Estructura

```
src/
  cli.ts             # entrada: Commander (subcomandos) o TUI (sin args)
  commands/          # un fichero por comando; salida --json y exit codes
  lib/               # client, auth, config, policy, send, types, wallet
  tui/               # app Ink + components/
agent/SKILL.md       # skill para agentes, instalable por el CLI
```

## Convenciones

- **Runtime**: Bun + TypeScript, ESM. `fetch` nativo, sin axios.
- **Commits**: convencionales (`feat:`, `fix:`, `ci:`, `chore:`, `docs:`).
- **Seguridad**: nunca escribas la contraseña a disco; solo el token, en fichero
  `600`. `send` siempre pasa por el PIN por correo y la política local.
- **Menos es más**: sin interfaces de una sola implementación ni config para
  valores que nunca cambian. Si tomas un atajo deliberado, márcalo con un
  comentario `// ponytail:` que nombre el techo y la vía de mejora.
- **Tests**: `bun test`. Lógica no trivial (parser, política, dinero) deja al
  menos una comprobación que falle si se rompe.
