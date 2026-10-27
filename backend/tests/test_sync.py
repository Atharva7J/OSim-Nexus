"""Tests for Synchronization algorithms (Producer-Consumer and Dining Philosophers)."""
import pytest
from app.services.synchronization import producer_consumer, dining_philosophers


class TestProducerConsumer:
    def test_bounded_buffer_normal_operation(self):
        actions = [
            {"actor": "Producer1", "action": "produce", "item": "A"},
            {"actor": "Producer1", "action": "produce", "item": "B"},
            {"actor": "Consumer1", "action": "consume"},
        ]
        res = producer_consumer(actions, buffer_size=3)
        assert len(res.steps) == 3
        # After step 0: ["A"], empty=2, full=1
        assert res.steps[0].buffer_state == ["A"]
        assert res.steps[0].semaphores["empty"] == 2
        assert res.steps[0].semaphores["full"] == 1
        # After step 1: ["A", "B"], empty=1, full=2
        assert res.steps[1].buffer_state == ["A", "B"]
        # After step 2: ["B"], empty=2, full=1
        assert res.steps[2].buffer_state == ["B"]
        assert res.steps[2].semaphores["empty"] == 2
        assert res.steps[2].semaphores["full"] == 1

    def test_producer_blocks_when_full(self):
        actions = [
            {"actor": "P", "action": "produce", "item": "1"},
            {"actor": "P", "action": "produce", "item": "2"},
            {"actor": "P", "action": "produce", "item": "3"},  # buffer_size=2, this should block
        ]
        res = producer_consumer(actions, buffer_size=2)
        assert res.steps[2].action == "blocked"
        assert res.steps[2].semaphores["empty"] == 0
        assert res.steps[2].semaphores["full"] == 2

    def test_consumer_blocks_when_empty(self):
        actions = [
            {"actor": "C", "action": "consume"},  # buffer empty, should block
        ]
        res = producer_consumer(actions, buffer_size=2)
        assert res.steps[0].action == "blocked"
        assert res.steps[0].semaphores["empty"] == 2
        assert res.steps[0].semaphores["full"] == 0


class TestDiningPhilosophers:
    def test_philosopher_picks_up_both_forks_and_eats(self):
        actions = [
            {"philosopher": 0, "action": "pickup"},
        ]
        res = dining_philosophers(num_philosophers=5, action_sequence=actions)
        step = res.steps[0]
        assert step.philosophers[0] == "EATING"
        assert step.forks[0] == "P0"
        assert step.forks[1] == "P0"

    def test_neighbor_blocked_when_fork_contested(self):
        actions = [
            {"philosopher": 0, "action": "pickup"},  # P0 holds fork 0 and 1
            {"philosopher": 1, "action": "pickup"},  # P1 needs fork 1 and 2, but fork 1 is held
        ]
        res = dining_philosophers(num_philosophers=5, action_sequence=actions)
        assert res.steps[0].philosophers[0] == "EATING"
        assert res.steps[1].philosophers[1] == "HUNGRY"
        assert res.steps[1].forks[1] == "P0"

    def test_philosopher_releases_forks(self):
        actions = [
            {"philosopher": 0, "action": "pickup"},
            {"philosopher": 0, "action": "putdown"},
        ]
        res = dining_philosophers(num_philosophers=5, action_sequence=actions)
        assert res.steps[1].philosophers[0] == "THINKING"
        assert res.steps[1].forks[0] is None
        assert res.steps[1].forks[1] is None
