// Deck: ShelfLife Análise e Linha de Tendência — Dobslit x Indorama
// Estilo baseado em "Indorama - Next Level.pptx"
//  - 20.0 x 11.25 in
//  - Montserrat (header + body)
//  - Cover/closing: bg #14171A, white, accent rect #1DA1F2 (bottom-left 3.8x3.8 @ 0,7.4)
//  - Content: white bg, text #1E1E1E, accent rect #2279DF (top-right 3.1x3.1 @ 17.3,0)

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM_XL", width: 20.0, height: 11.25 });
pres.layout = "CUSTOM_XL";

pres.title = "ShelfLife — Análise e Linha de Tendência";
pres.company = "Dobslit";
pres.subject = "Entrega Indovinya";
pres.author = "Dobslit";

const C = {
  dark: "14171A",
  text: "1E1E1E",
  textMuted: "5A6169",
  accentBlue: "1DA1F2",
  accentBlueDeep: "2279DF",
  bgLight: "FFFFFF",
  cardBg: "F6F8FB",
  cardBorder: "E3E8EE",
  divider: "CFD6DE",
  chartLine: "2279DF",
  chartSecondary: "1DA1F2",
  chartWarn: "F59E0B",
  chartOk: "10B981",
};

const F = { header: "Montserrat", body: "Montserrat" };

const LOGO_DOBSLIT = path.resolve(
  "C:/Users/Administrador/Desktop/Git Dobslit/Indorama/frontend/public/logo-dobslit.png"
);
const LOGO_DOBSLIT_WHITE = path.resolve(
  "C:/Users/Administrador/Desktop/Git Dobslit/Indorama/Relatorios/logo-dobslit-white.png"
);
const LOGO_INDORAMA = path.resolve(
  "C:/Users/Administrador/Desktop/Git Dobslit/Indorama/frontend/public/logo-indorama.png"
);

// ---------- helpers ----------
function addContentChrome(slide) {
  // Accent square top-right (Next_Level motif)
  slide.addShape("rect", {
    x: 17.3, y: 0, w: 3.1, h: 3.1, fill: { color: C.accentBlueDeep }, line: { type: "none" },
  });
  // Dobslit footer
  slide.addImage({ path: LOGO_DOBSLIT, x: 0.6, y: 10.45, w: 1.4, h: 0.42 });
  slide.addText("dobslit.com  ·  Abril 2026", {
    x: 17.3, y: 10.55, w: 2.2, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.textMuted, align: "right",
  });
}

function addDarkChrome(slide) {
  // Accent square bottom-left (cover/closing motif)
  slide.addShape("rect", {
    x: 0, y: 7.4, w: 3.8, h: 3.85, fill: { color: C.accentBlue }, line: { type: "none" },
  });
}

function addTitle(slide, title, kicker) {
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.8, y: 0.7, w: 12.0, h: 0.5,
      fontFace: F.body, fontSize: 16, bold: true,
      color: C.accentBlueDeep, charSpacing: 8,
    });
  }
  slide.addText(title, {
    x: 0.8, y: 1.1, w: 15.5, h: 1.3,
    fontFace: F.header, fontSize: 48, bold: true, color: C.text,
  });
  // Underline-less — Next_Level uses no accent line under titles
}

// =================================================================
// SLIDE 1 — CAPA
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };
  addDarkChrome(s);

  // Indorama logo destaque (topo-centro)
  s.addImage({ path: LOGO_INDORAMA, x: 14.0, y: 0.8, w: 5.0, h: 1.5 });

  // Título principal (duas linhas, Next_Level style)
  s.addText("ShelfLife", {
    x: 0.8, y: 3.2, w: 15.0, h: 1.9,
    fontFace: F.header, fontSize: 96, bold: true, color: "FFFFFF",
  });
  s.addText("Análise e Linha de Tendência", {
    x: 0.8, y: 5.3, w: 15.0, h: 1.0,
    fontFace: F.header, fontSize: 40, bold: false, color: "FFFFFF",
  });

  // Meta
  s.addText("Entrega para Indovinya  ·  Abril de 2026", {
    x: 0.8, y: 6.6, w: 14.0, h: 0.6,
    fontFace: F.body, fontSize: 20, color: "CADCFC",
  });

  // Dobslit assinatura (rodapé direito, logo branco sobre fundo escuro)
  s.addText("desenvolvido por", {
    x: 14.5, y: 10.1, w: 5.0, h: 0.3,
    fontFace: F.body, fontSize: 11, color: "8A93A0", align: "right",
  });
  s.addImage({ path: LOGO_DOBSLIT_WHITE, x: 17.0, y: 10.35, w: 2.4, h: 0.75 });
}

// =================================================================
// SLIDE 2 — PROBLEMA
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Problema", "O desafio");

  s.addText(
    "Predizer shelf life de produtos químicos de forma confiável é custoso, demorado e pouco transparente.",
    {
      x: 0.8, y: 2.7, w: 15.5, h: 0.9,
      fontFace: F.body, fontSize: 22, color: C.textMuted,
    }
  );

  const problems = [
    { title: "Ensaios longos e caros", body: "Estudos de estabilidade (acelerado + longa duração) consomem meses e recursos laboratoriais significativos." },
    { title: "Variáveis críticas desconhecidas", body: "Não é claro quais ensaios físico-químicos realmente dirigem o fim da vida útil — testa-se muito sem priorização." },
    { title: "Famílias heterogêneas", body: "Produtos agrupados por família podem apresentar perfis de degradação distintos, mascarando comportamentos reais." },
    { title: "Decisões sem modelo explícito", body: "Regressões lineares simples por ensaio isolado não capturam não-linearidades nem integram múltiplos ensaios." },
  ];

  const cardW = 7.6, cardH = 2.9, gap = 0.3;
  const startX = 0.8, startY = 3.8;
  problems.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    s.addShape("roundRect", {
      x, y, w: cardW, h: cardH,
      fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.1,
    });
    // Icon dot
    s.addShape("ellipse", {
      x: x + 0.4, y: y + 0.4, w: 0.4, h: 0.4,
      fill: { color: C.accentBlueDeep }, line: { type: "none" },
    });
    s.addText(p.title, {
      x: x + 1.0, y: y + 0.3, w: cardW - 1.2, h: 0.6,
      fontFace: F.header, fontSize: 20, bold: true, color: C.text,
    });
    s.addText(p.body, {
      x: x + 0.5, y: y + 1.1, w: cardW - 0.8, h: cardH - 1.2,
      fontFace: F.body, fontSize: 14, color: C.textMuted,
    });
  });
}

