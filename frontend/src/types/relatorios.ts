export type RelatorioTipo = 'tecnico' | 'interativo'

export type RelatorioStatus = 'disponivel' | 'em_breve'

export interface Relatorio {
  slug: string
  titulo: string
  descricao: string
  tipo: RelatorioTipo
  status: RelatorioStatus
  data: string
  tags: string[]
  href: string
  pdfPath?: string
}

export const RELATORIO_TIPO_LABEL: Record<RelatorioTipo, string> = {
  tecnico: 'Técnico',
  interativo: 'Interativo',
}
