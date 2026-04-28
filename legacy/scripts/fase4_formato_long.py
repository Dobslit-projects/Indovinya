# -*- coding: utf-8 -*-
"""
FASE 4 - Conversao para Formato LONG e Separacao por Tipo de Estudo
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# CARREGAR DADOS LIMPOS
# ============================================================

print("="*80)
print("FASE 4 - FORMATO LONG + SEPARACAO POR TIPO DE ESTUDO")
print("="*80)

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\dados_limpos.xlsx")
df = pd.read_excel(arquivo)

print(f"\nDados carregados: {len(df)} registros")

# Identificar colunas
colunas_base = [
    'Item', 'Código de item', 'Nome do produto', 'Descrição química',
    'Grau de Etoxilação', 'Grupo de Família', 'Família de Produtos', 'Peso Molecular',
    'Data inicial do estudo', 'Tipo de estudo',
    'Ensaios físico-químicos', 'ensaio_normalizado', 'categoria_ensaio', 'is_quantitativo',
    'Método', 'Especificação', 'spec_tipo', 'spec_min', 'spec_max'
]

# Detectar colunas temporais (formato: X_valor, X_menor_que)
colunas_valor = [c for c in df.columns if c.endswith('_valor')]
colunas_menor_que = [c for c in df.columns if c.endswith('_menor_que')]

periodos = [c.replace('_valor', '') for c in colunas_valor]
print(f"Periodos encontrados: {periodos}")

# ============================================================
# CONVERTER PARA FORMATO LONG
# ============================================================

print("\nConvertendo para formato LONG...")

# Para cada registro, criar uma linha para cada periodo com valor
registros_long = []

for idx, row in df.iterrows():
    # Dados base do registro
    dados_base = {col: row[col] for col in colunas_base if col in df.columns}

    for periodo in periodos:
        col_valor = f'{periodo}_valor'
        col_menor_que = f'{periodo}_menor_que'

        valor = row.get(col_valor)
        menor_que = row.get(col_menor_que, False)

        # Pular valores nulos/vazios
        if pd.isna(valor) or valor is None or str(valor).strip() == '':
            continue

        registro = dados_base.copy()
        registro['periodo'] = periodo
        registro['valor'] = valor
        registro['is_menor_que'] = menor_que

        registros_long.append(registro)

df_long = pd.DataFrame(registros_long)

print(f"Formato LONG: {len(df_long)} registros")

# Adicionar coluna de ordem dos periodos (para ordenacao)
ordem_periodos = {
    '0 dia': 0, '1 sem': 7, '2 sem': 14,
    '1m': 30, '2m': 60, '3m': 90, '4m': 120, '5m': 150, '6m': 180,
    '9m': 270, '12m': 365, '18m': 545, '24m': 730, '30m': 912, '36m': 1095
}
df_long['periodo_dias'] = df_long['periodo'].map(ordem_periodos)

# ============================================================
# SEPARAR POR TIPO DE ESTUDO
# ============================================================

print("\n" + "="*80)
print("SEPARACAO POR TIPO DE ESTUDO")
print("="*80)

# Verificar tipos de estudo
print("\nTipos de estudo encontrados:")
print(df_long['Tipo de estudo'].value_counts())

# Separar datasets
df_acelerado = df_long[df_long['Tipo de estudo'].str.contains('Acelerado', case=False, na=False)].copy()
df_longa = df_long[df_long['Tipo de estudo'].str.contains('Longa', case=False, na=False)].copy()
df_outros = df_long[~df_long['Tipo de estudo'].str.contains('Acelerado|Longa', case=False, na=False)].copy()

print(f"\nRegistros por tipo:")
print(f"  - Acelerado:     {len(df_acelerado):,} ({100*len(df_acelerado)/len(df_long):.1f}%)")
print(f"  - Longa Duracao: {len(df_longa):,} ({100*len(df_longa)/len(df_long):.1f}%)")
print(f"  - Outros:        {len(df_outros):,} ({100*len(df_outros)/len(df_long):.1f}%)")

# Periodos por tipo de estudo
print("\nPeriodos por tipo de estudo:")
print("\nAcelerado:")
print(df_acelerado['periodo'].value_counts().sort_index())
print("\nLonga Duracao:")
print(df_longa['periodo'].value_counts().sort_index())

# ============================================================
# ESTATISTICAS DO FORMATO LONG
# ============================================================

print("\n" + "="*80)
print("ESTATISTICAS DO FORMATO LONG")
print("="*80)

print(f"""
Total de registros LONG:   {len(df_long):,}
  - Com valores numericos: {df_long['valor'].apply(lambda x: isinstance(x, (int, float))).sum():,}
  - Com valores texto:     {df_long['valor'].apply(lambda x: isinstance(x, str)).sum():,}
  - Com flag "<X":         {df_long['is_menor_que'].sum():,}

