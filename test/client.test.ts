import { expect, test } from "bun:test"
import { normalizeError } from "../src/lib/client"

test("normalizeError extrae error/errors y no confunde message", () => {
  expect(normalizeError({ error: "boom" })).toBe("boom")
  expect(normalizeError({ errors: ["a", "b"] })).toBe("a, b")
  expect(normalizeError({ message: "PIN enviado" })).toBeNull() // message a solas no es error
  expect(normalizeError(null)).toBeNull()
})
