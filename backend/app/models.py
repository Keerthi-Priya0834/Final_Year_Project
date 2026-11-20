from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base
from .schemas import EyeEnum, GenderEnum


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    patient_name: Mapped[str] = mapped_column(String, nullable=False)
    patient_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)

    gender: Mapped[str] = mapped_column(SQLEnum(GenderEnum), nullable=False)
    eye_examined: Mapped[str] = mapped_column(SQLEnum(EyeEnum), nullable=False)

    scan_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    prediction: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)

    # AMD probabilities
    amd_normal: Mapped[float] = mapped_column(Float, nullable=False)
    amd_drusen: Mapped[float] = mapped_column(Float, nullable=False)
    amd_dme: Mapped[float] = mapped_column(Float, nullable=False)
    amd_cnv: Mapped[float] = mapped_column(Float, nullable=False)

    # Stage probabilities
    stage_beginner: Mapped[float] = mapped_column(Float, nullable=False)
    stage_intermediate: Mapped[float] = mapped_column(Float, nullable=False)
    stage_advanced: Mapped[float] = mapped_column(Float, nullable=False)

    # Visibility
    visibility: Mapped[float] = mapped_column(Float, nullable=False)

    # LLM analysis
    llm_diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Image
    oct_image_key: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
