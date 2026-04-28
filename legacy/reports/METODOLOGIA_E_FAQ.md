# Metodologia e FAQ - Diagnostico Indovinya

## Como foram calculadas as metricas

### 1. Visao Geral
| Metrica | Calculo |
|---------|---------|
| Registros | `len(df)` - contagem de linhas |
| Produtos | `df['Nome do produto'].nunique()` - valores unicos |
| Tipos de Ensaio | `df['Ensaios fisico-quimicos'].nunique()` |
| Celulas Vazias | `nulos / (linhas * colunas) * 100` |
| Periodo | `min(Data inicial)` ate `max(Data inicial)` |

### 2. Grau de Etoxilacao
- **Distribuicao**: `value_counts()` na coluna "Grau de Etoxilacao"
- **% Nao aplicavel**: soma de "Nao aplicavel" + "Nao descrito" / total

### 3. Ensaios Fisico-Quimicos
- **Variacoes**: contagem de valores unicos na coluna
- **Duplicatas detectadas**: busca por palavras-chave (pH, agua, acidez, hidroxila) e contagem de variantes

### 4. Especificacoes
Classificacao por regex/condicoes:
- **Range (X - Y)**: contem " - " e numeros
- **Maximo**: contem "max" ou "max."
- **Minimo**: contem "min" ou "min."
- **Descritiva**: contem palavras como "liquido", "solido", "livre", etc.

### 5. Padrao Temporal
- **Preenchimento**: `df[coluna].notna().sum()` para cada periodo
- **% por periodo**: preenchidos / total * 100
- **Combinacoes**: agrupamento das colunas temporais preenchidas por registro

### 6. Tiers de Qualidade
```
Completude = celulas_preenchidas / (registros_produto * 15_colunas_tempo) * 100

Tier A: > 55% completude
Tier B: 40-55%
Tier C: 25-40%
Tier D: < 25%
```

---

## Possiveis Perguntas (FAQ)

### Sobre os Dados

**P: Por que 250 ensaios se a empresa tem ~30 tipos?**
R: Inconsistencia de nomenclatura. Ex: "pH, 5% p/p aquoso, 25C" vs "pH 5% p/p, aquoso, 25C" contam como ensaios diferentes.

**P: O que significa 32.9% de celulas vazias?**
R: De todas as celulas do dataset (872 linhas x 28 colunas), quase 1/3 esta sem valor. Concentrado principalmente nas colunas temporais (1sem, 2sem, 2m, 4m, 5m).

**P: Por que alguns periodos tem >90% preenchimento e outros <10%?**
R: Estudos Acelerados focam em 0dia/1m/3m/6m. Estudos de Longa Duracao vao ate 36m. Periodos como 1sem, 2sem, 4m, 5m sao raramente usados.

**P: O que sao especificacoes descritivas?**
R: Ao inves de numeros (ex: "6.0 - 8.0"), descrevem qualidade (ex: "liquido livre de material estranho", "passa").

### Sobre os Tiers

**P: Como interpretar os Tiers?**
R: Indicam qualidade/completude dos dados por produto:
- Tier A: dados robustos, podem ser usados diretamente
- Tier B: dados razoaveis, podem precisar de tratamento leve
- Tier C: dados parciais, precisam avaliacao caso a caso
- Tier D: dados escassos, usar com cautela

**P: Um produto Tier D e ruim?**
R: Nao necessariamente. Pode ser um produto novo com poucos testes ou um produto descontinuado. O tier indica completude, nao qualidade do produto.

**P: Por que poucos produtos no Tier A?**
R: O criterio e rigoroso (>55% das celulas temporais preenchidas). Maioria dos produtos tem estudos parciais ou em andamento.

### Sobre Proximos Passos

**P: Precisa normalizar os 250 nomes de ensaio?**
R: Depende do objetivo. Para comparacoes entre produtos, sim. Para visualizacao simples por produto, talvez nao.

**P: Devo separar estudos Acelerado e Longa Duracao?**
R: Recomendado. Tem cronogramas e propositos diferentes. Misturar pode distorcer analises temporais.

**P: Qual o impacto de dados mistos (numero + texto)?**
R: Impede calculos automaticos. Ex: coluna "0 dia" tem "6.93" (numero) e "liquido limpido" (texto). Precisa separar ensaios quantitativos de qualitativos.

---

## Limitacoes da Analise

1. **Nao valida conteudo**: analise e estrutural, nao verifica se valores estao corretos
2. **Tiers sao arbitrarios**: faixas de 25/40/55% podem ser ajustadas conforme necessidade
3. **Duplicatas de ensaio**: deteccao por palavra-chave, pode haver falsos positivos/negativos
4. **Nao considera regras de negocio**: ex: quais ensaios sao obrigatorios por tipo de produto