// =================================================================
// SLIDE 3 — DADOS RECEBIDOS (INPUT)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Dados recebidos", "O ponto de partida");

  s.addText("Pacote de dados original fornecido pela Indovinya:", {
    x: 0.8, y: 2.8, w: 15.5, h: 0.5,
    fontFace: F.body, fontSize: 18, color: C.textMuted,
  });

  // Metric cards
  const metrics = [
    { n: "2", l: "Tipos de estudo", s: "Acelerado + Longa Duração" },
    { n: "~100", l: "Ensaios físico-químicos", s: "Por produto, múltiplas unidades" },
    { n: "36m", l: "Horizonte temporal", s: "0d · 1s · 2s · 1m … 36m" },
    { n: "N", l: "Produtos × Famílias", s: "Portfólio completo" },
  ];
  metrics.forEach((m, i) => {
    const x = 0.8 + i * 4.0;
    s.addShape("roundRect", {
      x, y: 3.6, w: 3.7, h: 2.2,
      fill: { color: C.dark }, line: { type: "none" },
      rectRadius: 0.1,
    });
    s.addText(m.n, {
      x: x + 0.3, y: 3.7, w: 3.2, h: 1.0,
      fontFace: F.header, fontSize: 52, bold: true, color: C.accentBlue,
    });
    s.addText(m.l, {
      x: x + 0.3, y: 4.75, w: 3.2, h: 0.45,
      fontFace: F.header, fontSize: 14, bold: true, color: "FFFFFF",
    });
    s.addText(m.s, {
      x: x + 0.3, y: 5.2, w: 3.2, h: 0.4,
      fontFace: F.body, fontSize: 11, color: "8A93A0",
    });
  });

  // Detalhamento
  s.addText("Conteúdo detalhado", {
    x: 0.8, y: 6.3, w: 15.5, h: 0.5,
    fontFace: F.header, fontSize: 22, bold: true, color: C.text,
  });

  const details = [
    "Planilhas por produto com valores medidos em cada timepoint e cenário de estudo",
    "Especificações de aprovação por ensaio (ranges, limites simples, qualitativas)",
    "Informações de família, categoria e identificação de produto",
    "Dados brutos — sem normalização de nomenclatura de ensaios, com heterogeneidades",
  ];
  details.forEach((d, i) => {
    s.addShape("ellipse", {
      x: 0.95, y: 7.05 + i * 0.55, w: 0.18, h: 0.18,
      fill: { color: C.accentBlueDeep }, line: { type: "none" },
    });
    s.addText(d, {
      x: 1.3, y: 6.9 + i * 0.55, w: 15.0, h: 0.5,
      fontFace: F.body, fontSize: 15, color: C.text,
    });
  });
}

// =================================================================
// SLIDE 4 — ABORDAGEM / PIPELINE
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Abordagem", "Como atacamos o problema");

  s.addText(
    "Pipeline analítico que transforma dados brutos em insights acionáveis sobre shelf life.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 18, color: C.textMuted,
    }
  );

  const steps = [
    { n: "01", t: "Normalização", d: "De-para de ~100 ensaios originais para nomes canônicos. Parse de especificações (RANGE, LIMIT, QUALITATIVE)." },
    { n: "02", t: "Limpeza", d: "Detecção de outliers por Z-score de resíduos. Tratamento de valores qualitativos e flags de 'menor que'." },
    { n: "03", t: "Modelagem", d: "Ajuste de 4 modelos por ensaio: Linear OLS, Exponencial, Logístico e Média. Seleção automática por adj-R² e AIC." },
    { n: "04", t: "Shelf life", d: "Projeção até 60 meses. Cruzamento com especificação (two-sided / one-sided) e estimativa de erro sigma." },
    { n: "05", t: "Importância", d: "Random Forest + XGBoost em 3 cenários. Ranking de ensaios críticos por família e globais." },
  ];

  const boxW = 3.5, boxH = 4.8, gap = 0.225;
  const startX = 0.8, startY = 3.8;
  steps.forEach((st, i) => {
    const x = startX + i * (boxW + gap);
    s.addShape("roundRect", {
      x, y: startY, w: boxW, h: boxH,
      fill: { color: "FFFFFF" }, line: { color: C.cardBorder, width: 1.5 },
      rectRadius: 0.1,
    });
    // Top color band
    s.addShape("rect", {
      x, y: startY, w: boxW, h: 0.15,
      fill: { color: C.accentBlueDeep }, line: { type: "none" },
    });
    s.addText(st.n, {
      x: x + 0.3, y: startY + 0.35, w: boxW - 0.6, h: 0.8,
      fontFace: F.header, fontSize: 48, bold: true, color: C.accentBlueDeep,
    });
    s.addText(st.t, {
      x: x + 0.3, y: startY + 1.5, w: boxW - 0.6, h: 0.6,
      fontFace: F.header, fontSize: 22, bold: true, color: C.text,
    });
    s.addShape("line", {
      x: x + 0.3, y: startY + 2.15, w: 0.8, h: 0,
      line: { color: C.accentBlueDeep, width: 2 },
    });
    s.addText(st.d, {
      x: x + 0.3, y: startY + 2.35, w: boxW - 0.6, h: boxH - 2.5,
      fontFace: F.body, fontSize: 12, color: C.textMuted,
      paraSpaceAfter: 4,
    });
  });
}

