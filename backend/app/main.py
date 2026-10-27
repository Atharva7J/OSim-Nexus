"""OSim Nexus Backend - FastAPI Application."""
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from app.routers import cpu_scheduling, memory_management, paging, deadlock, disk_scheduling, synchronization

app = FastAPI(
    title="OSim Nexus API",
    description="Interactive Operating Systems Simulation & Visualization Lab",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cpu_scheduling.router, prefix="/api/cpu", tags=["CPU Scheduling"])
app.include_router(memory_management.router, prefix="/api/memory", tags=["Memory Management"])
app.include_router(paging.router, prefix="/api/paging", tags=["Page Replacement"])
app.include_router(deadlock.router, prefix="/api/deadlock", tags=["Deadlock"])
app.include_router(disk_scheduling.router, prefix="/api/disk", tags=["Disk Scheduling"])
app.include_router(synchronization.router, prefix="/api/sync", tags=["Synchronization"])


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "osim-nexus-api", "version": "1.0.0"}
