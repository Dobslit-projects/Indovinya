# -*- coding: utf-8 -*-
"""
FASE 3 - Limpeza de Valores
Converter virgula para ponto, tratar <X como X, padronizar textos
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# CARREGAR DADOS
# ============================================================

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

# Carregar mapeamento de ensaios (Fase 1)
ensaios_map = pd.read_csv(
    Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ensaios_de_para.csv"),
    sep=';',
    encoding='utf-8-sig'
)
ensaio_to_normalized = dict(zip(ensaios_map['ensaio_original'], ensaios_map['ensaio_normalizado']))
ensaio_to_categoria = dict(zip(ensaios_map['ensaio_original'], ensaios_map['categoria']))
ensaio_to_quantitativo = dict(zip(ensaios_map['ensaio_original'], ensaios_map['is_quantitativo']))

# Adicionar mapeamentos faltantes (ensaios com caracteres especiais que podem ter sido perdidos)
ensaio_to_normalized['pH 1% p/p, IPA/água 1;1 v/v, 25ºC'] = 'pH'
ensaio_to_categoria['pH 1% p/p, IPA/água 1;1 v/v, 25ºC'] = 'Fisico-Quimico'
ensaio_to_quantitativo['pH 1% p/p, IPA/água 1;1 v/v, 25ºC'] = True

# Carregar mapeamento de especificacoes (Fase 2)
specs_map = pd.read_csv(
    Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\especificacoes_parseadas.csv"),
    sep=';',
    encoding='utf-8-sig'
)
spec_to_tipo = dict(zip(specs_map['spec_original'], specs_map['spec_tipo']))
spec_to_min = dict(zip(specs_map['spec_original'], specs_map['spec_min']))
spec_to_max = dict(zip(specs_map['spec_original'], specs_map['spec_max']))

print("="*80)
print("FASE 3 - LIMPEZA DE VALORES")
print("="*80)

# Colunas temporais
colunas_temporais = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']
colunas_temporais_existentes = [c for c in colunas_temporais if c in df.columns]
print(f"\nColunas temporais encontradas: {len(colunas_temporais_existentes)}")

# ============================================================
# FUNCOES DE LIMPEZA
# ============================================================

def limpar_valor(valor):
    """
    Limpa um valor:
    - Converte virgula para ponto
    - Trata <X como X
    - Remove espacos extras

    Retorna: (valor_limpo, is_menor_que, valor_original)
    """
    if pd.isna(valor):
        return (None, False, None)

    val_str = str(valor).strip()

    # Valor vazio
    if val_str == '' or val_str.lower() in ['nan', 'none', '-', '--', '---', '----']:
        return (None, False, val_str)

    # Detectar "<X"
    is_menor_que = False
    if val_str.startswith('<'):
        is_menor_que = True
        val_str = val_str[1:].strip()

    # Trocar virgula por ponto
    val_str = val_str.replace(',', '.')

    # Remover espacos internos (ex: "1 234" -> "1234")
    val_str = val_str.replace(' ', '')

    # Tentar converter para float
    try:
        valor_numerico = float(val_str)
        return (valor_numerico, is_menor_que, valor)
    except ValueError:
        # Nao e numerico - manter como texto
        return (val_str, False, valor)


def padronizar_texto_qualitativo(texto):
    """Padroniza valores qualitativos para formato consistente"""
    if pd.isna(texto) or texto is None:
        return None

    t = str(texto).lower().strip()

    # Mapeamentos de padronizacao
    mapeamentos = {
        # Aparencia liquida
        'liquido limpido': 'LIQUIDO_LIMPIDO',
        'líquido límpido': 'LIQUIDO_LIMPIDO',
        'líquido limpido': 'LIQUIDO_LIMPIDO',
        'liquido límpido': 'LIQUIDO_LIMPIDO',
        'líquido, límpido': 'LIQUIDO_LIMPIDO',
        'liquido claro': 'LIQUIDO_CLARO',
        'líquido claro': 'LIQUIDO_CLARO',
        'liquido': 'LIQUIDO',
        'líquido': 'LIQUIDO',

        # Aparencia solida
        'solido': 'SOLIDO',
        'sólido': 'SOLIDO',
        'flocos': 'FLOCOS',
        'pasta': 'PASTA',

        # Limpidez
        'limpido': 'LIMPIDO',
        'límpido': 'LIMPIDO',
        'turvo': 'TURVO',
        'opaco': 'OPACO',
        'transparente': 'TRANSPARENTE',

        # Conformidade
        'passa': 'PASSA',
        'conforme': 'CONFORME',
        'ok': 'OK',
        'aprovado': 'APROVADO',

        # Ausencia/Presenca
        'substancialmente livre': 'SUBST_LIVRE',
        'livre': 'LIVRE',
        'isento': 'ISENTO',
        'ausente': 'AUSENTE',
        'presente': 'PRESENTE',

        # Odor
        'caracteristico': 'CARACTERISTICO',
        'característico': 'CARACTERISTICO',
        'inodoro': 'INODORO',
        'suave': 'SUAVE',
    }

    # Verificar mapeamentos diretos
    if t in mapeamentos:
        return mapeamentos[t]

    # Verificar se contem alguma palavra-chave
    for chave, valor in mapeamentos.items():
        if chave in t:
            return valor

    # Retornar original em maiusculas se nao encontrou mapeamento
    return texto.upper().strip()


# ============================================================
# PROCESSAR DADOS
# ============================================================

print("\nProcessando dados...")

# Criar copia do dataframe
df_limpo = df.copy()

# Adicionar colunas de mapeamento dos ensaios
df_limpo['ensaio_normalizado'] = df_limpo['Ensaios físico-químicos'].map(ensaio_to_normalized)
df_limpo['categoria_ensaio'] = df_limpo['Ensaios físico-químicos'].map(ensaio_to_categoria)
df_limpo['is_quantitativo'] = df_limpo['Ensaios físico-químicos'].map(ensaio_to_quantitativo)

# Adicionar colunas de mapeamento das especificacoes
df_limpo['spec_tipo'] = df_limpo['Especificação'].map(spec_to_tipo)
df_limpo['spec_min'] = df_limpo['Especificação'].map(spec_to_min)
df_limpo['spec_max'] = df_limpo['Especificação'].map(spec_to_max)

# Contadores para estatisticas
stats = {
    'valores_processados': 0,
    'valores_numericos': 0,
    'valores_texto': 0,
    'valores_nulos': 0,
    'valores_menor_que': 0,
    'virgulas_convertidas': 0
}

# Processar colunas temporais
for col in colunas_temporais_existentes:
    col_limpo = f'{col}_valor'
    col_menor_que = f'{col}_menor_que'

    valores_limpos = []
    menores_que = []

    for idx, row in df_limpo.iterrows():
        valor_original = row[col]
        is_quant = row['is_quantitativo']

        valor_limpo, is_menor, val_orig = limpar_valor(valor_original)

        stats['valores_processados'] += 1

        if valor_limpo is None:
            stats['valores_nulos'] += 1
        elif isinstance(valor_limpo, float):
            stats['valores_numericos'] += 1
            if is_menor:
                stats['valores_menor_que'] += 1
            if val_orig and ',' in str(val_orig):
                stats['virgulas_convertidas'] += 1
        else:
            stats['valores_texto'] += 1
            # Padronizar texto se for qualitativo
            if not is_quant:
                valor_limpo = padronizar_texto_qualitativo(valor_limpo)

        valores_limpos.append(valor_limpo)
        menores_que.append(is_menor)

    df_limpo[col_limpo] = valores_limpos
    df_limpo[col_menor_que] = menores_que

# ============================================================
# ESTATISTICAS
# ============================================================

print("\n" + "="*80)
print("RESULTADO DA LIMPEZA")
print("="*80)

print(f"""
Valores processados:    {stats['valores_processados']:,}
  - Numericos:          {stats['valores_numericos']:,} ({100*stats['valores_numericos']/stats['valores_processados']:.1f}%)
  - Texto:              {stats['valores_texto']:,} ({100*stats['valores_texto']/stats['valores_processados']:.1f}%)
  - Nulos/Vazios:       {stats['valores_nulos']:,} ({100*stats['valores_nulos']/stats['valores_processados']:.1f}%)

