# -*- coding: utf-8 -*-
"""
Gera relatorio HTML com o diagnostico do dataset Indovinya
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

colunas_tempo = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']

# Calculos
etox = df['Grau de Etoxilação'].value_counts()
ensaios_unicos = df['Ensaios físico-químicos'].nunique()
metodos_unicos = df['Método'].nunique()

# Completude por produto
completude = []
for produto in df['Nome do produto'].unique():
    df_prod = df[df['Nome do produto'] == produto]
    total_celulas = len(df_prod) * len(colunas_tempo)
    preenchidas = df_prod[colunas_tempo].notna().sum().sum()
    pct = (preenchidas / total_celulas * 100) if total_celulas > 0 else 0
    completude.append({'produto': produto, 'registros': len(df_prod), 'completude': pct})

df_comp = pd.DataFrame(completude).sort_values('completude', ascending=False)
df_comp['tier'] = pd.cut(df_comp['completude'], bins=[0, 25, 40, 55, 100], labels=['D', 'C', 'B', 'A'])

# Preenchimento temporal
preench_tempo = []
for col in colunas_tempo:
    preench_tempo.append({'periodo': col, 'preenchido': df[col].notna().sum(), 'pct': df[col].notna().sum() / len(df) * 100})
df_tempo = pd.DataFrame(preench_tempo)

# HTML
html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnostico Dataset Indovinya</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        h1 {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin-bottom: 30px; border-radius: 10px; text-align: center; }}
        h1 small {{ display: block; font-weight: normal; font-size: 0.5em; margin-top: 10px; opacity: 0.8; }}
        h2 {{ color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; margin: 30px 0 20px; }}
        .card {{ background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }}
        .metric {{ text-align: center; padding: 20px; background: #f8f9ff; border-radius: 8px; }}
        .metric-value {{ font-size: 2.5em; font-weight: bold; color: #667eea; }}
        .metric-label {{ color: #666; font-size: 0.9em; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #eee; }}
        th {{ background: #667eea; color: white; }}
        tr:hover {{ background: #f8f9ff; }}
        .bar {{ background: #e0e0e0; border-radius: 4px; height: 20px; overflow: hidden; }}
        .bar-fill {{ background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; transition: width 0.3s; }}
        .tag {{ display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 0.8em; margin: 2px; }}
        .tag-a {{ background: #4CAF50; color: white; }}
        .tag-b {{ background: #8BC34A; color: white; }}
        .tag-c {{ background: #FFC107; color: #333; }}
        .tag-d {{ background: #f44336; color: white; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .success {{ background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .danger {{ background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .nota-usuario {{ background: #e3f2fd; border-left: 4px solid #2196F3; padding: 10px 15px; margin: 10px 0; font-style: italic; border-radius: 0 8px 8px 0; }}
        .two-cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        @media (max-width: 768px) {{ .two-cols {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <h1>
            Diagnostico do Dataset Indovinya
            <small>Analise do estado atual dos dados - {datetime.now().strftime("%d/%m/%Y")}</small>
        </h1>

        <div class="card">
            <h2>1. Visao Geral</h2>
            <div class="grid">
                <div class="metric">
                    <div class="metric-value">{df.shape[0]}</div>
                    <div class="metric-label">Registros</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{df['Nome do produto'].nunique()}</div>
                    <div class="metric-label">Produtos</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{ensaios_unicos}</div>
                    <div class="metric-label">Tipos de Ensaio</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{(df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100):.1f}%</div>
                    <div class="metric-label">Celulas Vazias</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{df['Data inicial do estudo'].min().year}-{df['Data inicial do estudo'].max().year}</div>
                    <div class="metric-label">Periodo</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{metodos_unicos}</div>
                    <div class="metric-label">Metodos</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>2. Grau de Etoxilacao</h2>
            <div class="nota-usuario">Sua nota: "bom para agrupamento de produtos"</div>
            <table>
                <tr><th>Grau</th><th>Qtd</th><th>%</th><th>Distribuicao</th></tr>
"""

for grau, count in etox.head(10).items():
    pct = count / len(df) * 100
    html += f"""                <tr>
                    <td>{grau}</td>
                    <td>{count}</td>
                    <td>{pct:.1f}%</td>
                    <td><div class="bar"><div class="bar-fill" style="width: {pct*2}%"></div></div></td>
                </tr>
"""

