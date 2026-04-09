import re
import numpy as np
from fastapi import APIRouter, HTTPException

from app.models import (
    AnalysisRequest,
    CustomAnalysisRequest,
    AnalysisResponse,
    DataPoint,
    CurvePoint,
    ModelMetrics,
)
from app.services.supabase_client import get_ensaio_data
from app.services.fitting import remove_trend_outliers, select_best_model, format_equation
from app.services.shelf_life import infer_failure_mode, estimate_shelf_life_with_error

router = APIRouter()


def _parse_valor(valor_str: str | None) -> float | None:
    """Converte valor string para float (trata '<', ',' etc.)."""
    if valor_str is None:
        return None
    s = str(valor_str).strip()
    if not s or s == "-":
        return None
    s = s.replace(",", ".").replace("<", "").strip()
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


@router.post("/analysis", response_model=AnalysisResponse)
async def run_analysis(request: AnalysisRequest):
    # 1. Buscar dados do Supabase
    try:
        raw_data = get_ensaio_data(
            request.nome_produto,
            request.ensaio_normalizado,
            request.tipo_estudo,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Erro ao conectar com Supabase: {str(e)}")

    if not raw_data:
        raise HTTPException(status_code=404, detail="Nenhum dado encontrado para este ensaio")

    # 2. Extrair spec info do primeiro registro
    first = raw_data[0]
    spec_min = first.get("spec_min")
    spec_max = first.get("spec_max")
    spec_tipo = first.get("spec_tipo")
    especificacao = first.get("especificacao")

    # Validar que tem spec numérica
    if spec_tipo in (None, "QUALITATIVO"):
        raise HTTPException(
            status_code=422,
            detail="Ensaio sem especificação numérica para análise de tendência",
        )

    # 3. Converter valores
    periodos = []
    periodo_dias_list = []
    valores = []
    for row in raw_data:
        val = _parse_valor(row.get("valor"))
        if val is not None:
            periodos.append(row.get("periodo", ""))
            periodo_dias_list.append(int(row.get("periodo_dias", 0)))
            valores.append(val)

    if len(valores) < 3:
        raise HTTPException(
            status_code=422,
            detail="Dados insuficientes para análise (mínimo 3 pontos numéricos)",
        )

    # 4. Converter para meses
    x = np.array([d / 30.0 for d in periodo_dias_list])
    y = np.array(valores)

    # 5. Remoção de outliers
    x_clean, y_clean, outlier_mask = remove_trend_outliers(x, y)

    if len(x_clean) < 3:
        # Se após remoção ficou com poucos pontos, usar todos
        x_clean, y_clean = x, y
        outlier_mask = np.zeros(len(x), dtype=bool)

    # 6. Seleção do melhor modelo (ou modelo forçado pelo usuário)
    model_name, predict_func, sigma, model_params, adj_r2, all_models_raw = select_best_model(
        x_clean, y_clean, model_filter=request.model_name
    )

    if predict_func is None:
        detail = (
            f"Não foi possível ajustar o modelo '{request.model_name}' aos dados"
            if request.model_name
            else "Não foi possível ajustar nenhum modelo aos dados"
        )
        raise HTTPException(status_code=422, detail=detail)

    # 7. Shelf life
    failure_mode = infer_failure_mode(spec_min, spec_max)
    shelf_life, shelf_error = estimate_shelf_life_with_error(
        predict_func, sigma, spec_min, spec_max, failure_mode
    )

    # 8. Gerar curvas
    x_max = float(np.max(x))
    projection_end = shelf_life if shelf_life is not None else 60.0
    projection_end = min(max(projection_end * 1.2, x_max + 6), 60.0)

    # Fitted curve (sobre a faixa dos dados)
    t_fit = np.linspace(0, x_max, 200)
    mu_fit = predict_func(t_fit)
    fitted_curve = [
        CurvePoint(
            meses=round(float(t), 2),
            valor=round(float(v), 4),
            valor_upper=round(float(v + sigma), 4),
            valor_lower=round(float(v - sigma), 4),
        )
        for t, v in zip(t_fit, mu_fit)
    ]

    # Projection curve (além dos dados)
    t_proj = np.linspace(x_max, projection_end, 200)
    mu_proj = predict_func(t_proj)
    projection_curve = [
        CurvePoint(
            meses=round(float(t), 2),
            valor=round(float(v), 4),
            valor_upper=round(float(v + sigma), 4),
            valor_lower=round(float(v - sigma), 4),
        )
        for t, v in zip(t_proj, mu_proj)
    ]

    # 9. Pontos de dados com flag de outlier
    data_points = [
        DataPoint(
            periodo=periodos[i],
            periodo_dias=periodo_dias_list[i],
            valor=round(valores[i], 4),
            is_outlier=bool(outlier_mask[i]),
        )
        for i in range(len(valores))
    ]

    all_models = {
        name: ModelMetrics(
            adj_r2=m["adj_r2"],
            sigma=m["sigma"],
            aic=m["aic"],
        )
        for name, m in all_models_raw.items()
    }

    return AnalysisResponse(
        data_points=data_points,
        model_name=model_name,
        model_params=model_params,
        equation=format_equation(model_name, model_params),
        adj_r2=round(float(adj_r2), 4),
        fitted_curve=fitted_curve,
        projection_curve=projection_curve,
        shelf_life_months=round(shelf_life, 2) if shelf_life is not None else None,
        shelf_life_error=round(shelf_error, 2) if shelf_error is not None else None,
        spec_min=spec_min,
        spec_max=spec_max,
        spec_tipo=spec_tipo,
        failure_mode=failure_mode,
        especificacao=especificacao,
        all_models=all_models,
    )


@router.post("/analysis/custom", response_model=AnalysisResponse)
async def run_custom_analysis(request: CustomAnalysisRequest):
    """Análise best-fit com datapoints fornecidos diretamente (ex: média de família)."""
    spec_min = request.spec_min
    spec_max = request.spec_max
    spec_tipo = request.spec_tipo
    especificacao = request.especificacao

    if spec_tipo in (None, "QUALITATIVO"):
        raise HTTPException(
            status_code=422,
            detail="Sem especificação numérica para análise de tendência",
        )

    if len(request.data_points) < 3:
        raise HTTPException(
            status_code=422,
            detail="Dados insuficientes para análise (mínimo 3 pontos numéricos)",
        )

    periodos = [dp.periodo for dp in request.data_points]
    periodo_dias_list = [dp.periodo_dias for dp in request.data_points]
    valores = [dp.valor for dp in request.data_points]

    x = np.array([d / 30.0 for d in periodo_dias_list])
    y = np.array(valores)

    x_clean, y_clean, outlier_mask = remove_trend_outliers(x, y)

    if len(x_clean) < 3:
        x_clean, y_clean = x, y
        outlier_mask = np.zeros(len(x), dtype=bool)

    model_name, predict_func, sigma, model_params, adj_r2, all_models_raw = select_best_model(
        x_clean, y_clean, model_filter=request.model_name
    )

    if predict_func is None:
        detail = (
            f"Não foi possível ajustar o modelo '{request.model_name}' aos dados"
            if request.model_name
            else "Não foi possível ajustar nenhum modelo aos dados"
        )
        raise HTTPException(status_code=422, detail=detail)

    failure_mode = infer_failure_mode(spec_min, spec_max)
    shelf_life, shelf_error = estimate_shelf_life_with_error(
        predict_func, sigma, spec_min, spec_max, failure_mode
    )

    x_max = float(np.max(x))
    projection_end = shelf_life if shelf_life is not None else 60.0
    projection_end = min(max(projection_end * 1.2, x_max + 6), 60.0)

    t_fit = np.linspace(0, x_max, 200)
    mu_fit = predict_func(t_fit)
    fitted_curve = [
        CurvePoint(
            meses=round(float(t), 2),
            valor=round(float(v), 4),
            valor_upper=round(float(v + sigma), 4),
            valor_lower=round(float(v - sigma), 4),
        )
        for t, v in zip(t_fit, mu_fit)
    ]

    t_proj = np.linspace(x_max, projection_end, 200)
    mu_proj = predict_func(t_proj)
    projection_curve = [
        CurvePoint(
            meses=round(float(t), 2),
            valor=round(float(v), 4),
            valor_upper=round(float(v + sigma), 4),
            valor_lower=round(float(v - sigma), 4),
        )
        for t, v in zip(t_proj, mu_proj)
    ]

    data_points = [
        DataPoint(
            periodo=periodos[i],
            periodo_dias=periodo_dias_list[i],
            valor=round(valores[i], 4),
            is_outlier=bool(outlier_mask[i]),
        )
        for i in range(len(valores))
    ]

    all_models = {
        name: ModelMetrics(
            adj_r2=m["adj_r2"],
            sigma=m["sigma"],
            aic=m["aic"],
        )
        for name, m in all_models_raw.items()
    }

    return AnalysisResponse(
        data_points=data_points,
        model_name=model_name,
        model_params=model_params,
        equation=format_equation(model_name, model_params),
        adj_r2=round(float(adj_r2), 4),
        fitted_curve=fitted_curve,
        projection_curve=projection_curve,
        shelf_life_months=round(shelf_life, 2) if shelf_life is not None else None,
        shelf_life_error=round(shelf_error, 2) if shelf_error is not None else None,
        spec_min=spec_min,
        spec_max=spec_max,
        spec_tipo=spec_tipo,
        failure_mode=failure_mode,
        especificacao=especificacao,
        all_models=all_models,
    )