Tratamentos aplicados:
  - Virgulas convertidas: {stats['virgulas_convertidas']:,}
  - Valores "<X" -> X:    {stats['valores_menor_que']:,}
""")

# Verificar ensaios nao mapeados
nao_mapeados = df_limpo[df_limpo['ensaio_normalizado'].isna()]
if len(nao_mapeados) > 0:
    print(f"\n--- ATENCAO: {len(nao_mapeados)} registros com ensaio nao mapeado ---")
    print(nao_mapeados['Ensaios físico-químicos'].unique())

# Verificar specs nao mapeadas
specs_nao_map = df_limpo[df_limpo['spec_tipo'].isna()]
if len(specs_nao_map) > 0:
    print(f"\n--- ATENCAO: {len(specs_nao_map)} registros com spec nao mapeada ---")

# Mostrar amostra de valores texto padronizados
print("\n--- Amostra de Valores Texto Padronizados ---")
for col in colunas_temporais_existentes[:3]:
    col_limpo = f'{col}_valor'
    texto_vals = df_limpo[df_limpo[col_limpo].apply(lambda x: isinstance(x, str))]
    if len(texto_vals) > 0:
        print(f"\n{col}:")
        sample = texto_vals[[col, col_limpo]].drop_duplicates().head(5)
        for _, row in sample.iterrows():
            print(f"   '{row[col]}' -> '{row[col_limpo]}'")

# ============================================================
# SALVAR RESULTADOS
# ============================================================

# Selecionar colunas para o output
# Colunas originais do dataset
colunas_base = [
    'Item', 'Código de item', 'Nome do produto', 'Descrição química',
    'Grau de Etoxilação', 'Grupo de Família', 'Família de Produtos', 'Peso Molecular',
    'Data inicial do estudo', 'Tipo de estudo',
    'Ensaios físico-químicos', 'ensaio_normalizado', 'categoria_ensaio', 'is_quantitativo',
    'Método', 'Especificação', 'spec_tipo', 'spec_min', 'spec_max'
]

# Adicionar colunas temporais limpas
colunas_temporais_limpas = []
for col in colunas_temporais_existentes:
    colunas_temporais_limpas.append(f'{col}_valor')
    colunas_temporais_limpas.append(f'{col}_menor_que')

colunas_output = colunas_base + colunas_temporais_limpas

# Verificar quais colunas existem
colunas_output = [c for c in colunas_output if c in df_limpo.columns]

df_output = df_limpo[colunas_output].copy()

# Salvar CSV
output_csv = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\dados_limpos.csv")
df_output.to_csv(output_csv, index=False, encoding='utf-8-sig', sep=';')
print(f"\nCSV salvo em: {output_csv}")

# Salvar Excel
output_xlsx = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\dados_limpos.xlsx")
df_output.to_excel(output_xlsx, index=False)
print(f"Excel salvo em: {output_xlsx}")

# Salvar Parquet (mais eficiente para processamento)
# Nota: Parquet requer tipos consistentes por coluna
# Como temos valores mistos (numeros + texto), salvamos apenas para quantitativos
try:
    output_parquet = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\dados_limpos.parquet")
    # Filtrar apenas quantitativos para parquet
    df_quant = df_output[df_output['is_quantitativo'] == True].copy()
    df_quant.to_parquet(output_parquet, index=False)
    print(f"Parquet salvo em: {output_parquet} (apenas quantitativos)")
except Exception as e:
    print(f"Parquet nao salvo (tipos mistos): {e}")

# ============================================================
# RESUMO FINAL
# ============================================================

print("\n" + "="*80)
print("RESUMO")
print("="*80)

print(f"""
Registros processados:     {len(df_output)}
Colunas no output:         {len(colunas_output)}

Estrutura do output:
  - Colunas base:          {len(colunas_base)} (produto, ensaio, spec, etc.)
  - Colunas temporais:     {len(colunas_temporais_limpas)} ({len(colunas_temporais_existentes)} periodos x 2)

Arquivos gerados:
  - dados_limpos.csv       (para visualizacao)
  - dados_limpos.xlsx      (para Excel)
  - dados_limpos.parquet   (para processamento)

Proximo passo: Fase 4 - Converter para formato LONG
""")
