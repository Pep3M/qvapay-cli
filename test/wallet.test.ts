import { expect, test } from "bun:test"
import type { Transaction } from "../src/lib/types"
import { pickTransactions } from "../src/lib/wallet"

const tx = (uuid: string): Transaction => ({ uuid, amount: "1.00" })

test("pickTransactions extrae de respuesta paginada", () => {
  const resp = { data: [tx("a"), tx("b"), tx("c")], total: 3 }
  expect(pickTransactions(resp).map((t) => t.uuid)).toEqual(["a", "b", "c"])
})

test("pickTransactions acepta array crudo", () => {
  expect(pickTransactions([tx("a"), tx("b")]).length).toBe(2)
})

test("pickTransactions aplica el límite", () => {
  const resp = { data: [tx("a"), tx("b"), tx("c")] }
  expect(pickTransactions(resp, 2).map((t) => t.uuid)).toEqual(["a", "b"])
})

test("pickTransactions con data ausente devuelve []", () => {
  expect(pickTransactions({})).toEqual([])
})