// =================================================================
// SLIDE 5 — MODELAGEM ESTATÍSTICA
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Modelagem estatística", "Linha de tendência por ensaio");

  // Mock chart on left
  const chartX = 0.8, chartY = 3.2, chartW = 8.5, chartH = 6.8;
  s.addShape("roundRect", {
    x: chartX, y: chartY, w: chartW, h: chartH,
    fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 },
    rectRadius: 0.1,
  });
  s.addText("Exemplo: ensaio vs tempo", {
    x: chartX + 0.4, y: chartY + 0.3, w: chartW - 0.8, h: 0.4,
    fontFace: F.header, fontSize: 14, bold: true, color: C.text,
  });
  s.addText("linear · exponencial · logístico · média", {
    x: chartX + 0.4, y: chartY + 0.75, w: chartW - 0.8, h: 0.3,
    fontFace: F.body, fontSize: 11, color: C.textMuted, italic: true,
  });

  // Axes
  const axL = chartX + 0.8, axR = chartX + chartW - 0.4;
  const axT = chartY + 1.4, axB = chartY + chartH - 0.8;
  s.addShape("line", { x: axL, y: axB, w: axR - axL, h: 0, line: { color: "8A93A0", width: 1 } });
  s.addShape("line", { x: axL, y: axT, w: 0, h: axB - axT, line: { color: "8A93A0", width: 1 } });

  // Upper spec line (dashed simulated with short segments)
  const specY = axT + 0.6;
  for (let xd = axL; xd < axR; xd += 0.2) {
    s.addShape("line", { x: xd, y: specY, w: 0.12, h: 0, line: { color: C.chartWarn, width: 1.5 } });
  }
  s.addText("Spec máx", {
    x: axL + 0.2, y: specY - 0.35, w: 1.2, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.chartWarn, bold: true, align: "left",
  });

  // Data points (simulated degradation)
  const points = [];
  const nPts = 8;
  for (let i = 0; i < nPts; i++) {
    const xp = axL + 0.3 + (i / (nPts - 1)) * (axR - axL - 0.6);
    // logistic curve simulation
    const t = i / (nPts - 1);
    const val = 0.15 + 0.7 / (1 + Math.exp(-8 * (t - 0.55)));
    const yp = axB - val * (axB - axT - 0.3);
    points.push({ x: xp, y: yp });
  }
  // Plot lines between points (curve)
  for (let i = 0; i < points.length - 1; i++) {
    s.addShape("line", {
      x: points[i].x, y: points[i].y,
      w: points[i + 1].x - points[i].x,
      h: points[i + 1].y - points[i].y,
      line: { color: C.chartLine, width: 3 },
    });
  }
  // Points
  points.forEach((p) => {
    s.addShape("ellipse", {
      x: p.x - 0.1, y: p.y - 0.1, w: 0.2, h: 0.2,
      fill: { color: C.chartLine }, line: { color: "FFFFFF", width: 1.5 },
    });
  });

  // Projection segment (lighter, after last point)
  const lastP = points[points.length - 1];
  const projEnd = { x: axR - 0.1, y: specY };
  for (let xd = lastP.x; xd < projEnd.x; xd += 0.18) {
    const t = (xd - lastP.x) / (projEnd.x - lastP.x);
    const yd = lastP.y + t * (projEnd.y - lastP.y);
    s.addShape("line", { x: xd, y: yd, w: 0.09, h: 0, line: { color: C.chartLine, width: 2 } });
  }
  // Cross marker
  s.addShape("ellipse", {
    x: projEnd.x - 0.15, y: projEnd.y - 0.15, w: 0.3, h: 0.3,
    fill: { color: C.chartWarn }, line: { color: "FFFFFF", width: 2 },
  });
  s.addText("shelf life estimado", {
    x: projEnd.x - 2.6, y: projEnd.y + 0.1, w: 2.4, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.chartWarn, bold: true, align: "right",
  });

  // Axis labels
  s.addText("tempo (meses)", {
    x: axL, y: axB + 0.1, w: axR - axL, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.textMuted, align: "center",
  });
  s.addText("valor", {
    x: chartX + 0.15, y: axT + (axB - axT) / 2 - 0.15, w: 0.6, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.textMuted, align: "left",
  });

  // Right side: models
  const rx = 10.0, ry = 3.2;
  s.addText("4 modelos candidatos", {
    x: rx, y: ry, w: 9.0, h: 0.5,
    fontFace: F.header, fontSize: 22, bold: true, color: C.text,
  });
  s.addText("Seleção automática pelo maior adj-R² (desempate por menor AIC).", {
    x: rx, y: ry + 0.6, w: 9.0, h: 0.4,
    fontFace: F.body, fontSize: 13, color: C.textMuted,
  });

  const models = [
    { c: C.chartLine, n: "Linear", f: "y = a + b·t", d: "Degradação constante" },
    { c: C.chartSecondary, n: "Exponencial", f: "y = a·exp(b·t)", d: "Decaimento proporcional" },
    { c: C.chartOk, n: "Logístico", f: "y = L/(1 + e^(-k(t−t₀)))", d: "Platô e transição" },
    { c: "8A93A0", n: "Média", f: "y = média(y)", d: "Ensaios estáveis" },
  ];
  models.forEach((m, i) => {
    const y = ry + 1.25 + i * 1.05;
    s.addShape("roundRect", {
      x: rx, y, w: 9.0, h: 0.9,
      fill: { color: "FFFFFF" }, line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.08,
    });
    s.addShape("rect", {
      x: rx, y, w: 0.15, h: 0.9,
      fill: { color: m.c }, line: { type: "none" },
    });
    s.addText(m.n, {
      x: rx + 0.35, y: y + 0.1, w: 2.0, h: 0.35,
      fontFace: F.header, fontSize: 15, bold: true, color: C.text,
    });
    s.addText(m.f, {
      x: rx + 0.35, y: y + 0.45, w: 3.5, h: 0.35,
      fontFace: "Consolas", fontSize: 12, color: C.accentBlueDeep,
    });
    s.addText(m.d, {
      x: rx + 4.0, y: y + 0.28, w: 4.8, h: 0.4,
      fontFace: F.body, fontSize: 12, color: C.textMuted, align: "right",
    });
  });

  s.addText("+ Detecção de outliers por Z-score de resíduos   ·   Intervalo de confiança sigma na projeção", {
    x: rx, y: ry + 5.6, w: 9.0, h: 0.4,
    fontFace: F.body, fontSize: 11, color: C.textMuted,
  });
}

