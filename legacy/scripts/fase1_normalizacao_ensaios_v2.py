# -*- coding: utf-8 -*-
"""
FASE 1 - Normalizacao de Ensaios (v2)
- CSV com ponto-e-virgula como separador
- Extracao de metadados adicionais (unidade, temperatura, concentracao)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

print("="*80)
print("FASE 1 - NORMALIZACAO DE ENSAIOS (v2)")
print("="*80)

ensaios = df['Ensaios físico-químicos'].unique()
print(f"\nTotal de ensaios unicos: {len(ensaios)}")


def extrair_unidade(ensaio):
    """Extrai a unidade de medida do nome do ensaio"""
    e = str(ensaio)

    # Padroes de unidade
    padroes = [
        (r'mgKOH/g', 'mgKOH/g'),
        (r'mg KOH/g', 'mgKOH/g'),
        (r'mg/KOH/g', 'mgKOH/g'),
        (r'mEq/1000g', 'mEq/1000g'),
        (r'Meq/1000g', 'mEq/1000g'),
        (r'gl2/100g', 'gI2/100g'),
        (r'I2/100g', 'gI2/100g'),
        (r'g/100g', 'g/100g'),
        (r'g/cm3', 'g/cm³'),
        (r'%p', '%'),
        (r'%P', '%'),
        (r'% p/p', '%'),
        (r'%T', '%T'),
        (r'ppm', 'ppm'),
        (r'cSt', 'cSt'),
        (r'cPs', 'cP'),
        (r'cP', 'cP'),
        (r'cp', 'cP'),
        (r'°C', '°C'),
        (r'ºC', '°C'),
        (r'oC', '°C'),
        (r'nm', 'nm'),
        (r'mm', 'mm'),
        (r'mL', 'mL'),
        (r'%', '%'),
    ]

    for padrao, unidade in padroes:
        if re.search(padrao, e, re.IGNORECASE):
            return unidade

    return None


def extrair_temperatura(ensaio):
    """Extrai a temperatura do nome do ensaio"""
    e = str(ensaio)

    # Procurar padroes como "25°C", "25ºC", "60°C"
    match = re.search(r'(\d+)\s*[°ºo]C', e)
    if match:
        return f"{match.group(1)}°C"

    # "temperatura ambiente"
    if 'temp' in e.lower() and 'ambiente' in e.lower():
        return 'ambiente'

    return None


def extrair_concentracao(ensaio):
    """Extrai a concentracao/diluicao do nome do ensaio"""
    e = str(ensaio)

    # Padroes como "5% p/p", "10% aquoso", "1% p/p"
    match = re.search(r'(\d+)\s*%\s*(p/p|aquoso|p/v)?', e.lower())
    if match:
        conc = match.group(1) + '%'
        tipo = match.group(2) if match.group(2) else ''
        return f"{conc} {tipo}".strip()

    return None


def normalizar_ensaio(ensaio):
    """Mapeia um nome de ensaio para sua categoria normalizada"""
    e = str(ensaio).lower().strip()

    # ========== FISICO-QUIMICOS ==========
    if 'ph' in e and 'apha' not in e:
        return ('pH', 'Fisico-Quimico', True)
    if 'acidez' in e or 'n° ácido' in e or 'índice de acidez' in e:
        return ('Indice de Acidez', 'Fisico-Quimico', True)
    if 'hidroxila' in e:
        return ('Indice de Hidroxila', 'Fisico-Quimico', True)
    if 'saponifica' in e:
        return ('Indice de Saponificacao', 'Fisico-Quimico', True)
    if ('água' in e or 'agua' in e or 'umidade' in e) and 'ph' not in e and 'viscosidade' not in e:
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

    # ========== CONTAMINANTES ==========
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

    # ========== COR ==========
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

    # ========== COMPOSICAO ==========
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
    if 'fosfórico' in e or 'fosforico' in e:
        return ('Acido Fosforico', 'Composicao', True)
    if 'diester' in e or 'monoester' in e:
        return ('Esteres', 'Composicao', True)
    if 'ultrafluid' in e:
        return ('Componentes Especificos', 'Composicao', True)

    # ========== ORGANOLEPTICOS (Qualitativos) ==========
    if 'aparência' in e or 'aparencia' in e:
        return ('Aparencia', 'Organoleptico', False)
    if 'odor' in e:
        return ('Odor', 'Organoleptico', False)
    if 'limpidez' in e:
        return ('Limpidez', 'Organoleptico', False)
    if 'material em suspensão' in e or 'material em suspensao' in e:
        return ('Material em Suspensao', 'Organoleptico', False)

    # ========== IDENTIFICACAO (Qualitativos) ==========
    if 'identificação' in e or 'identificacao' in e or 'identification' in e or 'indentificação' in e or 'indentificacao' in e:
        return ('Identificacao', 'Identificacao', False)

    # ========== NAO CLASSIFICADO ==========
    return ('Outro', 'Outro', True)


# Aplicar normalizacao e extrair metadados
resultados = []
for ensaio in ensaios:
    normalizado, categoria, is_quant = normalizar_ensaio(ensaio)
    unidade = extrair_unidade(ensaio)
    temperatura = extrair_temperatura(ensaio)
    concentracao = extrair_concentracao(ensaio)
    freq = len(df[df['Ensaios físico-químicos'] == ensaio])

    resultados.append({
        'ensaio_original': str(ensaio).replace(';', ','),  # Evitar conflito com separador
        'ensaio_normalizado': normalizado,
        'categoria': categoria,
        'is_quantitativo': is_quant,
        'unidade': unidade if unidade else '',
        'temperatura': temperatura if temperatura else '',
        'concentracao': concentracao if concentracao else '',
        'frequencia': freq
    })

df_norm = pd.DataFrame(resultados)

# Estatisticas
print("\n" + "="*80)
print("RESULTADO DA NORMALIZACAO")
print("="*80)

print(f"\nDe {len(ensaios)} ensaios originais para {df_norm['ensaio_normalizado'].nunique()} categorias normalizadas")

print("\n--- Distribuicao por Categoria ---")
cat_stats = df_norm.groupby('categoria').agg({
    'ensaio_original': 'count',
    'frequencia': 'sum'
}).rename(columns={'ensaio_original': 'qtd_variacoes', 'frequencia': 'total_registros'})
print(cat_stats.sort_values('total_registros', ascending=False))

print("\n--- Top 20 Ensaios Normalizados ---")
norm_stats = df_norm.groupby('ensaio_normalizado').agg({
    'ensaio_original': 'count',
    'frequencia': 'sum',
    'categoria': 'first',
    'is_quantitativo': 'first'
}).rename(columns={'ensaio_original': 'qtd_variacoes', 'frequencia': 'total_registros'})
print(norm_stats.sort_values('total_registros', ascending=False).head(20))

print("\n--- Quantitativo vs Qualitativo ---")
quant_stats = df_norm.groupby('is_quantitativo')['frequencia'].sum()
print(quant_stats)

# Verificar "Outros"
outros = df_norm[df_norm['ensaio_normalizado'] == 'Outro']
if len(outros) > 0:
    print(f"\n--- ATENCAO: {len(outros)} ensaios como 'Outro' ---")
    for _, row in outros.iterrows():
        print(f"   [{row['frequencia']:3d}x] {row['ensaio_original']}")

# Salvar CSV com ponto-e-virgula
output_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ensaios_de_para.csv")
df_norm.to_csv(output_path, index=False, encoding='utf-8-sig', sep=';')
print(f"\n\nTabela salva em: {output_path}")
print("(Separador: ponto-e-virgula)")

# Salvar tambem em Excel para facilitar visualizacao
output_excel = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ensaios_de_para.xlsx")
df_norm.to_excel(output_excel, index=False)
print(f"Tabela Excel salva em: {output_excel}")

# Resumo
print("\n" + "="*80)
print("RESUMO FINAL")
print("="*80)
print(f"""
Ensaios originais:       {len(ensaios)}
Categorias normalizadas: {df_norm['ensaio_normalizado'].nunique()}
Grupos:                  {df_norm['categoria'].nunique()}

Quantitativos: {len(df_norm[df_norm['is_quantitativo']==True])} ensaios ({df_norm[df_norm['is_quantitativo']==True]['frequencia'].sum()} registros)
Qualitativos:  {len(df_norm[df_norm['is_quantitativo']==False])} ensaios ({df_norm[df_norm['is_quantitativo']==False]['frequencia'].sum()} registros)

Colunas extras extraidas:
- unidade: {df_norm['unidade'].notna().sum() - (df_norm['unidade'] == '').sum()} ensaios com unidade identificada
- temperatura: {df_norm['temperatura'].notna().sum() - (df_norm['temperatura'] == '').sum()} ensaios com temperatura
- concentracao: {df_norm['concentracao'].notna().sum() - (df_norm['concentracao'] == '').sum()} ensaios com concentracao
""")
