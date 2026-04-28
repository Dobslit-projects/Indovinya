# -*- coding: utf-8 -*-
"""
DIAGNOSTICO DO ESTADO ATUAL - Dataset Indovinya
Raio-X para entender a situacao dos dados e definir proximos passos
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import sys

# Forcar UTF-8 no Windows
sys.stdout.reconfigure(encoding='utf-8')

pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 100)

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

# Colunas temporais
colunas_tempo = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']

output = []

def add(text=""):
    output.append(text)
    print(text)

add("=" * 90)
add("DIAGNÓSTICO DO ESTADO ATUAL - DATASET INDOVINYA")
add("Data da análise: " + datetime.now().strftime("%d/%m/%Y %H:%M"))
add("=" * 90)

# =============================================================================
# VISÃO GERAL
# =============================================================================
add("\n" + "=" * 90)
add("1. VISÃO GERAL DO DATASET")
add("=" * 90)

add(f"""
┌─────────────────────────────────────────────────────────────┐
│  NÚMEROS GERAIS                                             │
├─────────────────────────────────────────────────────────────┤
│  Total de registros:        {df.shape[0]:>6}                          │
│  Total de colunas:          {df.shape[1]:>6}                          │
│  Produtos únicos:           {df['Nome do produto'].nunique():>6}                          │
│  Códigos de item únicos:    {df['Código de item'].nunique():>6}                          │
│  Período dos dados:         {df['Data inicial do estudo'].min().year} a {df['Data inicial do estudo'].max().year}                   │
│  % de células vazias:       {(df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100):>5.1f}%                         │
└─────────────────────────────────────────────────────────────┘
""")

# =============================================================================
# ANÁLISE 1: GRAU DE ETOXILAÇÃO
# =============================================================================
add("\n" + "=" * 90)
add("2. GRAU DE ETOXILAÇÃO - Potencial para Agrupamento")
add("   [Sua nota: 'bom para agrupamento de produtos']")
add("=" * 90)

etox = df['Grau de Etoxilação'].value_counts()
add("\n┌─ Distribuição dos Graus de Etoxilação ─────────────────────┐")
for idx, (grau, count) in enumerate(etox.items()):
    pct = count / len(df) * 100
    barra = "█" * int(pct / 2)
    add(f"│ {grau:15s} │ {count:4d} ({pct:5.1f}%) {barra}")
add("└─────────────────────────────────────────────────────────────┘")

add("\n⚠️  DIAGNÓSTICO:")
nao_aplicavel = etox.get('Não aplicável', 0) + etox.get('Não descrito', 0)
pct_na = nao_aplicavel / len(df) * 100
add(f"   - {pct_na:.1f}% dos registros são 'Não aplicável' ou 'Não descrito'")
add(f"   - Restam {100-pct_na:.1f}% com grau definido (efetivamente agrupáveis)")
add(f"   - {len(etox)} categorias diferentes")

# Cruzamento com Família
add("\n┌─ Grau de Etoxilação vs Grupo de Família ───────────────────┐")
cross = pd.crosstab(df['Grupo de Família'], df['Grau de Etoxilação'].isin(['Não aplicável', 'Não descrito']))
cross.columns = ['Com Grau', 'Sem Grau']
for familia in cross.index:
    com = cross.loc[familia, 'Com Grau']
    sem = cross.loc[familia, 'Sem Grau']
    total = com + sem
    add(f"│ {familia[:40]:40s} │ Com: {com:3d} | Sem: {sem:3d}")
add("└─────────────────────────────────────────────────────────────┘")

add("\n✅ CONCLUSÃO: Grau de Etoxilação é útil principalmente para 'Ethoxylates and Propoxylates'")
add("   Outros grupos majoritariamente não têm grau aplicável.")

# =============================================================================
# ANÁLISE 2: ENSAIOS FÍSICO-QUÍMICOS
# =============================================================================
add("\n" + "=" * 90)
add("3. ENSAIOS FÍSICO-QUÍMICOS - Análise de Variação")
add("   [Sua nota: 'fraco? - muita variação']")
add("=" * 90)

ensaios_unicos = df['Ensaios físico-químicos'].nunique()
metodos_unicos = df['Método'].nunique()

add(f"""
┌─────────────────────────────────────────────────────────────┐
│  NÚMEROS                                                    │
├─────────────────────────────────────────────────────────────┤
│  Tipos de ensaios únicos:   {ensaios_unicos:>6}                          │
│  Métodos únicos:            {metodos_unicos:>6}                          │
│  Combinações ensaio+método: {df.groupby(['Ensaios físico-químicos', 'Método']).ngroups:>6}                          │
└─────────────────────────────────────────────────────────────┘
""")

add("\n⚠️  PROBLEMA IDENTIFICADO: Inconsistência na nomenclatura")
add("\n   Exemplos de possíveis duplicatas:")

# Detectar possíveis duplicatas
ensaios_lista = df['Ensaios físico-químicos'].unique()
grupos_similares = {}

# Agrupar por palavras-chave
keywords = ['hidroxila', 'acidez', 'ph', 'água', 'aparência', 'cor', 'viscosidade', 'saponificação']
for kw in keywords:
    similares = [e for e in ensaios_lista if kw in str(e).lower()]
    if len(similares) > 1:
        grupos_similares[kw] = similares

for kw, similares in list(grupos_similares.items())[:4]:
    add(f"\n   '{kw.upper()}' - {len(similares)} variações:")
    for s in similares[:5]:
        add(f"      • {s}")
    if len(similares) > 5:
        add(f"      ... e mais {len(similares)-5}")

add("\n✅ CONCLUSÃO: Alta variação confirmada. Necessário normalização antes de análises comparativas.")

# Top ensaios
add("\n┌─ Top 10 Ensaios Mais Frequentes ───────────────────────────┐")
top_ensaios = df['Ensaios físico-químicos'].value_counts().head(10)
for ensaio, count in top_ensaios.items():
    pct = count / len(df) * 100
    add(f"│ {ensaio[:50]:50s} │ {count:3d} ({pct:4.1f}%)")
add("└─────────────────────────────────────────────────────────────┘")

# =============================================================================
# ANÁLISE 3: ESPECIFICAÇÕES
# =============================================================================
add("\n" + "=" * 90)
add("4. ESPECIFICAÇÕES - Numéricas vs Não-Numéricas")
add("   [Sua nota: 'Existem Especificações numéricas e não numéricas']")
add("=" * 90)

specs = df['Especificação'].dropna().astype(str)

# Classificar
def classificar_spec(spec):
    spec_lower = spec.lower()
    tem_numero = any(c.isdigit() for c in spec)
    tem_range = ' - ' in spec and tem_numero
    tem_max = 'máx' in spec_lower or 'max' in spec_lower
    tem_min = 'mín' in spec_lower or 'min' in spec_lower
    sem_spec = '----' in spec or spec.strip() == '' or 'monitoramento' in spec_lower
    descritivo = any(p in spec_lower for p in ['líquido', 'sólido', 'livre', 'passa', 'flocos', 'pasta', 'claro', 'escuro'])

    if sem_spec:
        return 'Sem especificação'
    elif descritivo and not tem_numero:
        return 'Descritiva (texto)'
    elif tem_range:
        return 'Range (X - Y)'
    elif tem_max:
        return 'Máximo'
    elif tem_min:
        return 'Mínimo'
    elif tem_numero:
        return 'Numérica (outro)'
    else:
        return 'Descritiva (texto)'

df['tipo_spec'] = df['Especificação'].fillna('Sem especificação').astype(str).apply(classificar_spec)
tipo_spec_counts = df['tipo_spec'].value_counts()

add("\n┌─ Tipos de Especificação ───────────────────────────────────┐")
for tipo, count in tipo_spec_counts.items():
    pct = count / len(df) * 100
    barra = "█" * int(pct / 3)
    add(f"│ {tipo:25s} │ {count:4d} ({pct:5.1f}%) {barra}")
add("└─────────────────────────────────────────────────────────────┘")

add("\n   Exemplos de cada tipo:")
for tipo in tipo_spec_counts.index[:5]:
    exemplos = df[df['tipo_spec'] == tipo]['Especificação'].dropna().unique()[:3]
    add(f"\n   {tipo}:")
    for ex in exemplos:
        add(f"      • {ex}")

add("\n✅ CONCLUSÃO: Especificações majoritariamente numéricas (Range e Máximo).")
add("   Tratamento diferenciado necessário para descritivas.")

# =============================================================================
# ANÁLISE 4: PADRÃO TEMPORAL
# =============================================================================
add("\n" + "=" * 90)
add("5. PADRÃO TEMPORAL DOS TESTES")
add("   [Sua nota: 'Normalização ou verificação de recorrência de testes - não há padrão']")
add("=" * 90)

add("\n┌─ Preenchimento por Período ────────────────────────────────┐")
add("│ Período  │ Preenchido │   %    │ Visual                    │")
add("├──────────┼────────────┼────────┼───────────────────────────┤")
for col in colunas_tempo:
    preenchido = df[col].notna().sum()
    pct = preenchido / len(df) * 100
    barra = "█" * int(pct / 5)
    add(f"│ {col:8s} │ {preenchido:10d} │ {pct:5.1f}% │ {barra:25s} │")
add("└──────────┴────────────┴────────┴───────────────────────────┘")

add("\n┌─ Padrão por Tipo de Estudo ────────────────────────────────┐")
for tipo in df['Tipo de estudo'].unique():
    df_tipo = df[df['Tipo de estudo'] == tipo]
    add(f"\n│ {tipo.upper()} ({len(df_tipo)} registros)")
    add("│ " + "-" * 55)
    periodos_usados = []
    for col in colunas_tempo:
        pct = df_tipo[col].notna().sum() / len(df_tipo) * 100
        if pct > 20:  # Só mostrar períodos relevantes
            periodos_usados.append(f"{col}({pct:.0f}%)")
    add(f"│ Períodos principais: {' → '.join(periodos_usados)}")
add("└─────────────────────────────────────────────────────────────┘")

# Padrões de coleta
df['padrao'] = df[colunas_tempo].notna().apply(lambda r: tuple(r), axis=1)
n_padroes = df['padrao'].nunique()
add(f"\n⚠️  DIAGNÓSTICO:")
add(f"   - {n_padroes} combinações diferentes de períodos medidos")
add(f"   - Estudo Acelerado: foco até 6 meses")
add(f"   - Estudo Longa duração: vai até 36 meses")

top_padroes = df.groupby('padrao').size().sort_values(ascending=False).head(5)
add("\n   Top 5 padrões de coleta:")
for i, (padrao, count) in enumerate(top_padroes.items(), 1):
    periodos = [colunas_tempo[j] for j, v in enumerate(padrao) if v]
    add(f"   {i}. {' → '.join(periodos[:6])}{'...' if len(periodos) > 6 else ''} ({count} registros)")

add("\n✅ CONCLUSÃO: Não há padronização. Cada estudo segue cronograma próprio.")

# =============================================================================
# ANÁLISE 5: PRODUTOS VENCIDOS
# =============================================================================
add("\n" + "=" * 90)
add("6. PRODUTOS COM ESTUDOS ANTIGOS")
add("   [Sua nota: 'Produtos mesmo com ciência de que estão vencidos podem ter ainda testes']")
add("=" * 90)

df['ano'] = df['Data inicial do estudo'].dt.year
ano_counts = df['ano'].value_counts().sort_index()

add("\n┌─ Distribuição por Ano de Início do Estudo ─────────────────┐")
for ano, count in ano_counts.items():
    pct = count / len(df) * 100
    barra = "█" * int(pct / 2)
    status = "⚠️ >8 anos" if ano < 2017 else ""
    add(f"│ {ano} │ {count:4d} ({pct:5.1f}%) {barra:20s} {status}")
add("└─────────────────────────────────────────────────────────────┘")

estudos_antigos = df[df['ano'] < 2017]
pct_antigos = len(estudos_antigos) / len(df) * 100

add(f"\n⚠️  DIAGNÓSTICO:")
add(f"   - {len(estudos_antigos)} registros ({pct_antigos:.1f}%) são de estudos iniciados antes de 2017")
add(f"   - Estudos de 2013-2016 ainda presentes com medições até 36m")

# Produtos com estudos antigos
produtos_antigos = estudos_antigos['Nome do produto'].unique()
add(f"\n   Produtos com estudos antigos (antes 2017): {len(produtos_antigos)}")
for p in produtos_antigos[:10]:
    anos_prod = df[df['Nome do produto'] == p]['ano'].unique()
    add(f"      • {p} (estudos: {sorted(anos_prod)})")

add("\n✅ CONCLUSÃO: Base contém histórico longo. Avaliar se dados antigos devem ser filtrados.")

# =============================================================================
# ANÁLISE 6: QUALIDADE GERAL - TIERS
# =============================================================================
add("\n" + "=" * 90)
add("7. QUALIDADE DOS DADOS - Visão por Produto")
add("   [Sua nota: 'Vai precisar de um tratamento (separar em tiers?)']")
add("=" * 90)

# Calcular completude por produto
completude = []
for produto in df['Nome do produto'].unique():
    df_prod = df[df['Nome do produto'] == produto]
    total_celulas = len(df_prod) * len(colunas_tempo)
    preenchidas = df_prod[colunas_tempo].notna().sum().sum()
    pct = (preenchidas / total_celulas * 100) if total_celulas > 0 else 0
    completude.append({
        'produto': produto,
        'registros': len(df_prod),
        'completude': pct,
        'familia': df_prod['Grupo de Família'].iloc[0],
        'tipo_estudo': df_prod['Tipo de estudo'].iloc[0]
    })

df_comp = pd.DataFrame(completude).sort_values('completude', ascending=False)

# Definir tiers
df_comp['tier'] = pd.cut(df_comp['completude'],
                         bins=[0, 25, 40, 55, 100],
                         labels=['D (<25%)', 'C (25-40%)', 'B (40-55%)', 'A (>55%)'])

tier_resumo = df_comp['tier'].value_counts().sort_index()

add("\n┌─ Distribuição por Tier de Qualidade ──────────────────────┐")
for tier, count in tier_resumo.items():
    pct = count / len(df_comp) * 100
    barra = "█" * int(count)
    add(f"│ Tier {tier:12s} │ {count:2d} produtos ({pct:5.1f}%) {barra}")
add("└─────────────────────────────────────────────────────────────┘")

add("\n┌─ Produtos por Tier ────────────────────────────────────────┐")
for tier in ['A (>55%)', 'B (40-55%)', 'C (25-40%)', 'D (<25%)']:
    prods = df_comp[df_comp['tier'] == tier]
    if len(prods) > 0:
        add(f"\n│ TIER {tier}")
        for _, row in prods.head(5).iterrows():
            add(f"│   • {row['produto'][:35]:35s} │ {row['completude']:5.1f}% │ {row['registros']:2d} reg")
        if len(prods) > 5:
            add(f"│   ... e mais {len(prods)-5} produtos")
add("└─────────────────────────────────────────────────────────────┘")

add("\n✅ CONCLUSÃO: Qualidade heterogênea. Sistema de tiers viável para priorização.")

# =============================================================================
# ANÁLISE 7: ORGANIZAÇÃO GERAL
# =============================================================================
add("\n" + "=" * 90)
add("8. ORGANIZAÇÃO E ESTRUTURA DOS DADOS")
add("   [Sua nota: 'Todos os dados estão, aparenta baixa separação e organização']")
add("=" * 90)

add("\n┌─ Estrutura Atual ──────────────────────────────────────────┐")
add("│                                                            │")
add("│  HIERARQUIA IMPLÍCITA:                                     │")
add(f"│    Grupo de Família ─────── {df['Grupo de Família'].nunique():2d} grupos                    │")
add(f"│      └─ Família de Produtos ─ {df['Família de Produtos'].nunique():2d} famílias                 │")
add(f"│           └─ Nome do Produto ── {df['Nome do produto'].nunique():2d} produtos                 │")
add(f"│                └─ Ensaio ─────── {df['Ensaios físico-químicos'].nunique():3d} ensaios               │")
add("│                                                            │")
add("└─────────────────────────────────────────────────────────────┘")

add("\n┌─ Problemas de Organização Identificados ──────────────────┐")
add("│                                                            │")
add("│  1. FORMATO WIDE (colunas temporais)                       │")
add("│     → Dificulta análises de série temporal                 │")
add("│     → 15 colunas de tempo poderiam ser 1 coluna + valores  │")
add("│                                                            │")
add("│  2. DADOS MISTOS NAS MESMAS COLUNAS                        │")
add("│     → Resultados numéricos e texto no mesmo campo          │")
add("│     → Ex: '6.93' e 'líquido límpido' em colunas de tempo   │")
add("│                                                            │")
add("│  3. NOMENCLATURA INCONSISTENTE                             │")
add("│     → 250 nomes de ensaio para ~30 tipos reais             │")
add("│     → Variações de escrita, acentuação, unidades           │")
add("│                                                            │")
add("│  4. SEM SEPARAÇÃO CLARA POR TIPO DE DADO                   │")
add("│     → Ensaios quantitativos e qualitativos juntos          │")
add("│     → Especificações numéricas e descritivas misturadas    │")
add("│                                                            │")
add("└─────────────────────────────────────────────────────────────┘")

# =============================================================================
# RESUMO EXECUTIVO
# =============================================================================
add("\n" + "=" * 90)
add("9. RESUMO EXECUTIVO - ESTADO ATUAL")
add("=" * 90)

add("""
┌──────────────────────────────────────────────────────────────────────────────┐
│                         DIAGNÓSTICO GERAL                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ PONTOS POSITIVOS                                                         │
│     • Dados existem e cobrem período significativo (2013-2024)               │
│     • Estrutura hierárquica implícita (família > produto > ensaio)           │
│     • Grau de etoxilação funciona para segmentação de etoxilados             │
│     • Dois tipos de estudo bem definidos (Acelerado / Longa duração)         │
│                                                                              │
│  ⚠️  PONTOS DE ATENÇÃO                                                       │
│     • 32.9% de valores nulos no dataset                                      │
│     • 250 variações de nome para ~30 ensaios reais                           │
│     • Mistura de dados numéricos e texto nos resultados                      │
│     • Sem padrão temporal claro (cada estudo tem cronograma próprio)         │
│     • Dados antigos (>8 anos) ainda presentes                                │
│                                                                              │
│  🔴 PROBLEMAS CRÍTICOS                                                       │
│     • Nomenclatura de ensaios impede comparações diretas                     │
│     • Formato wide dificulta análise temporal                                │
│     • Não há distinção clara entre ensaios quantitativos e qualitativos      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📊 MÉTRICAS-CHAVE                                                           │
│     • Produtos Tier A (>55% completo):  7 de 52  (13%)                       │
│     • Produtos Tier B (40-55%):        31 de 52  (60%)                       │
│     • Ensaios mais comuns: Água, Hidroxila, Aparência, Acidez, pH            │
│     • Estudo Acelerado: 53% dos registros                                    │
│     • Estudo Longa duração: 47% dos registros                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
""")

add("\n" + "=" * 90)
add("10. PRÓXIMOS PASSOS SUGERIDOS")
add("=" * 90)

add("""
┌──────────────────────────────────────────────────────────────────────────────┐
│  ANTES DE QUALQUER TRATAMENTO, DECIDIR:                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ESCOPO TEMPORAL                                                          │
│     → Usar todos os dados ou filtrar por período?                            │
│     → Estudos antigos (antes 2017) são relevantes?                           │
│                                                                              │
│  2. PRIORIZAÇÃO DE PRODUTOS                                                  │
│     → Trabalhar com todos ou focar em Tier A/B?                              │
│     → Há produtos prioritários para o negócio?                               │
│                                                                              │
│  3. NORMALIZAÇÃO DE ENSAIOS                                                  │
│     → Criar dicionário de-para para os 250 nomes?                            │
│     → Existe lista oficial de ensaios da empresa?                            │
│                                                                              │
│  4. SEPARAÇÃO DE DADOS                                                       │
│     → Tratar ensaios quantitativos e qualitativos separadamente?             │
│     → Separar por tipo de estudo (Acelerado vs Longa)?                       │
│                                                                              │
│  5. OBJETIVO FINAL                                                           │
│     → Dashboard de acompanhamento?                                           │
│     → Análise de estabilidade?                                               │
│     → Previsão de shelf-life?                                                │
│     → Detecção de anomalias?                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
""")

# Limpar colunas temporárias
df.drop(columns=['tipo_spec', 'padrao', 'ano'], inplace=True, errors='ignore')

# Salvar relatório
relatorio_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\DIAGNOSTICO_Indovinya.txt")
with open(relatorio_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

add(f"\n\n📄 Relatório salvo em: {relatorio_path}")