// =================================================================
// SLIDE 6 — PLATAFORMA — ARQUITETURA
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Plataforma", "Da análise ao produto");

  s.addText(
    "Toda a metodologia encapsulada em uma aplicação web segura, multi-usuário e extensível.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 18, color: C.textMuted,
    }
  );

  // Arquitetura: 3 camadas + Supabase
  const ax = 1.5, ay = 4.0;
  const blockW = 5.0, blockH = 4.5, gap = 0.6;

  // Frontend
  s.addShape("roundRect", {
    x: ax, y: ay, w: blockW, h: blockH,
    fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1.5 },
    rectRadius: 0.12,
  });
  s.addShape("rect", {
    x: ax, y: ay, w: blockW, h: 0.3,
    fill: { color: C.accentBlue }, line: { type: "none" },
  });
  s.addText("FRONTEND", {
    x: ax + 0.4, y: ay + 0.5, w: blockW - 0.8, h: 0.4,
    fontFace: F.body, fontSize: 12, bold: true, color: C.accentBlueDeep, charSpacing: 4,
  });
  s.addText("Next.js 16 · React 19", {
    x: ax + 0.4, y: ay + 1.0, w: blockW - 0.8, h: 0.5,
    fontFace: F.header, fontSize: 22, bold: true, color: C.text,
  });
  [
    "Dashboard multi-modo de ensaios",
    "Análise de shelf life interativa",
    "Galeria de relatórios",
    "Admin + gestão de usuários",
    "Session tracking de uso",
  ].forEach((t, i) => {
    s.addShape("ellipse", { x: ax + 0.45, y: ay + 1.95 + i * 0.45, w: 0.12, h: 0.12, fill: { color: C.accentBlueDeep }, line: { type: "none" } });
    s.addText(t, { x: ax + 0.7, y: ay + 1.85 + i * 0.45, w: blockW - 1.0, h: 0.4, fontFace: F.body, fontSize: 13, color: C.text });
  });

  // Backend
  const bx = ax + blockW + gap;
  s.addShape("roundRect", {
    x: bx, y: ay, w: blockW, h: blockH,
    fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1.5 },
    rectRadius: 0.12,
  });
  s.addShape("rect", {
    x: bx, y: ay, w: blockW, h: 0.3,
    fill: { color: C.accentBlueDeep }, line: { type: "none" },
  });
  s.addText("BACKEND", {
    x: bx + 0.4, y: ay + 0.5, w: blockW - 0.8, h: 0.4,
    fontFace: F.body, fontSize: 12, bold: true, color: C.accentBlueDeep, charSpacing: 4,
  });
  s.addText("FastAPI · Python 3.12", {
    x: bx + 0.4, y: ay + 1.0, w: blockW - 0.8, h: 0.5,
    fontFace: F.header, fontSize: 22, bold: true, color: C.text,
  });
  [
    "Fitting de 4 modelos (NumPy/SciPy)",
    "Seleção automática (adj-R² + AIC)",
    "Detecção de outliers",
    "Cálculo de shelf life",
    "API REST documentada",
  ].forEach((t, i) => {
    s.addShape("ellipse", { x: bx + 0.45, y: ay + 1.95 + i * 0.45, w: 0.12, h: 0.12, fill: { color: C.accentBlueDeep }, line: { type: "none" } });
    s.addText(t, { x: bx + 0.7, y: ay + 1.85 + i * 0.45, w: blockW - 1.0, h: 0.4, fontFace: F.body, fontSize: 13, color: C.text });
  });

  // Supabase
  const cx = bx + blockW + gap;
  s.addShape("roundRect", {
    x: cx, y: ay, w: blockW, h: blockH,
    fill: { color: C.dark }, line: { type: "none" },
    rectRadius: 0.12,
  });
  s.addShape("rect", {
    x: cx, y: ay, w: blockW, h: 0.3,
    fill: { color: C.accentBlue }, line: { type: "none" },
  });
  s.addText("DADOS & AUTH", {
    x: cx + 0.4, y: ay + 0.5, w: blockW - 0.8, h: 0.4,
    fontFace: F.body, fontSize: 12, bold: true, color: C.accentBlue, charSpacing: 4,
  });
  s.addText("Supabase · PostgreSQL", {
    x: cx + 0.4, y: ay + 1.0, w: blockW - 0.8, h: 0.5,
    fontFace: F.header, fontSize: 22, bold: true, color: "FFFFFF",
  });
  [
    "Persistência dos ensaios",
    "Autenticação + roles",
    "Convites por link",
    "Tracking de eventos",
    "Row-level security",
  ].forEach((t, i) => {
    s.addShape("ellipse", { x: cx + 0.45, y: ay + 1.95 + i * 0.45, w: 0.12, h: 0.12, fill: { color: C.accentBlue }, line: { type: "none" } });
    s.addText(t, { x: cx + 0.7, y: ay + 1.85 + i * 0.45, w: blockW - 1.0, h: 0.4, fontFace: F.body, fontSize: 13, color: "FFFFFF" });
  });

  // Chevrons (setas) nos gaps entre cards, abaixo dos blocos
  [ax + blockW + gap / 2 - 0.15, bx + blockW + gap / 2 - 0.15].forEach((gx) => {
    const gy = ay + blockH / 2 - 0.15;
    s.addShape("chevron", {
      x: gx, y: gy, w: 0.3, h: 0.3,
      fill: { color: C.accentBlueDeep }, line: { type: "none" },
    });
  });

  s.addText("Orquestrado em Docker Compose  ·  Deploy cloud-ready", {
    x: 0.8, y: 9.4, w: 18.4, h: 0.5,
    fontFace: F.body, fontSize: 14, color: C.textMuted, align: "center",
  });
}

