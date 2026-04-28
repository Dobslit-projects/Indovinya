# -*- coding: utf-8 -*-
"""
Gera relatorio HTML da Analise Profunda
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

arquivo = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\Pacote de dados_1 - PoC Indovinya.xlsx")
df = pd.read_excel(arquivo, sheet_name='Modelo')

colunas_tempo = ['0 dia', '1 sem', '2 sem', '1m', '2m', '3m', '4m', '5m', '6m', '9m', '12m', '18m', '24m', '30m', '36m']

# Calculos
df_acel = df[df['Tipo de estudo'] == 'Acelerado']
df_longa = df[df['Tipo de estudo'] == 'Longa duração']

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analise Profunda - Indovinya</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background: #1a1a2e; color: #eee; line-height: 1.6; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 20px; }}
        h1 {{ background: linear-gradient(135deg, #e94560 0%, #0f3460 100%); padding: 40px; text-align: center; border-radius: 15px; margin-bottom: 30px; }}
        h1 small {{ display: block; font-weight: normal; font-size: 0.5em; margin-top: 10px; opacity: 0.8; }}
        h2 {{ color: #e94560; border-left: 5px solid #e94560; padding-left: 15px; margin: 40px 0 20px; font-size: 1.5em; }}
        h3 {{ color: #16c79a; margin: 20px 0 10px; }}
        .card {{ background: #16213e; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
        .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}
        .metric {{ text-align: center; padding: 25px; background: #0f3460; border-radius: 12px; }}
        .metric-value {{ font-size: 3em; font-weight: bold; background: linear-gradient(135deg, #e94560, #16c79a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .metric-label {{ color: #888; font-size: 0.9em; margin-top: 5px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        th, td {{ padding: 12px 15px; text-align: left; border-bottom: 1px solid #0f3460; }}
        th {{ background: #e94560; color: white; font-weight: 600; }}
        tr:hover {{ background: #0f3460; }}
        .bar {{ background: #0f3460; border-radius: 4px; height: 25px; overflow: hidden; position: relative; }}
        .bar-fill {{ height: 100%; transition: width 0.3s; border-radius: 4px; }}
        .bar-fill.acel {{ background: linear-gradient(90deg, #e94560, #ff6b6b); }}
        .bar-fill.longa {{ background: linear-gradient(90deg, #16c79a, #00d9ff); }}
        .bar-label {{ position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.8em; font-weight: bold; }}
        .tag {{ display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 0.8em; margin: 3px; }}
        .tag-quant {{ background: #16c79a; color: #1a1a2e; }}
        .tag-qual {{ background: #e94560; color: white; }}
        .tag-range {{ background: #0f3460; border: 1px solid #16c79a; }}
        .tag-max {{ background: #0f3460; border: 1px solid #e94560; }}
        .warning {{ background: rgba(233, 69, 96, 0.2); border-left: 4px solid #e94560; padding: 15px 20px; margin: 15px 0; border-radius: 0 10px 10px 0; }}
        .success {{ background: rgba(22, 199, 154, 0.2); border-left: 4px solid #16c79a; padding: 15px 20px; margin: 15px 0; border-radius: 0 10px 10px 0; }}
        .info {{ background: rgba(15, 52, 96, 0.5); border-left: 4px solid #00d9ff; padding: 15px 20px; margin: 15px 0; border-radius: 0 10px 10px 0; }}
        .two-cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }}
        .code {{ background: #0f3460; padding: 20px; border-radius: 10px; font-family: monospace; font-size: 0.9em; overflow-x: auto; }}
        .highlight {{ color: #16c79a; font-weight: bold; }}
        .highlight-red {{ color: #e94560; font-weight: bold; }}
        .timeline {{ display: flex; justify-content: space-between; align-items: center; padding: 20px 0; position: relative; }}
        .timeline::before {{ content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 3px; background: #0f3460; }}
        .timeline-item {{ background: #16213e; padding: 10px 15px; border-radius: 8px; position: relative; z-index: 1; text-align: center; min-width: 60px; }}
        .timeline-item.active {{ background: #e94560; }}
        .timeline-item.active-longa {{ background: #16c79a; }}
        ul {{ margin-left: 20px; }}
        li {{ margin: 8px 0; }}
        .fase {{ background: linear-gradient(135deg, #0f3460, #16213e); border-radius: 12px; padding: 20px; margin: 15px 0; border-left: 4px solid; }}
        .fase-1 {{ border-color: #e94560; }}
        .fase-2 {{ border-color: #16c79a; }}
        .fase-3 {{ border-color: #00d9ff; }}
        .fase-4 {{ border-color: #ffd700; }}
        .fase h4 {{ margin-bottom: 10px; }}
        @media (max-width: 900px) {{ .two-cols, .grid-3 {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <h1>
            Analise Profunda - Dataset Indovinya
            <small>Entendendo o dataset para definir tratamentos necessarios - {datetime.now().strftime("%d/%m/%Y")}</small>
        </h1>

        <!-- ANATOMIA -->
        <div class="card">
            <h2>1. Anatomia do Dataset</h2>
            <p style="color: #888; margin-bottom: 20px;">Como o dataset esta estruturado e o que cada linha representa</p>

            <div class="info">
                <strong>Cada LINHA representa:</strong> 1 Ensaio de 1 Produto em 1 Estudo especifico
            </div>

            <div class="grid-3">
                <div>
                    <h3>Identificacao</h3>
                    <ul>
                        <li>Item (ID numerico)</li>
                        <li>Codigo de item</li>
                        <li>Nome do produto</li>
                        <li>Descricao quimica</li>
                    </ul>
                </div>
                <div>
                    <h3>Classificacao</h3>
                    <ul>
                        <li>Grau de Etoxilacao</li>
                        <li>Grupo de Familia</li>
                        <li>Familia de Produtos</li>
                        <li>Peso Molecular</li>
                    </ul>
                </div>
                <div>
                    <h3>Ensaio</h3>
                    <ul>
                        <li>Nome do ensaio</li>
                        <li>Metodo analitico</li>
                        <li>Especificacao</li>
                        <li>15 pontos temporais</li>
                    </ul>
                </div>
            </div>

            <div class="grid" style="margin-top: 25px;">
                <div class="metric">
                    <div class="metric-value">{df['Nome do produto'].nunique()}</div>
                    <div class="metric-label">Produtos Unicos</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{df['Ensaios físico-químicos'].nunique()}</div>
                    <div class="metric-label">Nomes de Ensaio</div>
                </div>
                <div class="metric">
                    <div class="metric-value">~20</div>
                    <div class="metric-label">Ensaios Reais (estimado)</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{df['Especificação'].nunique()}</div>
                    <div class="metric-label">Especificacoes Unicas</div>
                </div>
            </div>
        </div>

        <!-- ENSAIOS -->
        <div class="card">
            <h2>2. Ensaios Fisico-Quimicos</h2>
            <p style="color: #888; margin-bottom: 20px;">O problema central: 250 nomes para ~20 ensaios reais</p>

            <div class="warning">
                <strong>Problema Critico:</strong> Nomenclatura inconsistente impede qualquer analise comparativa entre produtos.
            </div>

            <h3>Categorizacao Identificada</h3>
            <table>
                <tr><th>Categoria</th><th>Variacoes</th><th>Exemplos</th><th>Tipo</th></tr>
                <tr>
                    <td><strong>pH</strong></td>
                    <td>29</td>
                    <td style="font-size:0.85em">pH, 5% p/p aquoso, 25C | pH, 10% aquoso, 25C | pH 1% p/p aquoso</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Cor</strong></td>
                    <td>29</td>
                    <td style="font-size:0.85em">Cor Gardner, 25C | Cor Pt-Co | Cor APHA 40C</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Acidez</strong></td>
                    <td>16</td>
                    <td style="font-size:0.85em">Indice de acidez, mgKOH/g | N° acido | Acidez</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Agua/Umidade</strong></td>
                    <td>10</td>
                    <td style="font-size:0.85em">Agua, %p | Agua, % | Teor de Agua | Umidade</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Aparencia</strong></td>
                    <td>7</td>
                    <td style="font-size:0.85em">Aparencia, 25C | Aparencia | Aparencia temp. ambiente</td>
                    <td><span class="tag tag-qual">Qualitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Viscosidade</strong></td>
                    <td>7</td>
                    <td style="font-size:0.85em">Viscosidade 25C, BKF, cp | Viscosidade, cP</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Hidroxila</strong></td>
                    <td>4</td>
                    <td style="font-size:0.85em">Hidroxila, indice de, mgKOH/g | Indice de hidroxila</td>
                    <td><span class="tag tag-quant">Quantitativo</span></td>
                </tr>
                <tr>
                    <td><strong>Outros</strong></td>
                    <td>79+</td>
                    <td style="font-size:0.85em">Dioxana, Peroxidos, Densidade, Saponificacao, etc.</td>
                    <td><span class="tag tag-quant">Variado</span></td>
                </tr>
            </table>

            <div class="success" style="margin-top: 20px;">
                <strong>Solucao:</strong> Criar tabela DE-PARA mapeando os 250 nomes para ~20 categorias normalizadas.
            </div>
        </div>

        <!-- ESPECIFICACOES -->
        <div class="card">
            <h2>3. Especificacoes</h2>
            <p style="color: #888; margin-bottom: 20px;">Criterios de aceitacao: o que precisa ser parseado</p>

            <div class="two-cols">
                <div>
                    <h3>Distribuicao por Tipo</h3>
                    <table>
                        <tr><th>Tipo</th><th>Qtd</th><th>Visual</th></tr>
                        <tr>
                            <td><span class="tag tag-range">RANGE (X - Y)</span></td>
                            <td>171</td>
                            <td><div class="bar"><div class="bar-fill acel" style="width: 51%"></div></div></td>
                        </tr>
                        <tr>
                            <td><span class="tag tag-max">MAXIMO</span></td>
                            <td>100</td>
                            <td><div class="bar"><div class="bar-fill acel" style="width: 30%"></div></div></td>
                        </tr>
                        <tr>
                            <td><span class="tag tag-qual">DESCRITIVA</span></td>
                            <td>37</td>
                            <td><div class="bar"><div class="bar-fill longa" style="width: 11%"></div></div></td>
                        </tr>
                        <tr>
                            <td><span class="tag">MINIMO</span></td>
                            <td>12</td>
                            <td><div class="bar"><div class="bar-fill longa" style="width: 4%"></div></div></td>
                        </tr>
                        <tr>
                            <td><span class="tag">OUTROS</span></td>
                            <td>15</td>
                            <td><div class="bar"><div class="bar-fill" style="width: 4%; background: #888"></div></div></td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h3>Exemplos de Parse</h3>
                    <div class="code">
<span class="highlight-red">"190,0 - 220,0"</span>
  tipo: RANGE
  min: 190.0
  max: 220.0

<span class="highlight-red">"1,0 max."</span>
  tipo: MAXIMO
  min: null
  max: 1.0

<span class="highlight-red">"liquido livre de material estranho"</span>
  tipo: DESCRITIVA
  descricao: "liquido livre..."
                    </div>
                </div>
            </div>

            <div class="info" style="margin-top: 20px;">
                <strong>Implicacao:</strong> 80% das especificacoes sao NUMERICAS (Range + Max + Min) e podem ser validadas automaticamente.
                <br>20% sao DESCRITIVAS e precisam de tratamento qualitativo.
            </div>
        </div>

        <!-- ACELERADO vs LONGA -->
        <div class="card">
            <h2>4. Acelerado vs Longa Duracao</h2>
            <p style="color: #888; margin-bottom: 20px;">Dois cronogramas completamente diferentes</p>

            <div class="grid">
                <div class="metric" style="border: 2px solid #e94560;">
                    <div class="metric-value" style="-webkit-text-fill-color: #e94560;">{len(df_acel)}</div>
                    <div class="metric-label">Registros ACELERADO (53%)</div>
                </div>
                <div class="metric" style="border: 2px solid #16c79a;">
                    <div class="metric-value" style="-webkit-text-fill-color: #16c79a;">{len(df_longa)}</div>
                    <div class="metric-label">Registros LONGA DURACAO (47%)</div>
                </div>
            </div>

            <h3 style="margin-top: 30px;">Cronograma ACELERADO</h3>
            <div class="timeline">
                <div class="timeline-item active">0 dia<br><small>99%</small></div>
                <div class="timeline-item active">1m<br><small>80%</small></div>
                <div class="timeline-item active">3m<br><small>95%</small></div>
                <div class="timeline-item active">6m<br><small>99%</small></div>
                <div class="timeline-item">9m<br><small>4%</small></div>
                <div class="timeline-item">12m<br><small>0%</small></div>
                <div class="timeline-item">...</div>
                <div class="timeline-item">36m<br><small>0%</small></div>
            </div>

            <h3 style="margin-top: 20px;">Cronograma LONGA DURACAO</h3>
            <div class="timeline">
                <div class="timeline-item active-longa">0 dia<br><small>96%</small></div>
                <div class="timeline-item active-longa">3m<br><small>88%</small></div>
                <div class="timeline-item active-longa">6m<br><small>90%</small></div>
                <div class="timeline-item active-longa">9m<br><small>89%</small></div>
                <div class="timeline-item active-longa">12m<br><small>98%</small></div>
                <div class="timeline-item active-longa">18m<br><small>89%</small></div>
                <div class="timeline-item active-longa">24m<br><small>87%</small></div>
                <div class="timeline-item active-longa">36m<br><small>48%</small></div>
            </div>

            <div class="warning" style="margin-top: 25px;">
                <strong>Importante:</strong> Estudos Acelerado e Longa Duracao NAO devem ser misturados em analises temporais.
                <br>Acelerado foca em <span class="highlight-red">0dia → 1m → 3m → 6m</span>
                <br>Longa foca em <span class="highlight">0dia → 3m → 6m → 9m → 12m → 18m → 24m → 30m → 36m</span>
            </div>

            <h3 style="margin-top: 25px;">Comparativo de Produtos</h3>
            <div class="grid-3">
                <div class="metric">
                    <div class="metric-value">43</div>
                    <div class="metric-label">Produtos em AMBOS estudos</div>
                </div>
                <div class="metric">
                    <div class="metric-value">9</div>
                    <div class="metric-label">APENAS Acelerado</div>
                </div>
                <div class="metric">
                    <div class="metric-value">0</div>
                    <div class="metric-label">APENAS Longa</div>
                </div>
            </div>
        </div>

        <!-- VALORES -->
        <div class="card">
            <h2>5. Valores nas Colunas Temporais</h2>
            <p style="color: #888; margin-bottom: 20px;">O desafio: numeros e texto misturados</p>

            <table>
                <tr><th>Periodo</th><th>Numerico</th><th>Texto</th><th>Misto</th><th>Nulo</th></tr>
                <tr>
                    <td><strong>0 dia</strong></td>
                    <td><span class="highlight">76.9%</span></td>
                    <td>15.1%</td>
                    <td>5.6%</td>
                    <td>2.3%</td>
                </tr>
                <tr>
                    <td><strong>3m</strong></td>
                    <td><span class="highlight">71.7%</span></td>
                    <td>15.7%</td>
                    <td>4.7%</td>
                    <td>7.9%</td>
                </tr>
                <tr>
                    <td><strong>6m</strong></td>
                    <td><span class="highlight">74.1%</span></td>
                    <td>16.1%</td>
                    <td>4.2%</td>
                    <td>5.6%</td>
                </tr>
                <tr>
                    <td><strong>12m</strong></td>
                    <td>35.7%</td>
                    <td>7.8%</td>
                    <td>2.5%</td>
                    <td><span class="highlight-red">54.0%</span></td>
                </tr>
            </table>

            <div class="two-cols" style="margin-top: 20px;">
                <div>
                    <h3>Exemplos de Texto</h3>
                    <div class="code">
"liquido limpido"
"flocos brancos"
"Pasta Turva Amarelada"
"Substancialmente livre"
"solido"
"granulos branco"
                    </div>
                </div>
                <div>
                    <h3>Exemplos de Misto</h3>
                    <div class="code">
"&lt;1"     (menor que 1)
"&lt;0,01"  (menor que 0.01)
"&lt;5"     (menor que 5)
"&lt;20"    (menor que 20)
                    </div>
                </div>
            </div>
        </div>

        <!-- TRATAMENTO -->
        <div class="card">
            <h2>6. Plano de Tratamento</h2>
            <p style="color: #888; margin-bottom: 20px;">O que precisa ser feito e em qual ordem</p>

            <div class="fase fase-1">
                <h4 style="color: #e94560;">FASE 1 - Estruturacao Basica (Prioridade ALTA)</h4>
                <ul>
                    <li><strong>1.1</strong> Criar tabela DE-PARA para normalizar 250 nomes de ensaio → ~20 categorias</li>
                    <li><strong>1.2</strong> Classificar ensaios em QUANTITATIVO vs QUALITATIVO</li>
                    <li><strong>1.3</strong> Parsear especificacoes: extrair tipo, min, max, descricao</li>
                </ul>
            </div>

            <div class="fase fase-2">
                <h4 style="color: #16c79a;">FASE 2 - Limpeza de Valores</h4>
                <ul>
                    <li><strong>2.1</strong> Converter valores numericos (tratar virgula como decimal)</li>
                    <li><strong>2.2</strong> Padronizar valores texto (encoding para qualitativos)</li>
                    <li><strong>2.3</strong> Tratar valores "&lt;X" (limite de deteccao)</li>
                </ul>
            </div>

            <div class="fase fase-3">
                <h4 style="color: #00d9ff;">FASE 3 - Separacao por Contexto</h4>
                <ul>
                    <li><strong>3.1</strong> Separar por tipo de estudo (Acelerado / Longa Duracao)</li>
                    <li><strong>3.2</strong> Separar por tipo de ensaio (Quantitativo / Qualitativo)</li>
                    <li><strong>3.3</strong> Opcional: converter para formato LONG para series temporais</li>
                </ul>
            </div>

            <div class="fase fase-4">
                <h4 style="color: #ffd700;">FASE 4 - Validacao</h4>
                <ul>
                    <li><strong>4.1</strong> Verificar conformidade (resultado vs especificacao)</li>
                    <li><strong>4.2</strong> Identificar outliers</li>
                    <li><strong>4.3</strong> Gerar alertas de desvio</li>
                </ul>
            </div>
        </div>

        <!-- RESUMO -->
        <div class="card" style="background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);">
            <h2 style="color: white; border-color: white;">Resumo: O que precisamos</h2>

            <div class="grid" style="margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                    <h3 style="color: white;">Artefatos Necessarios</h3>
                    <ul>
                        <li>Tabela de normalizacao de ensaios</li>
                        <li>Classificador quant/qual</li>
                        <li>Parser de especificacoes</li>
                        <li>Conversor de valores</li>
                    </ul>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                    <h3 style="color: white;">Decisoes Pendentes</h3>
                    <ul>
                        <li>Lista oficial de ensaios?</li>
                        <li>Tratar "&lt;X" como zero ou como X?</li>
                        <li>Formato final: WIDE ou LONG?</li>
                        <li>Manter dados historicos?</li>
                    </ul>
                </div>
            </div>
        </div>

        <p style="text-align: center; color: #666; margin-top: 30px;">
            Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}
        </p>
    </div>
</body>
</html>"""

output_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\ANALISE_PROFUNDA_Indovinya.html")
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Relatorio HTML salvo em: {output_path}")
