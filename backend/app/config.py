import logging

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/smartnote_db"

    # JWT
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # OpenAI
    OPENAI_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    APP_TITLE: str = "Smart-Note & Task Orchestrator API"
    APP_VERSION: str = "0.1.0"

    # CORS — comma-separated list of allowed origins for production.
    # Ignored in development (all origins are allowed).
    # Example: "http://localhost:3000,https://app.example.com"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        if self.APP_ENV == "development":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @model_validator(mode="after")
    def _validate_secret_key(self) -> "Settings":
        if self.SECRET_KEY == "change-me":
            if self.APP_ENV == "production":
                raise ValueError(
                    "SECRET_KEY must be changed before running in production. "
                    'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
                )
            _logger.warning(
                "SECRET_KEY is set to the insecure default 'change-me'. "
                "Set a strong SECRET_KEY in .env before deploying to production."
            )
        return self


settings = Settings()