// =================================================================
// SLIDE 7 — PLATAFORMA — DASHBOARD DE ENSAIOS (mockup)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Dashboard de ensaios", "Plataforma · módulo 1");

  s.addText(
    "Exploração temporal dos ensaios por produto ou família, com filtros dinâmicos e visualizações comparativas.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 16, color: C.textMuted,
    }
  );

  // Mockup container (browser frame)
  const mx = 0.8, my = 3.8, mw = 15.5, mh = 6.3;
  s.addShape("roundRect", {
    x: mx, y: my, w: mw, h: mh,
    fill: { color: C.dark }, line: { type: "none" }, rectRadius: 0.12,
  });
  // Browser top bar
  s.addShape("rect", { x: mx, y: my, w: mw, h: 0.45, fill: { color: "1F2428" }, line: { type: "none" } });
  ["F77272", "F7D072", "78C97A"].forEach((c, i) => {
    s.addShape("ellipse", { x: mx + 0.2 + i * 0.3, y: my + 0.13, w: 0.2, h: 0.2, fill: { color: c }, line: { type: "none" } });
  });
  s.addText("dobslit.indorama.com/dashboard", {
    x: mx + 1.4, y: my + 0.1, w: 6.0, h: 0.3,
    fontFace: F.body, fontSize: 10, color: "8A93A0",
  });

  // Tab bar
  s.addShape("rect", { x: mx, y: my + 0.45, w: mw, h: 0.6, fill: { color: "1A1E22" }, line: { type: "none" } });
  s.addText("Ensaios", {
    x: mx + 0.3, y: my + 0.52, w: 1.5, h: 0.45,
    fontFace: F.header, fontSize: 13, bold: true, color: C.accentBlue,
  });
  s.addShape("rect", { x: mx + 0.3, y: my + 0.97, w: 1.1, h: 0.05, fill: { color: C.accentBlue }, line: { type: "none" } });
  s.addText("Análise", {
    x: mx + 1.9, y: my + 0.52, w: 1.5, h: 0.45,
    fontFace: F.header, fontSize: 13, color: "8A93A0",
  });

  // Sidebar filtros
  const sbX = mx + 0.2, sbY = my + 1.25, sbW = 3.2, sbH = mh - 1.45;
  s.addShape("roundRect", { x: sbX, y: sbY, w: sbW, h: sbH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });
  s.addText("FILTROS", {
    x: sbX + 0.2, y: sbY + 0.2, w: sbW - 0.4, h: 0.3,
    fontFace: F.body, fontSize: 10, bold: true, color: "8A93A0", charSpacing: 4,
  });
  const filtros = [
    { l: "Modo", v: "Longa duração", active: true },
    { l: "Família", v: "Surfom CS", active: false },
    { l: "Produto", v: "(todos)", active: false },
    { l: "Ensaio", v: "Cor APHA", active: false },
  ];
  filtros.forEach((f, i) => {
    const fy = sbY + 0.7 + i * 0.85;
    s.addText(f.l, { x: sbX + 0.2, y: fy, w: sbW - 0.4, h: 0.3, fontFace: F.body, fontSize: 10, color: "8A93A0" });
    s.addShape("roundRect", {
      x: sbX + 0.2, y: fy + 0.3, w: sbW - 0.4, h: 0.4,
      fill: { color: f.active ? C.accentBlueDeep : "262B30" }, line: { type: "none" }, rectRadius: 0.05,
    });
    s.addText(f.v, { x: sbX + 0.35, y: fy + 0.32, w: sbW - 0.5, h: 0.35, fontFace: F.body, fontSize: 12, bold: true, color: "FFFFFF" });
  });

  // Chart panel
  const cpX = sbX + sbW + 0.2, cpY = sbY, cpW = mw - sbW - 0.6, cpH = sbH;
  s.addShape("roundRect", { x: cpX, y: cpY, w: cpW, h: cpH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });
  s.addText("Cor APHA — Longa Duração", {
    x: cpX + 0.3, y: cpY + 0.2, w: cpW - 0.6, h: 0.4,
    fontFace: F.header, fontSize: 16, bold: true, color: "FFFFFF",
  });
  s.addText("5 produtos · família Surfom CS · overlay média", {
    x: cpX + 0.3, y: cpY + 0.65, w: cpW - 0.6, h: 0.3,
    fontFace: F.body, fontSize: 11, color: "8A93A0",
  });

  // Mini chart inside
  const chX = cpX + 0.6, chY = cpY + 1.3, chW = cpW - 1.2, chH = cpH - 1.8;
  s.addShape("line", { x: chX, y: chY + chH, w: chW, h: 0, line: { color: "3A4248", width: 1 } });
  s.addShape("line", { x: chX, y: chY, w: 0, h: chH, line: { color: "3A4248", width: 1 } });
  // Gridlines
  for (let g = 1; g <= 3; g++) {
    s.addShape("line", { x: chX, y: chY + (chH / 4) * g, w: chW, h: 0, line: { color: "262B30", width: 0.5 } });
  }

  // 5 product lines
  const lineColors = ["4F8EFB", "F59E0B", "10B981", "EC4899", "A78BFA"];
  lineColors.forEach((col, li) => {
    const pts = [];
    for (let i = 0; i < 9; i++) {
      const xp = chX + (i / 8) * chW;
      const base = 0.15 + li * 0.05;
      const t = i / 8;
      const val = base + t * (0.5 + li * 0.08) + (Math.sin(i + li) * 0.04);
      const yp = chY + chH - val * chH;
      pts.push({ x: xp, y: yp });
    }
    for (let i = 0; i < pts.length - 1; i++) {
      s.addShape("line", {
        x: pts[i].x, y: pts[i].y,
        w: pts[i + 1].x - pts[i].x, h: pts[i + 1].y - pts[i].y,
        line: { color: col, width: 2 },
      });
    }
  });
  // Average line (thicker, white)
  const avgPts = [];
  for (let i = 0; i < 9; i++) {
    const xp = chX + (i / 8) * chW;
    const t = i / 8;
    const val = 0.2 + t * 0.55;
    avgPts.push({ x: xp, y: chY + chH - val * chH });
  }
  for (let i = 0; i < avgPts.length - 1; i++) {
    s.addShape("line", {
      x: avgPts[i].x, y: avgPts[i].y,
      w: avgPts[i + 1].x - avgPts[i].x, h: avgPts[i + 1].y - avgPts[i].y,
      line: { color: "FFFFFF", width: 3 },
    });
  }
  // Legenda da média — fixa no canto TOP-LEFT do painel, fora da área das linhas
  s.addShape("rect", {
    x: cpX + 0.3, y: cpY + 1.0, w: 0.25, h: 0.04,
    fill: { color: "FFFFFF" }, line: { type: "none" },
  });
  s.addText("média da família", {
    x: cpX + 0.6, y: cpY + 0.88, w: 2.2, h: 0.28,
    fontFace: F.body, fontSize: 10, color: "FFFFFF",
  });
}

