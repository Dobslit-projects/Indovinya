# -*- coding: utf-8 -*-
"""Fix Surfom CS 8216 records that failed due to malformed date "28/10./20" """
import pandas as pd
import re
import os
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
EXCEL_PATH = "/app/Pacote_de_dados_final_preenchido.xlsx"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import all functions from the main script context
# But for simplicity, just re-do the specific product

df = pd.read_excel(EXCEL_PATH)
cols = df.columns.tolist()

# Find Surfom CS 8216 rows
mask = df[cols[2]].str.strip() == 'Surfom CS 8216'
print(f"Surfom CS 8216 rows: {mask.sum()}")
print(f"Date value: {df.loc[mask, cols[8]].unique()}")

# The date "28/10./20" should be "2020-10-28"
FIXED_DATE = "2020-10-28"

# Check what's already in supabase for this product
resp_a = supabase.table('dados_acelerado').select('id').eq('nome_produto', 'Surfom CS 8216').execute()
resp_l = supabase.table('dados_longa_duracao').select('id').eq('nome_produto', 'Surfom CS 8216').execute()
print(f"Already in acelerado: {len(resp_a.data)}")
print(f"Already in longa: {len(resp_l.data)}")

if len(resp_a.data) > 0 or len(resp_l.data) > 0:
    print("Product already exists (partial insert happened one-by-one), skipping.")
    # Actually, since the batch failed at record 423, all records from 423 onwards in that batch
    # were retried one-by-one. The ones that failed are specifically the Surfom CS 8216 ones.
    # The ones before and after should have been inserted.
    # So we just need to insert the missing Surfom CS 8216 records with fixed date.

# We need the same transformation logic - import inline
import sys
sys.path.insert(0, '/app')

# Quick reimplementation for just this product
def normalizar_ensaio(ensaio):
    e = str(ensaio).lower().strip()
    if 'ph' in e and 'apha' not in e: return ('pH', 'Fisico-Quimico', True)
    if 'acidez' in e: return ('Indice de Acidez', 'Fisico-Quimico', True)
    if 'hidroxila' in e: return ('Indice de Hidroxila', 'Fisico-Quimico', True)
    if 'água' in e or 'agua' in e or 'umidade' in e: return ('Teor de Agua', 'Fisico-Quimico', True)
    if 'densidade' in e: return ('Densidade', 'Fisico-Quimico', True)
    if 'viscosidade' in e: return ('Viscosidade', 'Fisico-Quimico', True)
    if 'gardner' in e: return ('Cor Gardner', 'Cor', True)
    if 'matéria ativa' in e or 'materia ativa' in e or 'ativo' in e: return ('Materia Ativa', 'Composicao', True)
    if 'aparência' in e or 'aparencia' in e: return ('Aparencia', 'Organoleptico', False)
    return ('Outro', 'Outro', True)

def parse_especificacao(spec):
    if pd.isna(spec): return ('SEM_SPEC', None, None)
    s = str(spec).strip()
    if s in ['----','---','--','-','','monitoramento']: return ('SEM_SPEC', None, None)
    s_lower = s.lower()
    rm = re.search(r'([\d,\.]+)\s*[-–a]\s*([\d,\.]+)', s)
    if rm:
        v1 = float(str(rm.group(1)).replace(',','.').replace(' ',''))
        v2 = float(str(rm.group(2)).replace(',','.').replace(' ',''))
        if v1 > v2: v1, v2 = v2, v1
        return ('RANGE', v1, v2)
    for p in [r'([\d,\.]+)\s*m[aá]x', r'm[aá]x\.?\s*([\d,\.]+)', r'<\s*([\d,\.]+)']:
        m = re.search(p, s_lower)
        if m:
            val = float(str(m.group(1)).replace(',','.').replace(' ',''))
            return ('MAXIMO', None, val)
    for p in [r'([\d,\.]+)\s*m[ií]n', r'm[ií]n\.?\s*([\d,\.]+)', r'>\s*([\d,\.]+)']:
        m = re.search(p, s_lower)
        if m:
            val = float(str(m.group(1)).replace(',','.').replace(' ',''))
            return ('MINIMO', val, None)
    # Check for descriptive
    for kw in ['liquido','livre','limpido','passa','conforme','substancialmente']:
        if kw in s_lower: return ('DESCRITIVA', None, None)
    return ('OUTRO', None, None)

