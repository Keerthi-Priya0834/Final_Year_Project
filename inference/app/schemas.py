from pydantic import BaseModel


class AMDProbabilities(BaseModel):
    NORMAL: float
    DRUSEN: float
    DME: float
    CNV: float


class StageProbabilities(BaseModel):
    BEGINNER: float
    INTERMEDIATE: float
    ADVANCED: float


class VisibilityProbabilities(BaseModel):
    VISIBILITY: float


class InferenceResponse(BaseModel):
    amd_result: AMDProbabilities
    stage_result: StageProbabilities
    visibility_result: VisibilityProbabilities