// =================================================================
// SLIDE 8 — PLATAFORMA — ANÁLISE / BEST-FIT (mockup)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Análise de shelf life", "Plataforma · módulo 2");

  s.addText(
    "Ajuste automático, comparação de modelos, projeção e cálculo de shelf life com detecção de outliers.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 16, color: C.textMuted,
    }
  );

  // Split: chart left, metrics right
  const mx = 0.8, my = 3.8, mw = 15.5, mh = 6.3;
  s.addShape("roundRect", {
    x: mx, y: my, w: mw, h: mh, fill: { color: C.dark }, line: { type: "none" }, rectRadius: 0.12,
  });

  // Left: chart
  const chX = mx + 0.5, chY = my + 0.6, chW = 9.5, chH = mh - 1.2;
  s.addShape("roundRect", { x: chX, y: chY, w: chW, h: chH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });
  s.addText("Viscosidade dinâmica — Produto SURFOM CS 8216", {
    x: chX + 0.3, y: chY + 0.25, w: chW - 0.6, h: 0.4,
    fontFace: F.header, fontSize: 15, bold: true, color: "FFFFFF",
  });
  s.addText("Modelo selecionado: Logístico · adj-R² = 0.94 · shelf life estimado: 28.3 meses", {
    x: chX + 0.3, y: chY + 0.7, w: chW - 0.6, h: 0.3,
    fontFace: F.body, fontSize: 11, color: C.accentBlue,
  });

  // Plot area
  const pX = chX + 0.6, pY = chY + 1.4, pW = chW - 1.2, pH = chH - 2.0;
  s.addShape("line", { x: pX, y: pY + pH, w: pW, h: 0, line: { color: "3A4248", width: 1 } });
  s.addShape("line", { x: pX, y: pY, w: 0, h: pH, line: { color: "3A4248", width: 1 } });

  // Spec line dashed
  const specY = pY + 0.5;
  for (let xd = pX; xd < pX + pW; xd += 0.18) {
    s.addShape("line", { x: xd, y: specY, w: 0.1, h: 0, line: { color: C.chartWarn, width: 1.5 } });
  }
  s.addText("Spec máx", {
    x: pX + 0.15, y: specY - 0.35, w: 1.4, h: 0.3,
    fontFace: F.body, fontSize: 9, bold: true, color: C.chartWarn, align: "left",
  });

  // Points + logistic curve fit
  const nP = 8;
  const pts = [];
  for (let i = 0; i < nP; i++) {
    const xp = pX + 0.3 + (i / (nP - 1)) * (pW * 0.5);
    const t = i / (nP - 1);
    const val = 0.15 + 0.6 / (1 + Math.exp(-6 * (t - 0.5))) + (Math.random() - 0.5) * 0.03;
    const yp = pY + pH - val * pH;
    pts.push({ x: xp, y: yp, outlier: i === 3 });
  }
  // Fit curve (smooth)
  const fitPts = [];
  const fitEndX = pX + pW - 0.3;
  const nFit = 40;
  for (let i = 0; i < nFit; i++) {
    const t = i / (nFit - 1);
    const xp = pX + 0.3 + t * (fitEndX - pX - 0.3);
    const normT = t * 1.2;
    const val = 0.15 + 0.75 / (1 + Math.exp(-5 * (normT - 0.6)));
    fitPts.push({ x: xp, y: pY + pH - val * pH });
  }
  // Projection split
  const projStartIdx = Math.floor(nFit * 0.5);
  for (let i = 0; i < fitPts.length - 1; i++) {
    const isProj = i >= projStartIdx;
    if (isProj) {
      // dashed
      for (let d = 0; d < 1; d += 0.3) {
        const x1 = fitPts[i].x + d * (fitPts[i + 1].x - fitPts[i].x);
        const y1 = fitPts[i].y + d * (fitPts[i + 1].y - fitPts[i].y);
        const x2 = fitPts[i].x + Math.min(d + 0.15, 1) * (fitPts[i + 1].x - fitPts[i].x);
        const y2 = fitPts[i].y + Math.min(d + 0.15, 1) * (fitPts[i + 1].y - fitPts[i].y);
        s.addShape("line", { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: C.accentBlue, width: 2.5 } });
      }
    } else {
      s.addShape("line", {
        x: fitPts[i].x, y: fitPts[i].y,
        w: fitPts[i + 1].x - fitPts[i].x, h: fitPts[i + 1].y - fitPts[i].y,
        line: { color: C.accentBlue, width: 3 },
      });
    }
  }
  // Points
  pts.forEach((p) => {
    s.addShape("ellipse", {
      x: p.x - 0.1, y: p.y - 0.1, w: 0.2, h: 0.2,
      fill: { color: p.outlier ? C.chartWarn : C.accentBlue }, line: { color: "FFFFFF", width: 1.5 },
    });
  });
  // Crossing point
  const crossX = pX + pW - 0.5;
  s.addShape("ellipse", {
    x: crossX - 0.18, y: specY - 0.18, w: 0.36, h: 0.36,
    fill: { color: C.chartWarn }, line: { color: "FFFFFF", width: 2 },
  });
  s.addText("28.3m", {
    x: crossX - 1.2, y: specY + 0.25, w: 1.1, h: 0.3,
    fontFace: F.header, fontSize: 11, bold: true, color: C.chartWarn, align: "right",
  });
  // Linha vertical pontilhada do ponto de cruzamento até o eixo x
  for (let yv = specY + 0.2; yv < pY + pH - 0.1; yv += 0.12) {
    s.addShape("line", {
      x: crossX, y: yv, w: 0, h: 0.06, line: { color: C.chartWarn, width: 1 },
    });
  }

  // Right: results panel
  const rX = chX + chW + 0.3, rY = my + 0.6, rW = mw - (chX + chW + 0.3 - mx) - 0.4, rH = mh - 1.2;
  s.addShape("roundRect", { x: rX, y: rY, w: rW, h: rH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });

  s.addText("Comparação de modelos", {
    x: rX + 0.3, y: rY + 0.25, w: rW - 0.6, h: 0.4,
    fontFace: F.header, fontSize: 15, bold: true, color: "FFFFFF",
  });

  const comps = [
    { n: "Logístico", r2: "0.94", best: true },
    { n: "Exponencial", r2: "0.89", best: false },
    { n: "Linear", r2: "0.78", best: false },
    { n: "Média", r2: "—", best: false },
  ];
  comps.forEach((c, i) => {
    const cy = rY + 0.85 + i * 0.7;
    s.addShape("roundRect", {
      x: rX + 0.3, y: cy, w: rW - 0.6, h: 0.55,
      fill: { color: c.best ? C.accentBlueDeep : "262B30" }, line: { type: "none" }, rectRadius: 0.05,
    });
    s.addText(c.n, { x: rX + 0.5, y: cy + 0.13, w: 2.5, h: 0.3, fontFace: F.header, fontSize: 13, bold: true, color: "FFFFFF" });
    s.addText(`adj-R² ${c.r2}`, { x: rX + rW - 2.0, y: cy + 0.13, w: 1.6, h: 0.3, fontFace: F.body, fontSize: 12, color: c.best ? "FFFFFF" : "8A93A0", align: "right" });
  });

  // Shelf life callout
  const slY = rY + 4.2;
  s.addShape("roundRect", {
    x: rX + 0.3, y: slY, w: rW - 0.6, h: 1.8,
    fill: { color: "262B30" }, line: { color: C.chartWarn, width: 2 }, rectRadius: 0.08,
  });
  s.addText("SHELF LIFE", {
    x: rX + 0.5, y: slY + 0.15, w: rW - 1.0, h: 0.3,
    fontFace: F.body, fontSize: 10, bold: true, color: C.chartWarn, charSpacing: 4,
  });
  s.addText("28.3 meses", {
    x: rX + 0.5, y: slY + 0.5, w: rW - 1.0, h: 0.7,
    fontFace: F.header, fontSize: 28, bold: true, color: "FFFFFF",
  });
  s.addText("± 1.2m  ·  modo: one-sided máx", {
    x: rX + 0.5, y: slY + 1.25, w: rW - 1.0, h: 0.3,
    fontFace: F.body, fontSize: 10, color: "8A93A0",
  });
}

