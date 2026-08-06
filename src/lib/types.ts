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

// Forma laxa: la API personal aún no está confirmada campo a campo.
export interface Transaction {
  uuid: string
  amount: string | number
  description?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

export interface Paginated<T> {
  data?: T[]
  current_page?: number
  last_page?: number
  total?: number
}
