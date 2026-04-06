"""
Testes do endpoint /api/analysis.
Usa mocking do Supabase para não depender de conexão real.
"""

from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _mock_ensaio_data():
    """Dados mock simulando retorno do Supabase."""
    return [
        {
            "periodo": "0 dia",
            "periodo_dias": 0,
            "valor": "5.0",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
        {
            "periodo": "1m",
            "periodo_dias": 30,
            "valor": "5.5",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
        {
            "periodo": "3m",
            "periodo_dias": 90,
            "valor": "6.2",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
        {
            "periodo": "6m",
            "periodo_dias": 180,
            "valor": "7.1",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
        {
            "periodo": "12m",
            "periodo_dias": 365,
            "valor": "8.5",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
    ]


@patch("app.routers.analysis.get_ensaio_data")
def test_analysis_endpoint_success(mock_get):
    mock_get.return_value = _mock_ensaio_data()

    response = client.post(
        "/api/analysis",
        json={
            "nome_produto": "Produto X",
            "ensaio_normalizado": "pH",
            "tipo_estudo": "Acelerado",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "data_points" in data
    assert "fitted_curve" in data
    assert "projection_curve" in data
    assert len(data["data_points"]) == 5
    assert data["spec_min"] == 3.0
    assert data["spec_max"] == 10.0
    assert data["failure_mode"] == "two_sided"


@patch("app.routers.analysis.get_ensaio_data")
def test_analysis_endpoint_no_data(mock_get):
    mock_get.return_value = []

    response = client.post(
        "/api/analysis",
        json={
            "nome_produto": "Inexistente",
            "ensaio_normalizado": "pH",
            "tipo_estudo": "Acelerado",
        },
    )

    assert response.status_code == 404


@patch("app.routers.analysis.get_ensaio_data")
def test_analysis_endpoint_insufficient_data(mock_get):
    mock_get.return_value = [
        {
            "periodo": "0 dia",
            "periodo_dias": 0,
            "valor": "5.0",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
        {
            "periodo": "1m",
            "periodo_dias": 30,
            "valor": "5.5",
            "spec_min": 3.0,
            "spec_max": 10.0,
            "spec_tipo": "RANGE",
            "especificacao": "3.0 - 10.0",
        },
    ]

    response = client.post(
        "/api/analysis",
        json={
            "nome_produto": "Produto X",
            "ensaio_normalizado": "pH",
            "tipo_estudo": "Acelerado",
        },
    )

    assert response.status_code == 422


@patch("app.routers.analysis.get_ensaio_data")
def test_analysis_endpoint_qualitativo(mock_get):
    mock_get.return_value = [
        {
            "periodo": "0 dia",
            "periodo_dias": 0,
            "valor": "normal",
            "spec_min": None,
            "spec_max": None,
            "spec_tipo": "QUALITATIVO",
            "especificacao": "Normal",
        },
    ]

    response = client.post(
        "/api/analysis",
        json={
            "nome_produto": "Produto X",
            "ensaio_normalizado": "Aspecto",
            "tipo_estudo": "Acelerado",
        },
    )

    assert response.status_code == 422


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