// =================================================================
// SLIDE 9 — PLATAFORMA — RELATÓRIO INTERATIVO (mockup)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Relatório interativo", "Plataforma · módulo 3");

  s.addText(
    "Importância de ensaios navegável: filtros de cenário e modelo, rankings por família, heatmaps e análises temáticas.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 16, color: C.textMuted,
    }
  );

  // Layout: filtros globais top + 2 colunas de conteúdo
  const mx = 0.8, my = 3.8, mw = 15.5, mh = 6.3;
  s.addShape("roundRect", { x: mx, y: my, w: mw, h: mh, fill: { color: C.dark }, line: { type: "none" }, rectRadius: 0.12 });

  // Top filter bar
  s.addShape("rect", { x: mx, y: my, w: mw, h: 1.0, fill: { color: "1F2428" }, line: { type: "none" } });
  s.addText("FILTROS GLOBAIS", {
    x: mx + 0.3, y: my + 0.2, w: 3.0, h: 0.3,
    fontFace: F.body, fontSize: 10, bold: true, color: "8A93A0", charSpacing: 4,
  });
  // Filter pills
  const pills = [
    { l: "Cenário", v: "Longa duração", active: true },
    { l: "Modelo", v: "XGBoost", active: true },
    { l: "Família", v: "(todas)", active: false },
  ];
  pills.forEach((p, i) => {
    const px = mx + 0.3 + i * 3.8;
    const py = my + 0.55;
    s.addText(p.l, { x: px, y: py - 0.05, w: 1.0, h: 0.3, fontFace: F.body, fontSize: 10, color: "8A93A0" });
    s.addShape("roundRect", {
      x: px + 1.0, y: py - 0.05, w: 2.6, h: 0.4,
      fill: { color: p.active ? C.accentBlueDeep : "262B30" }, line: { type: "none" }, rectRadius: 0.2,
    });
    s.addText(p.v, { x: px + 1.15, y: py - 0.03, w: 2.4, h: 0.38, fontFace: F.body, fontSize: 11, bold: true, color: "FFFFFF" });
  });

  // Left panel: ranking
  const lX = mx + 0.3, lY = my + 1.2, lW = 7.3, lH = mh - 1.4;
  s.addShape("roundRect", { x: lX, y: lY, w: lW, h: lH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });
  s.addText("Top ensaios críticos", {
    x: lX + 0.3, y: lY + 0.2, w: lW - 0.6, h: 0.4,
    fontFace: F.header, fontSize: 15, bold: true, color: "FFFFFF",
  });
  s.addText("Família Surfom CS · Longa duração · XGBoost", {
    x: lX + 0.3, y: lY + 0.65, w: lW - 0.6, h: 0.3,
    fontFace: F.body, fontSize: 10, color: "8A93A0",
  });

  const rankings = [
    { n: "Cor APHA", v: 0.42 },
    { n: "Índice de Hidroxila", v: 0.28 },
    { n: "Viscosidade dinâmica", v: 0.19 },
    { n: "Índice de Acidez", v: 0.14 },
    { n: "Índice de Peróxido", v: 0.11 },
    { n: "Teor de água", v: 0.07 },
  ];
  rankings.forEach((r, i) => {
    const ry = lY + 1.2 + i * 0.6;
    s.addText(`${i + 1}`, { x: lX + 0.3, y: ry + 0.1, w: 0.5, h: 0.35, fontFace: F.header, fontSize: 16, bold: true, color: C.accentBlue, align: "center" });
    s.addText(r.n, { x: lX + 0.85, y: ry + 0.1, w: 3.0, h: 0.35, fontFace: F.body, fontSize: 12, bold: true, color: "FFFFFF" });
    // Bar
    const barX = lX + 3.9, barY = ry + 0.18, barW = lW - 4.5, barH = 0.22;
    s.addShape("roundRect", { x: barX, y: barY, w: barW, h: barH, fill: { color: "262B30" }, line: { type: "none" }, rectRadius: 0.03 });
    s.addShape("roundRect", {
      x: barX, y: barY, w: barW * r.v / 0.42, h: barH,
      fill: { color: C.accentBlue }, line: { type: "none" }, rectRadius: 0.03,
    });
    s.addText(r.v.toFixed(2), { x: barX + barW - 0.6, y: ry + 0.1, w: 0.6, h: 0.35, fontFace: F.body, fontSize: 11, bold: true, color: "FFFFFF", align: "right" });
  });

  // Right panel: heatmap preview
  const rX = lX + lW + 0.3, rY = lY, rW = mw - (rX - mx) - 0.3, rH = lH;
  s.addShape("roundRect", { x: rX, y: rY, w: rW, h: rH, fill: { color: "1A1E22" }, line: { type: "none" }, rectRadius: 0.08 });
  s.addText("Heatmap comparativo", {
    x: rX + 0.3, y: rY + 0.2, w: rW - 0.6, h: 0.4,
    fontFace: F.header, fontSize: 15, bold: true, color: "FFFFFF",
  });
  s.addText("Ensaios × famílias · importância normalizada", {
    x: rX + 0.3, y: rY + 0.65, w: rW - 0.6, h: 0.3,
    fontFace: F.body, fontSize: 10, color: "8A93A0",
  });

  // Heatmap grid
  const hX = rX + 1.3, hY = rY + 1.4;
  const cellW = 0.78, cellH = 0.48;
  const families = ["Fam A", "Fam B", "Fam C", "Fam D", "Fam E", "Fam F"];
  const ensaios = ["Cor", "OH", "Visc", "Acid", "Perox", "H₂O"];

  // Col headers
  ensaios.forEach((e, i) => {
    s.addText(e, { x: hX + i * cellW, y: hY - 0.45, w: cellW, h: 0.35, fontFace: F.body, fontSize: 9, color: "8A93A0", align: "center" });
  });
  // Row headers + cells
  families.forEach((f, ri) => {
    s.addText(f, { x: hX - 1.15, y: hY + ri * cellH + 0.05, w: 1.0, h: 0.35, fontFace: F.body, fontSize: 10, color: "FFFFFF", align: "right" });
    ensaios.forEach((e, ci) => {
      // Intensity simulated
      const v = Math.abs(Math.sin((ri + 1) * (ci + 1))) * 0.9 + 0.05;
      // Color ramp: dark → accentBlue
      const r = Math.round(0x1A + v * (0x1D - 0x1A));
      const g = Math.round(0x1E + v * (0xA1 - 0x1E));
      const b = Math.round(0x22 + v * (0xF2 - 0x22));
      const col = [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
      s.addShape("rect", {
        x: hX + ci * cellW + 0.03, y: hY + ri * cellH + 0.03, w: cellW - 0.06, h: cellH - 0.06,
        fill: { color: col }, line: { type: "none" },
      });
      if (v > 0.7) {
        s.addText(v.toFixed(1), {
          x: hX + ci * cellW, y: hY + ri * cellH + 0.05, w: cellW, h: cellH - 0.1,
          fontFace: F.body, fontSize: 9, bold: true, color: "FFFFFF", align: "center",
        });
      }
    });
  });

  // Legend
  s.addText("baixa", { x: hX, y: hY + 6 * cellH + 0.15, w: 0.6, h: 0.25, fontFace: F.body, fontSize: 9, color: "8A93A0" });
  s.addText("alta", { x: hX + 6 * cellW - 0.4, y: hY + 6 * cellH + 0.15, w: 0.4, h: 0.25, fontFace: F.body, fontSize: 9, color: "8A93A0", align: "right" });
  // Gradient bar (simulated with segments)
  for (let gi = 0; gi < 20; gi++) {
    const t = gi / 19;
    const r = Math.round(0x1A + t * (0x1D - 0x1A));
    const g = Math.round(0x1E + t * (0xA1 - 0x1E));
    const b = Math.round(0x22 + t * (0xF2 - 0x22));
    const col = [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
    s.addShape("rect", {
      x: hX + 0.5 + gi * 0.22, y: hY + 6 * cellH + 0.2, w: 0.22, h: 0.15,
      fill: { color: col }, line: { type: "none" },
    });
  }
}

// =================================================================
// SLIDE 10 — PRÓXIMAS FASES
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };
  addContentChrome(s);
  addTitle(s, "Próximas fases", "Evolução do projeto");

  s.addText(
    "Cinco frentes de evolução para elevar o sistema a um patamar preditivo robusto, explicável e estratégico.",
    {
      x: 0.8, y: 2.8, w: 15.5, h: 0.7,
      fontFace: F.body, fontSize: 18, color: C.textMuted,
    }
  );

  const phases = [
    { n: "01", t: "Linha de tendência não-linear", d: "Modelos além da regressão linear, com projeção e intervalo de confiança. Shelf life integrado combinando múltiplos ensaios." },
    { n: "02", t: "Clusterização de perfis", d: "K-Means · DBSCAN · hierárquico + UMAP. Subgrupos dentro de famílias e produtos anômalos. Modelos por cluster." },
    { n: "03", t: "Tipo de armazenamento", d: "Temperatura, umidade, luz e embalagem como feature do modelo. Reavalia rankings de importância por condição." },
    { n: "04", t: "Estrutura molecular (SMILES)", d: "Relação estrutura química × shelf life. Predição para novos produtos ainda não testados em laboratório." },
    { n: "05", t: "QML híbrido", d: "Quantum Feature Selection em pipeline clássico-quântico. Captura de relações não-lineares complexas." },
  ];

  // 2 rows: 3 + 2
  const topCount = 3;
  const topW = 5.05, topH = 2.8, gap = 0.2;
  phases.slice(0, topCount).forEach((p, i) => {
    const x = 0.8 + i * (topW + gap);
    const y = 3.8;
    s.addShape("roundRect", { x, y, w: topW, h: topH, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, rectRadius: 0.1 });
    s.addShape("rect", { x, y, w: 0.2, h: topH, fill: { color: C.accentBlueDeep }, line: { type: "none" } });
    s.addText(p.n, { x: x + 0.45, y: y + 0.3, w: 1.0, h: 0.5, fontFace: F.header, fontSize: 22, bold: true, color: C.accentBlueDeep });
    s.addText(p.t, { x: x + 0.45, y: y + 0.8, w: topW - 0.7, h: 0.8, fontFace: F.header, fontSize: 18, bold: true, color: C.text });
    s.addText(p.d, { x: x + 0.45, y: y + 1.65, w: topW - 0.7, h: topH - 1.75, fontFace: F.body, fontSize: 12, color: C.textMuted });
  });

  const botW = 7.65;
  const botTotal = 2 * botW + gap;
  const botStartX = (20.0 - botTotal) / 2; // centraliza linha de 2 cards
  phases.slice(topCount).forEach((p, i) => {
    const x = botStartX + i * (botW + gap);
    const y = 3.8 + topH + gap;
    s.addShape("roundRect", { x, y, w: botW, h: topH, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, rectRadius: 0.1 });
    s.addShape("rect", { x, y, w: 0.2, h: topH, fill: { color: C.accentBlue }, line: { type: "none" } });
    s.addText(p.n, { x: x + 0.45, y: y + 0.3, w: 1.0, h: 0.5, fontFace: F.header, fontSize: 22, bold: true, color: C.accentBlue });
    s.addText(p.t, { x: x + 0.45, y: y + 0.8, w: botW - 0.7, h: 0.8, fontFace: F.header, fontSize: 18, bold: true, color: C.text });
    s.addText(p.d, { x: x + 0.45, y: y + 1.65, w: botW - 0.7, h: topH - 1.75, fontFace: F.body, fontSize: 13, color: C.textMuted });
  });

  s.addText("Time multidisciplinar (3 pessoas)  ·  Duração estimada de 5 meses", {
    x: 0.8, y: 9.95, w: 18.4, h: 0.4,
    fontFace: F.body, fontSize: 13, bold: true, color: C.accentBlueDeep, align: "center",
  });
}

