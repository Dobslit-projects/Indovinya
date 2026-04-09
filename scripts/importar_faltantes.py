# -*- coding: utf-8 -*-
"""
Script de importacao de produtos faltantes no Supabase.
Roda dentro do container Docker indorama-backend-1.
Aplica o mesmo pipeline de 4 fases dos scripts originais.
"""

import pandas as pd
import numpy as np
import re
import os
import json

from supabase import create_client

# ============================================================
# CONFIG
# ============================================================

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
EXCEL_PATH = "/app/Pacote_de_dados_final_preenchido.xlsx"
BATCH_SIZE = 500

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# FASE 1 - NORMALIZACAO DE ENSAIOS
# ============================================================

def normalizar_ensaio(ensaio):
    e = str(ensaio).lower().strip()

    # FISICO-QUIMICOS
    if 'ph' in e and 'apha' not in e:
        return ('pH', 'Fisico-Quimico', True)
    if 'acidez' in e or 'n° ácido' in e or 'índice de acidez' in e:
        return ('Indice de Acidez', 'Fisico-Quimico', True)
    if 'hidroxila' in e:
        return ('Indice de Hidroxila', 'Fisico-Quimico', True)
    if 'saponifica' in e:
        return ('Indice de Saponificacao', 'Fisico-Quimico', True)
    if ('água' in e or 'agua' in e or 'umidade' in e) and 'ph' not in e:
        return ('Teor de Agua', 'Fisico-Quimico', True)
    if 'densidade' in e or 'peso específico' in e:
        return ('Densidade', 'Fisico-Quimico', True)
    if 'viscosidade' in e:
        return ('Viscosidade', 'Fisico-Quimico', True)
    if 'ponto de fusão' in e or 'ponto de fus' in e:
        return ('Ponto de Fusao', 'Fisico-Quimico', True)
    if 'ponto de névoa' in e or 'ponto de nevoa' in e:
        return ('Ponto de Nevoa', 'Fisico-Quimico', True)
    if 'solidificação' in e or 'solidificacao' in e:
        return ('Ponto de Solidificacao', 'Fisico-Quimico', True)
    if 'refração' in e or 'refracao' in e:
        return ('Indice de Refracao', 'Fisico-Quimico', True)

    # CONTAMINANTES
    if 'dioxana' in e:
        return ('Dioxana', 'Contaminante', True)
    if 'óxido de etileno' in e or 'oxido de etileno' in e or 'óxido de eteno' in e or 'oxido de eteno' in e:
        return ('Oxido de Etileno Residual', 'Contaminante', True)
    if 'peróxido' in e or 'peroxido' in e:
        return ('Indice de Peroxidos', 'Contaminante', True)
    if 'metais pesados' in e or ('metal' in e and 'pesado' in e):
        return ('Metais Pesados', 'Contaminante', True)
    if e.strip() == 'ferro, ppm' or 'ferro,' in e:
        return ('Ferro', 'Contaminante', True)

    # COR
    if 'gardner' in e:
        return ('Cor Gardner', 'Cor', True)
    if 'pt-co' in e or 'ptco' in e or 'pt co' in e:
        return ('Cor Pt-Co', 'Cor', True)
    if 'apha' in e:
        return ('Cor APHA', 'Cor', True)
    if 'cor iodo' in e or ('iodo' in e and 'cor' in e):
        return ('Cor Iodo', 'Cor', True)
    if 'cor usp' in e:
        return ('Cor USP', 'Cor', True)
    if 'transmit' in e:
        return ('Transmitancia', 'Cor', True)
    if e.startswith('cor ') or e.startswith('cor,'):
        return ('Cor (Outro)', 'Cor', True)

    # COMPOSICAO
    if 'matéria ativa' in e or 'materia ativa' in e or 'ativo' in e or 'matéria-ativa' in e:
        return ('Materia Ativa', 'Composicao', True)
    if re.search(r'c\d+', e) or 'laurico' in e or 'oleico' in e or 'graxo' in e or 'estearico' in e or 'palmitico' in e:
        return ('Acidos Graxos', 'Composicao', True)
    if 'cloreto' in e and 'sódio' in e:
        return ('Cloreto de Sodio', 'Composicao', True)
    if 'sulfato' in e and 'sódio' in e:
        return ('Sulfato de Sodio', 'Composicao', True)
    if 'insulfatado' in e or 'insulfonado' in e or 'álcool insulfatado' in e:
        return ('Insulfatados', 'Composicao', True)
    if 'sólidos' in e or 'solidos' in e:
        return ('Solidos', 'Composicao', True)
    if 'glicol' in e or 'glicerina' in e or 'glic' in e:
        return ('Glicois', 'Composicao', True)
    if 'conteúdo de oxido de etileno' in e or 'conteudo de oxido' in e:
        return ('Teor de Oxido de Etileno', 'Composicao', True)
    if 'alcalinidade' in e:
        return ('Alcalinidade', 'Composicao', True)
    if 'cinzas' in e:
        return ('Cinzas', 'Composicao', True)
    if 'resíduo' in e or 'residuo' in e:
        return ('Residuo', 'Composicao', True)
    if 'amina' in e:
        return ('Aminas', 'Composicao', True)
    if 'formalde' in e or 'hcoh' in e:
        return ('Formaldeido', 'Composicao', True)
    if 'peso equivalente' in e or 'peso molecular' in e:
        return ('Peso Equivalente', 'Composicao', True)
    if 'nitrogênio' in e or 'nitrogenio' in e:
        return ('Nitrogenio', 'Composicao', True)
    if 'iodo' in e and 'cor' not in e:
        return ('Indice de Iodo', 'Composicao', True)
    if 'ácido sulfúrico' in e:
        return ('Acido Sulfurico', 'Composicao', True)
    if 'carbonila' in e:
        return ('Carbonila', 'Composicao', True)
    if 'anilina' in e:
        return ('Anilina', 'Composicao', True)
    if 'destila' in e:
        return ('Faixa de Destilacao', 'Composicao', True)
    if 'antioxidante' in e:
        return ('Antioxidante', 'Composicao', True)
    if 'açúcar' in e or 'acucar' in e or 'açucar' in e:
        return ('Acucares', 'Composicao', True)
    if 'benzotriazol' in e or 'difenilamina' in e or 'metiltriglicol' in e:
        return ('Componentes Especificos', 'Composicao', True)
    if 'piridina' in e:
        return ('Piridina', 'Composicao', True)
    if 'acetato' in e or 'aldeído' in e or 'aldeido' in e:
        return ('Aldeidos/Acetatos', 'Composicao', True)
    if 'butanol' in e or 'pentanol' in e:
        return ('Alcoois', 'Composicao', True)
    if 'álcoois totais' in e or 'alcoois totais' in e or 'álcool' in e:
        return ('Alcoois', 'Composicao', True)
    if 'impureza' in e:
        return ('Impurezas', 'Composicao', True)
    if 'sedimenta' in e:
        return ('Sedimentacao', 'Composicao', True)
    if 'sulfonado' in e:
        return ('Sulfonados', 'Composicao', True)
    if 'dietanolamina' in e or 'monoetanolamina' in e or e.strip() == 'dea, %':
        return ('Etanolaminas', 'Composicao', True)

    # ORGANOLEPTICOS
    if 'aparência' in e or 'aparencia' in e:
        return ('Aparencia', 'Organoleptico', False)
    if 'odor' in e:
        return ('Odor', 'Organoleptico', False)
    if 'limpidez' in e:
        return ('Limpidez', 'Organoleptico', False)
    if 'material em suspensão' in e or 'material em suspensao' in e:
        return ('Material em Suspensao', 'Organoleptico', False)

    # IDENTIFICACAO
    if 'identificação' in e or 'identificacao' in e or 'identification' in e or 'indentificação' in e or 'indentificacao' in e:
        return ('Identificacao', 'Identificacao', False)

    if 'fosfórico' in e or 'fosforico' in e:
        return ('Acido Fosforico', 'Composicao', True)
    if 'diester' in e or 'monoester' in e:
        return ('Esteres', 'Composicao', True)
    if 'ultrafluid' in e:
        return ('Componentes Especificos', 'Composicao', True)

    return ('Outro', 'Outro', True)


