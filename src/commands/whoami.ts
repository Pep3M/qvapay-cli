import { getMe } from "../lib/auth"
import { fail, type GlobalOpts, requireToken } from "./util"

export async function whoamiCommand(opts: GlobalOpts): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  try {
    const me = await getMe(token)
    if (opts.json) {
      console.log(JSON.stringify(me, null, 2))
    } else {
      console.log(`@${me.username}  (${me.name})`)
      console.log(`Email:   ${me.email}`)
      console.log(`Balance: ${me.balance}  (pendiente: ${me.pending_balance})`)
    }
  } catch (e) {
    fail(e, opts.json)
  }
}
