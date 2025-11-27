// Modulo para importar arquivos CSS como strings
declare module "*.css" {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string
  export default content
}