import numpy as np
from app.services.shelf_life import infer_failure_mode, estimate_shelf_life_with_error


def test_infer_failure_mode_two_sided():
    assert infer_failure_mode(5.0, 10.0) == "two_sided"


def test_infer_failure_mode_one_sided_min():
    assert infer_failure_mode(5.0, None) == "one_sided_min"


def test_infer_failure_mode_one_sided_max():
    assert infer_failure_mode(None, 10.0) == "one_sided_max"


def test_infer_failure_mode_none():
    assert infer_failure_mode(None, None) == "none"


def test_infer_failure_mode_nan():
    assert infer_failure_mode(float("nan"), float("nan")) == "none"


def test_one_sided_max_shelf_life():
    """Valor crescente que cruza spec_max = 15."""
    def predict(t):
        t = np.atleast_1d(t)
        return 5.0 + 0.5 * t  # cruza 15 em t=20

    sl, err = estimate_shelf_life_with_error(
        predict, 0.5, None, 15.0, "one_sided_max"
    )
    assert sl is not None
    assert 19.0 < sl < 21.0, f"Shelf life esperado ~20, obteve {sl}"
    assert err == 0.5


def test_one_sided_min_shelf_life():
    """Valor decrescente que cruza spec_min = 3."""
    def predict(t):
        t = np.atleast_1d(t)
        return 10.0 - 0.3 * t  # cruza 3 em t≈23.3

    sl, err = estimate_shelf_life_with_error(
        predict, 0.2, 3.0, None, "one_sided_min"
    )
    assert sl is not None
    assert 22.0 < sl < 25.0, f"Shelf life esperado ~23.3, obteve {sl}"


def test_two_sided_shelf_life():
    """Valor crescente com range 0-15."""
    def predict(t):
        t = np.atleast_1d(t)
        return 5.0 + 0.5 * t

    sl, err = estimate_shelf_life_with_error(
        predict, 0.3, 0.0, 15.0, "two_sided"
    )
    assert sl is not None
    assert 19.0 < sl < 21.0


def test_no_crossing_returns_none():
    """Dados estáveis que nunca cruzam spec."""
    def predict(t):
        t = np.atleast_1d(t)
        return np.full_like(t, 7.0)  # constante

    sl, err = estimate_shelf_life_with_error(
        predict, 0.1, 0.0, 15.0, "two_sided"
    )
    assert sl is None
    assert err is None


def test_none_mode_returns_none():
    """Modo 'none' deve retornar None."""
    def predict(t):
        return np.atleast_1d(t) * 0

    sl, err = estimate_shelf_life_with_error(
        predict, 0.1, None, None, "none"
    )
    assert sl is None