# ============================================================
# FASE 2 - PARSE DE ESPECIFICACOES
# ============================================================

def limpar_numero(texto):
    if texto is None:
        return None
    texto = str(texto).strip().replace(' ', '').replace(',', '.')
    try:
        return float(texto)
    except:
        return None


def parse_especificacao(spec):
    if pd.isna(spec):
        return ('SEM_SPEC', None, None)
    s = str(spec).strip()
    if s in ['----', '---', '--', '-', '', 'monitoramento', 'Monitoramento', 'MONITORAMENTO']:
        return ('SEM_SPEC', None, None)
    s_lower = s.lower()

    # RANGE
    range_match = re.search(r'([\d,\.]+)\s*[-–a]\s*([\d,\.]+)', s)
    if range_match:
        val_min = limpar_numero(range_match.group(1))
        val_max = limpar_numero(range_match.group(2))
        if val_min is not None and val_max is not None:
            if val_min > val_max:
                val_min, val_max = val_max, val_min
            return ('RANGE', val_min, val_max)

    # MAXIMO
    for pattern in [
        r'([\d,\.]+)\s*m[aá]x\.?', r'([\d,\.]+)\s*mn[aá]x\.?',
        r'm[aá]x\.?\s*([\d,\.]+)', r'([\d,\.]+)\s*m[aá]ximo',
        r'm[aá]ximo\.?\s*([\d,\.]+)', r'<\s*([\d,\.]+)',
        r'at[eé]\s*([\d,\.]+)', r'([\d,\.]+)\s*ou\s*menos',
    ]:
        match = re.search(pattern, s_lower)
        if match:
            val = limpar_numero(match.group(1))
            if val is not None:
                return ('MAXIMO', None, val)

    # MINIMO
    for pattern in [
        r'([\d,\.]+)\s*m[ií]n\.?', r'm[ií]n\.?\s*([\d,\.]+)',
        r'([\d,\.]+)\s*m[ií]nimo', r'm[ií]nimo\.?\s*([\d,\.]+)',
        r'>\s*([\d,\.]+)', r'acima\s*de\s*([\d,\.]+)',
        r'([\d,\.]+)\s*ou\s*mais',
    ]:
        match = re.search(pattern, s_lower)
        if match:
            val = limpar_numero(match.group(1))
            if val is not None:
                return ('MINIMO', val, None)

    # EXATO
    exact_match = re.match(r'^([\d,\.]+)$', s.strip())
    if exact_match:
        val = limpar_numero(exact_match.group(1))
        if val is not None:
            return ('EXATO', val, val)

    # DESCRITIVA
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
    for kw in descritivo_keywords:
        if kw in s_lower:
            return ('DESCRITIVA', None, None)

    numeros = re.findall(r'[\d,\.]+', s)
    if not numeros:
        return ('DESCRITIVA', None, None)

    primeiro_num = re.search(r'([\d,\.]+)', s)
    if primeiro_num:
        val = limpar_numero(primeiro_num.group(1))
        if val is not None:
            if 'max' in s_lower or 'máx' in s_lower:
                return ('MAXIMO', None, val)
            if 'min' in s_lower or 'mín' in s_lower:
                return ('MINIMO', val, None)
            return ('OUTRO', None, None)

    return ('OUTRO', None, None)


