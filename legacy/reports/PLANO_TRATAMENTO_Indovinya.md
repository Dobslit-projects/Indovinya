# Plano de Tratamento - Dataset Indovinya

## Visao Geral

Este documento detalha o plano de tratamento para transformar o dataset bruto em uma base estruturada e analisavel.

---

## FASE 1: Estruturacao Basica
**Prioridade:** ALTA | **Dependencias:** Nenhuma

### 1.1 Normalizacao de Ensaios

**Problema:** 250 nomes diferentes para ~20 ensaios reais

**Entregavel:** Tabela `ensaios_de_para.csv`

| ensaio_original | ensaio_normalizado | categoria | is_quantitativo |
|-----------------|-------------------|-----------|-----------------|
| pH, 5% p/p aquoso, 25C | pH | Fisico-Quimico | True |
| pH 10% aquoso | pH | Fisico-Quimico | True |
| Aparencia, 25C | Aparencia | Organolptico | False |

**Categorias Normalizadas Propostas:**

```
FISICO-QUIMICOS (Quantitativos):
  - pH
  - Indice de Acidez
  - Indice de Hidroxila
  - Indice de Saponificacao
  - Teor de Agua
  - Densidade
  - Viscosidade
  - Ponto de Fusao
  - Ponto de Nevoa
  - Ponto de Solidificacao
  - Indice de Refracao

CONTAMINANTES (Quantitativos):
  - Dioxana
  - Oxido de Etileno Residual
  - Indice de Peroxidos
  - Metais Pesados

COR (Quantitativos):
  - Cor Gardner
  - Cor Pt-Co
  - Cor APHA
  - Cor Iodo
  - Transmitancia

COMPOSICAO (Quantitativos):
  - Materia Ativa
  - Acidos Graxos
  - Cloretos
  - Sulfatos
  - Insulfatados/Insulfonados
  - Glicois
  - Solidos

ORGANOLEPTICOS (Qualitativos):
  - Aparencia
  - Odor
  - Limpidez
  - Material em Suspensao

IDENTIFICACAO (Qualitativos):
  - Identificacao USP
  - Identificacao IV
  - Identificacao CG
```

**Acoes:**
1. Exportar lista unica de ensaios do dataset
2. Classificar manualmente cada um (ou com apoio de regras)
3. Validar com especialista do negocio
4. Criar arquivo de mapeamento

---

### 1.2 Classificacao Quantitativo vs Qualitativo

**Problema:** Ensaios numericos e descritivos misturados

**Regra de Classificacao:**

```python
QUALITATIVO se:
  - Especificacao contem: "liquido", "solido", "livre", "passa",
    "flocos", "pasta", "claro", "escuro", "limpido", "turvo"
  - OU ensaio contem: "aparencia", "odor", "identificacao", "limpidez"

QUANTITATIVO se:
  - Especificacao contem: numeros + "max", "min", "-" (range)
  - OU ensaio contem: "indice", "teor", "ph", "densidade", "viscosidade"
```

**Entregavel:** Coluna `is_quantitativo` na tabela de ensaios

---

### 1.3 Parse de Especificacoes

**Problema:** Especificacoes em texto livre

**Estrutura de Saida:**

| spec_original | spec_tipo | spec_min | spec_max | spec_descricao |
|---------------|-----------|----------|----------|----------------|
| 190,0 - 220,0 | RANGE | 190.0 | 220.0 | null |
| 1,0 max. | MAXIMO | null | 1.0 | null |
| 94,0 min | MINIMO | 94.0 | null | null |
| liquido limpido | DESCRITIVA | null | null | liquido limpido |
| ---- | SEM_SPEC | null | null | null |

**Regras de Parse:**

```
RANGE:     regex r"([\d,\.]+)\s*[-–]\s*([\d,\.]+)"
MAXIMO:    contem "max" ou "max." -> extrair numero
MINIMO:    contem "min" ou "min." -> extrair numero
DESCRITIVA: contem palavras descritivas sem numeros
SEM_SPEC:  "----" ou "monitoramento" ou vazio
```

**Tratamentos Especiais:**
- Virgula como decimal: "1,5" -> 1.5
- Espacos extras: trim
- Typos: "mnax." -> "max."

---