ORDEM = {'0 dia':0,'1 sem':7,'2 sem':14,'3 sem':21,'1m':30,'2m':60,'3m':90,'4m':120,'5m':150,'6m':180,'9m':270,'12m':365,'18m':545,'24m':730,'30m':912,'36m':1095}
COL_MAP = {'3sem': '3 sem'}
temporal_cols = cols[13:-1]

records_acel = []
records_longa = []

for _, row in df[mask].iterrows():
    tipo = str(row[cols[9]])
    is_acel = 'acelerado' in tipo.lower()
    is_longa = 'longa' in tipo.lower()
    if not is_acel and not is_longa:
        continue

    ensaio_orig = str(row[cols[10]]).strip()
    norm, cat, is_q = normalizar_ensaio(ensaio_orig)
    spec_tipo, spec_min, spec_max = parse_especificacao(row[cols[12]])

    base = {
        'item': int(row[cols[0]]) if pd.notna(row[cols[0]]) else None,
        'codigo_item': str(row[cols[1]]).strip(),
        'nome_produto': str(row[cols[2]]).strip(),
        'descricao_quimica': str(row[cols[3]]).strip() if pd.notna(row[cols[3]]) else None,
        'grau_etoxilacao': str(row[cols[4]]).strip() if pd.notna(row[cols[4]]) else None,
        'grupo_familia': str(row[cols[5]]).strip() if pd.notna(row[cols[5]]) else None,
        'familia_produtos': str(row[cols[6]]).strip() if pd.notna(row[cols[6]]) else None,
        'peso_molecular': str(row[cols[7]]).strip() if pd.notna(row[cols[7]]) else None,
        'data_inicial_estudo': FIXED_DATE,
        'tipo_estudo': 'Acelerado' if is_acel else 'Longa duração',
        'ensaio': ensaio_orig,
        'ensaio_normalizado': norm,
        'categoria_ensaio': cat,
        'is_quantitativo': bool(is_q),
        'metodo': str(row[cols[11]]).strip() if pd.notna(row[cols[11]]) else None,
        'especificacao': str(row[cols[12]]).strip() if pd.notna(row[cols[12]]) else None,
        'spec_tipo': spec_tipo,
        'spec_min': spec_min,
        'spec_max': spec_max,
    }

    for tc in temporal_cols:
        val = row.get(tc)
        if pd.isna(val): continue
        val_str = str(val).strip()
        if val_str in ['', 'nan', 'None']: continue

        is_menor = False
        if val_str.startswith('<'):
            is_menor = True
            val_str = val_str[1:].strip()
        val_str = val_str.replace(',', '.').replace(' ', '')

        periodo_name = COL_MAP.get(tc, tc)
        periodo_dias = ORDEM.get(periodo_name)
        if periodo_dias is None: continue

        rec = base.copy()
        rec['periodo'] = periodo_name
        rec['valor'] = val_str
        rec['is_menor_que'] = is_menor
        rec['periodo_dias'] = periodo_dias

        if is_acel:
            records_acel.append(rec)
        else:
            records_longa.append(rec)

print(f"Records to insert - acelerado: {len(records_acel)}, longa: {len(records_longa)}")

if records_acel:
    try:
        supabase.table('dados_acelerado').insert(records_acel).execute()
        print(f"Inserted {len(records_acel)} into dados_acelerado")
    except Exception as e:
        print(f"Error acelerado: {e}")

if records_longa:
    try:
        supabase.table('dados_longa_duracao').insert(records_longa).execute()
        print(f"Inserted {len(records_longa)} into dados_longa_duracao")
    except Exception as e:
        print(f"Error longa: {e}")

# Verify
resp_a = supabase.table('dados_acelerado').select('nome_produto').execute()
resp_l = supabase.table('dados_longa_duracao').select('nome_produto').execute()
prods_a = set(r['nome_produto'].strip() for r in resp_a.data)
prods_l = set(r['nome_produto'].strip() for r in resp_l.data)
# Need to paginate
def count_products(table):
    prods = set()
    offset = 0
    while True:
        r = supabase.table(table).select('nome_produto').range(offset, offset+999).execute()
        if not r.data: break
        for rec in r.data:
            prods.add(rec['nome_produto'].strip())
        if len(r.data) < 1000: break
        offset += 1000
    return prods

prods_a = count_products('dados_acelerado')
prods_l = count_products('dados_longa_duracao')
print(f"\nFinal count: dados_acelerado={len(prods_a)} products, dados_longa_duracao={len(prods_l)} products")
