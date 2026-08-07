import { expect, test } from "bun:test"
import { checkPolicy, type SendPolicy } from "../src/lib/policy"

const base: SendPolicy = {
  enabled: true,
  maxPerTx: null,
  dailyCap: null,
  whitelist: [],
}

test("deshabilitado bloquea siempre", () => {
  const r = checkPolicy({ ...base, enabled: false }, 1, "juan", 0)
  expect(r.ok).toBe(false)
})

test("permite sin límites ni whitelist", () => {
  expect(checkPolicy(base, 1000, "juan", 0).ok).toBe(true)
})

test("maxPerTx: bloquea por encima, permite igual", () => {
  const pol = { ...base, maxPerTx: 50 }
  expect(checkPolicy(pol, 50.01, "juan", 0).ok).toBe(false)
  expect(checkPolicy(pol, 50, "juan", 0).ok).toBe(true)
})

test("dailyCap: cuenta lo ya gastado hoy", () => {
  const pol = { ...base, dailyCap: 100 }
  expect(checkPolicy(pol, 40, "juan", 70).ok).toBe(false) // 70+40 > 100
  expect(checkPolicy(pol, 30, "juan", 70).ok).toBe(true) // 70+30 = 100
})

test("whitelist: solo permite a los listados", () => {
  const pol = { ...base, whitelist: ["juan"] }
  expect(checkPolicy(pol, 1, "ana", 0).ok).toBe(false)
  expect(checkPolicy(pol, 1, "juan", 0).ok).toBe(true)
})
