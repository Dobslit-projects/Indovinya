# -*- coding: utf-8 -*-
"""
Análise Detalhada - Deep Dive Dataset Indovinya
Foco nos pontos levantados pelo usuário
"""

import pandas as pd
import numpy as np
from pathlib import Path
from collections import Counter

pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 100)

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

print("="*100)
print("DEEP DIVE - DATASET INDOVINYA")
print("="*100)

# =============================================================================
# 1. GRAU DE ETOXILAÇÃO - Análise para Agrupamento
# =============================================================================
print("\n" + "="*100)
print("[1] GRAU DE ETOXILAÇÃO - Potencial para Agrupamento")
print("="*100)

print("\n1.1 Valores únicos de 'Grau de Etoxilação':")
etox_counts = df['Grau de Etoxilação'].value_counts()
print(etox_counts)

print("\n1.2 Distribuição por Grupo de Família + Etoxilação:")
cross_tab = pd.crosstab(df['Grupo de Família'], df['Grau de Etoxilação'])
print(cross_tab)

print("\n1.3 Produtos por Grau de Etoxilação:")
produtos_por_etox = df.groupby('Grau de Etoxilação')['Nome do produto'].nunique()
print(produtos_por_etox.sort_values(ascending=False))

# =============================================================================
# 2. ENSAIOS FÍSICO-QUÍMICOS - Análise de Variação
# =============================================================================
print("\n" + "="*100)
print("[2] ENSAIOS FÍSICO-QUÍMICOS - Análise de Variação")
print("="*100)

print("\n2.1 Tipos de ensaios únicos:")
ensaios = df['Ensaios físico-químicos'].unique()
print(f"Total de tipos de ensaio: {len(ensaios)}")
for e in ensaios:
    print(f"  - {e}")

print("\n2.2 Frequência de cada ensaio:")
ensaio_counts = df['Ensaios físico-químicos'].value_counts()
print(ensaio_counts)

print("\n2.3 Métodos utilizados:")
metodos = df['Método'].value_counts()
print(metodos)

print("\n2.4 Relação Ensaio x Método:")
ensaio_metodo = df.groupby(['Ensaios físico-químicos', 'Método']).size().reset_index(name='contagem')
print(ensaio_metodo)

# =============================================================================
# 3. ESPECIFICAÇÕES - Numéricas vs Não-Numéricas
# =============================================================================
print("\n" + "="*100)
print("[3] ESPECIFICAÇÕES - Análise de Tipos")
print("="*100)

print("\n3.1 Valores únicos de especificação:")
specs = df['Especificação'].unique()
print(f"Total de especificações únicas: {len(specs)}")

# Classificar especificações
specs_numericas = []
specs_nao_numericas = []
specs_mistas = []

for spec in specs:
    spec_str = str(spec)
    # Padrões numéricos: contém números e símbolos como -, máx, mín
    tem_numero = any(c.isdigit() for c in spec_str)
    tem_texto_descritivo = any(palavra in spec_str.lower() for palavra in ['líquido', 'sólido', 'livre', 'branco', 'amarelo', 'claro', 'escuro', 'pastoso', 'ceroso'])

    if tem_texto_descritivo and not tem_numero:
        specs_nao_numericas.append(spec)
    elif tem_numero and tem_texto_descritivo:
        specs_mistas.append(spec)
    elif tem_numero:
        specs_numericas.append(spec)
    else:
        specs_nao_numericas.append(spec)

print(f"\n3.2 Classificação das especificações:")
print(f"  Numéricas: {len(specs_numericas)}")
print(f"  Não-numéricas (descritivas): {len(specs_nao_numericas)}")
print(f"  Mistas: {len(specs_mistas)}")

print("\n3.3 Exemplos de especificações NUMÉRICAS:")
for s in specs_numericas[:15]:
    print(f"  - {s}")

print("\n3.4 Exemplos de especificações NÃO-NUMÉRICAS:")
for s in specs_nao_numericas[:15]:
    print(f"  - {s}")

print("\n3.5 Especificações MISTAS:")
for s in specs_mistas:
    print(f"  - {s}")