nao_aplicavel = etox.get('Não aplicável', 0) + etox.get('Não descrito', 0)
pct_na = nao_aplicavel / len(df) * 100

html += f"""            </table>
            <div class="warning">
                <strong>Atencao:</strong> {pct_na:.1f}% dos registros sao "Nao aplicavel" ou "Nao descrito".
                Grau de Etoxilacao e util principalmente para o grupo "Ethoxylates and Propoxylates".
            </div>
        </div>

        <div class="card">
            <h2>3. Ensaios Fisico-Quimicos</h2>
            <div class="nota-usuario">Sua nota: "fraco? - muita variacao"</div>
            <div class="danger">
                <strong>Problema Critico:</strong> {ensaios_unicos} variacoes de nome para aproximadamente 30 ensaios reais.
                Nomenclatura inconsistente impede comparacoes diretas.
            </div>
            <h3 style="margin-top: 20px;">Exemplos de duplicatas:</h3>
            <table>
                <tr><th>Categoria</th><th>Variacoes encontradas</th></tr>
                <tr><td>pH</td><td>32 variacoes diferentes</td></tr>
                <tr><td>Agua</td><td>14 variacoes diferentes</td></tr>
                <tr><td>Acidez</td><td>12 variacoes diferentes</td></tr>
                <tr><td>Hidroxila</td><td>4 variacoes diferentes</td></tr>
            </table>
        </div>

        <div class="card">
            <h2>4. Especificacoes</h2>
            <div class="nota-usuario">Sua nota: "Existem Especificacoes numericas e nao numericas"</div>
            <div class="two-cols">
                <div>
                    <h3>Distribuicao por Tipo</h3>
                    <table>
                        <tr><th>Tipo</th><th>%</th></tr>
                        <tr><td>Range (X - Y)</td><td>43.0%</td></tr>
                        <tr><td>Maximo</td><td>37.2%</td></tr>
                        <tr><td>Descritiva (texto)</td><td>13.2%</td></tr>
                        <tr><td>Numerica (outro)</td><td>3.0%</td></tr>
                        <tr><td>Minimo</td><td>2.8%</td></tr>
                    </table>
                </div>
                <div>
                    <h3>Exemplos</h3>
                    <p><strong>Range:</strong> 190,0 - 220,0</p>
                    <p><strong>Maximo:</strong> 1,0 max.</p>
                    <p><strong>Descritiva:</strong> liquido livre de material estranho</p>
                </div>
            </div>
            <div class="success">
                <strong>Conclusao:</strong> Especificacoes majoritariamente numericas (80%). Tratamento diferenciado necessario para descritivas.
            </div>
        </div>

        <div class="card">
            <h2>5. Padrao Temporal dos Testes</h2>
            <div class="nota-usuario">Sua nota: "Normalizacao ou verificacao de recorrencia de testes - nao ha padrao"</div>
            <table>
                <tr><th>Periodo</th><th>Preenchido</th><th>%</th><th>Visualizacao</th></tr>
"""

for _, row in df_tempo.iterrows():
    html += f"""                <tr>
                    <td>{row['periodo']}</td>
                    <td>{row['preenchido']}</td>
                    <td>{row['pct']:.1f}%</td>
                    <td><div class="bar"><div class="bar-fill" style="width: {row['pct']}%"></div></div></td>
                </tr>
"""

