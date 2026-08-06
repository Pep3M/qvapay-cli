// Entry de desarrollo visual (equivalente a Storybook). Renderiza la TUI con
// datos de prueba, sin login ni red. Correr con: bun run dev:tui
// ponytail: fixtures entry, no framework de stories.
import { render } from "ink"
import type { Transaction, User } from "../lib/types"
import { App } from "./app"

const user: User = {
  uuid: "demo-uuid",
  username: "demo",
  name: "Demo",
  lastname: "User",
  email: "demo@qvapay.test",
  bio: "",
  balance: 150.75,
  satoshis: 0,
  phone: "",
  phone_verified: true,
  kyc: true,
  golden_check: false,
  p2p_enabled: true,
  image: "",
  latest_transactions: [],
}

const txs: Transaction[] = [
  {
    uuid: "1",
    amount: 25,
    description: "Pago de servicio",
    status: "paid",
    created_at: "2024-06-20T14:30:00.000Z",
  },
  {
    uuid: "2",
    amount: 10,
    description: "Recarga",
    status: "pending",
    created_at: "2024-06-19T10:00:00.000Z",
  },
  {
    uuid: "3",
    amount: 5.5,
    description: "Café",
    status: "paid",
    created_at: "2024-06-18T09:15:00.000Z",
  },
]

render(<App initialUser={user} initialTxs={txs} fixture />)
