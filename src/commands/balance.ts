import { getUser } from "../lib/auth"
import { fail, type GlobalOpts, requireToken } from "./util"

export async function balanceCommand(opts: GlobalOpts): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  try {
    const user = await getUser(token)
    if (opts.json) {
      console.log(JSON.stringify({ balance: user.balance }))
    } else {
      console.log(`Disponible: ${user.balance}`)
    }
  } catch (e) {
    fail(e, opts)
  }
}
