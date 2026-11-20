from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class GenderEnum(str, Enum):
    Male = "MALE"
    Female = "FEMALE"
    Other = "OTHER"


class EyeEnum(str, Enum):
    Left = "LEFT"
    Right = "RIGHT"
    Both = "BOTH"


class AMDProbabilities(BaseModel):
    NORMAL: float = Field(ge=0, le=1)
    DRUSEN: float = Field(ge=0, le=1)
    DME: float = Field(ge=0, le=1)
    CNV: float = Field(ge=0, le=1)


class StageProbabilities(BaseModel):
    BEGINNER: float = Field(ge=0, le=1)
    INTERMEDIATE: float = Field(ge=0, le=1)
    ADVANCED: float = Field(ge=0, le=1)


class VisibilityProbabilities(BaseModel):
    VISIBILITY: float = Field(ge=0, le=100)


class InferenceResponse(BaseModel):
    amd_result: AMDProbabilities
    stage_result: StageProbabilities
    visibility_result: VisibilityProbabilities


class LLMAnalysis(BaseModel):
    diagnosis: str = ""
    treatment: str = ""
    summary: str = ""


class ScanCreate(BaseModel):
    patient_name: str = Field(min_length=2)
    patient_id: str = Field(min_length=3)
    age: int = Field(ge=1, le=120)
    gender: GenderEnum
    eye_examined: EyeEnum
    scan_date: datetime


class ScanResponse(BaseModel):
    id: str
    patient_name: str
    patient_id: str
    age: int
    gender: GenderEnum
    eye_examined: EyeEnum
    scan_date: datetime
    prediction: str
    confidence: float
    amd_result: AMDProbabilities
    stage_result: StageProbabilities
    visibility_result: VisibilityProbabilities
    llm_analysis: LLMAnalysis | None = None
    oct_image_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedScans(BaseModel):
    items: list[ScanResponse]
    total: int
    page: int
    page_size: int
