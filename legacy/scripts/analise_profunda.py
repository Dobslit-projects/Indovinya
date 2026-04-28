# -*- coding: utf-8 -*-
"""
ANALISE PROFUNDA - Ensaios, Especificacoes e Tipos de Estudo
Deep dive para entender tratamento necessario
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 150)

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

colunas_tempo = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']

output = []

def add(text=""):
    output.append(text)
    print(text)

def sep(char="=", size=100):
    add(char * size)

# =============================================================================
sep()
add("ANALISE PROFUNDA - TRATAMENTO DE DADOS INDOVINYA")
add(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
sep()

# =============================================================================
# PARTE 1: ANATOMIA DO DATASET
# =============================================================================
sep()
add("PARTE 1: ANATOMIA DO DATASET - COMO ELE FUNCIONA")
sep()

add("""
ESTRUTURA ATUAL DO DATASET:
---------------------------
Cada LINHA representa: 1 Ensaio de 1 Produto em 1 Estudo

Colunas de IDENTIFICACAO:
  - Item (ID numerico do produto)
  - Codigo de item (codigo interno)
  - Nome do produto
  - Descricao quimica

Colunas de CLASSIFICACAO:
  - Grau de Etoxilacao
  - Grupo de Familia
  - Familia de Produtos
  - Peso Molecular

Colunas do ESTUDO:
  - Data inicial do estudo
  - Tipo de estudo (Acelerado / Longa duracao)

Colunas do ENSAIO:
  - Ensaios fisico-quimicos (nome do teste)
  - Metodo (codigo do metodo analitico)
  - Especificacao (criterio de aceitacao)

Colunas de RESULTADOS (15 pontos temporais):
  - 0 dia, 1 sem, 2 sem, 1m, 2m, 3m, 4m, 5m, 6m, 9m, 12m, 18m, 24m, 30m, 36m
