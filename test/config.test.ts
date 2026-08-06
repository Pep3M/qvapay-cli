import { afterAll, beforeAll, expect, test } from "bun:test"
import { mkdtemp, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { authFile, clearAuth, readAuth, writeAuth } from "../src/lib/config"

let dir: string

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "qvapay-test-"))
  process.env.XDG_CONFIG_HOME = dir
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

test("writeAuth/readAuth roundtrip y fichero con permisos 600", async () => {
  await writeAuth({
    token: "secreto",
    expiresAt: null,
    email: "a@b.c",
    username: "x",
  })
  const auth = await readAuth()
  expect(auth?.token).toBe("secreto")
  expect(auth?.username).toBe("x")

  const st = await stat(authFile())
  expect(st.mode & 0o777).toBe(0o600)
})

test("token expirado devuelve null", async () => {
  await writeAuth({
    token: "t",
    expiresAt: Date.now() - 1000,
    email: "a@b.c",
    username: "x",
  })
  expect(await readAuth()).toBeNull()
})

test("clearAuth borra y readAuth devuelve null", async () => {
  await writeAuth({
    token: "t",
    expiresAt: null,
    email: "a@b.c",
    username: "x",
  })
  await clearAuth()
  expect(await readAuth()).toBeNull()
})
