/**
 * Script de migração de dados Excel para Supabase
 *
 * Uso:
 * 1. Configure as variáveis de ambiente no arquivo .env.local
 * 2. Execute: npx tsx scripts/migrate-data.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Caminho para os arquivos Excel (relativo à raiz do projeto Indorama)
const DATA_PATH = path.join(__dirname, '../../')

// Função para converter serial do Excel para data ISO
function excelDateToISO(excelDate: unknown): string | null {
  if (!excelDate) return null

  // Se já for string no formato de data, retorna como está
  if (typeof excelDate === 'string') {
    // Verifica se já está em formato de data
    if (excelDate.includes('-') || excelDate.includes('/')) {
      return excelDate
    }
  }

  // Se for número (serial do Excel)
  const serial = Number(excelDate)
  if (isNaN(serial)) return null

  // Excel usa 1/1/1900 como dia 1 (com bug do ano bissexto de 1900)
  const excelEpoch = new Date(1899, 11, 30) // 30/12/1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000)

  // Retorna no formato YYYY-MM-DD
  return date.toISOString().split('T')[0]
}

interface DadosRow {
  item: number
  codigo_item: string
  nome_produto: string
  descricao_quimica: string | null
  grau_etoxilacao: string | null
  grupo_familia: string | null
  familia_produtos: string | null
  peso_molecular: string | null
  data_inicial_estudo: string | null
  tipo_estudo: string
  ensaio: string
  ensaio_normalizado: string
  categoria_ensaio: string
  is_quantitativo: boolean
  metodo: string | null
  especificacao: string | null
  spec_tipo: string | null
  spec_min: number | null
  spec_max: number | null
  periodo: string
  valor: string | null
  is_menor_que: boolean
  periodo_dias: number
}

function readExcel(filename: string): DadosRow[] {
  const filepath = path.join(DATA_PATH, filename)

  if (!fs.existsSync(filepath)) {
    console.error(`Arquivo não encontrado: ${filepath}`)
    return []
  }

  console.log(`Lendo arquivo: ${filepath}`)
  const workbook = XLSX.readFile(filepath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

  return jsonData.map((row) => ({
    item: Number(row['Item']) || 0,
    codigo_item: String(row['Código de item'] || row['codigo_item'] || ''),
    nome_produto: String(row['Nome do produto'] || row['nome_produto'] || ''),
    descricao_quimica: row['Descrição química'] as string || row['descricao_quimica'] as string || null,
    grau_etoxilacao: row['Grau de Etoxilação'] as string || row['grau_etoxilacao'] as string || null,
    grupo_familia: row['Grupo de Família'] as string || row['grupo_familia'] as string || null,
    familia_produtos: row['Família de Produtos'] as string || row['familia_produtos'] as string || null,
    peso_molecular: row['Peso Molecular'] as string || row['peso_molecular'] as string || null,
    data_inicial_estudo: excelDateToISO(row['Data inicial do estudo'] || row['data_inicial_estudo']),
    tipo_estudo: String(row['Tipo de Estudo'] || row['tipo_estudo'] || ''),
    ensaio: String(row['Ensaios físico-químicos'] || row['ensaio'] || ''),
    ensaio_normalizado: String(row['ensaio_normalizado'] || ''),
    categoria_ensaio: String(row['categoria_ensaio'] || ''),
    is_quantitativo: Boolean(row['is_quantitativo']),
    metodo: row['Método'] as string || row['metodo'] as string || null,
    especificacao: row['Especificação'] as string || row['especificacao'] as string || null,
    spec_tipo: row['spec_tipo'] as string || null,
    spec_min: row['spec_min'] != null ? Number(row['spec_min']) : null,
    spec_max: row['spec_max'] != null ? Number(row['spec_max']) : null,
    periodo: String(row['periodo'] || ''),
    valor: row['valor'] != null ? String(row['valor']) : null,
    is_menor_que: Boolean(row['is_menor_que']),
    periodo_dias: Number(row['periodo_dias']) || 0
  }))
}

async function clearTable(tableName: string) {
  console.log(`Limpando tabela: ${tableName}`)
  const { error } = await supabase.from(tableName).delete().neq('id', 0)
  if (error) {
    console.error(`Erro ao limpar ${tableName}:`, error.message)
  }
}

async function insertBatch(tableName: string, data: DadosRow[], batchSize = 500) {
  console.log(`Inserindo ${data.length} registros em ${tableName}...`)

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { error } = await supabase.from(tableName).insert(batch)

    if (error) {
      console.error(`Erro no batch ${i}-${i + batchSize}:`, error.message)
    } else {
      console.log(`  Inserido batch ${i + 1}-${Math.min(i + batchSize, data.length)} de ${data.length}`)
    }
  }
}

async function main() {
  console.log('===========================================')
  console.log('MIGRAÇÃO DE DADOS - INDOVINYA DASHBOARD')
  console.log('===========================================\n')

  // Ler arquivos Excel
  const dadosAcelerado = readExcel('dados_acelerado.xlsx')
  const dadosLonga = readExcel('dados_longa_duracao.xlsx')

  console.log(`\nDados carregados:`)
  console.log(`  - Acelerado: ${dadosAcelerado.length} registros`)
  console.log(`  - Longa Duração: ${dadosLonga.length} registros`)

  if (dadosAcelerado.length === 0 && dadosLonga.length === 0) {
    console.error('\nNenhum dado encontrado. Verifique os arquivos Excel.')
    process.exit(1)
  }

  // Limpar tabelas existentes
  console.log('\n--- Limpando tabelas existentes ---')
  await clearTable('dados_acelerado')
  await clearTable('dados_longa_duracao')

  // Inserir dados
  console.log('\n--- Inserindo novos dados ---')

  if (dadosAcelerado.length > 0) {
    await insertBatch('dados_acelerado', dadosAcelerado)
  }

  if (dadosLonga.length > 0) {
    await insertBatch('dados_longa_duracao', dadosLonga)
  }

  console.log('\n===========================================')
  console.log('MIGRAÇÃO CONCLUÍDA COM SUCESSO!')
  console.log('===========================================')
}

main().catch(console.error)