""")

add("\nRELACIONAMENTOS IDENTIFICADOS:")
add("-" * 50)

# Verificar cardinalidade
add(f"  Produtos unicos: {df['Nome do produto'].nunique()}")
add(f"  Codigos de item unicos: {df['Código de item'].nunique()}")
add(f"  Items unicos: {df['Item'].nunique()}")

# Verificar se 1 produto = 1 codigo
prod_cod = df.groupby('Nome do produto')['Código de item'].nunique()
multi_cod = prod_cod[prod_cod > 1]
if len(multi_cod) > 0:
    add(f"\n  ATENCAO: {len(multi_cod)} produtos com multiplos codigos:")
    for p in multi_cod.index:
        cods = df[df['Nome do produto'] == p]['Código de item'].unique()
        add(f"    - {p}: {list(cods)}")

# Verificar quantos estudos por produto
add("\nESTUDOS POR PRODUTO:")
estudos_por_prod = df.groupby('Nome do produto').apply(
    lambda x: x.groupby(['Data inicial do estudo', 'Tipo de estudo']).ngroups
)
add(f"  Media de estudos por produto: {estudos_por_prod.mean():.1f}")
add(f"  Minimo: {estudos_por_prod.min()}")
add(f"  Maximo: {estudos_por_prod.max()}")

# =============================================================================
# PARTE 2: ENSAIOS FISICO-QUIMICOS - ANALISE PROFUNDA
# =============================================================================
sep()
add("PARTE 2: ENSAIOS FISICO-QUIMICOS - ANALISE PROFUNDA")
sep()

ensaios = df['Ensaios físico-químicos'].unique()
add(f"\nTotal de nomes de ensaio unicos: {len(ensaios)}")

# Agrupar ensaios por categoria (baseado em palavras-chave)
categorias = {
    'pH': [],
    'Acidez': [],
    'Hidroxila': [],
    'Agua/Umidade': [],
    'Aparencia': [],
    'Cor': [],
    'Viscosidade': [],
    'Saponificacao': [],
    'Dioxana': [],
    'Peroxidos': [],
    'Densidade': [],
    'Ponto (fusao/nevoa/solidif)': [],
    'Materia Ativa': [],
    'Oxido de Etileno': [],
    'Transmitancia': [],
    'Cloreto/Sulfato': [],
    'Indice de Iodo': [],
    'Acidos Graxos': [],
    'Outros': []
}

for ensaio in ensaios:
    e_lower = str(ensaio).lower()
    categorizado = False

    if 'ph' in e_lower and 'apha' not in e_lower:
        categorias['pH'].append(ensaio)
        categorizado = True
    elif 'acidez' in e_lower or 'ácido' in e_lower or 'n° ácido' in e_lower:
        categorias['Acidez'].append(ensaio)
        categorizado = True
    elif 'hidroxila' in e_lower:
        categorias['Hidroxila'].append(ensaio)
        categorizado = True
    elif 'água' in e_lower or 'agua' in e_lower or 'umidade' in e_lower or 'teor de água' in e_lower:
        categorias['Agua/Umidade'].append(ensaio)
        categorizado = True
    elif 'aparência' in e_lower or 'aparencia' in e_lower:
        categorias['Aparencia'].append(ensaio)
        categorizado = True
    elif 'cor' in e_lower:
        categorias['Cor'].append(ensaio)
        categorizado = True
    elif 'viscosidade' in e_lower:
        categorias['Viscosidade'].append(ensaio)
        categorizado = True
    elif 'saponifica' in e_lower:
        categorias['Saponificacao'].append(ensaio)
        categorizado = True
    elif 'dioxana' in e_lower:
        categorias['Dioxana'].append(ensaio)
        categorizado = True
    elif 'peróxido' in e_lower or 'peroxido' in e_lower:
        categorias['Peroxidos'].append(ensaio)
        categorizado = True
    elif 'densidade' in e_lower or 'peso específico' in e_lower:
        categorias['Densidade'].append(ensaio)
        categorizado = True
    elif 'ponto de' in e_lower or 'ponto ' in e_lower:
        categorias['Ponto (fusao/nevoa/solidif)'].append(ensaio)
        categorizado = True
    elif 'matéria ativa' in e_lower or 'materia ativa' in e_lower or 'ativo' in e_lower:
        categorias['Materia Ativa'].append(ensaio)
        categorizado = True
    elif 'óxido de etileno' in e_lower or 'oxido de etileno' in e_lower or 'óxido de eteno' in e_lower:
        categorias['Oxido de Etileno'].append(ensaio)
        categorizado = True
    elif 'transmit' in e_lower:
        categorias['Transmitancia'].append(ensaio)
        categorizado = True
    elif 'cloreto' in e_lower or 'sulfato' in e_lower:
        categorias['Cloreto/Sulfato'].append(ensaio)
        categorizado = True
    elif 'iodo' in e_lower:
        categorias['Indice de Iodo'].append(ensaio)
        categorizado = True
    elif any(x in e_lower for x in ['c10', 'c12', 'c14', 'c16', 'c18', 'laurico', 'oleico', 'graxo']):
        categorias['Acidos Graxos'].append(ensaio)
        categorizado = True

    if not categorizado:
        categorias['Outros'].append(ensaio)

add("\nCATEGORIZACAO DOS ENSAIOS:")
add("-" * 70)
for cat, lista in sorted(categorias.items(), key=lambda x: -len(x[1])):
    if len(lista) > 0:
        add(f"\n{cat}: {len(lista)} variacoes")
        # Mostrar frequencia de cada variacao
        for e in lista[:5]:
            freq = len(df[df['Ensaios físico-químicos'] == e])
            add(f"   [{freq:3d}x] {e}")
        if len(lista) > 5:
            add(f"   ... e mais {len(lista)-5} variacoes")

# Analise de qual o ensaio NORMALIZADO
add("\n" + "=" * 70)
add("PROPOSTA DE NORMALIZACAO DE ENSAIOS:")
add("=" * 70)

normalizacao = {
    'pH': ['ph'],
    'Indice de Acidez': ['acidez', 'n° ácido', 'índice de acidez'],
    'Indice de Hidroxila': ['hidroxila'],
    'Teor de Agua': ['água', 'umidade', 'teor de água'],
    'Aparencia': ['aparência', 'aparencia'],
    'Cor Gardner': ['cor gardner'],
    'Cor Pt-Co': ['pt-co', 'ptco', 'pt co'],
    'Cor APHA': ['apha'],
    'Viscosidade': ['viscosidade'],
    'Indice de Saponificacao': ['saponifica'],
    'Dioxana': ['dioxana'],
    'Indice de Peroxidos': ['peróxido', 'peroxido'],
    'Densidade': ['densidade', 'peso específico'],
    'Ponto de Fusao': ['ponto de fusão', 'ponto de fus'],
    'Ponto de Nevoa': ['ponto de névoa', 'ponto de nevoa'],
    'Materia Ativa': ['matéria ativa', 'materia ativa'],
    'Oxido de Etileno Residual': ['óxido de etileno', 'oxido de etileno'],
}

add("\nMAPEAMENTO SUGERIDO (ensaio_original -> ensaio_normalizado):")
for norm_name, keywords in normalizacao.items():
    matches = []
    for e in ensaios:
        e_lower = str(e).lower()
        if any(kw in e_lower for kw in keywords):
            matches.append(e)
    if matches:
        add(f"\n  {norm_name}:")
        for m in matches[:3]:
            add(f"    <- '{m}'")
        if len(matches) > 3:
            add(f"    ... e mais {len(matches)-3}")

# =============================================================================
# PARTE 3: ESPECIFICACOES - ANALISE PROFUNDA
# =============================================================================
sep()
add("PARTE 3: ESPECIFICACOES - ANALISE PROFUNDA")
sep()

specs = df['Especificação'].dropna().unique()
add(f"\nTotal de especificacoes unicas: {len(specs)}")

# Classificar especificacoes
def parse_spec(spec):
    """Analisa e classifica uma especificacao"""
    spec_str = str(spec).strip()
    spec_lower = spec_str.lower()

    result = {
        'original': spec_str,
        'tipo': None,
        'valor_min': None,
        'valor_max': None,
        'unidade': None,
        'descricao': None
    }

    # Sem especificacao
    if spec_str in ['----', '---', '-', ''] or 'monitoramento' in spec_lower:
        result['tipo'] = 'SEM_SPEC'
        return result

    # Descritiva pura
    descritivos = ['líquido', 'liquido', 'sólido', 'solido', 'livre', 'passa',
                   'flocos', 'pasta', 'claro', 'escuro', 'branco', 'amarelo',
                   'límpido', 'limpido', 'turvo', 'ceroso', 'isento', 'substancialmente']
    if any(d in spec_lower for d in descritivos) and not any(c.isdigit() for c in spec_str):
        result['tipo'] = 'DESCRITIVA'
        result['descricao'] = spec_str
        return result

    # Range (X - Y)
    range_match = re.match(r'([\d,\.]+)\s*[-–]\s*([\d,\.]+)', spec_str)
    if range_match:
        result['tipo'] = 'RANGE'
        result['valor_min'] = range_match.group(1).replace(',', '.')
        result['valor_max'] = range_match.group(2).replace(',', '.')
        return result

    # Maximo
    if 'máx' in spec_lower or 'max' in spec_lower:
        result['tipo'] = 'MAXIMO'
        num_match = re.search(r'([\d,\.]+)', spec_str)
        if num_match:
            result['valor_max'] = num_match.group(1).replace(',', '.')
        return result

    # Minimo
    if 'mín' in spec_lower or 'min' in spec_lower:
        result['tipo'] = 'MINIMO'
        num_match = re.search(r'([\d,\.]+)', spec_str)
        if num_match:
            result['valor_min'] = num_match.group(1).replace(',', '.')
        return result

    # Numero simples
    if re.match(r'^[\d,\.]+$', spec_str):
        result['tipo'] = 'VALOR_EXATO'
        result['valor_min'] = spec_str.replace(',', '.')
        result['valor_max'] = spec_str.replace(',', '.')
        return result

    result['tipo'] = 'OUTRO'
    result['descricao'] = spec_str
    return result

# Aplicar parse em todas as especificacoes
specs_parsed = [parse_spec(s) for s in specs]
tipos_spec = defaultdict(list)
for sp in specs_parsed:
    tipos_spec[sp['tipo']].append(sp)

add("\nDISTRIBUICAO POR TIPO DE ESPECIFICACAO:")
add("-" * 50)
for tipo, lista in sorted(tipos_spec.items(), key=lambda x: -len(x[1])):
    add(f"\n{tipo}: {len(lista)} especificacoes")
    for item in lista[:3]:
        add(f"   Exemplo: '{item['original']}'")
        if item['valor_min'] or item['valor_max']:
            add(f"            -> min={item['valor_min']}, max={item['valor_max']}")

# Relacao Ensaio x Especificacao
add("\n" + "=" * 70)
add("RELACAO ENSAIO x TIPO DE ESPECIFICACAO:")
add("=" * 70)

df['spec_parsed'] = df['Especificação'].fillna('----').apply(lambda x: parse_spec(x)['tipo'])

ensaio_spec = df.groupby(['Ensaios físico-químicos', 'spec_parsed']).size().unstack(fill_value=0)
add("\nEnsaios com especificacoes DESCRITIVAS (qualitativos):")
if 'DESCRITIVA' in ensaio_spec.columns:
    ensaios_descritivos = ensaio_spec[ensaio_spec['DESCRITIVA'] > 0].index.tolist()
    for e in ensaios_descritivos[:10]:
        add(f"   - {e}")
    add(f"   Total: {len(ensaios_descritivos)} ensaios qualitativos")

add("\nEnsaios com especificacoes NUMERICAS (quantitativos):")
cols_num = [c for c in ['RANGE', 'MAXIMO', 'MINIMO'] if c in ensaio_spec.columns]
if cols_num:
    mask = ensaio_spec[cols_num].sum(axis=1) > 0
    ensaios_numericos = ensaio_spec[mask].index.tolist()
    add(f"   Total: {len(ensaios_numericos)} ensaios quantitativos")

# =============================================================================
# PARTE 4: ACELERADO vs LONGA DURACAO
# =============================================================================
sep()
add("PARTE 4: ESTUDO ACELERADO vs LONGA DURACAO")
sep()

df_acel = df[df['Tipo de estudo'] == 'Acelerado']
df_longa = df[df['Tipo de estudo'] == 'Longa duração']

add(f"\nACELERADO: {len(df_acel)} registros ({len(df_acel)/len(df)*100:.1f}%)")
add(f"LONGA DURACAO: {len(df_longa)} registros ({len(df_longa)/len(df)*100:.1f}%)")

add("\n" + "-" * 70)
add("COMPARATIVO DE PREENCHIMENTO TEMPORAL:")
add("-" * 70)
add(f"\n{'Periodo':<10} {'Acelerado':>15} {'Longa Duracao':>15} {'Diferenca':>15}")
add("-" * 55)

for col in colunas_tempo:
    pct_acel = df_acel[col].notna().sum() / len(df_acel) * 100 if len(df_acel) > 0 else 0
    pct_longa = df_longa[col].notna().sum() / len(df_longa) * 100 if len(df_longa) > 0 else 0
    diff = pct_acel - pct_longa
    marker = "<<<" if abs(diff) > 30 else ""
    add(f"{col:<10} {pct_acel:>14.1f}% {pct_longa:>14.1f}% {diff:>+14.1f}% {marker}")

add("\n" + "-" * 70)
add("ENSAIOS POR TIPO DE ESTUDO:")
add("-" * 70)

ensaios_acel = set(df_acel['Ensaios físico-químicos'].unique())
ensaios_longa = set(df_longa['Ensaios físico-químicos'].unique())

add(f"\nEnsaios APENAS em Acelerado: {len(ensaios_acel - ensaios_longa)}")
for e in list(ensaios_acel - ensaios_longa)[:5]:
    add(f"   - {e}")

add(f"\nEnsaios APENAS em Longa Duracao: {len(ensaios_longa - ensaios_acel)}")
for e in list(ensaios_longa - ensaios_acel)[:5]:
    add(f"   - {e}")

add(f"\nEnsaios em AMBOS: {len(ensaios_acel & ensaios_longa)}")

add("\n" + "-" * 70)
add("PRODUTOS POR TIPO DE ESTUDO:")
add("-" * 70)

prods_acel = set(df_acel['Nome do produto'].unique())
prods_longa = set(df_longa['Nome do produto'].unique())

add(f"\nProdutos APENAS em Acelerado: {len(prods_acel - prods_longa)}")
add(f"Produtos APENAS em Longa Duracao: {len(prods_longa - prods_acel)}")
add(f"Produtos em AMBOS os estudos: {len(prods_acel & prods_longa)}")

# Produtos com ambos
if len(prods_acel & prods_longa) > 0:
    add("\nProdutos com AMBOS os tipos de estudo:")
    for p in list(prods_acel & prods_longa)[:10]:
        n_acel = len(df_acel[df_acel['Nome do produto'] == p])
        n_longa = len(df_longa[df_longa['Nome do produto'] == p])
        add(f"   - {p}: {n_acel} acel + {n_longa} longa")

# =============================================================================
# PARTE 5: ANALISE DOS VALORES (RESULTADOS)
# =============================================================================
sep()
add("PARTE 5: ANALISE DOS VALORES (RESULTADOS)")
sep()

add("\nTIPOS DE VALORES NAS COLUNAS TEMPORAIS:")
add("-" * 50)

def classificar_valor(val):
    if pd.isna(val):
        return 'NULO'
    val_str = str(val).strip()
    if val_str == '':
        return 'VAZIO'
    try:
        float(val_str.replace(',', '.'))
        return 'NUMERICO'
    except:
        if any(c.isdigit() for c in val_str):
            return 'MISTO'
        return 'TEXTO'

for col in ['0 dia', '3m', '6m', '12m']:
    tipos = df[col].apply(classificar_valor)
    add(f"\n{col}:")
    for tipo, count in tipos.value_counts().items():
        pct = count / len(df) * 100
        add(f"   {tipo:10s}: {count:4d} ({pct:5.1f}%)")

add("\n" + "-" * 70)
add("EXEMPLOS DE VALORES TEXTO (nao-numericos):")
add("-" * 70)

valores_texto = []
for col in colunas_tempo:
    for val in df[col].dropna().unique():
        try:
            float(str(val).replace(',', '.'))
        except:
            valores_texto.append(str(val))

valores_texto_unicos = list(set(valores_texto))
add(f"\nTotal de valores texto unicos: {len(valores_texto_unicos)}")
add("\nExemplos:")
for v in valores_texto_unicos[:20]:
    add(f"   - {v}")

# =============================================================================
# PARTE 6: RECOMENDACOES DE TRATAMENTO
# =============================================================================
sep()
add("PARTE 6: RECOMENDACOES DE TRATAMENTO")
sep()

add("""
TRATAMENTOS NECESSARIOS:
========================

