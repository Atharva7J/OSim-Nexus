# OSim Nexus — Algorithm Specification & Formulas

This document details the mathematical models, formulas, and operational behaviors implemented across OSim Nexus modules.

---

## 1. CPU Scheduling

### Metrics & Formulas
- **Completion Time ($CT$)**: Time instant when process finishes execution.
- **Turnaround Time ($TAT$)**:
  $$TAT = CT - AT$$
  where $AT$ is Arrival Time.
- **Waiting Time ($WT$)**:
  $$WT = TAT - BT$$
  where $BT$ is Burst Time.
- **Response Time ($RT$)**: Time from arrival until first scheduled on CPU.
  $$RT = \text{Start Time} - AT$$
- **CPU Utilization**:
  $$\text{Utilization} = \frac{\sum BT}{\text{Total Time}} \times 100\%$$
- **Throughput**:
  $$\text{Throughput} = \frac{N}{\text{Total Time}}$$

### Supported Algorithms
1. **First-Come, First-Served (FCFS)**: Non-preemptive, ordered strictly by $AT$.
2. **Shortest Job First (SJF)**: Non-preemptive, selects process with shortest remaining burst from arrived set.
3. **Shortest Remaining Time First (SRTF)**: Preemptive variant of SJF; evaluated at every time step or process arrival.
4. **Round Robin (RR)**: Preemptive; processes take turns in a FIFO queue for up to time quantum $q$. Context switches recorded whenever a new process is dispatched.
5. **Priority Scheduling (Non-Preemptive)**: Lower numerical value = higher priority.
6. **Priority Scheduling (Preemptive)**: Arriving process with higher priority preempts currently executing process.

---

## 2. Page Replacement

### Metrics
- **Page Fault**: Requested page is not present in any physical frame.
- **Page Hit**: Requested page already resides in a frame.
- **Hit Ratio**: $\frac{\text{Hits}}{\text{Total References}}$
- **Fault Ratio**: $\frac{\text{Faults}}{\text{Total References}}$

### Algorithms
1. **FIFO**: Replaces page residing the longest in physical memory.
2. **LRU**: Replaces page unreferenced for the longest interval.
3. **Optimal (OPT / MIN)**: Replaces page that will not be used for the longest future duration.
4. **Second Chance (Clock)**: FIFO with reference bit; resets bit to 0 and gives page a second pass if bit was 1.

---

## 3. Contiguous Memory Management

### Placement Strategies
- **First Fit**: Allocates the first available hole of size $\ge S$.
- **Best Fit**: Allocates the smallest available hole of size $\ge S$.
- **Worst Fit**: Allocates the largest available hole of size $\ge S$.
- **Next Fit**: Begins search from location of previous allocation.

### Coalescing & Fragmentation
- **External Fragmentation**:
  $$\text{ExtFrag} = 1.0 - \frac{\text{Largest Free Block}}{\text{Total Free Memory}}$$
- **Coalescing**: When process deallocates, contiguous adjacent free blocks are automatically merged into a single free block.

---

## 4. Deadlock & Banker's Algorithm

### Banker's Safety Algorithm
1. **Need Calculation**:
   $$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$
2. **Safety Check**:
   - Initialize $\text{Work} = \text{Available}$, $\text{Finish}[i] = \text{False}$.
   - Find process $i$ such that $\text{Finish}[i] == \text{False}$ and $\text{Need}[i] \le \text{Work}$.
   - If found: $\text{Work} = \text{Work} + \text{Allocation}[i]$, $\text{Finish}[i] = \text{True}$.
   - System is **Safe** if all processes finish; safe sequence recorded. Otherwise **Unsafe**.

---

## 5. Disk Scheduling

### Metrics
- **Total Head Movement**:
  $$\sum_{i=1}^{k} |\text{Cylinder}_i - \text{Cylinder}_{i-1}|$$
- **Average Seek Distance**:
  $$\frac{\text{Total Head Movement}}{N}$$

### Algorithms
1. **FCFS**: Services requests in arrival order.
2. **SSTF**: Selects pending request with minimum seek distance from current position.
3. **SCAN (Elevator)**: Moves toward one boundary servicing requests, reverses at disk end, and continues in opposite direction.
4. **C-SCAN**: Moves toward boundary, jumps to cylinder 0 without servicing on return, then sweeps outward.
5. **LOOK**: SCAN without traversing to disk boundary unless requested.
6. **C-LOOK**: C-SCAN without traversing to disk boundary unless requested.
