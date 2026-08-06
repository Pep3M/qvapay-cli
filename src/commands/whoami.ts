import { getUser } from "../lib/auth"
import { fail, type GlobalOpts, requireToken } from "./util"

export async function whoamiCommand(opts: GlobalOpts): Promise<void> {
  const token = await requireToken(opts)
  if (!token) return

  try {
    const user = await getUser(token)
    if (opts.json) {
      console.log(JSON.stringify(user, null, 2))
    } else {
      console.log(`@${user.username}  (${user.name} ${user.lastname})`)
      console.log(`Email:   ${user.email}`)
      console.log(`Balance: ${user.balance}`)
    }
  } catch (e) {
    fail(e, opts)
  }
}
