"""
Funções de ajuste estatístico (linear, exponencial, logístico, média).
Adaptado de Best-fit_indovynia_v4.ipynb.
"""

import numpy as np
import statsmodels.api as sm
from scipy.optimize import curve_fit
from typing import Callable

# Nomes válidos de modelos
MODEL_NAMES = ("Linear", "Exponential", "Logistic", "Mean")


def remove_trend_outliers(
    x: np.ndarray, y: np.ndarray, z: float = 3
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Remove outliers baseados na tendência linear (z-score dos resíduos).

    Returns:
        (x_clean, y_clean, outlier_mask) onde outlier_mask[i] = True se ponto i é outlier.
    """
    if len(x) < 3:
        return x, y, np.zeros(len(x), dtype=bool)

    X = sm.add_constant(x)
    model = sm.OLS(y, X).fit()
    y_pred = model.predict(X)
    residuals = y - y_pred
    std = np.std(residuals)

    if std == 0:
        return x, y, np.zeros(len(x), dtype=bool)

    outlier_mask = np.abs(residuals) > z * std
    return x[~outlier_mask], y[~outlier_mask], outlier_mask


def linear_fit(
    x: np.ndarray, y: np.ndarray
) -> tuple[float, float, Callable, float, dict]:
    """
    Regressão linear OLS: y = intercept + slope * t

    Returns:
        (adj_r2, aic, predict_func, sigma, params)
    """
    X = sm.add_constant(x)
    model = sm.OLS(y, X).fit()
    y_pred = model.predict(X)
    residuals = y - y_pred
    ss_res = np.sum(residuals**2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - ss_res / ss_tot if ss_tot != 0 else 0
    n = len(y)
    adj_r2 = 1 - (1 - r2) * (n - 1) / (n - 2) if n > 2 else r2
    aic = model.aic
    sigma = float(np.std(residuals))
    params = {
        "intercept": float(model.params[0]),
        "slope": float(model.params[1]),
    }

    def predict(t):
        t = np.atleast_1d(t)
        return model.predict(sm.add_constant(t))

    return adj_r2, aic, predict, sigma, params


def exponential_fit(
    x: np.ndarray, y: np.ndarray
) -> tuple[float, float, Callable | None, float | None, dict]:
    """
    Ajuste exponencial: y = a * exp(b * t) via log-linearização.

    Returns:
        (adj_r2, aic, predict_func, sigma, params) ou (-inf, inf, None, None, {}) se falhar.
    """
    if np.any(y <= 0):
        return -np.inf, np.inf, None, None, {}

    log_y = np.log(y)
    X = sm.add_constant(x)
    model = sm.OLS(log_y, X).fit()
    a = np.exp(model.params[0])
    b = model.params[1]
    y_pred = a * np.exp(b * x)
    residuals = y - y_pred
    ss_res = np.sum(residuals**2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - ss_res / ss_tot if ss_tot != 0 else 0
    n = len(y)
    adj_r2 = 1 - (1 - r2) * (n - 1) / (n - 2) if n > 2 else r2
    aic = model.aic
    sigma = float(np.std(residuals))
    params = {"a": float(a), "b": float(b)}

    def predict(t):
        t = np.atleast_1d(t)
        return a * np.exp(b * t)

    return adj_r2, aic, predict, sigma, params


def _logistic_func(t, L, k, t0):
    return L / (1 + np.exp(-k * (t - t0)))


def logistic_fit(
    x: np.ndarray, y: np.ndarray
) -> tuple[float, float, Callable | None, float | None, dict]:
    """
    Ajuste logístico: y = L / (1 + exp(-k*(t - t0))).

    Returns:
        (adj_r2, aic, predict_func, sigma, params) ou (-inf, inf, None, None, {}) se falhar.
    """
    try:
        if len(y) <= 4:
            return -np.inf, np.inf, None, None, {}

        fit_params, _ = curve_fit(
            _logistic_func,
            x,
            y,
            p0=[max(y), 0.1, np.median(x)],
            maxfev=10000,
        )
        y_pred = _logistic_func(x, *fit_params)
        residuals = y - y_pred
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r2 = 1 - ss_res / ss_tot if ss_tot != 0 else 0
        n = len(y)
        k_params = 3
        adj_r2 = 1 - (1 - r2) * (n - 1) / (n - k_params) if n > k_params else r2
        aic = n * np.log(ss_res / n) + 2 * k_params if n > 0 else np.inf
        sigma = float(np.std(residuals))
        params = {
            "L": float(fit_params[0]),
            "k": float(fit_params[1]),
            "t0": float(fit_params[2]),
        }

        def predict(t):
            t = np.atleast_1d(t)
            return _logistic_func(t, *fit_params)

        return adj_r2, aic, predict, sigma, params
    except Exception:
        return -np.inf, np.inf, None, None, {}


def mean_fit(
    x: np.ndarray, y: np.ndarray
) -> tuple[float, float, Callable, float, dict]:
    """
    Modelo de média constante: y = mean(y).
    Usado quando não há tendência detectável.

    Returns:
        (adj_r2=0, aic=nan, predict_func, sigma, params)
    """
    m = float(np.mean(y))
    sigma = float(np.std(y))
    params = {"mean": m}

    def predict(t):
        t = np.atleast_1d(t)
        return np.full_like(t, m, dtype=float)

    return 0.0, float("nan"), predict, sigma, params


def format_equation(model_name: str, params: dict) -> str:
    """Retorna a equação do modelo com os valores reais substituídos."""
    if model_name == "Linear":
        return f"y = {params['intercept']:.4f} + {params['slope']:.4f} · t"
    elif model_name == "Exponential":
        return f"y = {params['a']:.4f} · exp({params['b']:.4f} · t)"
    elif model_name == "Logistic":
        return f"y = {params['L']:.4f} / (1 + exp(-{params['k']:.4f} · (t - {params['t0']:.4f})))"
    elif model_name == "Mean":
        return f"y = {params['mean']:.4f}"
    return ""


def select_best_model(
    x: np.ndarray, y: np.ndarray, model_filter: str | None = None
) -> tuple[str, Callable | None, float | None, dict, float, dict]:
    """
    Seleciona o melhor modelo por max(adj_r2), desempate por min(aic).
    Se model_filter for informado, usa esse modelo diretamente sem seleção automática.

    Mean fica fora da seleção automática — só é usado quando explicitamente solicitado.

    Returns:
        (model_name, predict_func, sigma, params, adj_r2, all_models_metrics)
        all_models_metrics: dict com métricas de Linear/Exponential/Logistic para comparação
    """
    fits = {
        "Linear": linear_fit(x, y),
        "Exponential": exponential_fit(x, y),
        "Logistic": logistic_fit(x, y),
        "Mean": mean_fit(x, y),
    }

    def _safe(v) -> float | None:
        if v is None:
            return None
        try:
            f = float(v)
            return None if not np.isfinite(f) else round(f, 4)
        except (TypeError, ValueError):
            return None

    # Métricas de todos os modelos candidatos (exceto Mean) para o modal de comparação
    all_models_metrics: dict = {}
    for name, (r2, aic, func, s, _) in fits.items():
        if name == "Mean":
            continue
        all_models_metrics[name] = {
            "adj_r2": _safe(r2) if func is not None else None,
            "sigma": _safe(s),
            "aic": _safe(aic),
        }

    # Modelo forçado pelo usuário
    if model_filter and model_filter in fits:
        adj_r2, aic, predict, sigma, params = fits[model_filter]
        if predict is None:
            return model_filter, None, None, {}, 0.0, all_models_metrics
        return model_filter, predict, sigma, params, float(adj_r2), all_models_metrics

    # Seleção automática: exclui Mean (igual ao v4)
    best_name = None
    best_score = (-np.inf, np.inf)
    best_func = None
    best_sigma = None
    best_params: dict = {}
    best_adj_r2: float = 0.0

    for name, (adj_r2, aic, func, sigma, params) in fits.items():
        if name == "Mean":
            continue
        if func is None:
            continue
        score = (adj_r2, -aic)
        if score > best_score:
            best_score = score
            best_name = name
            best_func = func
            best_sigma = sigma
            best_params = params
            best_adj_r2 = float(adj_r2)

    return best_name or "Linear", best_func, best_sigma, best_params, best_adj_r2, all_models_metrics
