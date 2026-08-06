// Tipos portados de qvapay-tools (lib/types/qvapay.ts), recortados a lo que usa el CLI.

export interface QvaPayRequestPinResponse {
  message: string
}

export interface QvaPayLoginResponse {
  accessToken: string
  token_type: string
  me: Me
}

export interface Me {
  uuid: string
  username: string
  name: string
  lastname: string
  email: string
  bio: string
  image: string
  balance: string
  pending_balance: string
  satoshis: number
  phone: string
  phone_verified: boolean
  kyc: boolean
  vip: boolean
  golden_check: boolean
  role: string
  p2p_enabled: boolean
}

export interface QvaPayApiError {
  error?: string
  errors?: string[]
  message?: string
}

export interface Transaction {
  uuid: string
  amount: number | string
  description?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

// Respuesta de GET /user (Bearer). balance es NÚMERO; no hay pending_balance.
// Las transacciones recientes vienen embebidas en latest_transactions.
export interface User {
  uuid: string
  username: string
  name: string
  lastname: string
  email: string
  bio: string
  balance: number
  satoshis: number
  phone: string
  phone_verified: boolean
  kyc: boolean
  golden_check: boolean
  p2p_enabled: boolean
  image: string
  latest_transactions: Transaction[]
}
