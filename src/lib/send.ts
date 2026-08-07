// Transferencia de saldo. El PIN va en el body (nunca por argv). La API la
// ejecuta atómica y notifica a ambas partes. Rate limit del server: 1 / 10s.

import { api } from "./client"
import type { QvaPayRequestPinResponse, TransferResponse } from "./types"

// Dispara el envío del PIN de transferencia al correo. Solo necesita el token
// (a diferencia de /auth/request-pin, que exige email+password).
export function requestTransferPin(
  token: string
): Promise<QvaPayRequestPinResponse> {
  return api<QvaPayRequestPinResponse>("/user/reset-pin", {
    method: "POST",
    token,
  })
}

export function transfer(
  token: string,
  args: { amount: number; to: string; pin: string; description?: string }
): Promise<TransferResponse> {
  return api<TransferResponse>("/transaction/transfer", {
    method: "POST",
    token,
    body: JSON.stringify({
      amount: args.amount,
      to: args.to,
      pin: args.pin,
      ...(args.description ? { description: args.description } : {}),
    }),
  })
}
