from pydantic import BaseSettings


class Settings(BaseSettings):
    deriv_app_id: int = 1089
    deriv_api_endpoint: str = "wss://ws.binaryws.com/websockets/v3"
    deriv_token: str | None = None
    llm_api_url: str | None = None
    llm_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"
    cors_allow_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"


timeframe_granularity = {
    "1m": 60,
    "1h": 3600,
    "1d": 86400,
}

settings = Settings()
