// Almacenamiento local. Solo el token toca el disco, nunca la contraseña.
// auth.json con permisos 600, directorio 700, escritura atómica.

import {
  chmod,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

export function configDir(): string {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
  return join(base, "qvapay")
}

export function authFile(): string {
  return join(configDir(), "auth.json")
}

export interface StoredAuth {
  token: string
  expiresAt: number | null
  email: string
  username: string
}

export async function readAuth(): Promise<StoredAuth | null> {
  try {
    const auth = JSON.parse(await readFile(authFile(), "utf8")) as StoredAuth
    if (auth.expiresAt && Date.now() >= auth.expiresAt) return null
    return auth
  } catch {
    return null
  }
}

export async function writeAuth(auth: StoredAuth): Promise<void> {
  const dir = configDir()
  await mkdir(dir, { recursive: true, mode: 0o700 })
  const file = authFile()
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(auth, null, 2), { mode: 0o600 })
  await chmod(tmp, 0o600) // por si umask afectó al crear
  await rename(tmp, file)
}

export async function clearAuth(): Promise<void> {
  await unlink(authFile()).catch(() => {})
}
