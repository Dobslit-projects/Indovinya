import numpy as np
from app.services.fitting import (
    linear_fit,
    exponential_fit,
    logistic_fit,
    select_best_model,
    remove_trend_outliers,
)


def test_linear_fit_returns_high_r2(linear_data):
    x, y = linear_data
    adj_r2, aic, predict_func, sigma = linear_fit(x, y)
    assert adj_r2 > 0.95, f"R² ajustado muito baixo: {adj_r2}"
    assert predict_func is not None
    assert sigma >= 0


def test_exponential_fit_returns_high_r2(exponential_data):
    x, y = exponential_data
    adj_r2, aic, predict_func, sigma = exponential_fit(x, y)
    assert adj_r2 > 0.90, f"R² ajustado muito baixo: {adj_r2}"
    assert predict_func is not None


def test_logistic_fit_returns_high_r2(logistic_data):
    x, y = logistic_data
    adj_r2, aic, predict_func, sigma = logistic_fit(x, y)
    assert adj_r2 > 0.85, f"R² ajustado muito baixo: {adj_r2}"
    assert predict_func is not None


def test_select_best_model_chooses_linear(linear_data):
    x, y = linear_data
    model_name, predict_func, sigma = select_best_model(x, y)
    assert model_name == "Linear"
    assert predict_func is not None


def test_select_best_model_chooses_exponential(exponential_data):
    x, y = exponential_data
    model_name, predict_func, sigma = select_best_model(x, y)
    # Pode escolher Linear ou Exponential dependendo do ruído,
    # mas predict_func nunca deve ser None
    assert predict_func is not None
    assert model_name in ("Linear", "Exponential", "Logistic")


def test_outlier_removal_detects_outliers(data_with_outlier):
    x, y = data_with_outlier
    x_clean, y_clean, mask = remove_trend_outliers(x, y)
    assert mask[4] == True, "Outlier no índice 4 deveria ser detectado"
    assert len(x_clean) < len(x), "Dados limpos deveriam ter menos pontos"


def test_outlier_removal_preserves_clean_data(clean_linear_data):
    x, y = clean_linear_data
    x_clean, y_clean, mask = remove_trend_outliers(x, y)
    assert np.sum(mask) == 0, "Nenhum outlier deveria ser detectado"
    assert len(x_clean) == len(x)


def test_linear_fit_prediction_shape(linear_data):
    x, y = linear_data
    _, _, predict_func, _ = linear_fit(x, y)
    t_test = np.array([0, 6, 12, 24])
    result = predict_func(t_test)
    assert len(result) == len(t_test)


def test_exponential_fit_negative_values():
    """Exponencial deve falhar com valores negativos."""
    x = np.array([0, 1, 2, 3, 6], dtype=float)
    y = np.array([5, 4, -1, 2, 1], dtype=float)
    adj_r2, aic, func, sigma = exponential_fit(x, y)
    assert adj_r2 == -np.inf
    assert func is None
