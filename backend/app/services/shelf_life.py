"""
Estimativa de shelf life e modo de falha.
Adaptado de Best-fit_indovynia_v2.py.
"""

import math
import numpy as np
from typing import Callable


def infer_failure_mode(
    spec_min: float | None, spec_max: float | None
) -> str:
    """Infere o modo de falha a partir dos limites de especificação."""
    has_min = spec_min is not None and not math.isnan(spec_min)
    has_max = spec_max is not None and not math.isnan(spec_max)

    if has_min and has_max:
        return "two_sided"
    if has_min:
        return "one_sided_min"
    if has_max:
        return "one_sided_max"
    return "none"


def estimate_shelf_life_with_error(
    predict_func: Callable,
    sigma: float,
    spec_min: float | None,
    spec_max: float | None,
    mode: str,
    max_months: float = 60,
) -> tuple[float | None, float | None]:
    """
    Estima shelf life projetando a curva até cruzar o limite de spec.

    Returns:
        (shelf_life_months, error_months) ou (None, None) se não cruzar.
    """
    if mode == "none" or predict_func is None:
        return None, None

    t_grid = np.linspace(0, max_months, 2000)
    mu = predict_func(t_grid)

    if mode == "one_sided_min":
        idx = np.where(mu <= spec_min)[0]
    elif mode == "one_sided_max":
        idx = np.where(mu >= spec_max)[0]
    elif mode == "two_sided":
        idx = np.where((mu <= spec_min) | (mu >= spec_max))[0]
    else:
        return None, None

    # Filtrar apenas pontos após t=0
    idx = idx[idx > 0]

    if len(idx) == 0:
        return None, None

    shelf_life = float(t_grid[idx[0]])
    error = float(sigma) if sigma is not None else None
    return shelf_life, error