## FASE 2: Limpeza de Valores
**Prioridade:** ALTA | **Dependencias:** Fase 1

### 2.1 Conversao de Valores Numericos

**Problema:** Valores com virgula, espacos, formatos inconsistentes

**Regras:**

```python
def converter_valor(val):
    if pd.isna(val): return None
    val_str = str(val).strip()

    # Remover espacos
    val_str = val_str.strip()

    # Trocar virgula por ponto
    val_str = val_str.replace(',', '.')

    # Tentar converter
    try:
        return float(val_str)
    except:
        return val_str  # Manter original se nao converter
```

---

### 2.2 Tratamento de Valores "<X" (Limite de Deteccao)

**Problema:** Valores como "<1", "<0,01", "< 5"

**Opcoes de Tratamento:**

| Opcao | Descricao | Quando Usar |
|-------|-----------|-------------|
| A | Manter como texto | Se precisar rastrear o "<" |
| B | Substituir por 0 | Se "<X" significa "indetectavel" |
| C | Substituir por X/2 | Pratica comum em quimica analitica |
| D | Substituir por X | Abordagem conservadora |

**Recomendacao:** Opcao C (X/2) para analises, com flag indicando que era "<"

**Estrutura:**

| valor_original | valor_numerico | is_menor_que |
|----------------|----------------|--------------|
| <1 | 0.5 | True |
| <0,01 | 0.005 | True |
| 6.93 | 6.93 | False |

---

### 2.3 Padronizacao de Valores Texto (Qualitativos)

**Problema:** Mesma coisa escrita de formas diferentes

**Mapeamento:**

```
"liquido limpido" -> "LIQUIDO_LIMPIDO"
"Líquido límpido" -> "LIQUIDO_LIMPIDO"
"líquido, límpido" -> "LIQUIDO_LIMPIDO"
"Limpido" -> "LIMPIDO"
"limpido" -> "LIMPIDO"

"passa" -> "PASSA"
"Passa" -> "PASSA"

"substancialmente livre" -> "SUBST_LIVRE"
"Substancialmente Livre" -> "SUBST_LIVRE"
```

**Entregavel:** Tabela `valores_qualitativos_de_para.csv`

---

## FASE 3: Separacao por Contexto
**Prioridade:** MEDIA | **Dependencias:** Fase 2

### 3.1 Separacao Acelerado vs Longa Duracao

**Problema:** Cronogramas diferentes, nao podem ser misturados

**Estrutura Proposta:**

```
dataset_tratado/
  ├── acelerado/
  │   ├── dados_acelerado.parquet
  │   └── colunas: [..., 0_dia, 1m, 3m, 6m]  # apenas relevantes
  │
  └── longa_duracao/
      ├── dados_longa.parquet
      └── colunas: [..., 0_dia, 3m, 6m, 9m, 12m, 18m, 24m, 30m, 36m]
```

**Ou:** Manter junto com flag `tipo_estudo` e filtrar nas analises

---

### 3.2 Separacao Quantitativo vs Qualitativo

**Opcao A - Views/Filtros:**
```python
df_quant = df[df['is_quantitativo'] == True]
df_qual = df[df['is_quantitativo'] == False]
```

**Opcao B - Datasets Separados:**
```
dataset_tratado/
  ├── quantitativos.parquet  # 218 ensaios
  └── qualitativos.parquet   # 20 ensaios
```

---

### 3.3 Conversao para Formato LONG (Opcional)

**Formato Atual (WIDE):**

| Produto | Ensaio | 0_dia | 3m | 6m | 12m |
|---------|--------|-------|----|----|-----|
| Prod A | pH | 6.5 | 6.4 | 6.3 | 6.2 |

**Formato LONG:**

| Produto | Ensaio | Periodo | Valor |
|---------|--------|---------|-------|
| Prod A | pH | 0_dia | 6.5 |
| Prod A | pH | 3m | 6.4 |
| Prod A | pH | 6m | 6.3 |
| Prod A | pH | 12m | 6.2 |

**Vantagens LONG:**
- Facilita analise de series temporais
- Melhor para visualizacoes de tendencia
- Compativel com bibliotecas de ML

**Vantagens WIDE:**
- Mais compacto
- Facil visualizacao por produto
- Melhor para dashboards tabulares

