from urllib.parse import quote
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Scan
from ..schemas import (
    AMDProbabilities,
    EyeEnum,
    GenderEnum,
    LLMAnalysis,
    PaginatedScans,
    ScanCreate,
    ScanResponse,
    StageProbabilities,
    VisibilityProbabilities,
)
from ..storage import storage
from .inference_client import run_inference
from .llm_service import generate_analysis


async def create_scan(
    db: AsyncSession,
    form_data: ScanCreate,
    image_bytes: bytes,
    original_filename: str,
    content_type: str = "image/jpeg",
) -> ScanResponse:
    scan_id = str(uuid4())
    safe_name = original_filename or "scan.jpg"
    object_key = f"scans/{scan_id}/{safe_name}"

    storage.upload(image_bytes, object_key, content_type=content_type)

    result = await run_inference(image_bytes)

    amd_probs = result.amd_result.model_dump()
    prediction, confidence = max(amd_probs.items(), key=lambda item: item[1])

    stage_result = result.stage_result.model_dump()
    visibility_result = result.visibility_result.model_dump()

    llm_analysis: LLMAnalysis | None = None
    try:
        llm_analysis = generate_analysis(result)
    except Exception:
        print("LLM analysis failed")
        llm_analysis = None

    scan = Scan(
        id=scan_id,
        patient_name=form_data.patient_name,
        patient_id=form_data.patient_id,
        age=form_data.age,
        gender=form_data.gender,
        eye_examined=form_data.eye_examined,
        scan_date=form_data.scan_date,
        prediction=prediction,
        confidence=confidence,
        amd_normal=amd_probs["NORMAL"],
        amd_drusen=amd_probs["DRUSEN"],
        amd_dme=amd_probs["DME"],
        amd_cnv=amd_probs["CNV"],
        stage_beginner=stage_result["BEGINNER"],
        stage_intermediate=stage_result["INTERMEDIATE"],
        stage_advanced=stage_result["ADVANCED"],
        visibility=float(visibility_result["VISIBILITY"]),
        llm_diagnosis=llm_analysis.diagnosis if llm_analysis else None,
        llm_treatment=llm_analysis.treatment if llm_analysis else None,
        llm_summary=llm_analysis.summary if llm_analysis else None,
        oct_image_key=object_key,
    )

    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    return _to_response(scan)


async def list_scans(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    prediction: str | None = None,
) -> PaginatedScans:
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    count_stmt = select(func.count()).select_from(Scan)
    data_stmt = select(Scan)

    if prediction:
        count_stmt = count_stmt.where(Scan.prediction == prediction)
        data_stmt = data_stmt.where(Scan.prediction == prediction)

    total = (await db.execute(count_stmt)).scalar_one()

    data_stmt = (
        data_stmt.order_by(Scan.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    rows = (await db.execute(data_stmt)).scalars().all()

    items = [_to_response(scan) for scan in rows]

    return PaginatedScans(items=items, total=total, page=page, page_size=page_size)


async def get_scan(db: AsyncSession, scan_id: str) -> ScanResponse | None:
    scan = await db.get(Scan, scan_id)
    if not scan:
        return None
    return _to_response(scan)


async def delete_scan(db: AsyncSession, scan_id: str) -> bool:
    scan = await db.get(Scan, scan_id)
    if not scan:
        return False

    await db.delete(scan)
    await db.commit()

    try:
        storage.delete(str(scan.oct_image_key))
    except Exception:
        pass

    return True


async def get_patient_scans(db: AsyncSession, patient_id: str) -> list[ScanResponse]:
    stmt = (
        select(Scan)
        .where(Scan.patient_id == patient_id)
        .order_by(Scan.created_at.desc())
    )
    rows = (await db.execute(stmt)).scalars().all()
    return [_to_response(scan) for scan in rows]


def _to_response(scan: Scan) -> ScanResponse:
    return ScanResponse(
        id=scan.id,
        patient_name=scan.patient_name,
        patient_id=scan.patient_id,
        age=scan.age,
        gender=GenderEnum(scan.gender),
        eye_examined=EyeEnum(scan.eye_examined),
        scan_date=scan.scan_date,
        prediction=scan.prediction,
        confidence=float(scan.confidence),
        amd_result=AMDProbabilities(
            NORMAL=scan.amd_normal,
            DRUSEN=scan.amd_drusen,
            DME=scan.amd_dme,
            CNV=scan.amd_cnv,
        ),
        stage_result=StageProbabilities(
            BEGINNER=scan.stage_beginner,
            INTERMEDIATE=scan.stage_intermediate,
            ADVANCED=scan.stage_advanced,
        ),
        visibility_result=VisibilityProbabilities(VISIBILITY=scan.visibility),
        llm_analysis=LLMAnalysis(
            diagnosis=scan.llm_diagnosis or "",
            treatment=scan.llm_treatment or "",
            summary=scan.llm_summary or "",
        )
        if any([scan.llm_diagnosis, scan.llm_treatment, scan.llm_summary])
        else None,
        oct_image_url=_public_image_url(str(scan.oct_image_key)),
        created_at=scan.created_at,
    )


def _public_image_url(object_key: str) -> str:
    safe_key = quote(object_key)
    return f"http://localhost:9000/{storage.bucket}/{safe_key}"
