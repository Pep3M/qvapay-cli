// Stub de la TUI (Fase 3 la implementa con Ink). Por ahora orienta al usuario.
// ponytail: un mensaje basta como stub; sin Ink hasta la Fase 3.

export function tuiStub(): string {
  return [
    "",
    "  QvaPay CLI",
    "  ─────────────────────────────",
    "  La interfaz interactiva llega en la Fase 3.",
    "",
    "  Mientras tanto, usa los comandos directos:",
    "    qvapay login     iniciar sesión",
    "    qvapay whoami    usuario actual",
    "    qvapay logout    cerrar sesión",
    "    qvapay --help    ver todo",
    "",
  ].join("\n")
}
