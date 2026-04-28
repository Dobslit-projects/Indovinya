# -*- coding: utf-8 -*-
"""
Análise das possibilidades de visualização e análise por produto
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Carregar dados LONG
df = pd.read_excel(Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\dados_long.xlsx"))

print("="*80)
print("ANÁLISE DE POSSIBILIDADES - DADOS POR PRODUTO")
print("="*80)

# ============================================================
# ESTRUTURA DOS DADOS
# ============================================================

print("\n" + "="*80)
print("1. ESTRUTURA GERAL DOS DADOS")
print("="*80)

print(f"""
Total de registros: {len(df):,}
Produtos únicos:    {df['Nome do produto'].nunique()}
Ensaios únicos:     {df['ensaio_normalizado'].nunique()}
Categorias:         {df['categoria_ensaio'].nunique()}
Períodos:           {df['periodo'].nunique()}
""")

print("\nColunas disponíveis:")
for col in df.columns:
    print(f"  - {col}")

# ============================================================
# ANÁLISE POR PRODUTO
# ============================================================

print("\n" + "="*80)
print("2. ANÁLISE POR PRODUTO - EXEMPLO")
print("="*80)

# Pegar um produto com bastante dados
produto_stats = df.groupby('Nome do produto').size().sort_values(ascending=False)
produto_exemplo = produto_stats.index[0]

print(f"\nProduto exemplo: {produto_exemplo}")
print(f"Total de medições: {produto_stats.iloc[0]}")

df_prod = df[df['Nome do produto'] == produto_exemplo]

print(f"\nTipos de estudo:")
print(df_prod['Tipo de estudo'].value_counts())

print(f"\nEnsaios disponíveis ({df_prod['ensaio_normalizado'].nunique()}):")
for ensaio in df_prod['ensaio_normalizado'].unique():
    count = len(df_prod[df_prod['ensaio_normalizado'] == ensaio])
    print(f"  - {ensaio}: {count} medições")

print(f"\nPeríodos com dados:")
print(df_prod['periodo'].value_counts().sort_index())

# ============================================================
# TIPOS DE ANÁLISE POSSÍVEIS
# ============================================================

print("\n" + "="*80)
print("3. TIPOS DE ANÁLISE POSSÍVEIS POR PRODUTO")
print("="*80)

print("""
┌─────────────────────────────────────────────────────────────────────────────┐
│ ANÁLISES QUANTITATIVAS (ensaios numéricos)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 📈 EVOLUÇÃO TEMPORAL (Gráfico de Linha)                                     │
│    - Eixo X: Período (0 dia → 36m)                                          │
│    - Eixo Y: Valor do ensaio                                                │
│    - Linhas: spec_min e spec_max (limites)                                  │
│    - Uso: Ver degradação/estabilidade ao longo do tempo                     │
│                                                                             │
│ 📊 COMPARAÇÃO ENTRE ESTUDOS (Gráfico de Barras Agrupadas)                   │
│    - Comparar Acelerado vs Longa Duração                                    │
│    - Mesmo ensaio, mesmos períodos                                          │
│    - Uso: Ver se acelerado prediz longa duração                             │
│                                                                             │
│ 🎯 CONFORMIDADE (Gauge/Bullet Chart)                                        │
│    - Valor atual vs especificação                                           │
│    - Zonas: OK, Atenção, Fora                                               │
│    - Uso: Status rápido de conformidade                                     │
│                                                                             │
│ 📉 TENDÊNCIA/PROJEÇÃO (Gráfico de Linha + Regressão)                        │
│    - Linha de tendência linear/polinomial                                   │
│    - Projeção para próximos períodos                                        │
│    - Uso: Prever quando vai sair da spec                                    │
│                                                                             │
│ 🔥 HEATMAP DE ESTABILIDADE                                                  │
│    - Linhas: Ensaios                                                        │
│    - Colunas: Períodos                                                      │
│    - Cor: Variação % em relação ao T0                                       │
│    - Uso: Visão geral de todos ensaios                                      │
│                                                                             │
│ 📦 BOXPLOT POR PERÍODO                                                      │
│    - Distribuição dos valores por período                                   │
│    - Útil quando há múltiplos lotes/batches                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ANÁLISES QUALITATIVAS (ensaios descritivos)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 📋 TIMELINE DE APARÊNCIA                                                    │
│    - Mostrar evolução: LIQUIDO_LIMPIDO → TURVO → etc                        │
│    - Formato: cards ou linha do tempo                                       │
│                                                                             │
│ ✅ STATUS TABLE                                                             │
│    - Tabela com PASSA/CONFORME por período                                  │
│    - Cores: verde/amarelo/vermelho                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICAS CALCULADAS                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 📐 Variação % em relação ao T0                                              │
│    var_pct = (valor - valor_t0) / valor_t0 * 100                            │
│                                                                             │
│ 📐 Distância da especificação                                               │
│    Se RANGE: dist = min(valor - spec_min, spec_max - valor)                 │
│    Se MAX: dist = spec_max - valor                                          │
│    Se MIN: dist = valor - spec_min                                          │
│                                                                             │
│ 📐 Score de estabilidade (0-100)                                            │
│    Baseado em variação % e conformidade                                     │
│                                                                             │
│ 📐 Taxa de degradação                                                       │
│    Slope da regressão linear dos valores                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
""")

# ============================================================
# DADOS NUMÉRICOS VS TEXTO
# ============================================================

print("\n" + "="*80)
print("4. ANÁLISE DE TIPOS DE DADOS")
print("="*80)

# Separar quantitativos e qualitativos
df_quant = df[df['is_quantitativo'] == True].copy()
df_qual = df[df['is_quantitativo'] == False].copy()

print(f"\nQuantitativos: {len(df_quant):,} registros ({100*len(df_quant)/len(df):.1f}%)")
print(f"Qualitativos:  {len(df_qual):,} registros ({100*len(df_qual)/len(df):.1f}%)")

# Verificar valores numéricos vs texto nos quantitativos
df_quant['valor_numerico'] = pd.to_numeric(df_quant['valor'], errors='coerce')
num_reais = df_quant['valor_numerico'].notna().sum()
print(f"\nDos quantitativos, {num_reais:,} têm valores numéricos válidos")

# ============================================================
# ENSAIOS MAIS COMUNS POR CATEGORIA
# ============================================================

print("\n" + "="*80)
print("5. ENSAIOS POR CATEGORIA (para organizar UI)")
print("="*80)

for categoria in df['categoria_ensaio'].unique():
    df_cat = df[df['categoria_ensaio'] == categoria]
    print(f"\n{categoria} ({len(df_cat):,} registros):")
    ensaios = df_cat.groupby('ensaio_normalizado').size().sort_values(ascending=False)
    for ensaio, count in ensaios.head(10).items():
        print(f"  - {ensaio}: {count}")

# ============================================================
# EXEMPLO DE SÉRIE TEMPORAL
# ============================================================

print("\n" + "="*80)
print("6. EXEMPLO DE SÉRIE TEMPORAL - pH")
print("="*80)

# Filtrar pH do produto exemplo, estudo Acelerado
df_ph = df_prod[(df_prod['ensaio_normalizado'] == 'pH') &
                (df_prod['Tipo de estudo'] == 'Acelerado')]

if len(df_ph) > 0:
    print(f"\npH - Estudo Acelerado - {produto_exemplo}")
    print(f"Especificação: {df_ph['spec_tipo'].iloc[0]} | min={df_ph['spec_min'].iloc[0]} | max={df_ph['spec_max'].iloc[0]}")
    print("\nEvolução:")

    # Ordenar por período
    ordem = {'0 dia': 0, '1 sem': 7, '2 sem': 14, '1m': 30, '2m': 60, '3m': 90,
             '4m': 120, '5m': 150, '6m': 180, '9m': 270}
    df_ph['ordem'] = df_ph['periodo'].map(ordem)
    df_ph = df_ph.sort_values('ordem')

    for _, row in df_ph.iterrows():
        valor = row['valor']
        spec_min = row['spec_min']
        spec_max = row['spec_max']

        # Verificar conformidade
        if pd.notna(spec_min) and pd.notna(spec_max):
            if spec_min <= float(valor) <= spec_max:
                status = "✅"
            else:
                status = "❌"
        else:
            status = "?"

        print(f"  {row['periodo']:8s}: {valor:8} {status}")
else:
    print("Sem dados de pH para este produto/estudo")

# ============================================================
# RESUMO DE POSSIBILIDADES
# ============================================================

print("\n" + "="*80)
print("7. RESUMO - COMPONENTES DA UI")
print("="*80)

print("""
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ESTRUTURA SUGERIDA DA UI                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FILTROS (topo):                                                            │
│  ┌──────────────┐ ┌─────────────────────┐                                   │
│  │ Produto  ▼   │ │ Tipo Estudo ▼       │                                   │
│  └──────────────┘ └─────────────────────┘                                   │
│                                                                             │
│  CARDS DE RESUMO:                                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Ensaios    │ │ Períodos   │ │ Conformes  │ │ Alertas    │                │
│  │    12      │ │    9       │ │   95%      │ │    2       │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
│                                                                             │
│  ABAS POR CATEGORIA:                                                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐              │
│  │Físico-Químico│    Cor       │ Composição   │Organoléptico │              │
│  └──────────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                             │
│  CONTEÚDO DA ABA:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Seletor de Ensaio: [pH ▼]                                  │            │
│  │                                                             │            │
│  │  ┌─────────────────────────────────────────────────────┐    │            │
│  │  │                                                     │    │            │
│  │  │     GRÁFICO DE EVOLUÇÃO TEMPORAL                    │    │            │
│  │  │     (linha com área de especificação)               │    │            │
│  │  │                                                     │    │            │
│  │  └─────────────────────────────────────────────────────┘    │            │
│  │                                                             │            │
│  │  ┌──────────────────────┐ ┌──────────────────────┐          │            │
│  │  │ TABELA DE VALORES    │ │ MÉTRICAS             │          │            │
│  │  │ Período | Valor      │ │ Variação T0: +2.3%   │          │            │
│  │  │ 0 dia   | 6.5    ✅  │ │ Tendência: estável   │          │            │
│  │  │ 1m      | 6.4    ✅  │ │ Projeção 12m: 6.2    │          │            │
│  │  │ 3m      | 6.3    ✅  │ │ Status: CONFORME     │          │            │
│  │  └──────────────────────┘ └──────────────────────┘          │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  HEATMAP GERAL (visão de todos os ensaios):                                 │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Ensaio      │ 0dia │ 1m  │ 3m  │ 6m  │ 9m  │ 12m │         │            │
│  │  pH          │ 🟢   │ 🟢  │ 🟢  │ 🟢  │ 🟢  │ 🟢  │         │            │
│  │  Acidez      │ 🟢   │ 🟢  │ 🟡  │ 🟡  │ 🔴  │ 🔴  │         │            │
│  │  Cor Gardner │ 🟢   │ 🟢  │ 🟢  │ 🟢  │ 🟢  │ 🟢  │         │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
""")

# ============================================================
# ESTATÍSTICAS POR PRODUTO
# ============================================================

print("\n" + "="*80)
print("8. ESTATÍSTICAS POR PRODUTO")
print("="*80)

stats_por_produto = df.groupby('Nome do produto').agg({
    'ensaio_normalizado': 'nunique',
    'periodo': 'nunique',
    'Tipo de estudo': lambda x: ', '.join(x.unique()),
    'valor': 'count'
}).rename(columns={
    'ensaio_normalizado': 'qtd_ensaios',
    'periodo': 'qtd_periodos',
    'Tipo de estudo': 'tipos_estudo',
    'valor': 'total_medicoes'
})

print("\nTop 10 produtos com mais dados:")
print(stats_por_produto.sort_values('total_medicoes', ascending=False).head(10))

# Salvar estatísticas
stats_por_produto.to_csv(
    Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\stats_por_produto.csv"),
    encoding='utf-8-sig',
    sep=';'
)
print("\nEstatísticas salvas em: stats_por_produto.csv")
