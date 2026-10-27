"""Synchronization API Router."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.synchronization import producer_consumer, dining_philosophers

router = APIRouter()


class ProducerConsumerRequest(BaseModel):
    buffer_size: int = Field(default=5, gt=0)
    actions: list[dict]


class DiningPhilosophersRequest(BaseModel):
    num_philosophers: int = Field(default=5, ge=2)
    action_sequence: list[dict] | None = None


@router.post("/producer-consumer")
def run_producer_consumer(req: ProducerConsumerRequest):
    result = producer_consumer(req.actions, req.buffer_size)
    return result.model_dump()


@router.post("/dining-philosophers")
def run_dining_philosophers(req: DiningPhilosophersRequest):
    result = dining_philosophers(req.num_philosophers, req.action_sequence)
    return result.model_dump()
