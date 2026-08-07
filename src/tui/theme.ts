// Paleta portada del diseño (QvaPay CLI.dc.html) y helpers de formato compartidos.
export const ACCENT = "#6d5ef1"
export const FG = "#e7e8f2"
export const MUTED = "#7b7f9e"
export const DIM = "#565a78"
export const LINE = "#2a2c40"
export const GREEN = "#3ddc84"
export const RED = "#f0506b"

export function money(n: number): string {
  return `${n < 0 ? "-" : "+"}$${Math.abs(n).toFixed(2)}`
}

export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Error inesperado"
}
