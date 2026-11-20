from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import EyeEnum, GenderEnum, PaginatedScans, ScanCreate, ScanResponse
from ..services import scan_service

router = APIRouter(prefix="/api/v1/scans", tags=["scans"])


@router.post("/", status_code=201, response_model=ScanResponse)
async def create_scan(
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    eye_examined: str = Form(...),
    scan_date: str = Form(...),
    oct_image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    if oct_image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, detail="Only JPEG and PNG images are accepted"
        )

    image_bytes = await oct_image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be under 10MB")

    try:
        parsed_scan_date = datetime.fromisoformat(scan_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="scan_date must be ISO format")

    try:
        form_data = ScanCreate(
            patient_name=patient_name,
            patient_id=patient_id,
            age=age,
            gender=GenderEnum(gender.upper()),
            eye_examined=EyeEnum(eye_examined.upper()),
            scan_date=parsed_scan_date,
        )

    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc

    return await scan_service.create_scan(
        db=db,
        form_data=form_data,
        image_bytes=image_bytes,
        original_filename=oct_image.filename or "scan.jpg",
        content_type=oct_image.content_type or "image/jpeg",
    )


@router.get("/", response_model=PaginatedScans)
async def list_scans(
    page: int = 1,
    page_size: int = 20,
    prediction: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> PaginatedScans:
    return await scan_service.list_scans(
        db=db,
        page=page,
        page_size=page_size,
        prediction=prediction,
    )


@router.get("/patient/{patient_id}", response_model=list[ScanResponse])
async def get_patient_scans(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[ScanResponse]:
    return await scan_service.get_patient_scans(db=db, patient_id=patient_id)


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)) -> ScanResponse:
    result = await scan_service.get_scan(db=db, scan_id=scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found")
    return result


@router.delete("/{scan_id}", status_code=204)
async def delete_scan(scan_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    deleted = await scan_service.delete_scan(db=db, scan_id=scan_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Scan not found")
    return Response(status_code=204)
