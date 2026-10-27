"""Deadlock API Router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.deadlock import bankers_algorithm, detect_deadlock

router = APIRouter()


class BankerRequest(BaseModel):
    available: list[int]
    maximum: list[list[int]]
    allocation: list[list[int]]
    process_ids: list[str] | None = None


class DetectionRequest(BaseModel):
    available: list[int]
    allocation: list[list[int]]
    request: list[list[int]]
    process_ids: list[str] | None = None


@router.post("/bankers")
def run_bankers(req: BankerRequest):
    n = len(req.maximum)
    m = len(req.available)
    if len(req.allocation) != n:
        raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": "Allocation matrix rows must match Maximum matrix rows."}})
    for i, row in enumerate(req.maximum):
        if len(row) != m:
            raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": f"Maximum row {i} has {len(row)} columns, expected {m}."}})
    for i, row in enumerate(req.allocation):
        if len(row) != m:
            raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": f"Allocation row {i} has {len(row)} columns, expected {m}."}})
    # Validate Need >= 0
    for i in range(n):
        for j in range(m):
            if req.maximum[i][j] < req.allocation[i][j]:
                pid = req.process_ids[i] if req.process_ids else f"P{i}"
                raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_MATRICES", "message": f"Allocation[{pid}][{j}] ({req.allocation[i][j]}) exceeds Maximum[{pid}][{j}] ({req.maximum[i][j]})."}})

    result = bankers_algorithm(req.available, req.maximum, req.allocation, req.process_ids)
    return result.model_dump()


@router.post("/detect")
def run_detection(req: DetectionRequest):
    n = len(req.allocation)
    m = len(req.available)
    if len(req.request) != n:
        raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": "Request matrix rows must match Allocation matrix rows."}})
    for i, row in enumerate(req.allocation):
        if len(row) != m:
            raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": f"Allocation row {i} has {len(row)} columns, expected {m}."}})
    for i, row in enumerate(req.request):
        if len(row) != m:
            raise HTTPException(status_code=400, detail={"error": {"code": "DIMENSION_MISMATCH", "message": f"Request row {i} has {len(row)} columns, expected {m}."}})

    result = detect_deadlock(req.available, req.allocation, req.request, req.process_ids)
    return result.model_dump()