1. NORMALIZACAO DE ENSAIOS
   -------------------------
   Problema: 250 nomes diferentes para ~20 ensaios reais
   Solucao: Criar tabela DE-PARA com ensaio_original -> ensaio_normalizado
   Prioridade: ALTA (bloqueia qualquer analise comparativa)

   Sugestao de categorias normalizadas:
   - pH
   - Indice de Acidez
   - Indice de Hidroxila
   - Teor de Agua
   - Aparencia
   - Cor (Gardner / Pt-Co / APHA)
   - Viscosidade
   - Indice de Saponificacao
   - Dioxana
   - Indice de Peroxidos
   - Densidade
   - Materia Ativa
   - Oxido de Etileno Residual
   - Acidos Graxos
   - Outros

2. SEPARACAO QUANTITATIVO vs QUALITATIVO
   --------------------------------------
   Problema: Ensaios numericos e descritivos misturados
   Solucao: Criar flag is_quantitativo baseado no tipo de especificacao
   Prioridade: ALTA (tratamento diferente para cada tipo)

   Quantitativos: pH, Acidez, Hidroxila, Agua, Viscosidade, etc.
   Qualitativos: Aparencia, Limpidez, Material em suspensao, etc.

3. PARSE DE ESPECIFICACOES
   ------------------------
   Problema: Especificacoes em texto livre
   Solucao: Extrair campos estruturados:
     - tipo: RANGE / MAXIMO / MINIMO / DESCRITIVA / SEM_SPEC
     - valor_min: numero ou null
     - valor_max: numero ou null
     - descricao: texto para descritivas
   Prioridade: ALTA (necessario para validacao de conformidade)

