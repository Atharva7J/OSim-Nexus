# OSim Nexus — System Architecture

**OSim Nexus (Interactive Operating Systems Simulation & Visualization Lab)** is built with a decoupled client-server architecture:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide React + Recharts
- **Backend**: FastAPI + Python 3.14 + Pydantic v2 + Uvicorn + Pytest

---

## 1. System Overview

```
+-------------------------------------------------------------------------+
|                        OSim Nexus Web Application                       |
|                          (Vite Dev Server :5173)                        |
|                                                                         |
|  [ Dashboard ]  [ CPU Scheduling ]  [ Memory Mgmt ]  [ Page Replacement ]|
|  [ Deadlock  ]  [ Disk Scheduling]  [ Sync Lab    ]  [ Algorithm Lab    ]|
|                                                                         |
|                React 19 Components + State + Framer Motion              |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTP / JSON Requests (/api/*)
                                    v
+-------------------------------------------------------------------------+
|                        FastAPI Backend Engine                           |
|                         (Uvicorn Server :8000)                          |
|                                                                         |
|  Routers:                                                               |
|  - /api/cpu/schedule & compare   -> CPU Scheduling Simulator & Lab       |
|  - /api/memory/simulate          -> Contiguous Memory Simulator          |
|  - /api/paging/simulate & compare-> Page Replacement Simulator & Lab     |
|  - /api/deadlock/bankers         -> Banker's Algorithm Safety Check      |
|  - /api/deadlock/detect          -> Deadlock Matrix Detection            |
|  - /api/disk/simulate & compare  -> Disk Head Scheduling Simulator & Lab |
|  - /api/sync/*                   -> Producer-Consumer & Philosophers     |
+-------------------------------------------------------------------------+

```

---

## 2. Core Design Principles

1. **Deterministic Execution**:
   All simulations are deterministic given the same inputs.
2. **Textbook Accuracy**:
   All formulas strictly follow standard OS textbooks (Silberschatz, Galvin, Gagne).
3. **Discrete Event Tracing**:
   Each simulation engine produces a chronological stream of `SimulationEvent` objects (`timestamp`, `event_type`, `entity_id`, `description`, `metadata`), enabling step-by-step playback in the UI.
4. **Resilient Error Handling**:
   Every endpoint validates payloads using Pydantic v2 and returns structured HTTP 400 errors for invalid states.
