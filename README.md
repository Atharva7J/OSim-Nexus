# OSim Nexus
### Interactive Operating Systems Learning Platform

OSim Nexus is an educational platform for exploring Operating Systems concepts through interactive simulations and visualizations.

## Modules

- **CPU Scheduling:** Explore process scheduling algorithms and their execution.
- **Deadlock Management:** Study resource allocation, deadlock detection, and recovery.
- **Disk Scheduling:** Visualize disk scheduling strategies.
- **Memory Management:** Explore memory allocation concepts.
- **Paging:** Understand page-based memory management.
- **Process Synchronization:** Experiment with synchronization concepts.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Python
- FastAPI

## Project Structure

- `frontend/` — User interface and simulation pages.
- `backend/` — API routes, simulation logic, and automated tests.
- `docs/` — Architecture, algorithms, API reference, and testing documentation.

## Getting Started

### Requirements

Install a compatible version of Python and Node.js.

### Start the backend

Open a terminal in the `backend/` directory:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Start the frontend

Open a second terminal in the `frontend/` directory:

```powershell
npm ci
npm run dev
```

Follow the local URL printed by Vite in your terminal.

### Run backend tests

From the `backend/` directory, activate the virtual environment and run:

```powershell
python -m pytest
```

## Documentation

See `docs/` for algorithm explanations, architecture, API reference, and testing instructions.

## Project Status

Educational project under development. Features, algorithms, and setup instructions should be verified against the current implementation.

## Contributors

Add the names of the people who have actually contributed to the project.

## Licensing

Licensing and attribution details will be added after the applicable redistribution rights are verified.
