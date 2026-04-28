"""
Análise Exploratória - Pacote de dados_1 - PoC Indovinya.xlsx
Deep Dive inicial para entendimento da estrutura dos dados
"""

import pandas as pd
import numpy as np
from pathlib import Path

# Configurações de exibição
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 50)

# Caminho do arquivo
arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")

print("="*80)
print("ANÁLISE EXPLORATÓRIA - DATASET INDOVINYA")
print("="*80)

# 1. Carregar e verificar abas disponíveis
print("\n[1] ESTRUTURA DO ARQUIVO EXCEL")
print("-"*40)

xl = pd.ExcelFile(arquivo)
print(f"Abas disponíveis: {xl.sheet_names}")
print(f"Total de abas: {len(xl.sheet_names)}")

# 2. Carregar cada aba e analisar
dados_por_aba = {}
for sheet in xl.sheet_names:
    df = pd.read_excel(arquivo, sheet_name=sheet)
    dados_por_aba[sheet] = df
    print(f"\n--- Aba: '{sheet}' ---")
    print(f"  Dimensões: {df.shape[0]} linhas x {df.shape[1]} colunas")
    print(f"  Colunas: {list(df.columns)[:10]}{'...' if len(df.columns) > 10 else ''}")

# 3. Análise detalhada de cada aba
print("\n" + "="*80)
print("[2] ANÁLISE DETALHADA POR ABA")
print("="*80)

for nome_aba, df in dados_por_aba.items():
    print(f"\n{'='*60}")
    print(f"ABA: {nome_aba}")
    print(f"{'='*60}")

    print(f"\nDimensões: {df.shape}")
    print(f"\nTipos de dados:")
    print(df.dtypes)

    print(f"\nPrimeiras 5 linhas:")
    print(df.head())

    print(f"\nValores nulos por coluna:")
    nulos = df.isnull().sum()
    nulos_pct = (df.isnull().sum() / len(df) * 100).round(2)
    resumo_nulos = pd.DataFrame({'Nulos': nulos, '%': nulos_pct})
    print(resumo_nulos[resumo_nulos['Nulos'] > 0])

    print(f"\nEstatísticas descritivas (colunas numéricas):")
    if df.select_dtypes(include=[np.number]).shape[1] > 0:
        print(df.describe())
    else:
        print("  Nenhuma coluna numérica encontrada")

    print(f"\nValores únicos por coluna (primeiras 10 colunas):")
    for col in df.columns[:10]:
        n_unique = df[col].nunique()
        print(f"  {col}: {n_unique} valores únicos")
        if n_unique <= 10:
            print(f"    -> {df[col].unique()[:10]}")

# 4. Buscar padrões específicos mencionados nas notas
print("\n" + "="*80)
print("[3] ANÁLISE DE PADRÕES ESPECÍFICOS")
print("="*80)

# Procurar por colunas relacionadas a etoxilação
print("\n--- Busca por 'etoxilação' ou 'EO' ---")
for nome_aba, df in dados_por_aba.items():
    colunas_etox = [col for col in df.columns if any(x in str(col).lower() for x in ['etox', 'eo', 'grau'])]
    if colunas_etox:
        print(f"  Aba '{nome_aba}': {colunas_etox}")

# Procurar por colunas de especificações
print("\n--- Busca por 'especificação' ou 'spec' ---")
for nome_aba, df in dados_por_aba.items():
    colunas_spec = [col for col in df.columns if any(x in str(col).lower() for x in ['espec', 'spec', 'limite', 'min', 'max'])]
    if colunas_spec:
        print(f"  Aba '{nome_aba}': {colunas_spec}")

# Procurar por datas/tempo
print("\n--- Busca por colunas de data/tempo ---")
for nome_aba, df in dados_por_aba.items():
    colunas_data = [col for col in df.columns if any(x in str(col).lower() for x in ['data', 'date', 'tempo', 'validade', 'venc'])]
    if colunas_data:
        print(f"  Aba '{nome_aba}': {colunas_data}")
    # Também verificar colunas datetime
    colunas_datetime = df.select_dtypes(include=['datetime64']).columns.tolist()
    if colunas_datetime:
        print(f"  Aba '{nome_aba}' (datetime): {colunas_datetime}")

# Procurar por ensaios/testes
print("\n--- Busca por 'ensaio' ou 'teste' ---")
for nome_aba, df in dados_por_aba.items():
    colunas_ensaio = [col for col in df.columns if any(x in str(col).lower() for x in ['ensaio', 'teste', 'analise', 'análise'])]
    if colunas_ensaio:
        print(f"  Aba '{nome_aba}': {colunas_ensaio}")

# Procurar por produtos
print("\n--- Busca por 'produto' ou 'material' ---")
for nome_aba, df in dados_por_aba.items():
    colunas_produto = [col for col in df.columns if any(x in str(col).lower() for x in ['produto', 'material', 'item', 'código', 'codigo', 'nome'])]
    if colunas_produto:
        print(f"  Aba '{nome_aba}': {colunas_produto}")

# 5. Resumo geral
print("\n" + "="*80)
print("[4] RESUMO GERAL")
print("="*80)

total_linhas = sum(df.shape[0] for df in dados_por_aba.values())
total_colunas = sum(df.shape[1] for df in dados_por_aba.values())

print(f"\nTotal de registros (todas as abas): {total_linhas}")
print(f"Total de colunas (todas as abas): {total_colunas}")

print("\nResumo por aba:")
for nome_aba, df in dados_por_aba.items():
    pct_nulos = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100)
    print(f"  {nome_aba}: {df.shape[0]} linhas, {df.shape[1]} colunas, {pct_nulos:.1f}% valores nulos")

print("\n" + "="*80)
print("FIM DA ANÁLISE EXPLORATÓRIA INICIAL")
print("="*80)
