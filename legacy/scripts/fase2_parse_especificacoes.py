# -*- coding: utf-8 -*-
"""
FASE 2 - Parse de Especificacoes
Extrair valores min/max das especificacoes em texto livre
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

print("="*80)
print("FASE 2 - PARSE DE ESPECIFICACOES")
print("="*80)

# Extrair especificacoes unicas
specs = df['Especificação'].unique()
print(f"\nTotal de especificacoes unicas: {len(specs)}")

# ============================================================
# FUNCOES DE PARSE
# ============================================================

def limpar_numero(texto):
    """Converte texto numerico para float (virgula -> ponto)"""
    if texto is None:
        return None
    texto = str(texto).strip()
    # Remover espacos e trocar virgula por ponto
    texto = texto.replace(' ', '').replace(',', '.')
    try:
        return float(texto)
    except:
        return None


def parse_especificacao(spec):
    """
    Parseia uma especificacao e retorna:
    - tipo: RANGE, MAXIMO, MINIMO, DESCRITIVA, SEM_SPEC
    - spec_min: valor minimo (ou None)
    - spec_max: valor maximo (ou None)
    - spec_descricao: texto descritivo (ou None)
    """
    if pd.isna(spec):
        return ('SEM_SPEC', None, None, None)

    s = str(spec).strip()

    # Sem especificacao
    if s in ['----', '---', '--', '-', '', 'monitoramento', 'Monitoramento', 'MONITORAMENTO']:
        return ('SEM_SPEC', None, None, None)

    # Normalizar texto
    s_lower = s.lower()

    # ========== RANGE (X - Y) ==========
    # Padroes: "190,0 - 220,0", "5.0-7.0", "1,0 a 3,0"
    range_pattern = r'([\d,\.]+)\s*[-–a]\s*([\d,\.]+)'
    range_match = re.search(range_pattern, s)

    if range_match:
        val_min = limpar_numero(range_match.group(1))
        val_max = limpar_numero(range_match.group(2))
        if val_min is not None and val_max is not None:
            # Garantir que min < max
            if val_min > val_max:
                val_min, val_max = val_max, val_min
            return ('RANGE', val_min, val_max, None)

    # ========== MAXIMO ==========
    # Padroes: "1,0 máx", "1.0 max.", "máximo 5", "< 10", "até 5"
    max_patterns = [
        r'([\d,\.]+)\s*m[aá]x\.?',           # "1,0 máx" ou "1.0 max."
        r'([\d,\.]+)\s*mn[aá]x\.?',          # "1,0 mnáx" (typo comum)
        r'm[aá]x\.?\s*([\d,\.]+)',           # "máx 1,0"
        r'([\d,\.]+)\s*m[aá]ximo',           # "1,0 máximo"
        r'm[aá]ximo\.?\s*([\d,\.]+)',        # "máximo 1,0"
        r'<\s*([\d,\.]+)',                    # "< 1,0"
        r'at[eé]\s*([\d,\.]+)',              # "até 1,0"
        r'([\d,\.]+)\s*ou\s*menos',          # "1,0 ou menos"
    ]

    for pattern in max_patterns:
        match = re.search(pattern, s_lower)
        if match:
            val = limpar_numero(match.group(1))
            if val is not None:
                return ('MAXIMO', None, val, None)

    # ========== MINIMO ==========
    # Padroes: "94,0 mín", "min. 90", "mínimo 5", "> 10", "acima de"
    min_patterns = [
        r'([\d,\.]+)\s*m[ií]n\.?',           # "94,0 mín" ou "94.0 min."
        r'm[ií]n\.?\s*([\d,\.]+)',           # "mín 94,0"
        r'([\d,\.]+)\s*m[ií]nimo',           # "94,0 mínimo"
        r'm[ií]nimo\.?\s*([\d,\.]+)',        # "mínimo 94,0"
        r'>\s*([\d,\.]+)',                    # "> 94,0"
        r'acima\s*de\s*([\d,\.]+)',          # "acima de 94,0"
        r'([\d,\.]+)\s*ou\s*mais',           # "94,0 ou mais"
    ]

    for pattern in min_patterns:
        match = re.search(pattern, s_lower)
        if match:
            val = limpar_numero(match.group(1))
            if val is not None:
                return ('MINIMO', val, None, None)

    # ========== VALOR EXATO ==========
    # Se tem apenas um numero, pode ser valor exato
    # Padroes: "6,5", "100", "1.050"
    exact_pattern = r'^([\d,\.]+)$'
    exact_match = re.match(exact_pattern, s.strip())
    if exact_match:
        val = limpar_numero(exact_match.group(1))
        if val is not None:
            return ('EXATO', val, val, None)

    # ========== DESCRITIVA ==========
    # Palavras que indicam especificacao descritiva (qualitativa)
    descritivo_keywords = [
        'liquido', 'líquido', 'solido', 'sólido', 'pasta', 'flocos',
        'livre', 'limpido', 'límpido', 'claro', 'escuro', 'turvo',
        'passa', 'conforme', 'caracteristico', 'característico',
        'branco', 'amarelo', 'incolor', 'transparente', 'opaco',
        'isento', 'ausente', 'presente', 'positivo', 'negativo',
        'aprovado', 'reprovado', 'ok', 'nok',
        'substancialmente', 'praticamente', 'essencialmente',
        'odor', 'cheiro', 'aspecto', 'aparencia', 'aparência',
        'homogeneo', 'homogêneo', 'heterogeneo', 'heterogêneo',
        'viscoso', 'fluido', 'espesso', 'fino',
        'forte', 'fraco', 'suave', 'intenso',
        'normal', 'anormal', 'tipico', 'típico', 'atipico', 'atípico'
    ]

    for keyword in descritivo_keywords:
        if keyword in s_lower:
            return ('DESCRITIVA', None, None, s)

    # Se nao encontrou numero e nao e descritiva conhecida, marca como descritiva
    numeros = re.findall(r'[\d,\.]+', s)
    if not numeros:
        return ('DESCRITIVA', None, None, s)

    # ========== CASO ESPECIAL: Numero com texto ==========
    # Ex: "1,0480 - 1,0540" ja foi pego acima
    # Ex: "3 a 5" ja foi pego acima
    # Se chegou aqui com numero, tenta extrair como EXATO ou OUTRO

    # Tenta pegar o primeiro numero
    primeiro_num = re.search(r'([\d,\.]+)', s)
    if primeiro_num:
        val = limpar_numero(primeiro_num.group(1))
        if val is not None:
            # Se tem "max" ou "min" no texto original (nao pegou antes)
            if 'max' in s_lower or 'máx' in s_lower:
                return ('MAXIMO', None, val, None)
            if 'min' in s_lower or 'mín' in s_lower:
                return ('MINIMO', val, None, None)
            # Caso contrario, marca como OUTRO com o texto original
            return ('OUTRO', None, None, s)

    # ========== NAO CLASSIFICADO ==========
    return ('OUTRO', None, None, s)


# ============================================================
# PROCESSAR ESPECIFICACOES
# ============================================================

print("\nProcessando especificacoes...")

resultados = []
for spec in specs:
    tipo, spec_min, spec_max, descricao = parse_especificacao(spec)
    freq = len(df[df['Especificação'] == spec])
    resultados.append({
        'spec_original': spec,
        'spec_tipo': tipo,
        'spec_min': spec_min,
        'spec_max': spec_max,
        'spec_descricao': descricao,
        'frequencia': freq
    })

df_specs = pd.DataFrame(resultados)

# ============================================================
# ESTATISTICAS
# ============================================================

print("\n" + "="*80)
print("RESULTADO DO PARSE")
print("="*80)

print(f"\nDe {len(specs)} especificacoes unicas:")

print("\n--- Distribuicao por Tipo ---")
tipo_stats = df_specs.groupby('spec_tipo').agg({
    'spec_original': 'count',
    'frequencia': 'sum'
}).rename(columns={'spec_original': 'qtd_specs', 'frequencia': 'total_registros'})
print(tipo_stats.sort_values('total_registros', ascending=False))

# Percentual por tipo
print("\n--- Percentual por Tipo ---")
total_registros = df_specs['frequencia'].sum()
for tipo in tipo_stats.index:
    qtd = tipo_stats.loc[tipo, 'total_registros']
    pct = (qtd / total_registros) * 100
    print(f"  {tipo:12s}: {qtd:4d} registros ({pct:5.1f}%)")

# Verificar specs classificadas como "OUTRO"
outros = df_specs[df_specs['spec_tipo'] == 'OUTRO']
if len(outros) > 0:
    print(f"\n--- ATENCAO: {len(outros)} specs classificadas como 'OUTRO' ---")
    for _, row in outros.sort_values('frequencia', ascending=False).head(20).iterrows():
        print(f"   [{row['frequencia']:3d}x] {row['spec_original']}")

# Amostras de cada tipo
print("\n" + "="*80)
print("AMOSTRAS POR TIPO")
print("="*80)

for tipo in ['RANGE', 'MAXIMO', 'MINIMO', 'EXATO', 'DESCRITIVA', 'SEM_SPEC']:
    subset = df_specs[df_specs['spec_tipo'] == tipo]
    if len(subset) > 0:
        print(f"\n--- {tipo} ({len(subset)} specs) ---")
        for _, row in subset.head(5).iterrows():
            if tipo == 'RANGE':
                print(f"   '{row['spec_original']}' -> min={row['spec_min']}, max={row['spec_max']}")
            elif tipo == 'MAXIMO':
                print(f"   '{row['spec_original']}' -> max={row['spec_max']}")
            elif tipo == 'MINIMO':
                print(f"   '{row['spec_original']}' -> min={row['spec_min']}")
            elif tipo == 'EXATO':
                print(f"   '{row['spec_original']}' -> valor={row['spec_min']}")
            elif tipo == 'DESCRITIVA':
                print(f"   '{row['spec_original']}'")
            elif tipo == 'SEM_SPEC':
                print(f"   '{row['spec_original']}'")

# ============================================================
# SALVAR RESULTADOS
# ============================================================

# CSV com ponto-e-virgula
output_csv = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\especificacoes_parseadas.csv")

# Substituir ; por , nos campos de texto para nao quebrar o CSV
df_specs_csv = df_specs.copy()
for col in ['spec_original', 'spec_descricao']:
    df_specs_csv[col] = df_specs_csv[col].apply(lambda x: str(x).replace(';', ',') if pd.notna(x) else x)

df_specs_csv.to_csv(output_csv, index=False, encoding='utf-8-sig', sep=';')
print(f"\n\nCSV salvo em: {output_csv}")

# Excel
output_xlsx = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\especificacoes_parseadas.xlsx")
df_specs.to_excel(output_xlsx, index=False)
print(f"Excel salvo em: {output_xlsx}")

# ============================================================
# RESUMO FINAL
# ============================================================

print("\n" + "="*80)
print("RESUMO")
print("="*80)

quantitativos = df_specs[df_specs['spec_tipo'].isin(['RANGE', 'MAXIMO', 'MINIMO', 'EXATO'])]
qualitativos = df_specs[df_specs['spec_tipo'].isin(['DESCRITIVA'])]
sem_spec = df_specs[df_specs['spec_tipo'].isin(['SEM_SPEC'])]
outros = df_specs[df_specs['spec_tipo'].isin(['OUTRO'])]

print(f"""
Especificacoes originais:  {len(specs)}

Por tipo:
  QUANTITATIVAS (RANGE/MAX/MIN/EXATO): {len(quantitativos)} specs ({quantitativos['frequencia'].sum()} registros)
  DESCRITIVAS:                         {len(qualitativos)} specs ({qualitativos['frequencia'].sum()} registros)
  SEM ESPECIFICACAO:                   {len(sem_spec)} specs ({sem_spec['frequencia'].sum()} registros)
  OUTROS (revisar):                    {len(outros)} specs ({outros['frequencia'].sum()} registros)

Detalhamento quantitativas:
  RANGE:  {len(df_specs[df_specs['spec_tipo']=='RANGE']):3d} specs -> extraiu min E max
  MAXIMO: {len(df_specs[df_specs['spec_tipo']=='MAXIMO']):3d} specs -> extraiu apenas max
  MINIMO: {len(df_specs[df_specs['spec_tipo']=='MINIMO']):3d} specs -> extraiu apenas min
  EXATO:  {len(df_specs[df_specs['spec_tipo']=='EXATO']):3d} specs -> valor unico
""")
