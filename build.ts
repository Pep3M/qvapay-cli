// Build de distribución. Sin args: bundle npm (un cli.js self-contained, node).
// Con --compile: los 5 binarios autocontenidos (Bun) para GitHub Releases.
//
// react-devtools-core solo lo usa Ink en modo DEV (import dinámico guardado);
// lo stubeamos para no arrastrar tooling de dev ni dejar un import sin resolver.
import { chmod } from "node:fs/promises"

const stub: Bun.BunPlugin = {
  name: "stub-devtools",
  setup(build) {
    build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: "react-devtools-core",
      namespace: "stub",
    }))
    build.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: "export default {}",
      loader: "js",
    }))
  },
}

async function buildNpm() {
  const out = await Bun.build({
    entrypoints: ["src/cli.ts"],
    target: "node",
    outdir: "dist",
    minify: true,
    plugins: [stub],
  })
  if (!out.success) {
    for (const log of out.logs) console.error(log)
    process.exit(1)
  }
  // El paquete npm corre bajo node: cambia el shebang de bun por node.
  const file = "dist/cli.js"
  const src = await Bun.file(file).text()
  await Bun.write(file, src.replace(/^#![^\n]*\n/, "#!/usr/bin/env node\n"))
  await chmod(file, 0o755)
  console.log(`✓ dist/cli.js (${(Bun.file(file).size / 1024) | 0} KB)`)
}

// target -> nombre del binario. Windows lleva .exe.
const BINARIES: Record<string, string> = {
  "bun-linux-x64": "qvapay-linux-x64",
  "bun-linux-arm64": "qvapay-linux-arm64",
  "bun-darwin-x64": "qvapay-darwin-x64",
  "bun-darwin-arm64": "qvapay-darwin-arm64",
  "bun-windows-x64": "qvapay-windows-x64.exe",
}

async function buildBinaries() {
  for (const [target, name] of Object.entries(BINARIES)) {
    const out = await Bun.build({
      entrypoints: ["src/cli.ts"],
      compile: { target: target as `bun-${string}`, outfile: `dist/${name}` },
      minify: true,
      plugins: [stub],
    })
    if (!out.success) {
      for (const log of out.logs) console.error(log)
      process.exit(1)
    }
    console.log(`✓ dist/${name}`)
  }
}

if (process.argv.includes("--compile")) await buildBinaries()
else await buildNpm()