**Recomendacao:** Manter WIDE como base, gerar LONG sob demanda

---

## FASE 4: Validacao
**Prioridade:** BAIXA | **Dependencias:** Fase 3

### 4.1 Verificacao de Conformidade

**Para Ensaios Quantitativos:**

```python
def verificar_conformidade(valor, spec_tipo, spec_min, spec_max):
    if spec_tipo == 'RANGE':
        return spec_min <= valor <= spec_max
    elif spec_tipo == 'MAXIMO':
        return valor <= spec_max
    elif spec_tipo == 'MINIMO':
        return valor >= spec_min
    else:
        return None  # Nao aplicavel
```

**Entregavel:** Coluna `is_conforme` para cada valor

---

### 4.2 Deteccao de Outliers

**Metodos:**
- IQR (Interquartile Range) por ensaio
- Z-score > 3
- Comparacao com historico do mesmo produto

**Entregavel:** Flag `is_outlier` + `outlier_reason`

---

### 4.3 Alertas de Desvio

**Tipos de Alerta:**
- `FORA_SPEC`: Valor fora da especificacao
- `TENDENCIA`: Valores degradando ao longo do tempo
- `OUTLIER`: Valor muito diferente do esperado
- `DADO_FALTANTE`: Periodo sem medicao esperada

---

## Cronograma Sugerido

```
FASE 1 - Estruturacao Basica
├── 1.1 Normalizacao de Ensaios ............ [  2-3 dias  ]
├── 1.2 Classificacao Quant/Qual ........... [  1 dia     ]
└── 1.3 Parse de Especificacoes ............ [  1-2 dias  ]
                                              -----------
                                              [  4-6 dias  ]

FASE 2 - Limpeza de Valores
├── 2.1 Conversao Numerica ................. [  0.5 dia   ]
├── 2.2 Tratamento "<X" .................... [  0.5 dia   ]
└── 2.3 Padronizacao Texto ................. [  1 dia     ]
                                              -----------
                                              [  2 dias    ]

FASE 3 - Separacao por Contexto
├── 3.1 Separar Acel/Longa ................. [  0.5 dia   ]
├── 3.2 Separar Quant/Qual ................. [  0.5 dia   ]
└── 3.3 Formato LONG (opcional) ............ [  1 dia     ]
                                              -----------
                                              [  2 dias    ]

FASE 4 - Validacao
├── 4.1 Verificacao Conformidade ........... [  1 dia     ]
├── 4.2 Deteccao Outliers .................. [  1 dia     ]
└── 4.3 Sistema de Alertas ................. [  1 dia     ]
                                              -----------
                                              [  3 dias    ]

TOTAL ESTIMADO: 11-13 dias de trabalho
```

---

## Entregaveis Finais

### Arquivos de Configuracao
- `ensaios_de_para.csv` - Mapeamento de ensaios
- `valores_qualitativos_de_para.csv` - Mapeamento de valores texto
- `config_tratamento.json` - Parametros do tratamento

### Datasets Tratados
- `dados_tratados_wide.parquet` - Formato wide completo
- `dados_tratados_long.parquet` - Formato long (opcional)
- `dados_acelerado.parquet` - Filtrado por tipo de estudo
- `dados_longa_duracao.parquet` - Filtrado por tipo de estudo

### Relatorios
- `relatorio_conformidade.html` - Status de conformidade
- `relatorio_outliers.html` - Outliers identificados
- `relatorio_qualidade.html` - Metricas de qualidade dos dados

---

## Decisoes Pendentes

| # | Decisao | Opcoes | Impacto |
|---|---------|--------|---------|
| 1 | Existe lista oficial de ensaios? | Sim/Nao | Afeta 1.1 |
| 2 | Como tratar "<X"? | 0 / X/2 / X | Afeta 2.2 |
| 3 | Formato final preferido? | WIDE / LONG / Ambos | Afeta 3.3 |
| 4 | Incluir dados historicos (pre-2017)? | Sim / Nao | Afeta escopo |
| 5 | Quais alertas sao prioritarios? | Lista | Afeta 4.3 |

---

## Proximos Passos Imediatos

1. **Validar categorias de ensaios** com especialista
2. **Decidir tratamento de "<X"** com equipe
3. **Iniciar Fase 1.1** - criar tabela de normalizacao