# ============================================================
# FASE 3 - LIMPEZA DE VALORES
# ============================================================

MAPEAMENTOS_QUALITATIVOS = {
    'liquido limpido': 'LIQUIDO_LIMPIDO', 'líquido límpido': 'LIQUIDO_LIMPIDO',
    'líquido limpido': 'LIQUIDO_LIMPIDO', 'liquido límpido': 'LIQUIDO_LIMPIDO',
    'líquido, límpido': 'LIQUIDO_LIMPIDO',
    'liquido claro': 'LIQUIDO_CLARO', 'líquido claro': 'LIQUIDO_CLARO',
    'liquido': 'LIQUIDO', 'líquido': 'LIQUIDO',
    'solido': 'SOLIDO', 'sólido': 'SOLIDO', 'flocos': 'FLOCOS', 'pasta': 'PASTA',
    'limpido': 'LIMPIDO', 'límpido': 'LIMPIDO',
    'turvo': 'TURVO', 'opaco': 'OPACO', 'transparente': 'TRANSPARENTE',
    'passa': 'PASSA', 'conforme': 'CONFORME', 'ok': 'OK', 'aprovado': 'APROVADO',
    'substancialmente livre': 'SUBST_LIVRE', 'livre': 'LIVRE',
    'isento': 'ISENTO', 'ausente': 'AUSENTE', 'presente': 'PRESENTE',
    'caracteristico': 'CARACTERISTICO', 'característico': 'CARACTERISTICO',
    'inodoro': 'INODORO', 'suave': 'SUAVE',
}


