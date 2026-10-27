"""Page Replacement API Router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.paging import run_page_replacement, PAGE_ALGORITHMS

router = APIRouter()


class PagingRequest(BaseModel):
    algorithm: str
    reference_string: list[int] = Field(min_length=1)
    num_frames: int = Field(gt=0)


class PagingCompareRequest(BaseModel):
    algorithms: list[str] = Field(min_length=1)
    reference_string: list[int] = Field(min_length=1)
    num_frames: int = Field(gt=0)


@router.post("/simulate")
def simulate_paging(req: PagingRequest):
    if req.algorithm not in PAGE_ALGORITHMS:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {req.algorithm}. Valid: {sorted(PAGE_ALGORITHMS.keys())}"}})
    result = run_page_replacement(req.algorithm, req.reference_string, req.num_frames)
    return result.model_dump()


@router.post("/compare")
def compare_paging(req: PagingCompareRequest):
    results = {}
    for algo in req.algorithms:
        if algo not in PAGE_ALGORITHMS:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {algo}"}})
        result = run_page_replacement(algo, req.reference_string, req.num_frames)
        results[algo] = result.model_dump()
    return results
