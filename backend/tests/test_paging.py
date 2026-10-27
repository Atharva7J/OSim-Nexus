"""Tests for Page Replacement algorithms."""
import pytest
from app.services.paging import fifo, lru, optimal, second_chance


class TestFIFO:
    def test_textbook_example(self):
        ref = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
        result = fifo(ref, 3)
        assert result.page_faults == 15
        assert result.page_hits == 5
        assert result.algorithm == "FIFO"

    def test_all_same_pages(self):
        ref = [1, 1, 1, 1, 1]
        result = fifo(ref, 2)
        assert result.page_faults == 1
        assert result.page_hits == 4

    def test_single_frame(self):
        ref = [1, 2, 3, 1, 2]
        result = fifo(ref, 1)
        assert result.page_faults == 5  # Every access is a fault (except repeat would be hit if same)
        # Actually: 1(F), 2(F,evict1), 3(F,evict2), 1(F,evict3), 2(F,evict1) = 5 faults
        assert result.page_hits == 0


class TestLRU:
    def test_textbook_example(self):
        ref = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
        result = lru(ref, 3)
        assert result.page_faults == 12
        assert result.page_hits == 8

    def test_all_hits(self):
        ref = [1, 2, 1, 2, 1]
        result = lru(ref, 2)
        assert result.page_faults == 2  # Only first two are faults
        assert result.page_hits == 3


class TestOptimal:
    def test_textbook_example(self):
        ref = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
        result = optimal(ref, 3)
        assert result.page_faults == 9  # Optimal gives minimum faults
        assert result.page_hits == 11

    def test_never_reused(self):
        ref = [1, 2, 3, 4, 5]
        result = optimal(ref, 3)
        assert result.page_faults == 5  # All unique, all faults after frame fill


class TestSecondChance:
    def test_basic(self):
        ref = [7, 0, 1, 2, 0, 3, 0, 4]
        result = second_chance(ref, 3)
        assert result.page_faults > 0
        assert result.algorithm == "Second Chance"
        assert len(result.frames_over_time) == len(ref)
