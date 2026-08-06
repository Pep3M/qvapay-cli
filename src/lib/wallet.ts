// Lectura de wallet: transacciones. El balance sale de /me (ver auth.getMe).
import { api } from "./client"
import type { Paginated, Transaction } from "./types"

// ponytail: paths del cliente oficial (client-node) + patrón /transaction/* de los docs.
// NO verificado aún contra la API personal con token real. Si falla, cambiar aquí.
const LIST_PATH = "/transactions"
const DETAIL_PATH = (uuid: string) => `/transaction/${uuid}`

export function listTransactions(
  token: string,
  page?: number
): Promise<Paginated<Transaction> | Transaction[]> {
  const q = page ? `?page=${page}` : ""
  return api<Paginated<Transaction> | Transaction[]>(`${LIST_PATH}${q}`, {
    token,
  })
}

export function getTransaction(token: string, uuid: string): Promise<unknown> {
  return api<unknown>(DETAIL_PATH(uuid), { token })
}

// Extrae el array de la respuesta (paginada o cruda) y aplica el límite local.
export function pickTransactions(
  resp: Paginated<Transaction> | Transaction[],
  limit?: number
): Transaction[] {
  const arr = Array.isArray(resp) ? resp : (resp.data ?? [])
  return typeof limit === "number" ? arr.slice(0, limit) : arr
}
