from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    use_mock_model: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