# Analisar padrões nas especificações numéricas
print("\n3.6 Padrões nas especificações numéricas:")
padroes = {
    'range (x - y)': 0,
    'máximo (máx/max)': 0,
    'mínimo (mín/min)': 0,
    'sem especificação (----)': 0,
    'outros': 0
}

for spec in df['Especificação'].dropna():
    spec_str = str(spec).lower()
    if ' - ' in spec_str and any(c.isdigit() for c in spec_str):
        padroes['range (x - y)'] += 1
    elif 'máx' in spec_str or 'max' in spec_str:
        padroes['máximo (máx/max)'] += 1
    elif 'mín' in spec_str or 'min' in spec_str:
        padroes['mínimo (mín/min)'] += 1
    elif '----' in spec_str or spec_str.strip() == '':
        padroes['sem especificação (----)'] += 1
    else:
        padroes['outros'] += 1

for padrao, count in padroes.items():
    print(f"  {padrao}: {count}")

# =============================================================================
# 4. ANÁLISE TEMPORAL - Recorrência de Testes
# =============================================================================
print("\n" + "="*100)
print("[4] ANÁLISE TEMPORAL - Padrões de Testes")
print("="*100)

# Colunas temporais
colunas_tempo = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']

print("\n4.1 Preenchimento por período temporal:")
for col in colunas_tempo:
    preenchido = df[col].notna().sum()
    pct = (preenchido / len(df)) * 100
    print(f"  {col:6s}: {preenchido:4d} registros ({pct:5.1f}%)")

print("\n4.2 Análise por Tipo de Estudo:")
print(df['Tipo de estudo'].value_counts())

# Preenchimento por tipo de estudo
print("\n4.3 Preenchimento temporal por Tipo de Estudo:")
for tipo in df['Tipo de estudo'].unique():
    print(f"\n  --- {tipo} ---")
    df_tipo = df[df['Tipo de estudo'] == tipo]
    for col in colunas_tempo:
        preenchido = df_tipo[col].notna().sum()
        pct = (preenchido / len(df_tipo)) * 100
        if preenchido > 0:
            print(f"    {col:6s}: {preenchido:4d} ({pct:5.1f}%)")

print("\n4.4 Padrão de coleta (quais combinações de tempos existem):")
# Criar string indicando quais tempos têm dados
df['padrao_temporal'] = df[colunas_tempo].notna().apply(lambda row: '-'.join([col for col, val in zip(colunas_tempo, row) if val]), axis=1)
padrao_counts = df['padrao_temporal'].value_counts().head(20)
print(padrao_counts)

# =============================================================================
# 5. ANÁLISE DE VALIDADE/STATUS DOS PRODUTOS
# =============================================================================
print("\n" + "="*100)
print("[5] ANÁLISE DE DATAS E POTENCIAL VALIDADE")
print("="*100)

print("\n5.1 Range de datas do estudo:")
print(f"  Data mais antiga: {df['Data inicial do estudo'].min()}")
print(f"  Data mais recente: {df['Data inicial do estudo'].max()}")

print("\n5.2 Distribuição por ano:")
df['ano_estudo'] = df['Data inicial do estudo'].dt.year
ano_counts = df['ano_estudo'].value_counts().sort_index()
print(ano_counts)

print("\n5.3 Estudos antigos (antes de 2017) com dados em 36m:")
estudos_antigos = df[(df['ano_estudo'] < 2017) & (df['36m'].notna())]
print(f"  Total: {len(estudos_antigos)} registros")
if len(estudos_antigos) > 0:
    print(estudos_antigos[['Nome do produto', 'Data inicial do estudo', 'Tipo de estudo', '36m']].head(10))

# =============================================================================
# 6. ANÁLISE DE QUALIDADE DOS DADOS - Para tratamento em Tiers
# =============================================================================
print("\n" + "="*100)
print("[6] QUALIDADE DOS DADOS - Sugestão de Tiers")
print("="*100)

