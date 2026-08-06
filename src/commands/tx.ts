import type { Transaction } from "../lib/types"
import {
  getTransaction,
  listTransactions,
  pickTransactions,
} from "../lib/wallet"
import { fail, type GlobalOpts, requireToken } from "./util"

interface ListOpts extends GlobalOpts {
  limit?: string
  page?: string
}

export async function txListCommand(opts: ListOpts): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  const limit = opts.limit ? Number(opts.limit) : undefined
  const page = opts.page ? Number(opts.page) : undefined

  try {
    const resp = await listTransactions(token, page)
    const txs = pickTransactions(resp, limit)
    if (opts.json) {
      console.log(JSON.stringify(txs, null, 2))
    } else if (txs.length === 0) {
      console.log("Sin transacciones.")
    } else {
      for (const t of txs) console.log(formatRow(t))
    }
  } catch (e) {
    fail(e, opts.json)
  }
}

export async function txGetCommand(
  uuid: string,
  opts: GlobalOpts
): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  try {
    const tx = await getTransaction(token, uuid)
    console.log(JSON.stringify(tx, null, 2))
  } catch (e) {
    fail(e, opts.json)
  }
}

function formatRow(t: Transaction): string {
  const date = (t.created_at ?? "").slice(0, 19).replace("T", " ")
  const status = t.status ?? "-"
  const desc = t.description ?? ""
  return `${date}  ${String(t.amount).padStart(10)}  ${status.padEnd(10)}  ${desc}`
}