Por categoria de ensaio:
""")
cat_stats = df_long.groupby('categoria_ensaio').size().sort_values(ascending=False)
for cat, count in cat_stats.items():
    print(f"  {cat}: {count:,}")

print(f"\nPor ensaio normalizado (top 15):")
ensaio_stats = df_long.groupby('ensaio_normalizado').size().sort_values(ascending=False).head(15)
for ensaio, count in ensaio_stats.items():
    print(f"  {ensaio}: {count:,}")

# ============================================================
# SALVAR RESULTADOS
# ============================================================

print("\n" + "="*80)
print("SALVANDO ARQUIVOS")
print("="*80)

base_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama")

# Dataset completo LONG
# Verificar nome correto da coluna de produto
col_produto = 'Produto' if 'Produto' in df_long.columns else 'produto'
if col_produto not in df_long.columns:
    # Tentar encontrar coluna similar
    for c in df_long.columns:
        if 'produt' in c.lower():
            col_produto = c
            break

sort_cols = [c for c in [col_produto, 'ensaio_normalizado', 'periodo_dias'] if c in df_long.columns]
df_long_sorted = df_long.sort_values(sort_cols) if sort_cols else df_long
df_long_sorted.to_csv(base_path / 'dados_long.csv', index=False, encoding='utf-8-sig', sep=';')
df_long_sorted.to_excel(base_path / 'dados_long.xlsx', index=False)
print(f"  dados_long.csv/xlsx: {len(df_long_sorted):,} registros")

# Dataset Acelerado
if len(df_acelerado) > 0:
    df_acel_sorted = df_acelerado.sort_values(sort_cols) if sort_cols else df_acelerado
    df_acel_sorted.to_csv(base_path / 'dados_acelerado.csv', index=False, encoding='utf-8-sig', sep=';')
    df_acel_sorted.to_excel(base_path / 'dados_acelerado.xlsx', index=False)
    print(f"  dados_acelerado.csv/xlsx: {len(df_acel_sorted):,} registros")

# Dataset Longa Duracao
if len(df_longa) > 0:
    df_longa_sorted = df_longa.sort_values(sort_cols) if sort_cols else df_longa
    df_longa_sorted.to_csv(base_path / 'dados_longa_duracao.csv', index=False, encoding='utf-8-sig', sep=';')
    df_longa_sorted.to_excel(base_path / 'dados_longa_duracao.xlsx', index=False)
    print(f"  dados_longa_duracao.csv/xlsx: {len(df_longa_sorted):,} registros")

# ============================================================
# RESUMO FINAL
# ============================================================

print("\n" + "="*80)
print("RESUMO FINAL - TRATAMENTO COMPLETO")
print("="*80)

print(f"""
DADOS ORIGINAIS:
  - Registros (WIDE):      872
  - Colunas temporais:     15

APOS TRATAMENTO:
  - Formato LONG:          {len(df_long):,} registros
  - Ensaios normalizados:  {df_long['ensaio_normalizado'].nunique()} categorias
  - Categorias de grupo:   {df_long['categoria_ensaio'].nunique()}

SEPARACAO POR TIPO:
  - Acelerado:             {len(df_acelerado):,} registros
  - Longa Duracao:         {len(df_longa):,} registros
  - Outros:                {len(df_outros):,} registros

ARQUIVOS GERADOS:
  Fase 1: ensaios_de_para.csv/xlsx
  Fase 2: especificacoes_parseadas.csv/xlsx
  Fase 3: dados_limpos.csv/xlsx
  Fase 4: dados_long.csv/xlsx
          dados_acelerado.csv/xlsx
          dados_longa_duracao.csv/xlsx

TRATAMENTO CONCLUIDO!
""")
