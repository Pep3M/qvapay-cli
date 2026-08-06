import { clearAuth } from "../lib/config"

export async function logoutCommand(): Promise<void> {
  await clearAuth()
  console.log("Sesión cerrada.")
}
