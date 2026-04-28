import type { ModelType, Scenario, Version } from './importance-data'

export interface Narrative {
  leitura: string
  alerta?: string
}

type NarrativeKey = `${ModelType}-${Version}-${Scenario}-${string}`

export const NARRATIVES: Partial<Record<NarrativeKey, Narrative>> = {
  // ═══ RF · Com Limites · Acelerado ═══
  'rf-com_limites-acelerado-Other ethoxylate': {
    leitura:
      'Claro predomínio de Água, %p, com peso bastante superior aos demais ensaios. O descritor dominante foi margin0_norm, indicando que o shelf life está fortemente relacionado à condição inicial do produto em relação à faixa de especificação — não à velocidade de degradação. O Índice de hidroxila aparece em segundo plano, mais ligado à intensidade de variação no tempo.',
  },
  'rf-com_limites-acelerado-Blend - Crop': {
    leitura:
      'Comportamento multifatorial. Água, %p e Cor Gardner, 25ºC têm pesos próximos, sugerindo que o shelf life depende de pelo menos dois sinais relevantes. Para a água dominou abs_slope (intensidade de variação); para a Cor Gardner, min_margin_norm (aproximação crítica ao limite). O pH 1% aparece como variável complementar.',
  },
  'rf-com_limites-acelerado-Alkyl Ester': {
    leitura:
      'Resultado particularmente consistente do ponto de vista técnico. Índice de acidez e Índice de saponificação lideram com pesos próximos, seguidos por Cor Gardner e Água, %p. Para a acidez, dominou delta_total (mudança acumulada); para a saponificação e para a cor, abs_slope (velocidade absoluta de variação).',
  },
  'rf-com_limites-acelerado-Blend - E&R': {
    leitura:
      'Apenas um ensaio válido permaneceu após os filtros e o peso observado foi praticamente nulo.',
    alerta:
      'Resultado exploratório — sem robustez suficiente para sustentar conclusões firmes.',
  },

  // ═══ RF · Com Limites · Longa Duração ═══
  'rf-com_limites-longa_duracao-Other ethoxylate': {
    leitura:
      'Água, %p volta a liderar com ampla superioridade. Diferente do cenário acelerado, aqui o descritor dominante passou a ser slope — a tendência temporal da água foi mais informativa do que a margem inicial. O RSN, Número de água aparece em segundo lugar, associado principalmente à menor margem ao limite.',
  },
  'rf-com_limites-longa_duracao-Alkyl Ester': {
    leitura:
      'Comportamento muito claro do ponto de vista químico. Índice de saponificação lidera, seguido pelo Índice de acidez, com contribuições menores de Água e Cor Gardner. Para a saponificação o descritor dominante foi slope (direção e intensidade da mudança temporal); para a acidez, delta_total. Indica que, em longa duração, o shelf life é fortemente governado por degradação química progressiva.',
  },
  'rf-com_limites-longa_duracao-Blend - Crop': {
    leitura:
      'Padrão bifatorial novamente: Água, %p e Cor Gardner, 25ºC têm pesos próximos. Para a água, delta_total (variação acumulada); para a cor, min_margin_norm. A cor se torna especialmente relevante quando se aproxima criticamente da especificação. O pH aparece como variável secundária.',
  },
  'rf-com_limites-longa_duracao-Blend - E&R': {
    leitura: 'Assim como no cenário acelerado, o resultado apresenta pouca robustez.',
    alerta: 'Trate como exploratório.',
  },

  // ═══ RF · Com Limites · Acompanhamento ═══
  'rf-com_limites-acompanhamento-Ethoxylated natural alcohol': {
    leitura:
      'Índice de hidroxila lidera, seguido pelo Índice de acidez, com Água e pH tendo relevância menor. Para a hidroxila dominou min_margin_norm — a aproximação crítica à especificação é o fator mais informativo. Para a acidez, slope. O shelf life está associado tanto à proximidade dos limites quanto à trajetória temporal de degradação química.',
  },
  'rf-com_limites-acompanhamento-Ethoxylated synthetic alcohol': {
    leitura:
      'Multifatorial: Óxido de Eteno em primeiro lugar, seguido de perto por Índice de hidroxila e Índice de acidez, com Água em contribuição moderada. Para o óxido de eteno dominou slope; para a hidroxila, delta_total. O shelf life é explicado por combinação de mecanismos de degradação, sem um ensaio absolutamente dominante.',
  },
  'rf-com_limites-acompanhamento-Ethoxylated nonyl phenol': {
    leitura:
      'Resultado equilibrado entre vários ensaios. Cor Pt-Co, 25°C em primeiro, seguida por Água, Índice de hidroxila e Índice de acidez com pesos próximos. Para a cor dominou abs_slope; para a água, delta_total; para a hidroxila, menor margem; para a acidez, inclinação temporal.',
  },

  // ═══ XGBoost · Com Limites · Longa Duração ═══
  'xgb-com_limites-longa_duracao-Other ethoxylate': {
    leitura:
      'Nítido predomínio de Água, %p com peso muito superior aos demais. O descritor dominante é margin0_norm — a posição inicial da água em relação ao limite é o principal sinal. RSN, Número de água aparece em segundo, associado a delta_total. Índice de hidroxila tem contribuição praticamente residual.',
  },
  'xgb-com_limites-longa_duracao-Alkyl Ester': {
    leitura:
      'Resultado tecnicamente consistente. Índice de saponificação lidera, seguido pelo Índice de acidez — ambos com descritor slope. O shelf life está associado à tendência temporal desses parâmetros, não apenas à posição inicial. Água e Cor Gardner aparecem com pesos bem menores. Um dos resultados mais fortes do cenário de longa duração.',
  },
  'xgb-com_limites-longa_duracao-Blend - Crop': {
    leitura:
      'Multifatorial: Água e Cor Gardner, 25ºC com pesos muito próximos. Para a água, abs_slope (intensidade da variação); para a cor, min_margin_norm (aproximação crítica ao limite).',
  },
  'xgb-com_limites-longa_duracao-Blend - E&R': {
    leitura: 'Apenas um ensaio válido após os filtros, com peso zero.',
    alerta: 'Sem robustez interpretativa suficiente.',
  },

  // ═══ XGBoost · Com Limites · Acelerado ═══
  'xgb-com_limites-acelerado-Other ethoxylate': {
    leitura:
      'Forte predomínio de Água, %p, agora com descritor dominante slope — no acelerado o principal sinal é a tendência temporal da água. Índice de hidroxila em segundo lugar com abs_slope, mas com contribuição muito menor.',
  },
  'xgb-com_limites-acelerado-Alkyl Ester': {
    leitura:
      'Índice de saponificação continua liderando, mas o descritor dominante passou a ser min_margin_norm — diferença relevante em relação à longa duração. Índice de acidez em segundo (com slope), enquanto Cor Gardner e Água aparecem em posições posteriores. Leitura global coerente com degradação química.',
  },
  'xgb-com_limites-acelerado-Blend - Crop': {
    leitura:
      'Cor Gardner, 25ºC como principal ensaio, ligeiramente à frente de Água, %p. pH 1% em terceiro. Descritor dominante da cor: min_margin_norm. Para a água e o pH: abs_slope.',
  },

  // ═══ XGBoost · Com Limites · Acompanhamento ═══
  'xgb-com_limites-acompanhamento-Ethoxylated nonyl phenol': {
    leitura:
      'O modelo concentrou integralmente a importância em Cor Pt-Co, 25°C (peso 1,000), descritor abs_slope.',
    alerta:
      'O valor extremo 1,000 não deve ser lido como exclusividade — é um caminho dominante de separação dentro de uma família relativamente pequena. Interprete com cautela.',
  },
  'xgb-com_limites-acompanhamento-Ethoxylated synthetic alcohol': {
    leitura:
      'Resultados distribuídos e interpretáveis. Índice de acidez lidera (slope), seguido pelo Índice de hidroxila (abs_slope) e Água (delta_total). O shelf life está ligado à tendência da acidez, intensidade de variação da hidroxila e, em menor grau, à mudança acumulada da água.',
  },
  'xgb-com_limites-acompanhamento-Ethoxylated natural alcohol': {
    leitura:
      'Índice de hidroxila lidera, com descritor dominante min_margin_norm. Em seguida Índice de acidez e Água (ambos com slope), depois Cor Pt-Co, 60ºC (delta_total). Combinação entre aproximação crítica da hidroxila ao limite, tendência temporal da acidez e da água, e mudança acumulada da cor.',
  },
}

export function getNarrative(
  model: ModelType,
  version: Version,
  scenario: Scenario,
  familia: string
): Narrative | undefined {
  const key: NarrativeKey = `${model}-${version}-${scenario}-${familia}`
  return NARRATIVES[key]
}
