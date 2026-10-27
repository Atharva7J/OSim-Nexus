"""CPU Scheduling API Router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.cpu_scheduling import run_scheduling, ALGORITHMS

router = APIRouter()


class ProcessInput(BaseModel):
    pid: str
    arrival_time: int = Field(ge=0)
    burst_time: int = Field(gt=0)
    priority: int = Field(default=0, ge=0)


class SchedulingRequest(BaseModel):
    algorithm: str
    processes: list[ProcessInput] = Field(min_length=1)
    time_quantum: int = Field(default=2, gt=0)

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        valid = set(ALGORITHMS.keys())
        if v not in valid:
            raise ValueError(f"Unknown algorithm '{v}'. Valid: {sorted(valid)}")
        return v

    @field_validator("processes")
    @classmethod
    def validate_unique_pids(cls, v: list[ProcessInput]) -> list[ProcessInput]:
        pids = [p.pid for p in v]
        if len(pids) != len(set(pids)):
            raise ValueError("Duplicate process IDs are not allowed.")
        return v


class CompareRequest(BaseModel):
    algorithms: list[str] = Field(min_length=1)
    processes: list[ProcessInput] = Field(min_length=1)
    time_quantum: int = Field(default=2, gt=0)


@router.post("/schedule")
def schedule(req: SchedulingRequest):
    try:
        processes = [p.model_dump() for p in req.processes]
        result = run_scheduling(req.algorithm, processes, req.time_quantum)
        return result.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_INPUT", "message": str(e)}})


@router.post("/compare")
def compare(req: CompareRequest):
    """Run multiple algorithms on the same input for comparison."""
    results = {}
    processes = [p.model_dump() for p in req.processes]
    for algo in req.algorithms:
        if algo not in ALGORITHMS:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {algo}"}})
        result = run_scheduling(algo, processes, req.time_quantum)
        results[algo] = result.model_dump()
    return results
