import numpy as np
import pytest


@pytest.fixture
def linear_data():
    """Dados perfeitamente lineares: y = 2 + 0.5*x."""
    np.random.seed(42)
    x = np.array([0, 1, 2, 3, 6, 9, 12, 18, 24])
    y = 2 + 0.5 * x + np.random.normal(0, 0.1, len(x))
    return x.astype(float), y


@pytest.fixture
def exponential_data():
    """Dados exponenciais: y = 5 * exp(0.05 * x)."""
    np.random.seed(42)
    x = np.array([0, 1, 2, 3, 6, 9, 12, 18, 24])
    y = 5 * np.exp(0.05 * x) + np.random.normal(0, 0.1, len(x))
    return x.astype(float), y


@pytest.fixture
def logistic_data():
    """Dados logísticos: y = 100 / (1 + exp(-0.3*(x - 12)))."""
    np.random.seed(42)
    x = np.array([0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36])
    y = 100 / (1 + np.exp(-0.3 * (x - 12))) + np.random.normal(0, 1, len(x))
    return x.astype(float), y


@pytest.fixture
def data_with_outlier():
    """Dados lineares com um outlier artificial."""
    np.random.seed(42)
    x = np.array([0, 1, 2, 3, 6, 9, 12, 18, 24])
    y = 2 + 0.5 * x + np.random.normal(0, 0.1, len(x))
    # Inserir outlier no índice 4
    y[4] = y[4] + 20
    return x.astype(float), y


@pytest.fixture
def clean_linear_data():
    """Dados lineares sem nenhum outlier."""
    x = np.array([0, 3, 6, 9, 12, 18, 24], dtype=float)
    y = 5.0 + 0.3 * x
    return x, y
