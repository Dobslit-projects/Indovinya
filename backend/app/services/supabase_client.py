from supabase import create_client, Client
from app.config import settings

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


def get_ensaio_data(
    nome_produto: str,
    ensaio_normalizado: str,
    tipo_estudo: str,
) -> list[dict]:
    """Busca dados de um ensaio específico do Supabase."""
    table = "dados_acelerado" if tipo_estudo == "Acelerado" else "dados_longa_duracao"
    client = get_client()

    response = (
        client.table(table)
        .select("*")
        .eq("nome_produto", nome_produto)
        .eq("ensaio_normalizado", ensaio_normalizado)
        .order("periodo_dias")
        .execute()
    )

    return response.data or []
