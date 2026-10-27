# OSim Nexus — REST API Reference

The FastAPI backend exposes endpoints rooted under `/api`.

---

## 1. System Health
- **`GET /api/health`**
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "service": "osim-nexus-api",
      "version": "1.0.0"
    }
    ```

---

## 2. CPU Scheduling
- **`POST /api/cpu/schedule`**
  - **Payload**:
    ```json
    {
      "algorithm": "fcfs",
      "processes": [
        {"pid": "P1", "arrival_time": 0, "burst_time": 5, "priority": 2},
        {"pid": "P2", "arrival_time": 1, "burst_time": 3, "priority": 1}
      ],
      "time_quantum": 2
    }
    ```
  - **Response (200 OK)**: Returns `gantt_chart`, `metrics`, `events`, and aggregate statistics (`avg_waiting_time`, `avg_turnaround_time`, etc.).

---

## 3. Contiguous Memory Management
- **`POST /api/memory/simulate`**
  - **Payload**:
    ```json
    {
      "total_memory": 1000,
      "algorithm": "first_fit",
      "operations": [
        {"type": "allocate", "pid": "P1", "size": 200},
        {"type": "allocate", "pid": "P2", "size": 300},
        {"type": "deallocate", "pid": "P1"}
      ]
    }
    ```
  - **Response (200 OK)**: Returns `snapshots` for each operation, `final_state`, `blocks`, and `external_fragmentation`.

---

## 4. Page Replacement
- **`POST /api/paging/simulate`**
  - **Payload**:
    ```json
    {
      "algorithm": "fifo",
      "reference_string": [7, 0, 1, 2, 0, 3, 0, 4, 2, 3],
      "num_frames": 3
    }
    ```
  - **Response (200 OK)**: Returns `page_faults`, `page_hits`, `hit_ratio`, `fault_ratio`, `steps`, and `events`.

---

## 5. Deadlock Detection & Banker's Algorithm
- **`POST /api/deadlock/bankers`**
  - **Payload**:
    ```json
    {
      "available": [3, 3, 2],
      "maximum": [[7,5,3], [3,2,2], [9,0,2], [2,2,2], [4,3,3]],
      "allocation": [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]],
      "process_ids": ["P0", "P1", "P2", "P3", "P4"]
    }
    ```
  - **Response (200 OK)**: Returns `is_safe`, `safe_sequence`, `need`, and `events`.

---

## 6. Disk Scheduling
- **`POST /api/disk/simulate`**
  - **Payload**:
    ```json
    {
      "algorithm": "scan",
      "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
      "initial_head": 53,
      "disk_size": 200,
      "direction": "right"
    }
    ```
  - **Response (200 OK)**: Returns `seek_sequence`, `total_head_movement`, `average_seek_distance`, and `events`.

---

## 7. Process Synchronization
- **`POST /api/sync/producer-consumer`**
- **`POST /api/sync/dining-philosophers`**
