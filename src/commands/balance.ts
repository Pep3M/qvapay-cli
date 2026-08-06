import { getMe } from "../lib/auth"
import { fail, type GlobalOpts, requireToken } from "./util"

export async function balanceCommand(opts: GlobalOpts): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  try {
    const me = await getMe(token)
    if (opts.json) {
      console.log(
        JSON.stringify({
          balance: me.balance,
          pending_balance: me.pending_balance,
        })
      )
    } else {
      console.log(`Disponible: ${me.balance}`)
      console.log(`Pendiente:  ${me.pending_balance}`)
    }
  } catch (e) {
    fail(e, opts.json)
  }
}
