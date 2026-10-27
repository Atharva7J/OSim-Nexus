import { motion } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DocSection {
  title: string;
  content: string;
}

const sections: DocSection[] = [
  {
    title: 'CPU Scheduling — FCFS',
    content: `**Concept**: First Come First Served schedules processes in the order they arrive.\n\n**How It Works**: Processes are placed in a FIFO queue. The first process to arrive gets the CPU first. Non-preemptive.\n\n**Advantages**: Simple, easy to implement, no starvation.\n**Limitations**: Convoy effect — short processes stuck behind long ones. High average waiting time.\n**Time Complexity**: O(n)\n**Space Complexity**: O(n)`,
  },
  {
    title: 'CPU Scheduling — SJF',
    content: `**Concept**: Shortest Job First selects the process with the smallest burst time.\n\n**How It Works**: When the CPU is free, it is assigned to the ready process with the smallest burst time. Non-preemptive.\n\n**Advantages**: Optimal average waiting time for non-preemptive scheduling.\n**Limitations**: Requires knowledge of burst times (often estimated). Can cause starvation for long processes.\n**Time Complexity**: O(n²) or O(n log n) with a priority queue\n**Space Complexity**: O(n)`,
  },
  {
    title: 'CPU Scheduling — SRTF',
    content: `**Concept**: Shortest Remaining Time First is the preemptive version of SJF.\n\n**How It Works**: At each time unit, the process with the smallest remaining burst time gets the CPU. A running process can be preempted.\n\n**Advantages**: Optimal average waiting time.\n**Limitations**: High overhead from frequent context switches. Starvation possible.\n**Time Complexity**: O(n²)\n**Space Complexity**: O(n)`,
  },
  {
    title: 'CPU Scheduling — Round Robin',
    content: `**Concept**: Each process gets a fixed time quantum. Processes rotate through the CPU.\n\n**How It Works**: Processes are placed in a circular queue. Each gets at most time_quantum units. If not done, re-enqueued.\n\n**Advantages**: Fair, good response time, no starvation.\n**Limitations**: Performance depends heavily on time quantum size. Too small → high overhead. Too large → behaves like FCFS.\n**Time Complexity**: O(n × total_time / quantum)\n**Space Complexity**: O(n)`,
  },
  {
    title: 'Page Replacement — FIFO',
    content: `**Concept**: Replaces the oldest page in memory.\n\n**How It Works**: Pages are tracked in a FIFO queue. On a fault, the page at the front is evicted.\n\n**Advantages**: Simple.\n**Limitations**: Bélády's anomaly — more frames can cause more faults.\n**Time Complexity**: O(n × m)\n**Space Complexity**: O(m)`,
  },
  {
    title: 'Page Replacement — LRU',
    content: `**Concept**: Replaces the page that has not been used for the longest time.\n\n**How It Works**: Track last-use timestamps. On a fault, evict the page with the oldest timestamp.\n\n**Advantages**: Generally performs well. No Bélády's anomaly.\n**Limitations**: Expensive to implement in hardware. Requires tracking all accesses.\n**Time Complexity**: O(n × m)\n**Space Complexity**: O(m)`,
  },
  {
    title: 'Page Replacement — Optimal',
    content: `**Concept**: Replaces the page that will not be used for the longest time in the future.\n\n**How It Works**: Look ahead in the reference string. Evict the page whose next use is farthest away.\n\n**Advantages**: Minimum possible page faults — theoretical optimum.\n**Limitations**: Requires future knowledge. Not implementable in practice. Used as a benchmark.\n**Time Complexity**: O(n × m)\n**Space Complexity**: O(m)`,
  },
  {
    title: "Deadlock — Banker's Algorithm",
    content: `**Concept**: Determines if a system is in a safe state by simulating resource allocation.\n\n**How It Works**: 1. Calculate Need = Max - Allocation. 2. Find a process whose Need ≤ Work. 3. Simulate its completion (Work += Allocation). 4. Repeat. If all finish, SAFE. Otherwise, UNSAFE.\n\n**Advantages**: Prevents deadlock before it happens.\n**Limitations**: Requires advance knowledge of maximum resource needs. Conservative.\n**Time Complexity**: O(n² × m)\n**Space Complexity**: O(n × m)`,
  },
  {
    title: 'Memory Management — First Fit',
    content: `**Concept**: Allocates the first free block large enough.\n\n**How It Works**: Scan memory from the beginning. Use the first block that fits.\n\n**Advantages**: Fast allocation.\n**Limitations**: Creates external fragmentation over time.`,
  },
  {
    title: 'Disk Scheduling — SCAN',
    content: `**Concept**: The disk head moves in one direction, servicing requests, then reverses.\n\n**How It Works**: Move to the end of the disk in the current direction, then reverse. Service requests along the way.\n\n**Advantages**: Better than FCFS/SSTF for uniform distributions. No starvation.\n**Limitations**: Requests at the extremes may wait longer.`,
  },
];

export default function DocsPage() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={22} color="var(--color-accent-emerald)" />
          Documentation
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Algorithm reference, concepts, and learning guides
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sections.map((section, i) => (
          <div key={i} className="card" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => toggle(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              {section.title}
              <ChevronDown
                size={16}
                style={{
                  color: 'var(--color-text-muted)',
                  transform: expanded.has(i) ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {expanded.has(i) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '0 18px 16px',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {section.content.split('\n').map((line, j) => {
                  if (line.startsWith('**') && line.includes('**:')) {
                    const [bold, rest] = line.split('**:');
                    const label = bold.replace(/\*\*/g, '');
                    return (
                      <p key={j} style={{ marginBottom: 6 }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{label}:</strong>{rest}
                      </p>
                    );
                  }
                  return line.trim() ? <p key={j} style={{ marginBottom: 6 }}>{line}</p> : null;
                })}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
