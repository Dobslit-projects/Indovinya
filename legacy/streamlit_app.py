# -*- coding: utf-8 -*-
"""
Dashboard de Estabilidade - Indovinya
Interface moderna para análise de produtos
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from pathlib import Path

# ============================================================
# CONFIGURACAO DA PAGINA
# ============================================================

st.set_page_config(
    page_title="Estabilidade Indovinya",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS customizado - Design Indorama Ventures (Fundo Claro)
st.markdown("""
<style>
    /* Reset e base - Tema claro profissional */
    .stApp {
        background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    }

    /* Sidebar styling - Azul Indorama */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #003366 0%, #002244 100%);
        border-right: 3px solid #00a3e0;
    }

    [data-testid="stSidebar"] .stMarkdown {
        color: #ffffff;
    }

    [data-testid="stSidebar"] h1,
    [data-testid="stSidebar"] h2,
    [data-testid="stSidebar"] h3 {
        color: #ffffff !important;
    }

    /* Headers */
    h1, h2, h3 {
        color: #003366 !important;
        font-weight: 600 !important;
    }

    /* Main title styling */
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #003366 !important;
        -webkit-text-fill-color: #003366;
        margin-bottom: 0.3rem;
        letter-spacing: -0.02em;
    }

    .subtitle {
        color: #64748b;
        font-size: 1rem;
        font-weight: 400;
        margin-bottom: 1rem;
    }

    /* Logo container - fundo branco para contraste */
    .logo-container {
        background: #ffffff;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        display: inline-block;
    }

    /* Metric cards */
    .metric-container {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #003366;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        transition: all 0.3s ease;
    }

    .metric-container:hover {
        border-left-color: #00a3e0;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 51, 102, 0.12);
    }

    .metric-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #003366;
        line-height: 1.2;
    }

    .metric-label {
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 0.5rem;
    }

    .metric-delta {
        color: #00a651;
        font-size: 0.85rem;
        margin-top: 0.25rem;
    }

    .metric-delta.negative {
        color: #c8102e;
    }

    /* Cards de info na sidebar - compactos */
    .info-card {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.4rem;
    }

    .info-label {
        color: #94a3b8;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 0.1rem;
    }

    .info-value {
        color: #ffffff;
        font-size: 0.8rem;
        font-weight: 500;
    }

    /* Modo de visualização - Botões estilizados */
    .modo-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 0.5rem;
    }

    .modo-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 12px 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .modo-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }

    .modo-btn.active {
        background: linear-gradient(135deg, #00a3e0 0%, #0055a4 100%);
        border-color: #00a3e0;
        box-shadow: 0 4px 12px rgba(0, 163, 224, 0.3);
    }

    .modo-btn .icon {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 4px;
    }

    .modo-btn .label {
        font-size: 0.7rem;
        color: #ffffff;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .modo-btn .desc {
        font-size: 0.6rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
    }

    /* Disponibilidade de dados */
    .disp-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .disp-badge.ok {
        background: rgba(0, 166, 81, 0.2);
        color: #00a651;
        border: 1px solid rgba(0, 166, 81, 0.3);
    }

    .disp-badge.no {
        background: rgba(200, 16, 46, 0.2);
        color: #ff6b6b;
        border: 1px solid rgba(200, 16, 46, 0.3);
    }

    /* Sidebar mais compacta */
    [data-testid="stSidebar"] [data-testid="stVerticalBlock"] {
        gap: 0.5rem;
    }

    [data-testid="stSidebar"] hr {
        margin: 0.5rem 0;
    }

    [data-testid="stSidebar"] h3 {
        margin-bottom: 0.3rem;
        font-size: 0.95rem;
    }

    /* Tabs styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
        background: #ffffff;
        padding: 6px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }

    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border-radius: 8px;
        color: #64748b;
        padding: 12px 24px;
        font-weight: 500;
        border: none;
    }

    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #003366 0%, #0055a4 100%);
        color: white !important;
    }

    .stTabs [data-baseweb="tab"]:hover {
        color: #003366;
        background: #f1f5f9;
    }

    /* Selectbox styling */
    .stSelectbox > div > div {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        color: #1e293b;
    }

    .stSelectbox > div > div:hover {
        border-color: #00a3e0;
    }

    /* Radio buttons na sidebar */
    [data-testid="stSidebar"] .stRadio > div {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    [data-testid="stSidebar"] .stRadio label {
        color: #ffffff !important;
    }

    /* Tabela customizada */
    .custom-table {
        width: 100%;
        border-collapse: collapse;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .custom-table th {
        background: #003366;
        color: #ffffff;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        font-size: 0.85rem;
    }

    .custom-table td {
        padding: 10px 16px;
        border-bottom: 1px solid #e2e8f0;
        color: #1e293b;
        font-size: 0.9rem;
    }

    .custom-table tr:nth-child(even) {
        background: #f8fafc;
    }

    .custom-table tr:hover {
        background: #f1f5f9;
    }

    /* Textos na area principal - força cor escura */
    .stMainBlockContainer p,
    .stMainBlockContainer span,
    .stMainBlockContainer label,
    .stMainBlockContainer .stMarkdown,
    .stMainBlockContainer .stMarkdown p,
    [data-testid="stMainBlockContainer"] p,
    [data-testid="stMainBlockContainer"] label {
        color: #1e293b !important;
    }

    /* Headers h4 na area principal */
    .stMainBlockContainer h4,
    [data-testid="stMainBlockContainer"] h4 {
        color: #003366 !important;
    }

    /* Metric nativo do Streamlit */
    [data-testid="stMetric"] label,
    [data-testid="stMetric"] [data-testid="stMetricValue"],
    [data-testid="stMetric"] [data-testid="stMetricDelta"] {
        color: #003366 !important;
    }

    /* Alert/Info boxes */
    .stAlert {
        background: #f0f9ff;
        border: 1px solid #00a3e0;
        border-radius: 10px;
        color: #003366;
    }

    /* Divider */
    hr {
        border-color: #e2e8f0;
        margin: 1.5rem 0;
    }

    /* Section headers */
    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #003366;
    }

    .section-icon {
        font-size: 1.5rem;
    }

    .section-title {
        color: #003366;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
    }

    /* Status badges */
    .badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .badge-success {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
    }

    .badge-warning {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fcd34d;
    }

    .badge-danger {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
    }

    /* Plotly chart container */
    .js-plotly-plot {
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
        background: #003366;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #0055a4;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Product info card */
    .product-info {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #00a3e0;
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }

    .product-name {
        color: #003366;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    /* Spec info */
    .spec-info {
        background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
        border: 1px solid #86efac;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        color: #166534;
        font-weight: 600;
    }

    /* Sidebar logo com fundo branco - aplica na imagem diretamente */
    [data-testid="stSidebar"] [data-testid="stImage"] {
        background: #ffffff;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 0.5rem;
    }

    [data-testid="stSidebar"] [data-testid="stImage"] img {
        display: block;
        margin: 0 auto;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================
# CARREGAR DADOS
# ============================================================

@st.cache_data
def carregar_dados():
    """Carrega os dados tratados"""
    # Usa caminho relativo para funcionar no Streamlit Cloud
    base_path = Path(__file__).parent
    df_long = pd.read_excel(base_path / "dados_long.xlsx")
    df_acelerado = pd.read_excel(base_path / "dados_acelerado.xlsx")
    df_longa = pd.read_excel(base_path / "dados_longa_duracao.xlsx")
    return df_long, df_acelerado, df_longa

df_long, df_acelerado, df_longa = carregar_dados()

ORDEM_PERIODOS = {
    '0 dia': 0, '1 sem': 7, '2 sem': 14,
    '1m': 30, '2m': 60, '3m': 90, '4m': 120, '5m': 150, '6m': 180,
    '9m': 270, '12m': 365, '18m': 545, '24m': 730, '30m': 912, '36m': 1095
}

# ============================================================
# CONSTANTES E FUNÇÕES PARA NORMALIZAÇÃO
# ============================================================

# Fator de normalização: Acelerado x 4 = Longa Duração
FATOR_NORMALIZACAO = 4

# Modos de visualização disponíveis
MODOS_VISUALIZACAO = {
    'acelerado': {'label': '⚡ Somente Acelerado', 'icon': '⚡', 'cor': '#00a3e0'},
    'longa': {'label': '📅 Somente Longa Duração', 'icon': '📅', 'cor': '#00a651'},
    'comparar': {'label': '⚖️ Comparar', 'icon': '⚖️', 'cor': '#f59e0b'},
    'mesclar': {'label': '🔀 Mesclar', 'icon': '🔀', 'cor': '#8b5cf6'}
}

def normalizar_periodo_para_dias(periodo: str, tipo_estudo: str) -> int:
    """
    Converte período para dias equivalentes em Longa Duração.
    Acelerado: multiplica por FATOR_NORMALIZACAO (4)
    Exemplo: 3 meses acelerado = 12 meses longa duração
    """
    dias_base = ORDEM_PERIODOS.get(periodo, 0)

    if 'Acelerado' in tipo_estudo:
        return dias_base * FATOR_NORMALIZACAO
    return dias_base

def dias_para_label(dias: int) -> str:
    """Converte dias para label legível"""
    if dias == 0:
        return '0 dia'
    elif dias < 30:
        semanas = dias // 7
        return f'{semanas} sem' if semanas > 0 else f'{dias} dias'
    else:
        meses = dias // 30
        return f'{meses}m'

def get_produtos_disponiveis(df_acel, df_long):
    """Retorna dicionário com produtos disponíveis em cada dataset"""
    produtos_acel = set(df_acel['Nome do produto'].unique())
    produtos_long = set(df_long['Nome do produto'].unique())

    return {
        'somente_acelerado': produtos_acel - produtos_long,
        'somente_longa': produtos_long - produtos_acel,
        'ambos': produtos_acel & produtos_long,
        'todos': produtos_acel | produtos_long
    }

def preparar_dados_normalizados(df, tipo_estudo):
    """Adiciona coluna de período normalizado ao DataFrame"""
    df = df.copy()
    df['periodo_dias'] = df['periodo'].map(ORDEM_PERIODOS)
    df['periodo_normalizado'] = df.apply(
        lambda r: normalizar_periodo_para_dias(r['periodo'], tipo_estudo),
        axis=1
    )
    df['tipo_estudo_origem'] = tipo_estudo
    return df

# Cores do tema - Baseado na identidade visual Indorama Ventures
COLORS = {
    'primary': '#003366',      # Azul Indorama escuro
    'secondary': '#0055a4',    # Azul Indorama médio
    'accent': '#00a3e0',       # Azul Dobslit/Accent
    'success': '#00a651',      # Verde Indorama
    'warning': '#f59e0b',      # Amarelo alerta
    'danger': '#c8102e',       # Vermelho Indorama
    'bg_dark': '#0a1628',      # Fundo escuro azulado
    'bg_card': 'rgba(0, 51, 102, 0.3)',
    'text': '#e2e8f0',
    'text_muted': '#94a3b8',
    'border': 'rgba(0, 163, 224, 0.2)'
}

# ============================================================
# HEADER
# ============================================================

# Header com logo Indorama
col_logo, col_title = st.columns([1, 4])
with col_logo:
    st.image("Indorama_Ventures_Logo.png", width=180)
with col_title:
    st.markdown('<h1 class="main-title">Dashboard de Estabilidade</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Indovinya - Especialidades Quimicas</p>', unsafe_allow_html=True)

# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:
    # Logo Dobslit - CSS aplica fundo branco automaticamente
    st.image("LOGOMARCA_DOBSLIT.PNG", width=140)
    st.markdown("---")

    # Seletor de modo visual melhorado
    st.markdown("### 📊 Modo de Visualização")

    # Criar grid 2x2 de botões de modo usando columns
    col_m1, col_m2 = st.columns(2)

    with col_m1:
        if st.button("⚡\nAcelerado", key="btn_acel", use_container_width=True,
                    type="primary" if st.session_state.get('modo_viz', 'acelerado') == 'acelerado' else "secondary"):
            st.session_state['modo_viz'] = 'acelerado'
            st.rerun()

    with col_m2:
        if st.button("📅\nLonga", key="btn_longa", use_container_width=True,
                    type="primary" if st.session_state.get('modo_viz', 'acelerado') == 'longa' else "secondary"):
            st.session_state['modo_viz'] = 'longa'
            st.rerun()

    col_m3, col_m4 = st.columns(2)

    with col_m3:
        if st.button("⚖️\nComparar", key="btn_comp", use_container_width=True,
                    type="primary" if st.session_state.get('modo_viz', 'acelerado') == 'comparar' else "secondary"):
            st.session_state['modo_viz'] = 'comparar'
            st.rerun()

    with col_m4:
        if st.button("🔀\nMesclar", key="btn_mescl", use_container_width=True,
                    type="primary" if st.session_state.get('modo_viz', 'acelerado') == 'mesclar' else "secondary"):
            st.session_state['modo_viz'] = 'mesclar'
            st.rerun()

    # Obter modo atual
    modo_viz = st.session_state.get('modo_viz', 'acelerado')

    # Descrição do modo atual
    descricoes_modo = {
        'acelerado': '⚡ Visualizando apenas dados de estudo acelerado',
        'longa': '📅 Visualizando apenas dados de longa duração',
        'comparar': '⚖️ Comparando ambos os estudos (Acel ×4)',
        'mesclar': '🔀 Dados mesclados em série única'
    }
    st.caption(descricoes_modo[modo_viz])

    # Identificar produtos disponíveis em cada dataset
    produtos_info = get_produtos_disponiveis(df_acelerado, df_longa)

    # Definir lista de produtos baseado no modo
    if modo_viz == 'acelerado':
        produtos_disponiveis = sorted(df_acelerado['Nome do produto'].unique())
        emoji_tipo = "⚡"
    elif modo_viz == 'longa':
        produtos_disponiveis = sorted(df_longa['Nome do produto'].unique())
        emoji_tipo = "📅"
    else:  # comparar ou mesclar
        # Para comparar/mesclar, mostrar todos os produtos (união)
        produtos_disponiveis = sorted(produtos_info['todos'])
        emoji_tipo = MODOS_VISUALIZACAO[modo_viz]['icon']

    st.markdown("---")

    # Produto
    produto_selecionado = st.selectbox(
        "**🏭 Selecione o Produto**",
        produtos_disponiveis,
        index=0
    )

    # Verificar disponibilidade do produto em cada dataset
    produto_em_acelerado = produto_selecionado in set(df_acelerado['Nome do produto'].unique())
    produto_em_longa = produto_selecionado in set(df_longa['Nome do produto'].unique())

    # Mostrar indicador de disponibilidade para modos comparar/mesclar
    if modo_viz in ['comparar', 'mesclar']:
        st.markdown("**Dados disponíveis:**")
        col_disp1, col_disp2 = st.columns(2)
        with col_disp1:
            if produto_em_acelerado:
                st.markdown('<span class="disp-badge ok">⚡ Acel ✓</span>', unsafe_allow_html=True)
            else:
                st.markdown('<span class="disp-badge no">⚡ Acel ✗</span>', unsafe_allow_html=True)
        with col_disp2:
            if produto_em_longa:
                st.markdown('<span class="disp-badge ok">📅 Longa ✓</span>', unsafe_allow_html=True)
            else:
                st.markdown('<span class="disp-badge no">📅 Longa ✗</span>', unsafe_allow_html=True)

    # Preparar DataFrames baseado no modo
    if modo_viz == 'acelerado':
        df_produto = df_acelerado[df_acelerado['Nome do produto'] == produto_selecionado].copy()
        df_produto_acel = df_produto
        df_produto_long = pd.DataFrame()
    elif modo_viz == 'longa':
        df_produto = df_longa[df_longa['Nome do produto'] == produto_selecionado].copy()
        df_produto_acel = pd.DataFrame()
        df_produto_long = df_produto
    else:  # comparar ou mesclar
        df_produto_acel = df_acelerado[df_acelerado['Nome do produto'] == produto_selecionado].copy() if produto_em_acelerado else pd.DataFrame()
        df_produto_long = df_longa[df_longa['Nome do produto'] == produto_selecionado].copy() if produto_em_longa else pd.DataFrame()

        # Normalizar períodos
        if len(df_produto_acel) > 0:
            df_produto_acel = preparar_dados_normalizados(df_produto_acel, 'Acelerado')
        if len(df_produto_long) > 0:
            df_produto_long = preparar_dados_normalizados(df_produto_long, 'Longa Duração')

        # Para cálculos gerais, usar combinação
        if len(df_produto_acel) > 0 and len(df_produto_long) > 0:
            df_produto = pd.concat([df_produto_acel, df_produto_long], ignore_index=True)
        elif len(df_produto_acel) > 0:
            df_produto = df_produto_acel
        else:
            df_produto = df_produto_long

    # Info do produto
    st.markdown("---")
    st.markdown("### 📋 Informações")

    if len(df_produto) > 0:
        info = df_produto.iloc[0]

        info_items = [
            ("Descrição", info.get('Descrição química')),
            ("Família", info.get('Família de Produtos')),
            ("Etoxilação", info.get('Grau de Etoxilação')),
            ("Início", info.get('Data inicial do estudo'))
        ]

        for label, value in info_items:
            if pd.notna(value) and str(value).strip():
                st.markdown(f"""
                <div class="info-card">
                    <div class="info-label">{label}</div>
                    <div class="info-value">{value}</div>
                </div>
                """, unsafe_allow_html=True)

    # Legenda de normalização para modos comparar/mesclar
    if modo_viz in ['comparar', 'mesclar']:
        st.markdown("---")
        st.markdown("### 📐 Normalização")
        st.markdown("""
        <div class="info-card">
            <div class="info-label">Fator de Conversão</div>
            <div class="info-value">Acelerado × 4 = Longa</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("""
        <div class="info-card" style="font-size: 0.8rem;">
            <div class="info-label">Exemplo</div>
            <div class="info-value">3m Acel = 12m Longa</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================================
# METRICAS
# ============================================================

# Calcular conformidade
def calcular_conformidade(row):
    try:
        valor = float(row['valor'])
        spec_tipo = row['spec_tipo']
        spec_min = row['spec_min']
        spec_max = row['spec_max']

        if spec_tipo == 'RANGE' and pd.notna(spec_min) and pd.notna(spec_max):
            return spec_min <= valor <= spec_max
        elif spec_tipo == 'MAXIMO' and pd.notna(spec_max):
            return valor <= spec_max
        elif spec_tipo == 'MINIMO' and pd.notna(spec_min):
            return valor >= spec_min
        return None
    except:
        return None

df_produto['conforme'] = df_produto.apply(calcular_conformidade, axis=1)
total_ensaios = df_produto['ensaio_normalizado'].nunique()
total_periodos = df_produto['periodo'].nunique()
conformes = df_produto['conforme'].sum()
total_verificaveis = df_produto['conforme'].notna().sum()
pct_conforme = (conformes / total_verificaveis * 100) if total_verificaveis > 0 else 0
alertas = int(total_verificaveis - conformes)

# Métricas em cards
col1, col2, col3, col4 = st.columns(4)

metrics = [
    (col1, "📊", total_ensaios, "Ensaios", None),
    (col2, "📅", total_periodos, "Períodos", None),
    (col3, "✅", f"{pct_conforme:.0f}%", "Conformidade", f"{int(conformes)}/{int(total_verificaveis)}"),
    (col4, "⚠️", alertas, "Alertas", "fora da spec" if alertas > 0 else "tudo OK")
]

for col, icon, value, label, delta in metrics:
    with col:
        delta_class = "negative" if label == "Alertas" and alertas > 0 else ""
        delta_html = f'<div class="metric-delta {delta_class}">{delta}</div>' if delta else ""
        st.markdown(f"""
        <div class="metric-container">
            <div class="metric-value">{icon} {value}</div>
            <div class="metric-label">{label}</div>
            {delta_html}
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ============================================================
# ABAS POR CATEGORIA
# ============================================================

# Cores para cada tipo de estudo
COR_ACELERADO = '#00a3e0'  # Azul
COR_LONGA = '#00a651'      # Verde

def criar_grafico_simples(df, ensaio, tipo_estudo, spec_tipo, spec_min, spec_max):
    """
    Cria gráfico simples para um único tipo de estudo.
    Usado para modos 'acelerado' e 'longa', e também para os gráficos lado a lado em 'comparar'.
    """
    fig = go.Figure()

    cor = COR_ACELERADO if 'Acelerado' in tipo_estudo else COR_LONGA
    icone = '⚡' if 'Acelerado' in tipo_estudo else '📅'
    simbolo = 'circle' if 'Acelerado' in tipo_estudo else 'square'

    df_plot = df.copy()
    df_plot['valor_num'] = pd.to_numeric(df_plot['valor'], errors='coerce')
    df_plot = df_plot.dropna(subset=['valor_num'])
    df_plot['ordem'] = df_plot['periodo'].map(ORDEM_PERIODOS)
    df_plot = df_plot.sort_values('ordem')

    if len(df_plot) > 0:
        x_vals = df_plot['periodo'].tolist()

        # Área de especificação
        if spec_tipo == 'RANGE' and pd.notna(spec_min) and pd.notna(spec_max):
            fig.add_trace(go.Scatter(
                x=x_vals + x_vals[::-1],
                y=[spec_max]*len(x_vals) + [spec_min]*len(x_vals),
                fill='toself', fillcolor='rgba(16, 185, 129, 0.15)',
                line=dict(color='rgba(16, 185, 129, 0)'),
                name='Faixa OK', showlegend=True, hoverinfo='skip'
            ))
            fig.add_hline(y=spec_max, line_dash="dash", line_color="#10b981", line_width=1)
            fig.add_hline(y=spec_min, line_dash="dash", line_color="#10b981", line_width=1)
        elif spec_tipo == 'MAXIMO' and pd.notna(spec_max):
            fig.add_hline(y=spec_max, line_dash="dash", line_color="#ef4444", line_width=2,
                         annotation_text=f"Máx: {spec_max}", annotation_position="top right")
        elif spec_tipo == 'MINIMO' and pd.notna(spec_min):
            fig.add_hline(y=spec_min, line_dash="dash", line_color="#ef4444", line_width=2,
                         annotation_text=f"Mín: {spec_min}", annotation_position="bottom right")

        fig.add_trace(go.Scatter(
            x=df_plot['periodo'], y=df_plot['valor_num'],
            mode='lines+markers', name=f'{icone} {tipo_estudo}',
            line=dict(color=cor, width=3),
            marker=dict(size=12, symbol=simbolo, color=cor,
                       line=dict(color='#ffffff', width=2)),
            hovertemplate='<b>%{x}</b><br>Valor: %{y:.2f}<extra></extra>'
        ))

    fig.update_layout(
        title=dict(text=f"<b>{icone} {tipo_estudo} - {ensaio}</b>", font=dict(size=14, color='#003366')),
        xaxis=dict(title=dict(text="Período", font=dict(color='#64748b')),
                  gridcolor='#e2e8f0', tickfont=dict(color='#64748b')),
        yaxis=dict(title=dict(text="Valor", font=dict(color='#64748b')),
                  gridcolor='#e2e8f0', tickfont=dict(color='#64748b')),
        plot_bgcolor='#ffffff', paper_bgcolor='#ffffff',
        height=350, margin=dict(l=50, r=20, t=50, b=50),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1,
                   font=dict(color='#64748b')),
        hovermode='x unified'
    )

    return fig

def criar_grafico_mesclado(df_acel, df_long, ensaio, spec_tipo, spec_min, spec_max):
    """
    Cria gráfico com traces sobrepostos.
    Acelerado × 4 = Longa Duração para alinhar os períodos.

    Conversão exata:
    - 0 dia → 0 dia
    - 1 sem (7d) × 4 = 28d → 1m
    - 2 sem (14d) × 4 = 56d → 2m
    - 1m (30d) × 4 = 120d → 4m
    - 2m (60d) × 4 = 240d → 8m
    - 3m (90d) × 4 = 360d → 12m
    - 4m (120d) × 4 = 480d → 16m
    - 5m (150d) × 4 = 600d → 20m
    - 6m (180d) × 4 = 720d → 24m
    """
    fig = go.Figure()

    has_acel = len(df_acel) > 0
    has_long = len(df_long) > 0

    def dias_para_periodo_meses(dias):
        """Converte dias normalizados para label de meses"""
        if dias == 0:
            return '0 dia'
        meses = round(dias / 30)
        return f'{meses}m'

    # Preparar dados do Acelerado (normalizado ×4)
    df_acel_plot = pd.DataFrame()
    if has_acel:
        df_acel_plot = df_acel.copy()
        df_acel_plot['valor_num'] = pd.to_numeric(df_acel_plot['valor'], errors='coerce')
        df_acel_plot = df_acel_plot.dropna(subset=['valor_num'])
        # Calcular período normalizado em dias (×4)
        df_acel_plot['dias_norm'] = df_acel_plot['periodo'].map(ORDEM_PERIODOS) * FATOR_NORMALIZACAO
        # Criar label de período equivalente em meses
        df_acel_plot['periodo_equiv'] = df_acel_plot['dias_norm'].apply(dias_para_periodo_meses)
        # Label para hover: "3m → 12m"
        df_acel_plot['hover_label'] = df_acel_plot.apply(
            lambda r: f"{r['periodo']} → {r['periodo_equiv']}", axis=1
        )
        df_acel_plot = df_acel_plot.sort_values('dias_norm')

    # Preparar dados da Longa Duração
    df_long_plot = pd.DataFrame()
    if has_long:
        df_long_plot = df_long.copy()
        df_long_plot['valor_num'] = pd.to_numeric(df_long_plot['valor'], errors='coerce')
        df_long_plot = df_long_plot.dropna(subset=['valor_num'])
        df_long_plot['dias_norm'] = df_long_plot['periodo'].map(ORDEM_PERIODOS)
        df_long_plot['periodo_equiv'] = df_long_plot['periodo']  # Já está no formato correto
        df_long_plot['hover_label'] = df_long_plot['periodo']
        df_long_plot = df_long_plot.sort_values('dias_norm')

    # Coletar todos os dias normalizados e criar mapeamento para labels
    all_dias_labels = {}  # dias -> periodo_label

    if has_acel and len(df_acel_plot) > 0:
        for _, row in df_acel_plot.iterrows():
            all_dias_labels[row['dias_norm']] = row['periodo_equiv']

    if has_long and len(df_long_plot) > 0:
        for _, row in df_long_plot.iterrows():
            all_dias_labels[row['dias_norm']] = row['periodo_equiv']

    # Ordenar por dias e criar lista de períodos
    dias_ordenados = sorted(all_dias_labels.keys())
    periodos_ordenados = [all_dias_labels[d] for d in dias_ordenados]

    # Área de especificação
    if periodos_ordenados and spec_tipo == 'RANGE' and pd.notna(spec_min) and pd.notna(spec_max):
        fig.add_trace(go.Scatter(
            x=periodos_ordenados + periodos_ordenados[::-1],
            y=[spec_max]*len(periodos_ordenados) + [spec_min]*len(periodos_ordenados),
            fill='toself', fillcolor='rgba(16, 185, 129, 0.15)',
            line=dict(color='rgba(16, 185, 129, 0)'),
            name='Faixa OK', showlegend=True, hoverinfo='skip'
        ))
        fig.add_hline(y=spec_max, line_dash="dash", line_color="#10b981", line_width=1)
        fig.add_hline(y=spec_min, line_dash="dash", line_color="#10b981", line_width=1)
    elif spec_tipo == 'MAXIMO' and pd.notna(spec_max):
        fig.add_hline(y=spec_max, line_dash="dash", line_color="#ef4444", line_width=2,
                     annotation_text=f"Máx: {spec_max}", annotation_position="top right")
    elif spec_tipo == 'MINIMO' and pd.notna(spec_min):
        fig.add_hline(y=spec_min, line_dash="dash", line_color="#ef4444", line_width=2,
                     annotation_text=f"Mín: {spec_min}", annotation_position="bottom right")

    # Trace Acelerado
    if has_acel and len(df_acel_plot) > 0:
        fig.add_trace(go.Scatter(
            x=df_acel_plot['periodo_equiv'],
            y=df_acel_plot['valor_num'],
            mode='lines+markers', name='⚡ Acelerado (×4)',
            line=dict(color=COR_ACELERADO, width=3),
            marker=dict(size=12, symbol='circle', color=COR_ACELERADO,
                       line=dict(color='#ffffff', width=2)),
            text=df_acel_plot['hover_label'],
            hovertemplate='<b>⚡ Acelerado</b><br>%{text}<br>Valor: %{y:.2f}<extra></extra>'
        ))

    # Trace Longa Duração
    if has_long and len(df_long_plot) > 0:
        fig.add_trace(go.Scatter(
            x=df_long_plot['periodo_equiv'],
            y=df_long_plot['valor_num'],
            mode='lines+markers', name='📅 Longa Duração',
            line=dict(color=COR_LONGA, width=3),
            marker=dict(size=12, symbol='square', color=COR_LONGA,
                       line=dict(color='#ffffff', width=2)),
            text=df_long_plot['hover_label'],
            hovertemplate='<b>📅 Longa Duração</b><br>%{text}<br>Valor: %{y:.2f}<extra></extra>'
        ))

    fig.update_layout(
        title=dict(text=f"<b>🔀 Mesclado - {ensaio}</b>", font=dict(size=16, color='#003366')),
        xaxis=dict(
            title=dict(text="Período (equivalente Longa Duração)", font=dict(color='#64748b')),
            gridcolor='#e2e8f0', tickfont=dict(color='#64748b'),
            categoryorder='array', categoryarray=periodos_ordenados
        ),
        yaxis=dict(title=dict(text="Valor", font=dict(color='#64748b')),
                  gridcolor='#e2e8f0', tickfont=dict(color='#64748b')),
        plot_bgcolor='#ffffff', paper_bgcolor='#ffffff',
        height=400, margin=dict(l=60, r=30, t=60, b=60),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1,
                   font=dict(color='#64748b')),
        hovermode='x unified'
    )

    return fig

# Determinar categorias baseado no modo
if modo_viz in ['acelerado', 'longa']:
    categorias = df_produto['categoria_ensaio'].unique().tolist() if len(df_produto) > 0 else []
else:
    # Para comparar/mesclar, usar união de categorias de ambos datasets
    cat_acel = set(df_produto_acel['categoria_ensaio'].unique()) if len(df_produto_acel) > 0 else set()
    cat_long = set(df_produto_long['categoria_ensaio'].unique()) if len(df_produto_long) > 0 else set()
    categorias = sorted(cat_acel | cat_long)

if len(categorias) > 0:
    tabs = st.tabs([f"📁 {cat}" for cat in categorias])

    for i, categoria in enumerate(categorias):
        with tabs[i]:
            # Filtrar por categoria baseado no modo
            if modo_viz == 'acelerado':
                df_cat = df_produto[df_produto['categoria_ensaio'] == categoria].copy()
                df_cat_acel = df_cat
                df_cat_long = pd.DataFrame()
            elif modo_viz == 'longa':
                df_cat = df_produto[df_produto['categoria_ensaio'] == categoria].copy()
                df_cat_acel = pd.DataFrame()
                df_cat_long = df_cat
            else:
                df_cat_acel = df_produto_acel[df_produto_acel['categoria_ensaio'] == categoria].copy() if len(df_produto_acel) > 0 else pd.DataFrame()
                df_cat_long = df_produto_long[df_produto_long['categoria_ensaio'] == categoria].copy() if len(df_produto_long) > 0 else pd.DataFrame()
                df_cat = pd.concat([df_cat_acel, df_cat_long], ignore_index=True) if len(df_cat_acel) > 0 or len(df_cat_long) > 0 else pd.DataFrame()

            # Listar ensaios disponíveis
            ensaios_acel = set(df_cat_acel['ensaio_normalizado'].unique()) if len(df_cat_acel) > 0 else set()
            ensaios_long = set(df_cat_long['ensaio_normalizado'].unique()) if len(df_cat_long) > 0 else set()
            ensaios_disponiveis = sorted(ensaios_acel | ensaios_long) if modo_viz in ['comparar', 'mesclar'] else sorted(df_cat['ensaio_normalizado'].unique()) if len(df_cat) > 0 else []

            if len(ensaios_disponiveis) == 0:
                st.info("Sem ensaios disponíveis para esta categoria.")
                continue

            col_select, col_spacer, col_info = st.columns([2, 0.5, 2.5])

            with col_select:
                ensaio_selecionado = st.selectbox(
                    "Selecione o Ensaio",
                    ensaios_disponiveis,
                    key=f"ensaio_{categoria}_{i}"
                )

            # Filtrar dados do ensaio
            df_ensaio_acel = df_cat_acel[df_cat_acel['ensaio_normalizado'] == ensaio_selecionado].copy() if len(df_cat_acel) > 0 else pd.DataFrame()
            df_ensaio_long = df_cat_long[df_cat_long['ensaio_normalizado'] == ensaio_selecionado].copy() if len(df_cat_long) > 0 else pd.DataFrame()

            if modo_viz in ['acelerado', 'longa']:
                df_ensaio = df_cat[df_cat['ensaio_normalizado'] == ensaio_selecionado].copy()
            else:
                df_ensaio = pd.concat([df_ensaio_acel, df_ensaio_long], ignore_index=True) if len(df_ensaio_acel) > 0 or len(df_ensaio_long) > 0 else pd.DataFrame()

            # Mostrar disponibilidade do ensaio em cada tipo (para comparar/mesclar)
            if modo_viz in ['comparar', 'mesclar']:
                col_disp_a, col_disp_b = st.columns(2)
                with col_disp_a:
                    if len(df_ensaio_acel) > 0:
                        st.success(f"⚡ Acelerado: {len(df_ensaio_acel)} pontos")
                    else:
                        st.warning("⚡ Acelerado: Sem dados")
                with col_disp_b:
                    if len(df_ensaio_long) > 0:
                        st.success(f"📅 Longa: {len(df_ensaio_long)} pontos")
                    else:
                        st.warning("📅 Longa: Sem dados")

            with col_info:
                if len(df_ensaio) > 0:
                    spec_tipo = df_ensaio['spec_tipo'].iloc[0]
                    spec_min = df_ensaio['spec_min'].iloc[0]
                    spec_max = df_ensaio['spec_max'].iloc[0]

                    if spec_tipo == 'RANGE' and pd.notna(spec_min) and pd.notna(spec_max):
                        spec_text = f"📏 Faixa: {spec_min} — {spec_max}"
                    elif spec_tipo == 'MAXIMO' and pd.notna(spec_max):
                        spec_text = f"📏 Máximo: {spec_max}"
                    elif spec_tipo == 'MINIMO' and pd.notna(spec_min):
                        spec_text = f"📏 Mínimo: {spec_min}"
                    else:
                        spec_text = "📏 Qualitativo"

                    st.markdown(f'<div class="spec-info">{spec_text}</div>', unsafe_allow_html=True)

            st.markdown("<br>", unsafe_allow_html=True)

            # Obter especificações
            if len(df_ensaio) > 0:
                spec_tipo = df_ensaio['spec_tipo'].iloc[0]
                spec_min = df_ensaio['spec_min'].iloc[0]
                spec_max = df_ensaio['spec_max'].iloc[0]
                is_quant = df_ensaio['is_quantitativo'].iloc[0]
            else:
                spec_tipo, spec_min, spec_max = None, None, None
                is_quant = True

            # ========================================
            # RENDERIZAÇÃO DOS GRÁFICOS POR MODO
            # ========================================

            if modo_viz == 'comparar':
                # MODO COMPARAR: Dois gráficos lado a lado
                st.markdown("#### ⚖️ Comparação Lado a Lado")

                col_graf_acel, col_graf_long = st.columns(2)

                with col_graf_acel:
                    if len(df_ensaio_acel) > 0 and is_quant:
                        fig_acel = criar_grafico_simples(
                            df_ensaio_acel, ensaio_selecionado, 'Acelerado',
                            spec_tipo, spec_min, spec_max
                        )
                        if len(fig_acel.data) > 0:
                            st.plotly_chart(fig_acel, use_container_width=True)
                        else:
                            st.info("Sem dados numéricos.")
                    else:
                        st.warning("⚡ Acelerado: Sem dados para este ensaio")

                with col_graf_long:
                    if len(df_ensaio_long) > 0 and is_quant:
                        fig_long = criar_grafico_simples(
                            df_ensaio_long, ensaio_selecionado, 'Longa Duração',
                            spec_tipo, spec_min, spec_max
                        )
                        if len(fig_long.data) > 0:
                            st.plotly_chart(fig_long, use_container_width=True)
                        else:
                            st.info("Sem dados numéricos.")
                    else:
                        st.warning("📅 Longa Duração: Sem dados para este ensaio")

                # Tabelas lado a lado
                st.markdown("#### 📋 Dados")
                col_tab_acel, col_tab_long = st.columns(2)

                with col_tab_acel:
                    if len(df_ensaio_acel) > 0:
                        st.markdown("**⚡ Acelerado**")
                        df_tab_a = df_ensaio_acel.copy()
                        df_tab_a['ordem'] = df_tab_a['periodo'].map(ORDEM_PERIODOS)
                        df_tab_a = df_tab_a.sort_values('ordem')
                        if 'conforme' not in df_tab_a.columns:
                            df_tab_a['conforme'] = df_tab_a.apply(calcular_conformidade, axis=1)
                        df_tab_a['Status'] = df_tab_a['conforme'].apply(lambda v: "✅" if v == True else ("❌" if v == False else "➖"))
                        table_html = '<table class="custom-table"><thead><tr><th>Período</th><th>Valor</th><th>Status</th></tr></thead><tbody>'
                        for _, row in df_tab_a.iterrows():
                            table_html += f'<tr><td>{row["periodo"]}</td><td>{row["valor"]}</td><td>{row["Status"]}</td></tr>'
                        table_html += '</tbody></table>'
                        st.markdown(table_html, unsafe_allow_html=True)

                with col_tab_long:
                    if len(df_ensaio_long) > 0:
                        st.markdown("**📅 Longa Duração**")
                        df_tab_l = df_ensaio_long.copy()
                        df_tab_l['ordem'] = df_tab_l['periodo'].map(ORDEM_PERIODOS)
                        df_tab_l = df_tab_l.sort_values('ordem')
                        if 'conforme' not in df_tab_l.columns:
                            df_tab_l['conforme'] = df_tab_l.apply(calcular_conformidade, axis=1)
                        df_tab_l['Status'] = df_tab_l['conforme'].apply(lambda v: "✅" if v == True else ("❌" if v == False else "➖"))
                        table_html = '<table class="custom-table"><thead><tr><th>Período</th><th>Valor</th><th>Status</th></tr></thead><tbody>'
                        for _, row in df_tab_l.iterrows():
                            table_html += f'<tr><td>{row["periodo"]}</td><td>{row["valor"]}</td><td>{row["Status"]}</td></tr>'
                        table_html += '</tbody></table>'
                        st.markdown(table_html, unsafe_allow_html=True)

            elif modo_viz == 'mesclar':
                # MODO MESCLAR: Gráfico único com traces sobrepostos
                col_grafico, col_dados = st.columns([3, 2])

                with col_grafico:
                    if is_quant:
                        fig = criar_grafico_mesclado(
                            df_ensaio_acel, df_ensaio_long,
                            ensaio_selecionado,
                            spec_tipo, spec_min, spec_max
                        )
                        if len(fig.data) > 0:
                            st.plotly_chart(fig, use_container_width=True)
                            # Legenda de normalização
                            st.caption("💡 **Normalização:** Acelerado ×4 = Longa Duração (ex: 3m Acel = 12m Longa)")
                        else:
                            st.info("Sem dados numéricos para este ensaio.")
                    else:
                        st.markdown("#### 📋 Evolução Qualitativa")
                        df_ensaio['ordem'] = df_ensaio['periodo'].map(ORDEM_PERIODOS)
                        df_ensaio = df_ensaio.sort_values('ordem')
                        for _, row in df_ensaio.iterrows():
                            origem_tag = ""
                            if 'tipo_estudo_origem' in row:
                                origem_tag = f" ({row['tipo_estudo_origem']})"
                            st.markdown(f"**{row['periodo']}{origem_tag}:** `{row['valor']}`")

                with col_dados:
                    st.markdown("#### Dados Mesclados")
                    # Tabela com coluna de origem
                    dfs_tabela = []
                    if len(df_ensaio_acel) > 0:
                        df_t_acel = df_ensaio_acel.copy()
                        df_t_acel['Origem'] = '⚡'
                        df_t_acel['periodo_sort'] = df_t_acel['periodo'].map(ORDEM_PERIODOS) * FATOR_NORMALIZACAO
                        if 'conforme' not in df_t_acel.columns:
                            df_t_acel['conforme'] = df_t_acel.apply(calcular_conformidade, axis=1)
                        dfs_tabela.append(df_t_acel)
                    if len(df_ensaio_long) > 0:
                        df_t_long = df_ensaio_long.copy()
                        df_t_long['Origem'] = '📅'
                        df_t_long['periodo_sort'] = df_t_long['periodo'].map(ORDEM_PERIODOS)
                        if 'conforme' not in df_t_long.columns:
                            df_t_long['conforme'] = df_t_long.apply(calcular_conformidade, axis=1)
                        dfs_tabela.append(df_t_long)

                    if dfs_tabela:
                        df_tabela = pd.concat(dfs_tabela, ignore_index=True)
                        df_tabela = df_tabela.sort_values('periodo_sort')
                        df_tabela['Status'] = df_tabela['conforme'].apply(lambda v: "✅" if v == True else ("❌" if v == False else "➖"))
                        table_html = '<table class="custom-table"><thead><tr><th>Orig</th><th>Período</th><th>Valor</th><th>St</th></tr></thead><tbody>'
                        for _, row in df_tabela.iterrows():
                            table_html += f'<tr><td>{row["Origem"]}</td><td>{row["periodo"]}</td><td>{row["valor"]}</td><td>{row["Status"]}</td></tr>'
                        table_html += '</tbody></table>'
                        st.markdown(table_html, unsafe_allow_html=True)

            else:
                # MODOS SIMPLES: acelerado ou longa
                col_grafico, col_dados = st.columns([3, 2])

                with col_grafico:
                    if is_quant:
                        tipo_estudo_atual = 'Acelerado' if modo_viz == 'acelerado' else 'Longa Duração'
                        df_plot = df_ensaio_acel if modo_viz == 'acelerado' else df_ensaio_long

                        if len(df_plot) > 0:
                            fig = criar_grafico_simples(
                                df_plot, ensaio_selecionado, tipo_estudo_atual,
                                spec_tipo, spec_min, spec_max
                            )
                            if len(fig.data) > 0:
                                st.plotly_chart(fig, use_container_width=True)
                            else:
                                st.info("Sem dados numéricos para este ensaio.")
                        else:
                            st.info("Sem dados para este ensaio.")
                    else:
                        st.markdown("#### 📋 Evolução Qualitativa")
                        df_ensaio['ordem'] = df_ensaio['periodo'].map(ORDEM_PERIODOS)
                        df_ensaio = df_ensaio.sort_values('ordem')
                        for _, row in df_ensaio.iterrows():
                            st.markdown(f"**{row['periodo']}:** `{row['valor']}`")

                with col_dados:
                    st.markdown("#### Dados")
                    df_plot = df_ensaio_acel if modo_viz == 'acelerado' else df_ensaio_long

                    if len(df_plot) > 0:
                        df_tabela = df_plot.copy()
                        df_tabela['ordem'] = df_tabela['periodo'].map(ORDEM_PERIODOS)
                        df_tabela = df_tabela.sort_values('ordem')
                        if 'conforme' not in df_tabela.columns:
                            df_tabela['conforme'] = df_tabela.apply(calcular_conformidade, axis=1)
                        df_tabela['Status'] = df_tabela['conforme'].apply(lambda v: "✅" if v == True else ("❌" if v == False else "➖"))

                        table_html = '<table class="custom-table"><thead><tr><th>Período</th><th>Valor</th><th>Status</th></tr></thead><tbody>'
                        for _, row in df_tabela.iterrows():
                            table_html += f'<tr><td>{row["periodo"]}</td><td>{row["valor"]}</td><td>{row["Status"]}</td></tr>'
                        table_html += '</tbody></table>'
                        st.markdown(table_html, unsafe_allow_html=True)

                        # Métricas do ensaio
                        df_tabela['valor_num'] = pd.to_numeric(df_tabela['valor'], errors='coerce')
                        if is_quant and len(df_tabela.dropna(subset=['valor_num'])) > 0:
                            st.markdown("#### 📈 Métricas")

                            df_calc = df_tabela.dropna(subset=['valor_num']).sort_values('ordem')
                            valor_t0 = df_calc[df_calc['periodo'] == '0 dia']['valor_num'].values
                            valor_atual = df_calc['valor_num'].iloc[-1] if len(df_calc) > 0 else None

                            if len(valor_t0) > 0 and valor_atual is not None and valor_t0[0] != 0:
                                var_pct = ((valor_atual - valor_t0[0]) / valor_t0[0]) * 100

                                col_m1, col_m2 = st.columns(2)
                                with col_m1:
                                    st.metric("Valor T0", f"{valor_t0[0]:.2f}")
                                with col_m2:
                                    st.metric("Variação", f"{var_pct:+.1f}%",
                                             delta_color="inverse" if var_pct > 10 else "normal")

                            if len(df_calc) >= 3:
                                valores = df_calc['valor_num'].values
                                if valores[-1] > valores[0] * 1.05:
                                    tendencia = "📈 Tendência de alta"
                                    cor = "warning"
                                elif valores[-1] < valores[0] * 0.95:
                                    tendencia = "📉 Tendência de queda"
                                    cor = "warning"
                                else:
                                    tendencia = "➡️ Estável"
                                    cor = "success"

                                badge_class = f"badge badge-{cor}"
                                st.markdown(f'<span class="{badge_class}">{tendencia}</span>', unsafe_allow_html=True)

# ============================================================
# HEATMAP
# ============================================================

st.markdown("<br>", unsafe_allow_html=True)

# Título dinâmico do heatmap baseado no modo
heatmap_titulo = {
    'acelerado': '🔥 Heatmap de Conformidade - Acelerado',
    'longa': '🔥 Heatmap de Conformidade - Longa Duração',
    'comparar': '🔥 Heatmap de Conformidade - Comparação',
    'mesclar': '🔥 Heatmap de Conformidade - Dados Mesclados'
}

st.markdown(f"""
<div class="section-header">
    <span class="section-icon">🔥</span>
    <h3 class="section-title">{heatmap_titulo[modo_viz]}</h3>
</div>
""", unsafe_allow_html=True)

# Preparar dados para o heatmap baseado no modo
if modo_viz in ['comparar', 'mesclar']:
    # Para comparar/mesclar: combinar dados de ambos os tipos
    dfs_heat = []

    if len(df_produto_acel) > 0:
        df_heat_acel = df_produto_acel[df_produto_acel['is_quantitativo'] == True].copy()
        if len(df_heat_acel) > 0:
            # Calcular conformidade se não existir
            if 'conforme' not in df_heat_acel.columns:
                df_heat_acel['conforme'] = df_heat_acel.apply(calcular_conformidade, axis=1)
            df_heat_acel['conforme_num'] = df_heat_acel['conforme'].map({True: 1, False: 0, None: 0.5})
            # Normalizar períodos
            df_heat_acel['periodo_norm'] = df_heat_acel['periodo'].map(ORDEM_PERIODOS) * FATOR_NORMALIZACAO
            df_heat_acel['periodo_label'] = df_heat_acel.apply(
                lambda r: f"{r['periodo']} (⚡→{dias_para_label(r['periodo_norm'])})", axis=1
            )
            dfs_heat.append(df_heat_acel)

    if len(df_produto_long) > 0:
        df_heat_long = df_produto_long[df_produto_long['is_quantitativo'] == True].copy()
        if len(df_heat_long) > 0:
            # Calcular conformidade se não existir
            if 'conforme' not in df_heat_long.columns:
                df_heat_long['conforme'] = df_heat_long.apply(calcular_conformidade, axis=1)
            df_heat_long['conforme_num'] = df_heat_long['conforme'].map({True: 1, False: 0, None: 0.5})
            df_heat_long['periodo_norm'] = df_heat_long['periodo'].map(ORDEM_PERIODOS)
            df_heat_long['periodo_label'] = df_heat_long.apply(
                lambda r: f"{r['periodo']} (📅)", axis=1
            )
            dfs_heat.append(df_heat_long)

    if dfs_heat:
        df_quant = pd.concat(dfs_heat, ignore_index=True)
    else:
        df_quant = pd.DataFrame()
else:
    df_quant = df_produto[df_produto['is_quantitativo'] == True].copy()
    if len(df_quant) > 0:
        df_quant['conforme_num'] = df_quant['conforme'].map({True: 1, False: 0, None: 0.5})
        df_quant['periodo_norm'] = df_quant['periodo'].map(ORDEM_PERIODOS)
        df_quant['periodo_label'] = df_quant['periodo']

if len(df_quant) > 0:
    # Criar pivot table
    if modo_viz in ['comparar', 'mesclar']:
        # Para comparação, usar período normalizado como coluna
        pivot = df_quant.pivot_table(
            index='ensaio_normalizado',
            columns='periodo_norm',
            values='conforme_num',
            aggfunc='mean'
        )
        cols_ordenadas = sorted(pivot.columns)
        pivot = pivot[cols_ordenadas]

        # Criar labels para o eixo X mostrando dias
        x_labels = [dias_para_label(int(d)) for d in cols_ordenadas]
    else:
        pivot = df_quant.pivot_table(
            index='ensaio_normalizado',
            columns='periodo',
            values='conforme_num',
            aggfunc='mean'
        )
        cols_ordenadas = sorted(pivot.columns, key=lambda x: ORDEM_PERIODOS.get(x, 999))
        pivot = pivot[cols_ordenadas]
        x_labels = list(cols_ordenadas)

    fig_heat = go.Figure(data=go.Heatmap(
        z=pivot.values,
        x=x_labels,
        y=pivot.index,
        colorscale=[
            [0, '#c8102e'],
            [0.5, '#0055a4'],
            [1, '#00a651']
        ],
        showscale=True,
        colorbar=dict(
            title=dict(text="Status", font=dict(color='#64748b')),
            tickvals=[0, 0.5, 1],
            ticktext=['Fora', 'N/A', 'OK'],
            tickfont=dict(color='#64748b'),
            bgcolor='#ffffff'
        ),
        hovertemplate='<b>%{y}</b><br>Período: %{x}<br>Status: %{z:.0%}<extra></extra>'
    ))

    # Título do eixo X baseado no modo
    xaxis_title = "Dias (normalizado)" if modo_viz in ['comparar', 'mesclar'] else "Período"

    fig_heat.update_layout(
        xaxis=dict(
            title=dict(text=xaxis_title, font=dict(color='#64748b')),
            tickfont=dict(color='#64748b')
        ),
        yaxis=dict(
            title=dict(text="Ensaio", font=dict(color='#64748b')),
            tickfont=dict(color='#64748b', size=10)
        ),
        plot_bgcolor='#ffffff',
        paper_bgcolor='#ffffff',
        height=max(400, len(pivot) * 28),
        margin=dict(l=200, r=50, t=30, b=60)
    )

    st.plotly_chart(fig_heat, use_container_width=True)

    # Legenda adicional para modos comparar/mesclar
    if modo_viz in ['comparar', 'mesclar']:
        st.markdown("""
        <div style="text-align: center; color: #64748b; font-size: 0.85rem; padding: 0.5rem;">
            <b>Nota:</b> Períodos normalizados (Acelerado × 4 = Longa Duração)
        </div>
        """, unsafe_allow_html=True)
else:
    st.info("Sem dados quantitativos para exibir o heatmap.")

# ============================================================
# FOOTER
# ============================================================

st.markdown("<br>", unsafe_allow_html=True)
st.markdown("""
<div style="text-align: center; color: #00a3e0; font-size: 0.9rem; font-weight: 600; padding: 1rem 0;">
    Desenvolvido por Dobslit
</div>
""", unsafe_allow_html=True)
