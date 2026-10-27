"""Memory Management API Router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.memory_management import MemoryManager

router = APIRouter()


class AllocateRequest(BaseModel):
    pid: str
    size: int = Field(gt=0)


class MemoryRequest(BaseModel):
    total_memory: int = Field(gt=0)
    algorithm: str = "first_fit"
    operations: list[dict]

    model_config = {
        "json_schema_extra": {
            "example": {
                "total_memory": 1000,
                "algorithm": "first_fit",
                "operations": [
                    {"type": "allocate", "pid": "P1", "size": 200},
                    {"type": "allocate", "pid": "P2", "size": 300},
                    {"type": "deallocate", "pid": "P1"},
                    {"type": "allocate", "pid": "P3", "size": 250},
                ],
            }
        }
    }


@router.post("/simulate")
def simulate_memory(req: MemoryRequest):
    valid_algos = {"first_fit", "best_fit", "worst_fit", "next_fit"}
    if req.algorithm not in valid_algos:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ALGORITHM", "message": f"Unknown algorithm: {req.algorithm}. Valid: {sorted(valid_algos)}"}})

    mgr = MemoryManager(req.total_memory)
    snapshots = []

    for op in req.operations:
        op_type = op.get("type")
        if op_type == "allocate":
            pid = op.get("pid", "")
            size = op.get("size", 0)
            if size <= 0:
                raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_SIZE", "message": "Allocation size must be positive.", "field": "size"}})
            mgr.allocate(pid, size, req.algorithm)
        elif op_type == "deallocate":
            pid = op.get("pid", "")
            mgr.deallocate(pid)
        else:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_OPERATION", "message": f"Unknown operation: {op_type}"}})
        snapshots.append(mgr.get_state().model_dump())

    return {"algorithm": req.algorithm, "snapshots": snapshots, "final_state": mgr.get_state().model_dump()}
