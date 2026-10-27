"""Comprehensive tests for Memory Management algorithms.

Tests First Fit, Best Fit, Worst Fit, Next Fit, coalescing, and fragmentation.
"""
import pytest
from app.services.memory_management import MemoryManager, MemoryBlock


class TestMemoryAllocation:
    def test_first_fit_basic(self):
        mm = MemoryManager(total_memory=1000)
        assert mm.allocate("P1", 200, algorithm="first_fit") is True
        assert mm.allocate("P2", 300, algorithm="first_fit") is True
        state = mm.get_state()
        assert state.allocated_memory == 500
        assert state.free_memory == 500
        assert len(state.blocks) == 3  # [P1:200, P2:300, Free:500]
        assert state.blocks[0].pid == "P1"
        assert state.blocks[0].size == 200
        assert state.blocks[1].pid == "P2"
        assert state.blocks[1].size == 300
        assert state.blocks[2].is_free is True
        assert state.blocks[2].size == 500

    def test_best_fit_selects_smallest_adequate_block(self):
        mm = MemoryManager(total_memory=1000)
        # Setup blocks: allocate P1(200), P2(200), P3(300), P4(300)
        mm.allocate("P1", 200, "first_fit")
        mm.allocate("P2", 200, "first_fit")
        mm.allocate("P3", 300, "first_fit")
        mm.allocate("P4", 300, "first_fit")
        # Deallocate P1 (hole of 200 at 0) and P3 (hole of 300 at 400)
        mm.deallocate("P1")
        mm.deallocate("P3")
        # Best fit for 150 should pick the 200 hole (at start 0), not the 300 hole
        assert mm.allocate("P_NEW", 150, algorithm="best_fit") is True
        p_new = next(b for b in mm.blocks if b.pid == "P_NEW")
        assert p_new.start == 0
        assert p_new.size == 150

    def test_worst_fit_selects_largest_adequate_block(self):
        mm = MemoryManager(total_memory=1000)
        mm.allocate("P1", 200, "first_fit")
        mm.allocate("P2", 200, "first_fit")
        mm.allocate("P3", 300, "first_fit")
        mm.allocate("P4", 300, "first_fit")
        mm.deallocate("P1")  # hole of 200 at 0
        mm.deallocate("P3")  # hole of 300 at 400
        # Worst fit for 150 should pick the 300 hole at position 400
        assert mm.allocate("P_NEW", 150, algorithm="worst_fit") is True
        p_new = next(b for b in mm.blocks if b.pid == "P_NEW")
        assert p_new.start == 400
        assert p_new.size == 150

    def test_next_fit_circular_search(self):
        mm = MemoryManager(total_memory=1000)
        mm.allocate("P1", 200, "first_fit")
        mm.allocate("P2", 200, "first_fit")
        mm.allocate("P3", 200, "first_fit")
        mm.allocate("P4", 400, "first_fit")
        # Free P1 and P3
        mm.deallocate("P1")
        mm.deallocate("P3")
        # Reset Next Fit index by allocating using next_fit
        mm.allocate("A", 100, algorithm="next_fit")
        # Next fit will search from after A's allocation point
        mm.allocate("B", 100, algorithm="next_fit")
        assert any(b.pid == "A" for b in mm.blocks)
        assert any(b.pid == "B" for b in mm.blocks)

    def test_deallocation_merges_adjacent_free_blocks(self):
        mm = MemoryManager(total_memory=600)
        mm.allocate("P1", 200, "first_fit")
        mm.allocate("P2", 200, "first_fit")
        mm.allocate("P3", 200, "first_fit")
        assert len(mm.blocks) == 3
        # Deallocate middle block
        mm.deallocate("P2")
        assert len(mm.blocks) == 3
        # Deallocate P1 -> should merge P1 and P2 into 400 free
        mm.deallocate("P1")
        assert len(mm.blocks) == 2
        assert mm.blocks[0].is_free is True
        assert mm.blocks[0].size == 400
        # Deallocate P3 -> should merge into 600 total free
        mm.deallocate("P3")
        assert len(mm.blocks) == 1
        assert mm.blocks[0].is_free is True
        assert mm.blocks[0].size == 600

    def test_allocation_failure(self):
        mm = MemoryManager(total_memory=500)
        mm.allocate("P1", 400, "first_fit")
        # Request 200 when only 100 free
        success = mm.allocate("P2", 200, "first_fit")
        assert success is False
        state = mm.get_state()
        assert state.allocation_failures == 1
        assert state.allocated_memory == 400

    def test_fragmentation_calculation(self):
        mm = MemoryManager(total_memory=1000)
        mm.allocate("P1", 200, "first_fit")
        mm.allocate("P2", 200, "first_fit")
        mm.allocate("P3", 200, "first_fit")
        mm.allocate("P4", 400, "first_fit")
        # Deallocate P1 and P3: two holes of 200 each, total free = 400, largest free = 200
        mm.deallocate("P1")
        mm.deallocate("P3")
        state = mm.get_state()
        assert state.free_memory == 400
        assert state.largest_free_block == 200
        # external_frag = 1.0 - (largest / free) = 1.0 - (200 / 400) = 0.5
        assert state.external_fragmentation == 0.5
