# -*- coding: utf-8 -*-
"""
FASE 1 - Normalizacao de Ensaios
Criar tabela DE-PARA mapeando 250 nomes -> ~20 categorias
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
print("FASE 1 - NORMALIZACAO DE ENSAIOS")
print("="*80)

# Extrair todos os ensaios unicos
ensaios = df['Ensaios físico-químicos'].unique()
print(f"\nTotal de ensaios unicos: {len(ensaios)}")

# Regras de normalizacao baseadas em palavras-chave
def normalizar_ensaio(ensaio):
    """Mapeia um nome de ensaio para sua categoria normalizada"""
    e = str(ensaio).lower().strip()

    # ========== FISICO-QUIMICOS ==========

    # pH (exceto APHA que e cor)
    if 'ph' in e and 'apha' not in e:
        return ('pH', 'Fisico-Quimico', True)

    # Acidez / Indice de acidez
    if 'acidez' in e or 'n° ácido' in e or 'índice de acidez' in e:
        return ('Indice de Acidez', 'Fisico-Quimico', True)

    # Hidroxila
    if 'hidroxila' in e:
        return ('Indice de Hidroxila', 'Fisico-Quimico', True)

    # Saponificacao
    if 'saponifica' in e:
        return ('Indice de Saponificacao', 'Fisico-Quimico', True)

    # Agua / Umidade / Teor de agua
    if ('água' in e or 'agua' in e or 'umidade' in e) and 'ph' not in e:
        return ('Teor de Agua', 'Fisico-Quimico', True)

    # Densidade / Peso especifico
    if 'densidade' in e or 'peso específico' in e:
        return ('Densidade', 'Fisico-Quimico', True)

    # Viscosidade
    if 'viscosidade' in e:
        return ('Viscosidade', 'Fisico-Quimico', True)

    # Ponto de fusao
    if 'ponto de fusão' in e or 'ponto de fus' in e:
        return ('Ponto de Fusao', 'Fisico-Quimico', True)

    # Ponto de nevoa
    if 'ponto de névoa' in e or 'ponto de nevoa' in e:
        return ('Ponto de Nevoa', 'Fisico-Quimico', True)

    # Ponto de solidificacao
    if 'solidificação' in e or 'solidificacao' in e:
        return ('Ponto de Solidificacao', 'Fisico-Quimico', True)

    # Indice de refracao
    if 'refração' in e or 'refracao' in e:
        return ('Indice de Refracao', 'Fisico-Quimico', True)

    # ========== CONTAMINANTES ==========

    # Dioxana
    if 'dioxana' in e:
        return ('Dioxana', 'Contaminante', True)

    # Oxido de etileno / eteno
    if 'óxido de etileno' in e or 'oxido de etileno' in e or 'óxido de eteno' in e or 'oxido de eteno' in e:
        return ('Oxido de Etileno Residual', 'Contaminante', True)

    # Peroxidos
    if 'peróxido' in e or 'peroxido' in e:
        return ('Indice de Peroxidos', 'Contaminante', True)

    # Metais pesados
    if 'metais pesados' in e or 'metal' in e and 'pesado' in e:
        return ('Metais Pesados', 'Contaminante', True)

    # Ferro
    if e.strip() == 'ferro, ppm' or 'ferro,' in e:
        return ('Ferro', 'Contaminante', True)

    # ========== COR ==========

    # Cor Gardner
    if 'gardner' in e:
        return ('Cor Gardner', 'Cor', True)

    # Cor Pt-Co
    if 'pt-co' in e or 'ptco' in e or 'pt co' in e:
        return ('Cor Pt-Co', 'Cor', True)

    # Cor APHA
    if 'apha' in e:
        return ('Cor APHA', 'Cor', True)

    # Cor Iodo
    if 'cor iodo' in e or ('iodo' in e and 'cor' in e):
        return ('Cor Iodo', 'Cor', True)

    # Cor USP
    if 'cor usp' in e:
        return ('Cor USP', 'Cor', True)

    # Transmitancia
    if 'transmit' in e:
        return ('Transmitancia', 'Cor', True)

    # Cor generica (se nao pegou acima)
    if e.startswith('cor ') or e.startswith('cor,'):
        return ('Cor (Outro)', 'Cor', True)

    # ========== COMPOSICAO ==========

    # Materia ativa / Ativos
    if 'matéria ativa' in e or 'materia ativa' in e or 'ativo' in e or 'matéria-ativa' in e:
        return ('Materia Ativa', 'Composicao', True)

    # Acidos graxos (C10, C12, C14, C16, C18, etc)
    if re.search(r'c\d+', e) or 'laurico' in e or 'oleico' in e or 'graxo' in e or 'estearico' in e or 'palmitico' in e:
        return ('Acidos Graxos', 'Composicao', True)

    # Cloreto de sodio
    if 'cloreto' in e and 'sódio' in e:
        return ('Cloreto de Sodio', 'Composicao', True)

    # Sulfato de sodio
    if 'sulfato' in e and 'sódio' in e:
        return ('Sulfato de Sodio', 'Composicao', True)

    # Insulfatados / Insulfonados
    if 'insulfatado' in e or 'insulfonado' in e or 'álcool insulfatado' in e:
        return ('Insulfatados', 'Composicao', True)

    # Solidos
    if 'sólidos' in e or 'solidos' in e:
        return ('Solidos', 'Composicao', True)

    # Glicois / Glicerina
    if 'glicol' in e or 'glicerina' in e or 'glic' in e:
        return ('Glicois', 'Composicao', True)

    # Conteudo de oxido de etileno (composicao, nao contaminante)
    if 'conteúdo de oxido de etileno' in e or 'conteudo de oxido' in e:
        return ('Teor de Oxido de Etileno', 'Composicao', True)

    # Alcalinidade
    if 'alcalinidade' in e:
        return ('Alcalinidade', 'Composicao', True)

    # Cinzas
    if 'cinzas' in e:
        return ('Cinzas', 'Composicao', True)

    # Residuo de ignicao/evaporacao
    if 'resíduo' in e or 'residuo' in e:
        return ('Residuo', 'Composicao', True)

    # Amina / Oxido de amina
    if 'amina' in e:
        return ('Aminas', 'Composicao', True)

    # Formaldeido
    if 'formalde' in e or 'hcoh' in e:
        return ('Formaldeido', 'Composicao', True)

    # Peso equivalente / molecular
    if 'peso equivalente' in e or 'peso molecular' in e:
        return ('Peso Equivalente', 'Composicao', True)

    # Nitrogenio
    if 'nitrogênio' in e or 'nitrogenio' in e:
        return ('Nitrogenio', 'Composicao', True)

    # Indice de iodo (composicao)
    if 'iodo' in e and 'cor' not in e:
        return ('Indice de Iodo', 'Composicao', True)

    # Acido sulfurico
    if 'ácido sulfúrico' in e:
        return ('Acido Sulfurico', 'Composicao', True)

    # Carbonila
    if 'carbonila' in e:
        return ('Carbonila', 'Composicao', True)

    # Anilina (especifico)
    if 'anilina' in e:
        return ('Anilina', 'Composicao', True)

    # Destilacao
    if 'destila' in e:
        return ('Faixa de Destilacao', 'Composicao', True)

    # Antioxidante
    if 'antioxidante' in e:
        return ('Antioxidante', 'Composicao', True)

    # Acucares
    if 'açúcar' in e or 'acucar' in e or 'açucar' in e:
        return ('Acucares', 'Composicao', True)

    # Benzotriazol e outros componentes especificos
    if 'benzotriazol' in e or 'difenilamina' in e or 'metiltriglicol' in e:
        return ('Componentes Especificos', 'Composicao', True)

    # Piridina
    if 'piridina' in e:
        return ('Piridina', 'Composicao', True)

    # Acetato / Aldeidos
    if 'acetato' in e or 'aldeído' in e or 'aldeido' in e:
        return ('Aldeidos/Acetatos', 'Composicao', True)

    # Butanol / Isobutanol / Isopentanol
    if 'butanol' in e or 'pentanol' in e:
        return ('Alcoois', 'Composicao', True)

    # Alcool total
    if 'álcoois totais' in e or 'alcoois totais' in e or 'álcool' in e:
        return ('Alcoois', 'Composicao', True)

    # Impurezas
    if 'impureza' in e:
        return ('Impurezas', 'Composicao', True)

    # Sedimentacao
    if 'sedimenta' in e:
        return ('Sedimentacao', 'Composicao', True)

    # Sulfonado / Teor de sulfonado
    if 'sulfonado' in e:
        return ('Sulfonados', 'Composicao', True)

    # DEA / Dietanolamina / Monoetanolamina
    if 'dietanolamina' in e or 'monoetanolamina' in e or e.strip() == 'dea, %':
        return ('Etanolaminas', 'Composicao', True)

    # ========== ORGANOLEPTICOS (Qualitativos) ==========

    # Aparencia
    if 'aparência' in e or 'aparencia' in e:
        return ('Aparencia', 'Organoleptico', False)

    # Odor
    if 'odor' in e:
        return ('Odor', 'Organoleptico', False)

    # Limpidez
    if 'limpidez' in e:
        return ('Limpidez', 'Organoleptico', False)

    # Material em suspensao
    if 'material em suspensão' in e or 'material em suspensao' in e:
        return ('Material em Suspensao', 'Organoleptico', False)

    # ========== IDENTIFICACAO (Qualitativos) ==========

    # Identificacao USP / IV / CG (incluindo typo "indentificação")
    if 'identificação' in e or 'identificacao' in e or 'identification' in e or 'indentificação' in e or 'indentificacao' in e:
        return ('Identificacao', 'Identificacao', False)

    # Acido fosforico
    if 'fosfórico' in e or 'fosforico' in e:
        return ('Acido Fosforico', 'Composicao', True)

    # Diester / Monoester
    if 'diester' in e or 'monoester' in e:
        return ('Esteres', 'Composicao', True)

    # Ultrafluid (componente especifico)
    if 'ultrafluid' in e:
        return ('Componentes Especificos', 'Composicao', True)

    # ========== NAO CLASSIFICADO ==========
    return ('Outro', 'Outro', True)


# Aplicar normalizacao
resultados = []
for ensaio in ensaios:
    normalizado, categoria, is_quant = normalizar_ensaio(ensaio)
    freq = len(df[df['Ensaios físico-químicos'] == ensaio])
    resultados.append({
        'ensaio_original': ensaio,
        'ensaio_normalizado': normalizado,
        'categoria': categoria,
        'is_quantitativo': is_quant,
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

print("\n--- Distribuicao por Ensaio Normalizado ---")
norm_stats = df_norm.groupby('ensaio_normalizado').agg({
    'ensaio_original': 'count',
    'frequencia': 'sum',
    'categoria': 'first',
    'is_quantitativo': 'first'
}).rename(columns={'ensaio_original': 'qtd_variacoes', 'frequencia': 'total_registros'})
print(norm_stats.sort_values('total_registros', ascending=False).head(30))

print("\n--- Quantitativo vs Qualitativo ---")
quant_stats = df_norm.groupby('is_quantitativo')['frequencia'].sum()
print(quant_stats)

# Verificar ensaios classificados como "Outro"
outros = df_norm[df_norm['ensaio_normalizado'] == 'Outro']
if len(outros) > 0:
    print(f"\n--- ATENCAO: {len(outros)} ensaios classificados como 'Outro' ---")
    for _, row in outros.iterrows():
        print(f"   [{row['frequencia']:3d}x] {row['ensaio_original']}")

# Salvar tabela de normalizacao
output_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ensaios_de_para.csv")
df_norm.to_csv(output_path, index=False, encoding='utf-8-sig')
print(f"\n\nTabela salva em: {output_path}")

# Resumo final
print("\n" + "="*80)
print("RESUMO")
print("="*80)
print(f"""
Ensaios originais:     {len(ensaios)}
Categorias normalizadas: {df_norm['ensaio_normalizado'].nunique()}
Categorias de grupo:   {df_norm['categoria'].nunique()}

Quantitativos: {len(df_norm[df_norm['is_quantitativo']==True])} ensaios ({df_norm[df_norm['is_quantitativo']==True]['frequencia'].sum()} registros)
Qualitativos:  {len(df_norm[df_norm['is_quantitativo']==False])} ensaios ({df_norm[df_norm['is_quantitativo']==False]['frequencia'].sum()} registros)
""")
