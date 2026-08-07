// Bun embebe imports de texto (with { type: "text" }); esto se lo dice a tsc.
declare module "*.md" {
  const content: string
  export default content
}