def limpar_valor(valor):
    if pd.isna(valor):
        return (None, False)
    val_str = str(valor).strip()
    if val_str == '' or val_str.lower() in ['nan', 'none', '-', '--', '---', '----']:
        return (None, False)

    is_menor_que = False
    if val_str.startswith('<'):
        is_menor_que = True
        val_str = val_str[1:].strip()

    val_str = val_str.replace(',', '.').replace(' ', '')

    try:
        float(val_str)
        return (val_str, is_menor_que)
    except ValueError:
        return (val_str, False)


def padronizar_qualitativo(texto):
    if pd.isna(texto) or texto is None:
        return None
    t = str(texto).lower().strip()
    if t in MAPEAMENTOS_QUALITATIVOS:
        return MAPEAMENTOS_QUALITATIVOS[t]
    for chave, valor in MAPEAMENTOS_QUALITATIVOS.items():
        if chave in t:
            return valor
    return str(texto).upper().strip()


# ============================================================
# FASE 4 - WIDE TO LONG
# ============================================================

def _parse_date(val):
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip()
    # Try standard format first (2019-07-25 00:00:00)
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', s)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    # Handle malformed dates like "28/10./20" or "28/10/20"
    s_clean = s.replace('.', '').replace(' ', '')
    m = re.match(r'(\d{1,2})/(\d{1,2})/(\d{2,4})', s_clean)
    if m:
        day, month, year = m.group(1), m.group(2), m.group(3)
        if len(year) == 2:
            year = '20' + year
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return None


ORDEM_PERIODOS = {
    '0 dia': 0, '1 sem': 7, '2 sem': 14,
    '1m': 30, '2m': 60, '3m': 90, '4m': 120, '5m': 150, '6m': 180,
    '9m': 270, '12m': 365, '18m': 545, '24m': 730, '30m': 912, '36m': 1095
}

# Column name in excel -> column name expected by DB
# Excel uses "3sem" but pipeline uses "3 sem" - handle mapping
EXCEL_COL_MAPPING = {
    '0 dia': '0 dia', '1 sem': '1 sem', '2 sem': '2 sem', '3sem': '3 sem',
    '1m': '1m', '2m': '2m', '3m': '3m', '4m': '4m', '5m': '5m', '6m': '6m',
    '9m': '9m', '12m': '12m', '18m': '18m', '24m': '24m', '30m': '30m', '36m': '36m'
}

# ============================================================
# MAIN
# ============================================================

def get_existing_products(table_name):
    all_products = set()
    offset = 0
    while True:
        resp = supabase.table(table_name).select("nome_produto").range(offset, offset + 999).execute()
        if not resp.data:
            break
        for r in resp.data:
            all_products.add(r['nome_produto'].strip())
        if len(resp.data) < 1000:
            break
        offset += 1000
    return all_products