4. SEPARACAO POR TIPO DE ESTUDO
   -----------------------------
   Problema: Acelerado e Longa Duracao tem cronogramas diferentes
   Solucao: Processar separadamente ou criar views filtradas
   Prioridade: MEDIA

   Acelerado: foco em 0dia, 1m, 3m, 6m
   Longa Duracao: foco em 0dia, 3m, 6m, 9m, 12m, 18m, 24m, 30m, 36m

5. TRATAMENTO DE VALORES MISTOS
   -----------------------------
   Problema: Colunas temporais tem numeros E texto
   Solucao:
     - Para quantitativos: converter para float, tratar virgula como decimal
     - Para qualitativos: manter como texto, criar encoding se necessario
   Prioridade: ALTA

6. FORMATO DOS DADOS
   ------------------
   Problema: Formato WIDE (15 colunas de tempo)
   Solucao: Converter para formato LONG se necessario para series temporais
     - Manter WIDE para visualizacao por produto
     - Criar LONG para analises de tendencia
   Prioridade: MEDIA (depende do uso)

""")

add("\n" + "=" * 70)
add("ORDEM SUGERIDA DE TRATAMENTO:")
add("=" * 70)
add("""
FASE 1 - Estruturacao Basica:
  1.1 Criar tabela de normalizacao de ensaios
  1.2 Classificar ensaios em quantitativo/qualitativo
  1.3 Parsear especificacoes

FASE 2 - Limpeza de Valores:
  2.1 Converter valores numericos (tratar virgula)
  2.2 Padronizar valores texto
  2.3 Tratar valores ausentes

FASE 3 - Separacao por Contexto:
  3.1 Separar por tipo de estudo (Acelerado / Longa)
  3.2 Separar por tipo de ensaio (Quant / Qual)

FASE 4 - Validacao:
  4.1 Verificar conformidade com especificacoes
  4.2 Identificar outliers
  4.3 Gerar alertas
""")

# Limpar colunas temporarias
df.drop(columns=['spec_parsed'], inplace=True, errors='ignore')

# Salvar relatorio
relatorio_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ANALISE_PROFUNDA_Indovinya.txt")
with open(relatorio_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

add(f"\n\nRelatorio salvo em: {relatorio_path}")