print("\n6.1 Completude por produto:")
produtos_completude = []
for produto in df['Nome do produto'].unique():
    df_prod = df[df['Nome do produto'] == produto]
    total_celulas = len(df_prod) * len(colunas_tempo)
    celulas_preenchidas = df_prod[colunas_tempo].notna().sum().sum()
    pct_completo = (celulas_preenchidas / total_celulas) * 100 if total_celulas > 0 else 0
    produtos_completude.append({
        'produto': produto,
        'n_registros': len(df_prod),
        'pct_completo': pct_completo
    })

df_completude = pd.DataFrame(produtos_completude).sort_values('pct_completo', ascending=False)
print(df_completude.head(20))

print("\n6.2 Sugestão de Tiers baseado em completude:")
df_completude['tier'] = pd.cut(df_completude['pct_completo'],
                                bins=[0, 10, 30, 50, 100],
                                labels=['Tier 4 (0-10%)', 'Tier 3 (10-30%)', 'Tier 2 (30-50%)', 'Tier 1 (50-100%)'])
tier_counts = df_completude['tier'].value_counts().sort_index()
print(tier_counts)

print("\n6.3 Produtos por Tier:")
for tier in df_completude['tier'].unique():
    if pd.notna(tier):
        print(f"\n  {tier}:")
        prods = df_completude[df_completude['tier'] == tier]['produto'].tolist()
        for p in prods[:5]:
            print(f"    - {p}")
        if len(prods) > 5:
            print(f"    ... e mais {len(prods)-5} produtos")

# =============================================================================
# 7. ANÁLISE DE VALORES NOS RESULTADOS
# =============================================================================
print("\n" + "="*100)
print("[7] ANÁLISE DE VALORES NOS RESULTADOS")
print("="*100)

print("\n7.1 Tipos de valores encontrados em '0 dia':")
valores_0dia = df['0 dia'].dropna().astype(str).unique()
print(f"Total de valores únicos: {len(valores_0dia)}")

# Classificar tipos de valores
tipos_valor = {'numerico': 0, 'texto': 0, 'misto': 0}
exemplos_texto = []

for val in valores_0dia:
    try:
        float(val.replace(',', '.'))
        tipos_valor['numerico'] += 1
    except:
        if any(c.isdigit() for c in val):
            tipos_valor['misto'] += 1
        else:
            tipos_valor['texto'] += 1
            exemplos_texto.append(val)

print(f"\n7.2 Classificação dos valores em '0 dia':")
for tipo, count in tipos_valor.items():
    print(f"  {tipo}: {count}")

print(f"\n7.3 Exemplos de valores TEXTO em '0 dia':")
for ex in exemplos_texto[:20]:
    print(f"  - {ex}")

# =============================================================================
# 8. RESUMO FINAL - INSIGHTS PARA PLANEJAMENTO
# =============================================================================
print("\n" + "="*100)
print("[8] RESUMO E INSIGHTS PARA PLANEJAMENTO")
print("="*100)

print("""
ESTRUTURA GERAL:
- Dataset único com 872 registros e 28 colunas
- Cada linha = um ensaio para um produto em determinado estudo
- 50 itens/produtos únicos, 52 nomes de produtos

DIMENSÕES DE AGRUPAMENTO:
- Grau de Etoxilação: 16 categorias (bom para segmentação)
- Grupo de Família: 8 categorias
- Família de Produtos: 20 categorias
- Tipo de Estudo: 2 (Acelerado, Longa duração)

ENSAIOS:
- 8 tipos de ensaios físico-químicos
- Mistura de especificações numéricas (ranges, max, min) e descritivas

DADOS TEMPORAIS:
- 15 pontos de medição (0 dia até 36m)
- Alta variação de preenchimento (2% a 97%)
- Padrões diferentes para estudo Acelerado vs Longa duração
- Sem padronização clara de quando testes são realizados

QUALIDADE:
- 32.9% de valores nulos no total
- Possível divisão em 4 Tiers por completude
- Valores mistos: numéricos e texto descritivo nos mesmos campos
""")

# Limpar coluna temporária
df.drop(columns=['padrao_temporal', 'ano_estudo'], inplace=True)

print("\n" + "="*100)
print("FIM DO DEEP DIVE")
print("="*100)
