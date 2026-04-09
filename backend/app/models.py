from pydantic import BaseModel


class ModelMetrics(BaseModel):
    adj_r2: float | None
    sigma: float | None
    aic: float | None


class AnalysisRequest(BaseModel):
    nome_produto: str
    ensaio_normalizado: str
    tipo_estudo: str  # "Acelerado" | "Longa Duração"
    model_name: str | None = None  # None = auto; ou "Linear"/"Exponential"/"Logistic"/"Mean"


class CustomDataPoint(BaseModel):
    periodo_dias: int
    valor: float
    periodo: str = ""


class CustomAnalysisRequest(BaseModel):
    data_points: list[CustomDataPoint]
    spec_min: float | None = None
    spec_max: float | None = None
    spec_tipo: str | None = None
    especificacao: str | None = None
    model_name: str | None = None


class DataPoint(BaseModel):
    periodo: str
    periodo_dias: int
    valor: float
    is_outlier: bool


class CurvePoint(BaseModel):
    meses: float
    valor: float
    valor_upper: float
    valor_lower: float


class AnalysisResponse(BaseModel):
    data_points: list[DataPoint]
    model_name: str
    model_params: dict[str, float]
    equation: str
    adj_r2: float
    fitted_curve: list[CurvePoint]
    projection_curve: list[CurvePoint]
    shelf_life_months: float | None
    shelf_life_error: float | None
    spec_min: float | None
    spec_max: float | None
    spec_tipo: str | None
    failure_mode: str
    especificacao: str | None
    all_models: dict[str, ModelMetrics]
