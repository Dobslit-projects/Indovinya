# -*- coding: utf-8 -*-
"""
Gera HTML do Plano de Tratamento
"""

from pathlib import Path
from datetime import datetime

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plano de Tratamento - Indovinya</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.7; }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        h1 {{ background: linear-gradient(135deg, #238636 0%, #1f6feb 100%); padding: 40px; text-align: center; border-radius: 12px; margin-bottom: 30px; color: white; }}
        h1 small {{ display: block; font-weight: normal; font-size: 0.45em; margin-top: 10px; opacity: 0.9; }}
        h2 {{ color: #58a6ff; margin: 40px 0 20px; padding-bottom: 10px; border-bottom: 2px solid #30363d; }}
        h3 {{ color: #7ee787; margin: 25px 0 15px; }}
        h4 {{ color: #ffa657; margin: 20px 0 10px; }}
        .card {{ background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px; margin-bottom: 20px; }}
        .fase {{ border-left: 4px solid; padding-left: 20px; margin: 20px 0; }}
        .fase-1 {{ border-color: #f85149; }}
        .fase-2 {{ border-color: #ffa657; }}
        .fase-3 {{ border-color: #58a6ff; }}
        .fase-4 {{ border-color: #7ee787; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }}
        .metric {{ background: #21262d; border-radius: 10px; padding: 20px; text-align: center; }}
        .metric-value {{ font-size: 2em; font-weight: bold; }}
        .metric-value.alta {{ color: #f85149; }}
        .metric-value.media {{ color: #ffa657; }}
        .metric-value.baixa {{ color: #7ee787; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 0.95em; }}
        th, td {{ padding: 12px 15px; text-align: left; border: 1px solid #30363d; }}
        th {{ background: #21262d; color: #58a6ff; font-weight: 600; }}
        tr:hover {{ background: #21262d; }}
        code {{ background: #21262d; padding: 3px 8px; border-radius: 6px; font-family: 'Consolas', monospace; color: #7ee787; }}
        pre {{ background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 10px; overflow-x: auto; font-size: 0.9em; }}
        .tag {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; margin: 3px; font-weight: 600; }}
        .tag-alta {{ background: #f8514933; color: #f85149; border: 1px solid #f85149; }}
        .tag-media {{ background: #ffa65733; color: #ffa657; border: 1px solid #ffa657; }}
        .tag-baixa {{ background: #7ee78733; color: #7ee787; border: 1px solid #7ee787; }}
        .tag-quant {{ background: #58a6ff33; color: #58a6ff; }}
        .tag-qual {{ background: #a371f733; color: #a371f7; }}
        .warning {{ background: #f8514922; border-left: 4px solid #f85149; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .info {{ background: #58a6ff22; border-left: 4px solid #58a6ff; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .success {{ background: #7ee78722; border-left: 4px solid #7ee787; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }}
        .timeline {{ position: relative; padding-left: 30px; }}
        .timeline::before {{ content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 3px; background: #30363d; }}
        .timeline-item {{ position: relative; margin: 20px 0; padding: 15px 20px; background: #21262d; border-radius: 8px; }}
        .timeline-item::before {{ content: ''; position: absolute; left: -24px; top: 20px; width: 12px; height: 12px; border-radius: 50%; }}
        .timeline-item.f1::before {{ background: #f85149; }}
        .timeline-item.f2::before {{ background: #ffa657; }}
        .timeline-item.f3::before {{ background: #58a6ff; }}
        .timeline-item.f4::before {{ background: #7ee787; }}
        ul {{ margin: 10px 0 10px 25px; }}
        li {{ margin: 8px 0; }}
        .two-cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }}
        .checklist {{ list-style: none; margin-left: 0; }}
        .checklist li {{ padding: 8px 0; padding-left: 30px; position: relative; }}
        .checklist li::before {{ content: '☐'; position: absolute; left: 0; color: #58a6ff; }}
        .progress {{ background: #21262d; border-radius: 10px; height: 30px; overflow: hidden; margin: 10px 0; }}
        .progress-bar {{ height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85em; }}
        .deliverable {{ background: #21262d; border-radius: 8px; padding: 15px; margin: 10px 0; display: flex; align-items: center; gap: 15px; }}
        .deliverable-icon {{ font-size: 1.5em; }}
        @media (max-width: 800px) {{ .two-cols {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <h1>
            Plano de Tratamento de Dados
            <small>Dataset Indovinya - Roadmap detalhado para estruturacao e limpeza</small>
        </h1>

        <!-- VISAO GERAL -->
        <div class="card">
            <h2>Visao Geral do Plano</h2>
            <div class="grid">
                <div class="metric">
                    <div class="metric-value" style="color: #58a6ff;">4</div>
                    <div>Fases de Trabalho</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #ffa657;">11-13</div>
                    <div>Dias Estimados</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #7ee787;">6</div>
                    <div>Entregaveis Principais</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #f85149;">5</div>
                    <div>Decisoes Pendentes</div>
                </div>
            </div>
        </div>

        <!-- FASE 1 -->
        <div class="card">
            <h2><span style="color: #f85149;">FASE 1</span> - Estruturacao Basica</h2>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <span class="tag tag-alta">Prioridade ALTA</span>
                <span class="tag" style="background: #21262d;">4-6 dias</span>
                <span class="tag" style="background: #21262d;">Sem dependencias</span>
            </div>

            <div class="fase fase-1">
                <h3>1.1 Normalizacao de Ensaios</h3>
                <p><strong>Problema:</strong> 250 nomes diferentes para ~20 ensaios reais</p>

                <div class="info">
                    <strong>Entregavel:</strong> <code>ensaios_de_para.csv</code> - Tabela mapeando cada nome original para categoria normalizada
                </div>

                <h4>Categorias Normalizadas Propostas</h4>
                <div class="two-cols">
                    <div>
                        <h4 style="color: #58a6ff;">Quantitativos</h4>
                        <ul>
                            <li><strong>Fisico-Quimicos:</strong> pH, Acidez, Hidroxila, Saponificacao, Agua, Densidade, Viscosidade</li>
                            <li><strong>Contaminantes:</strong> Dioxana, Oxido de Etileno, Peroxidos, Metais</li>
                            <li><strong>Cor:</strong> Gardner, Pt-Co, APHA, Iodo, Transmitancia</li>
                            <li><strong>Composicao:</strong> Materia Ativa, Acidos Graxos, Cloretos, Sulfatos, Solidos</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="color: #a371f7;">Qualitativos</h4>
                        <ul>
                            <li><strong>Organolepticos:</strong> Aparencia, Odor, Limpidez, Material em Suspensao</li>
                            <li><strong>Identificacao:</strong> USP, IV, CG</li>
                        </ul>
                        <div class="warning" style="margin-top: 15px;">
                            <strong>Acao:</strong> Validar categorias com especialista do negocio
                        </div>
                    </div>
                </div>
            </div>

            <div class="fase fase-1">
                <h3>1.2 Classificacao Quantitativo vs Qualitativo</h3>
                <p><strong>Problema:</strong> Ensaios numericos e descritivos misturados no mesmo dataset</p>

                <pre><code>QUALITATIVO se:
  - Especificacao contem: "liquido", "solido", "livre", "passa", "flocos"
  - OU ensaio contem: "aparencia", "odor", "identificacao", "limpidez"

QUANTITATIVO se:
  - Especificacao contem: numeros + "max", "min", "-" (range)
  - OU ensaio contem: "indice", "teor", "ph", "densidade"</code></pre>

                <div class="success">
                    <strong>Resultado esperado:</strong> ~218 ensaios quantitativos | ~20 ensaios qualitativos
                </div>
            </div>

            <div class="fase fase-1">
                <h3>1.3 Parse de Especificacoes</h3>
                <p><strong>Problema:</strong> Especificacoes em texto livre precisam ser estruturadas</p>

                <table>
                    <tr><th>Tipo</th><th>Exemplo Original</th><th>spec_min</th><th>spec_max</th><th>Regex/Regra</th></tr>
                    <tr><td><span class="tag tag-quant">RANGE</span></td><td>190,0 - 220,0</td><td>190.0</td><td>220.0</td><td><code>(\\d+)\\s*-\\s*(\\d+)</code></td></tr>
                    <tr><td><span class="tag tag-quant">MAXIMO</span></td><td>1,0 max.</td><td>null</td><td>1.0</td><td>contem "max"</td></tr>
                    <tr><td><span class="tag tag-quant">MINIMO</span></td><td>94,0 min</td><td>94.0</td><td>null</td><td>contem "min"</td></tr>
                    <tr><td><span class="tag tag-qual">DESCRITIVA</span></td><td>liquido limpido</td><td>null</td><td>null</td><td>texto descritivo</td></tr>
                    <tr><td><span class="tag">SEM_SPEC</span></td><td>----</td><td>null</td><td>null</td><td>"----" ou vazio</td></tr>
                </table>
            </div>
        </div>

        <!-- FASE 2 -->
        <div class="card">
            <h2><span style="color: #ffa657;">FASE 2</span> - Limpeza de Valores</h2>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <span class="tag tag-alta">Prioridade ALTA</span>
                <span class="tag" style="background: #21262d;">2 dias</span>
                <span class="tag" style="background: #21262d;">Depende da Fase 1</span>
            </div>

            <div class="fase fase-2">
                <h3>2.1 Conversao de Valores Numericos</h3>
                <table>
                    <tr><th>De</th><th>Para</th><th>Regra</th></tr>
                    <tr><td><code>"6,93"</code></td><td><code>6.93</code></td><td>Virgula → Ponto</td></tr>
                    <tr><td><code>" 12.5 "</code></td><td><code>12.5</code></td><td>Trim espacos</td></tr>
                    <tr><td><code>"N/A"</code></td><td><code>null</code></td><td>Valores invalidos</td></tr>
                </table>
            </div>

            <div class="fase fase-2">
                <h3>2.2 Tratamento de Valores "&lt;X"</h3>
                <p><strong>Problema:</strong> Valores como "&lt;1", "&lt;0,01" indicam limite de deteccao</p>

                <div class="warning">
                    <strong>DECISAO NECESSARIA:</strong> Como tratar esses valores?
                </div>

                <table>
                    <tr><th>Opcao</th><th>Tratamento</th><th>Exemplo</th><th>Quando Usar</th></tr>
                    <tr><td>A</td><td>Manter texto</td><td>"&lt;1" → "&lt;1"</td><td>Precisa rastrear</td></tr>
                    <tr><td>B</td><td>Substituir por 0</td><td>"&lt;1" → 0</td><td>Indetectavel = zero</td></tr>
                    <tr><td><strong>C</strong></td><td><strong>Substituir por X/2</strong></td><td><strong>"&lt;1" → 0.5</strong></td><td><strong>Pratica comum</strong></td></tr>
                    <tr><td>D</td><td>Substituir por X</td><td>"&lt;1" → 1</td><td>Conservador</td></tr>
                </table>
            </div>

            <div class="fase fase-2">
                <h3>2.3 Padronizacao de Valores Texto</h3>
                <table>
                    <tr><th>Variacoes Encontradas</th><th>Valor Padronizado</th></tr>
                    <tr><td>liquido limpido, Líquido límpido, líquido, límpido</td><td><code>LIQUIDO_LIMPIDO</code></td></tr>
                    <tr><td>passa, Passa, PASSA</td><td><code>PASSA</code></td></tr>
                    <tr><td>substancialmente livre, Substancialmente Livre</td><td><code>SUBST_LIVRE</code></td></tr>
                    <tr><td>flocos brancos, Flocos Brancos</td><td><code>FLOCOS_BRANCOS</code></td></tr>
                </table>
            </div>
        </div>

        <!-- FASE 3 -->
        <div class="card">
            <h2><span style="color: #58a6ff;">FASE 3</span> - Separacao por Contexto</h2>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <span class="tag tag-media">Prioridade MEDIA</span>
                <span class="tag" style="background: #21262d;">2 dias</span>
                <span class="tag" style="background: #21262d;">Depende da Fase 2</span>
            </div>

            <div class="fase fase-3">
                <h3>3.1 Separacao Acelerado vs Longa Duracao</h3>
                <div class="two-cols">
                    <div style="background: #f8514922; padding: 15px; border-radius: 8px;">
                        <h4 style="color: #f85149;">Acelerado (53%)</h4>
                        <p>Colunas relevantes:</p>
                        <code>0_dia, 1m, 3m, 6m</code>
                    </div>
                    <div style="background: #7ee78722; padding: 15px; border-radius: 8px;">
                        <h4 style="color: #7ee787;">Longa Duracao (47%)</h4>
                        <p>Colunas relevantes:</p>
                        <code>0_dia, 3m, 6m, 9m, 12m, 18m, 24m, 30m, 36m</code>
                    </div>
                </div>
            </div>

            <div class="fase fase-3">
                <h3>3.2 Separacao Quantitativo vs Qualitativo</h3>
                <p>Criar views ou datasets separados para facilitar analises especificas</p>
            </div>

            <div class="fase fase-3">
                <h3>3.3 Conversao WIDE → LONG (Opcional)</h3>
                <div class="two-cols">
                    <div>
                        <h4>Formato WIDE (atual)</h4>
                        <pre>| Produto | Ensaio | 0_dia | 3m  | 6m  |
|---------|--------|-------|-----|-----|
| Prod A  | pH     | 6.5   | 6.4 | 6.3 |</pre>
                    </div>
                    <div>
                        <h4>Formato LONG</h4>
                        <pre>| Produto | Ensaio | Periodo | Valor |
|---------|--------|---------|-------|
| Prod A  | pH     | 0_dia   | 6.5   |
| Prod A  | pH     | 3m      | 6.4   |
| Prod A  | pH     | 6m      | 6.3   |</pre>
                    </div>
                </div>
            </div>
        </div>

        <!-- FASE 4 -->
        <div class="card">
            <h2><span style="color: #7ee787;">FASE 4</span> - Validacao</h2>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <span class="tag tag-baixa">Prioridade BAIXA</span>
                <span class="tag" style="background: #21262d;">3 dias</span>
                <span class="tag" style="background: #21262d;">Depende da Fase 3</span>
            </div>

            <div class="fase fase-4">
                <h3>4.1 Verificacao de Conformidade</h3>
                <pre><code>def verificar_conformidade(valor, spec_tipo, spec_min, spec_max):
    if spec_tipo == 'RANGE':
        return spec_min &lt;= valor &lt;= spec_max
    elif spec_tipo == 'MAXIMO':
        return valor &lt;= spec_max
    elif spec_tipo == 'MINIMO':
        return valor &gt;= spec_min</code></pre>
            </div>

            <div class="fase fase-4">
                <h3>4.2 Deteccao de Outliers</h3>
                <ul>
                    <li>IQR (Interquartile Range) por ensaio</li>
                    <li>Z-score > 3</li>
                    <li>Comparacao com historico do produto</li>
                </ul>
            </div>

            <div class="fase fase-4">
                <h3>4.3 Sistema de Alertas</h3>
                <div class="grid">
                    <div class="deliverable"><span class="deliverable-icon">🔴</span><div><strong>FORA_SPEC</strong><br>Valor fora da especificacao</div></div>
                    <div class="deliverable"><span class="deliverable-icon">📉</span><div><strong>TENDENCIA</strong><br>Degradacao ao longo do tempo</div></div>
                    <div class="deliverable"><span class="deliverable-icon">⚠️</span><div><strong>OUTLIER</strong><br>Valor muito diferente</div></div>
                    <div class="deliverable"><span class="deliverable-icon">❓</span><div><strong>DADO_FALTANTE</strong><br>Periodo sem medicao</div></div>
                </div>
            </div>
        </div>

        <!-- CRONOGRAMA -->
        <div class="card">
            <h2>Cronograma</h2>
            <div class="timeline">
                <div class="timeline-item f1">
                    <strong style="color: #f85149;">FASE 1 - Estruturacao Basica</strong>
                    <div class="progress"><div class="progress-bar" style="width: 46%; background: linear-gradient(90deg, #f85149, #ffa657);">4-6 dias</div></div>
                    <small>1.1 Normalizar ensaios (2-3d) | 1.2 Classificar (1d) | 1.3 Parse specs (1-2d)</small>
                </div>
                <div class="timeline-item f2">
                    <strong style="color: #ffa657;">FASE 2 - Limpeza de Valores</strong>
                    <div class="progress"><div class="progress-bar" style="width: 15%; background: #ffa657;">2 dias</div></div>
                    <small>2.1 Converter numeros (0.5d) | 2.2 Tratar &lt;X (0.5d) | 2.3 Padronizar texto (1d)</small>
                </div>
                <div class="timeline-item f3">
                    <strong style="color: #58a6ff;">FASE 3 - Separacao</strong>
                    <div class="progress"><div class="progress-bar" style="width: 15%; background: #58a6ff;">2 dias</div></div>
                    <small>3.1 Acel/Longa (0.5d) | 3.2 Quant/Qual (0.5d) | 3.3 LONG (1d)</small>
                </div>
                <div class="timeline-item f4">
                    <strong style="color: #7ee787;">FASE 4 - Validacao</strong>
                    <div class="progress"><div class="progress-bar" style="width: 23%; background: #7ee787;">3 dias</div></div>
                    <small>4.1 Conformidade (1d) | 4.2 Outliers (1d) | 4.3 Alertas (1d)</small>
                </div>
            </div>
            <div class="info" style="margin-top: 20px;">
                <strong>Total estimado:</strong> 11-13 dias de trabalho
            </div>
        </div>

        <!-- DECISOES -->
        <div class="card">
            <h2>Decisoes Pendentes</h2>
            <table>
                <tr><th>#</th><th>Decisao</th><th>Opcoes</th><th>Impacto</th></tr>
                <tr><td>1</td><td>Existe lista oficial de ensaios?</td><td>Sim / Nao</td><td>Fase 1.1</td></tr>
                <tr><td>2</td><td>Como tratar "&lt;X"?</td><td>0 / X/2 / X / Texto</td><td>Fase 2.2</td></tr>
                <tr><td>3</td><td>Formato final preferido?</td><td>WIDE / LONG / Ambos</td><td>Fase 3.3</td></tr>
                <tr><td>4</td><td>Incluir dados pre-2017?</td><td>Sim / Nao</td><td>Escopo geral</td></tr>
                <tr><td>5</td><td>Quais alertas sao prioritarios?</td><td>Lista a definir</td><td>Fase 4.3</td></tr>
            </table>
        </div>

        <!-- ENTREGAVEIS -->
        <div class="card">
            <h2>Entregaveis Finais</h2>
            <div class="grid">
                <div class="deliverable"><span class="deliverable-icon">📋</span><div><strong>ensaios_de_para.csv</strong><br>Mapeamento de ensaios</div></div>
                <div class="deliverable"><span class="deliverable-icon">📋</span><div><strong>valores_qual_de_para.csv</strong><br>Mapeamento de textos</div></div>
                <div class="deliverable"><span class="deliverable-icon">⚙️</span><div><strong>config_tratamento.json</strong><br>Parametros</div></div>
                <div class="deliverable"><span class="deliverable-icon">📊</span><div><strong>dados_tratados.parquet</strong><br>Dataset final</div></div>
                <div class="deliverable"><span class="deliverable-icon">📄</span><div><strong>relatorio_conformidade</strong><br>Status de conformidade</div></div>
                <div class="deliverable"><span class="deliverable-icon">📄</span><div><strong>relatorio_qualidade</strong><br>Metricas de qualidade</div></div>
            </div>
        </div>

        <!-- PROXIMOS PASSOS -->
        <div class="card" style="background: linear-gradient(135deg, #238636 0%, #1f6feb 100%);">
            <h2 style="color: white; border: none;">Proximos Passos Imediatos</h2>
            <ul class="checklist" style="color: white; font-size: 1.1em;">
                <li>Validar categorias de ensaios com especialista</li>
                <li>Decidir tratamento de "&lt;X" com equipe</li>
                <li>Iniciar Fase 1.1 - criar tabela de normalizacao</li>
                <li>Definir se precisa formato LONG</li>
                <li>Priorizar tipos de alerta</li>
            </ul>
        </div>

        <p style="text-align: center; color: #666; margin-top: 30px;">
            Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}
        </p>
    </div>
</body>
</html>"""

output_path = Path(r"C:\Users\Administrador\Desktop\GitHub Henrique Pessoal Top demais\Indorama\PLANO_TRATAMENTO_Indovinya.html")
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Plano HTML salvo em: {output_path}")