def main():
    print("=" * 70)
    print("IMPORTACAO DE PRODUTOS FALTANTES")
    print("=" * 70)

    # 1. Ler Excel
    print("\n[1/6] Lendo Excel...")
    df = pd.read_excel(EXCEL_PATH)
    cols = df.columns.tolist()
    print(f"  Total linhas: {len(df)}, Colunas: {len(cols)}")

    # Map column names
    col_map = {
        cols[0]: 'Item', cols[1]: 'Codigo_item', cols[2]: 'Nome_produto',
        cols[3]: 'Descricao_quimica', cols[4]: 'Grau_etoxilacao',
        cols[5]: 'Grupo_familia', cols[6]: 'Familia_produtos',
        cols[7]: 'Peso_molecular', cols[8]: 'Data_inicial_estudo',
        cols[9]: 'Tipo_estudo', cols[10]: 'Ensaio_original',
        cols[11]: 'Metodo', cols[12]: 'Especificacao',
    }
    # Temporal columns start at index 13
    temporal_cols_excel = cols[13:-1]  # Exclude 'Shelf Life' at the end

    df = df.rename(columns=col_map)

    # 2. Filtrar apenas Acelerado e Longa Duracao
    print("\n[2/6] Filtrando tipos de estudo...")
    mask_acel = df['Tipo_estudo'].str.contains('Acelerado', case=False, na=False)
    mask_longa = df['Tipo_estudo'].str.contains('Longa', case=False, na=False)
    df_filtered = df[mask_acel | mask_longa].copy()
    print(f"  Acelerado: {mask_acel.sum()} linhas")
    print(f"  Longa Duracao: {mask_longa.sum()} linhas")
    print(f"  Total filtrado: {len(df_filtered)} linhas")

    # 3. Consultar produtos existentes no Supabase
    print("\n[3/6] Consultando produtos existentes no Supabase...")
    existing_acel = get_existing_products('dados_acelerado')
    existing_longa = get_existing_products('dados_longa_duracao')
    existing_all = existing_acel | existing_longa
    print(f"  dados_acelerado: {len(existing_acel)} produtos")
    print(f"  dados_longa_duracao: {len(existing_longa)} produtos")

    # Filter only missing products
    df_missing = df_filtered[~df_filtered['Nome_produto'].str.strip().isin(existing_all)].copy()
    missing_products = df_missing['Nome_produto'].str.strip().unique()
    print(f"  Produtos faltantes: {len(missing_products)}")

    if len(missing_products) == 0:
        print("\nNenhum produto faltante encontrado! Todos ja estao no Supabase.")
        return

    # 4. Aplicar pipeline de transformacao
    print("\n[4/6] Aplicando pipeline de transformacao...")

    # Fase 1: Normalizar ensaios
    print("  Fase 1: Normalizando ensaios...")
    norm_results = df_missing['Ensaio_original'].apply(normalizar_ensaio)
    df_missing['ensaio_normalizado'] = norm_results.apply(lambda x: x[0])
    df_missing['categoria_ensaio'] = norm_results.apply(lambda x: x[1])
    df_missing['is_quantitativo'] = norm_results.apply(lambda x: x[2])

    outros = df_missing[df_missing['ensaio_normalizado'] == 'Outro']
    if len(outros) > 0:
        print(f"  AVISO: {len(outros)} registros classificados como 'Outro':")
        for e in outros['Ensaio_original'].unique()[:10]:
            print(f"    - {e}")

    # Fase 2: Parse especificacoes
    print("  Fase 2: Parseando especificacoes...")
    spec_results = df_missing['Especificacao'].apply(parse_especificacao)
    df_missing['spec_tipo'] = spec_results.apply(lambda x: x[0])
    df_missing['spec_min'] = spec_results.apply(lambda x: x[1])
    df_missing['spec_max'] = spec_results.apply(lambda x: x[2])

    # Fase 3 + 4: Limpar valores e converter para long format
    print("  Fase 3+4: Limpando valores e convertendo para formato long...")

    registros_long = []
    for _, row in df_missing.iterrows():
        dados_base = {
            'item': int(row['Item']) if pd.notna(row['Item']) else None,
            'codigo_item': str(row['Codigo_item']).strip() if pd.notna(row['Codigo_item']) else None,
            'nome_produto': str(row['Nome_produto']).strip() if pd.notna(row['Nome_produto']) else None,
            'descricao_quimica': str(row['Descricao_quimica']).strip() if pd.notna(row['Descricao_quimica']) else None,
            'grau_etoxilacao': str(row['Grau_etoxilacao']).strip() if pd.notna(row['Grau_etoxilacao']) else None,
            'grupo_familia': str(row['Grupo_familia']).strip() if pd.notna(row['Grupo_familia']) else None,
            'familia_produtos': str(row['Familia_produtos']).strip() if pd.notna(row['Familia_produtos']) else None,
            'peso_molecular': str(row['Peso_molecular']).strip() if pd.notna(row['Peso_molecular']) else None,
            'data_inicial_estudo': _parse_date(row['Data_inicial_estudo']),
            'tipo_estudo': 'Acelerado' if 'acelerado' in str(row['Tipo_estudo']).lower() else 'Longa duração',
            'ensaio': str(row['Ensaio_original']).strip() if pd.notna(row['Ensaio_original']) else None,
            'ensaio_normalizado': row['ensaio_normalizado'],
            'categoria_ensaio': row['categoria_ensaio'],
            'is_quantitativo': bool(row['is_quantitativo']),
            'metodo': str(row['Metodo']).strip() if pd.notna(row['Metodo']) else None,
            'especificacao': str(row['Especificacao']).strip() if pd.notna(row['Especificacao']) else None,
            'spec_tipo': row['spec_tipo'],
            'spec_min': float(row['spec_min']) if pd.notna(row['spec_min']) else None,
            'spec_max': float(row['spec_max']) if pd.notna(row['spec_max']) else None,
        }

        for excel_col in temporal_cols_excel:
            valor_raw = row.get(excel_col)
            if pd.isna(valor_raw) or valor_raw is None:
                continue

            valor_limpo, is_menor_que = limpar_valor(valor_raw)
            if valor_limpo is None:
                continue

            # Padronizar qualitativos
            if not row['is_quantitativo'] and isinstance(valor_limpo, str):
                valor_limpo = padronizar_qualitativo(valor_limpo)

            # Map excel col name to standard period name
            periodo_name = EXCEL_COL_MAPPING.get(excel_col, excel_col)
            periodo_dias = ORDEM_PERIODOS.get(periodo_name)

            if periodo_dias is None:
                # Try without space
                periodo_dias = ORDEM_PERIODOS.get(excel_col)
                if periodo_dias is None:
                    continue

            registro = dados_base.copy()
            registro['periodo'] = periodo_name
            registro['valor'] = str(valor_limpo) if valor_limpo is not None else None
            registro['is_menor_que'] = bool(is_menor_que)
            registro['periodo_dias'] = periodo_dias
            registros_long.append(registro)

    df_long = pd.DataFrame(registros_long)
    print(f"  Total registros long: {len(df_long)}")

    # 5. Separar por tipo de estudo
    print("\n[5/6] Separando por tipo de estudo...")
    df_acel = df_long[df_long['tipo_estudo'] == 'Acelerado'].copy()
    df_longa = df_long[df_long['tipo_estudo'] == 'Longa duração'].copy()

    print(f"  dados_acelerado: {len(df_acel)} registros, {df_acel['nome_produto'].nunique()} produtos")
    print(f"  dados_longa_duracao: {len(df_longa)} registros, {df_longa['nome_produto'].nunique()} produtos")

    # Print sample
    if len(df_acel) > 0:
        print("\n  Amostra dados_acelerado:")
        sample = df_acel.head(3)
        for _, r in sample.iterrows():
            print(f"    {r['nome_produto']} | {r['ensaio_normalizado']} | {r['periodo']} | {r['valor']}")

    if len(df_longa) > 0:
        print("\n  Amostra dados_longa_duracao:")
        sample = df_longa.head(3)
        for _, r in sample.iterrows():
            print(f"    {r['nome_produto']} | {r['ensaio_normalizado']} | {r['periodo']} | {r['valor']}")

    # 6. Inserir no Supabase
    print("\n[6/6] Inserindo no Supabase...")

    def insert_batch(table_name, dataframe):
        if len(dataframe) == 0:
            print(f"  {table_name}: nada para inserir")
            return 0

        records = dataframe.to_dict('records')
        # Clean None/NaN values
        for r in records:
            for k, v in list(r.items()):
                if pd.isna(v) if isinstance(v, float) else v is None:
                    r[k] = None
                elif k == 'item' and v is not None:
                    r[k] = int(v)

        total = 0
        for i in range(0, len(records), BATCH_SIZE):
            batch = records[i:i + BATCH_SIZE]
            try:
                supabase.table(table_name).insert(batch).execute()
                total += len(batch)
                print(f"  {table_name}: inseridos {total}/{len(records)} registros")
            except Exception as e:
                print(f"  ERRO no batch {i}-{i+len(batch)}: {e}")
                # Try inserting one by one to find the problematic record
                for j, rec in enumerate(batch):
                    try:
                        supabase.table(table_name).insert(rec).execute()
                        total += 1
                    except Exception as e2:
                        print(f"    ERRO registro {i+j}: {rec.get('nome_produto')} | {rec.get('ensaio_normalizado')} | {rec.get('periodo')}: {e2}")
        return total

    inserted_acel = insert_batch('dados_acelerado', df_acel)
    inserted_longa = insert_batch('dados_longa_duracao', df_longa)

    # Resumo final
    print("\n" + "=" * 70)
    print("RESUMO DA IMPORTACAO")
    print("=" * 70)
    print(f"  dados_acelerado:     {inserted_acel} registros inseridos ({df_acel['nome_produto'].nunique()} produtos)")
    print(f"  dados_longa_duracao: {inserted_longa} registros inseridos ({df_longa['nome_produto'].nunique()} produtos)")

    # Verificacao final
    print("\n  Verificacao pos-import:")
    final_acel = get_existing_products('dados_acelerado')
    final_longa = get_existing_products('dados_longa_duracao')
    print(f"  dados_acelerado:     {len(final_acel)} produtos totais")
    print(f"  dados_longa_duracao: {len(final_longa)} produtos totais")
    print("\nIMPORTACAO CONCLUIDA!")


if __name__ == '__main__':
    main()