html += f"""            </table>
            <div class="two-cols" style="margin-top: 20px;">
                <div class="warning">
                    <strong>Estudo Acelerado (53%):</strong><br>
                    Foco: 0 dia → 1m → 3m → 6m
                </div>
                <div class="warning">
                    <strong>Estudo Longa Duracao (47%):</strong><br>
                    Foco: 0 dia → 3m → 6m → 9m → 12m → 18m → 24m → 30m → 36m
                </div>
            </div>
            <div class="danger">
                <strong>Diagnostico:</strong> 36 combinacoes diferentes de periodos medidos. Nao ha padronizacao clara.
            </div>
        </div>

        <div class="card">
            <h2>6. Qualidade dos Dados - Tiers</h2>
            <div class="nota-usuario">Sua nota: "Vai precisar de um tratamento (separar em tiers?)"</div>
            <div class="grid">
                <div class="metric">
                    <div class="metric-value">{len(df_comp[df_comp['tier'] == 'A'])}</div>
                    <div class="metric-label"><span class="tag tag-a">Tier A (&gt;55%)</span></div>
                </div>
                <div class="metric">
                    <div class="metric-value">{len(df_comp[df_comp['tier'] == 'B'])}</div>
                    <div class="metric-label"><span class="tag tag-b">Tier B (40-55%)</span></div>
                </div>
                <div class="metric">
                    <div class="metric-value">{len(df_comp[df_comp['tier'] == 'C'])}</div>
                    <div class="metric-label"><span class="tag tag-c">Tier C (25-40%)</span></div>
                </div>
                <div class="metric">
                    <div class="metric-value">{len(df_comp[df_comp['tier'] == 'D'])}</div>
                    <div class="metric-label"><span class="tag tag-d">Tier D (&lt;25%)</span></div>
                </div>
            </div>
            <h3 style="margin-top: 20px;">Top 10 Produtos por Completude</h3>
            <table>
                <tr><th>Produto</th><th>Registros</th><th>Completude</th><th>Tier</th></tr>
"""

for _, row in df_comp.head(10).iterrows():
    tier_class = f"tag-{row['tier'].lower()}" if pd.notna(row['tier']) else ""
    html += f"""                <tr>
                    <td>{row['produto']}</td>
                    <td>{row['registros']}</td>
                    <td>{row['completude']:.1f}%</td>
                    <td><span class="tag {tier_class}">{row['tier']}</span></td>
                </tr>
"""

html += """            </table>
        </div>

        <div class="card">
            <h2>7. Problemas de Organizacao</h2>
            <div class="nota-usuario">Sua nota: "Todos os dados estao, aparenta baixa separacao e organizacao de informacao"</div>
            <div class="danger">
                <h3>Problemas Identificados:</h3>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li><strong>Formato Wide:</strong> 15 colunas de tempo dificultam analise temporal</li>
                    <li><strong>Dados Mistos:</strong> Numeros e texto nos mesmos campos de resultado</li>
                    <li><strong>Nomenclatura:</strong> 250 nomes para ~30 ensaios reais</li>
                    <li><strong>Sem Separacao:</strong> Ensaios quantitativos e qualitativos juntos</li>
                </ol>
            </div>
        </div>

        <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h2 style="color: white; border-color: white;">8. Resumo Executivo</h2>
            <div class="two-cols">
                <div>
                    <h3 style="color: #90EE90;">Pontos Positivos</h3>
                    <ul style="margin-left: 20px;">
                        <li>Dados existem e cobrem 2013-2024</li>
                        <li>Hierarquia implicita funcional</li>
                        <li>Grau de etoxilacao util para segmentacao</li>
                        <li>Tipos de estudo bem definidos</li>
                    </ul>
                </div>
                <div>
                    <h3 style="color: #FFB6C1;">Pontos Criticos</h3>
                    <ul style="margin-left: 20px;">
                        <li>32.9% de valores nulos</li>
                        <li>Nomenclatura inconsistente</li>
                        <li>Formato dificulta analises</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>9. Proximos Passos Sugeridos</h2>
            <table>
                <tr><th>#</th><th>Decisao</th><th>Opcoes</th></tr>
                <tr><td>1</td><td>Escopo Temporal</td><td>Usar todos os dados ou filtrar por periodo?</td></tr>
                <tr><td>2</td><td>Priorizacao</td><td>Trabalhar com todos ou focar em Tier A/B?</td></tr>
                <tr><td>3</td><td>Normalizacao</td><td>Criar dicionario de-para para os 250 nomes de ensaio?</td></tr>
                <tr><td>4</td><td>Separacao</td><td>Tratar quantitativos e qualitativos separadamente?</td></tr>
                <tr><td>5</td><td>Objetivo Final</td><td>Dashboard? Analise de estabilidade? Previsao? Anomalias?</td></tr>
            </table>
        </div>

        <p style="text-align: center; color: #666; margin-top: 30px;">
            Gerado automaticamente em """ + datetime.now().strftime("%d/%m/%Y %H:%M") + """
        </p>
    </div>
</body>
</html>"""

# Salvar
output_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\DIAGNOSTICO_Indovinya.html")
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Relatorio HTML salvo em: {output_path}")
