"""Disk Scheduling API Router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.disk_scheduling import run_disk_scheduling, DISK_ALGORITHMS

router = APIRouter()


class DiskRequest(BaseModel):
    algorithm: str
    request_queue: list[int] = Field(min_length=1)
    initial_head: int = Field(ge=0)
    disk_size: int = Field(gt=0)
    direction: str = "right"


class DiskCompareRequest(BaseModel):
    algorithms: list[str] = Field(min_length=1)
    request_queue: list[int] = Field(min_length=1)
    initial_head: int = Field(ge=0)
    disk_size: int = Field(gt=0)
    direction: str = "right"


@router.post("/simulate")
def simulate_disk(req: DiskRequest):
    if req.algorithm not in DISK_ALGORITHMS:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {req.algorithm}"}})
    if req.initial_head >= req.disk_size:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_HEAD", "message": "Initial head position must be less than disk size.", "field": "initial_head"}})
    for r in req.request_queue:
        if r < 0 or r >= req.disk_size:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_REQUEST", "message": f"Request {r} is out of disk range [0, {req.disk_size - 1}].", "field": "request_queue"}})

    result = run_disk_scheduling(req.algorithm, req.request_queue, req.initial_head, req.disk_size, req.direction)
    return result.model_dump()


@router.post("/compare")
def compare_disk(req: DiskCompareRequest):
    results = {}
    for algo in req.algorithms:
        if algo not in DISK_ALGORITHMS:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {algo}"}})
        result = run_disk_scheduling(algo, req.request_queue, req.initial_head, req.disk_size, req.direction)
        results[algo] = result.model_dump()
    return results
