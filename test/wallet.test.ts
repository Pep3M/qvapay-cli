import { expect, test } from "bun:test"
import type { Transaction } from "../src/lib/types"
import { clampTake, unwrapTransactions } from "../src/lib/wallet"

const tx = (uuid: string): Transaction => ({ uuid, amount: 1 })

test("unwrapTransactions acepta array crudo", () => {
  expect(unwrapTransactions([tx("a"), tx("b")]).length).toBe(2)
})

test("unwrapTransactions extrae de { transactions }", () => {
  const resp = { transactions: [tx("a"), tx("b"), tx("c")], total: 3 }
  expect(unwrapTransactions(resp).map((t) => t.uuid)).toEqual(["a", "b", "c"])
})

test("unwrapTransactions sin transactions devuelve []", () => {
  expect(unwrapTransactions({})).toEqual([])
})

test("clampTake limita a 1-30", () => {
  expect(clampTake(5)).toBe(5)
  expect(clampTake(100)).toBe(30)
  expect(clampTake(0)).toBe(1)
  expect(clampTake(undefined)).toBeUndefined()
  expect(clampTake(Number.NaN)).toBeUndefined()
})
