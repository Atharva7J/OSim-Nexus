# OSim Nexus — Testing & Verification Guide

This guide describes how to run all automated tests and verify code quality.

---

## 1. Backend Pytest Suite

Run all backend tests:
```bash
cd backend
python -m pytest tests/ -v
```

### Coverage by Module:
- `test_cpu_scheduling.py`: FCFS, SJF, SRTF, RR, Priority (NP & P), idle gaps, arrival times, preemption.
- `test_paging.py`: FIFO, LRU, Optimal, Second Chance (Clock), Belady's anomaly checks, hit/fault counts.
- `test_memory.py`: First Fit, Best Fit, Worst Fit, Next Fit, coalescing free holes, fragmentation formula.
- `test_deadlock.py`: Silberschatz textbook Banker's safe state, unsafe state detection, deadlock detection cycle.
- `test_disk.py`: FCFS (640 seek), SSTF (236 seek), SCAN (331 right / 236 left), C-SCAN, LOOK, C-LOOK.
- `test_sync.py`: Bounded buffer semaphore transitions, overflow/underflow blocks, dining philosopher lock states.
- `test_api_endpoints.py`: End-to-end FastAPI endpoint tests across all routers.

---

## 2. Frontend Build & TypeScript Checks

Run the TypeScript compiler and Vite production build:
```bash
cd frontend
npm run build
```
Build output produces optimized static bundles with 0 compilation or type errors.

---

## 3. Frontend Linting

Run ESLint verification across source files:
```bash
cd frontend
node ./node_modules/eslint/bin/eslint.js src
```
Expected result: `0 problems (0 errors, 0 warnings)`.

---

## 4. End-to-End Browser Verification

To run locally:
1. Start Backend:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. Start Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173/` in any modern browser.