// =================================================================
// SLIDE 11 — ENCERRAMENTO
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.dark };
  addDarkChrome(s);

  s.addText("Obrigado", {
    x: 0.8, y: 3.2, w: 15.0, h: 2.2,
    fontFace: F.header, fontSize: 120, bold: true, color: "FFFFFF",
  });
  s.addText("ShelfLife — Análise e Linha de Tendência", {
    x: 0.8, y: 5.6, w: 15.0, h: 0.7,
    fontFace: F.header, fontSize: 28, color: C.accentBlue,
  });

  // Indorama em destaque (topo direito)
  s.addImage({ path: LOGO_INDORAMA, x: 14.0, y: 0.8, w: 5.0, h: 1.5 });

  // Bloco de próximos passos (centro-direito, separando dos cantos)
  s.addText("Próximos passos", {
    x: 4.0, y: 7.8, w: 12.0, h: 0.4,
    fontFace: F.body, fontSize: 14, color: C.accentBlue, bold: true, charSpacing: 6,
  });
  s.addText("Fase 2 · ShelfLife Next Level", {
    x: 4.0, y: 8.3, w: 12.0, h: 0.7,
    fontFace: F.header, fontSize: 32, bold: true, color: "FFFFFF",
  });
  s.addText("Vamos construir juntos.", {
    x: 4.0, y: 9.1, w: 12.0, h: 0.5,
    fontFace: F.body, fontSize: 16, color: "CADCFC",
  });

  // Dobslit assinatura no canto inferior-direito (logo branco sobre fundo escuro)
  s.addText("desenvolvido por", {
    x: 14.5, y: 10.1, w: 5.0, h: 0.3,
    fontFace: F.body, fontSize: 11, color: "8A93A0", align: "right",
  });
  s.addImage({ path: LOGO_DOBSLIT_WHITE, x: 17.0, y: 10.35, w: 2.4, h: 0.75 });
}

// ---------- save ----------
const outPath = path.resolve(
  "C:/Users/Administrador/Desktop/Git Dobslit/Indorama/Relatorios/Indorama - ShelfLife Entrega.pptx"
);
pres.writeFile({ fileName: outPath }).then((f) => {
  console.log("Saved:", f);
});
