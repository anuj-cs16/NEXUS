"""Tests for EventBus pub/sub messaging."""

import asyncio
import pytest

from nexus.core.event_bus import EventBus
from nexus.core.events import EventEnvelope, EventType


@pytest.mark.asyncio
async def test_event_bus_publish_subscribe() -> None:
    bus = EventBus()
    received = []

    async def on_event(envelope: EventEnvelope) -> None:
        received.append(envelope)

    bus.subscribe("task.created", on_event)
    bus.subscribe("task.started", on_event)

    await bus.publish(
        EventEnvelope(
            event_type=EventType.TASK_CREATED,
            task_id="tsk_123",
            payload={"status": "pending"},
        )
    )
    await bus.publish(
        EventEnvelope(
            event_type=EventType.TASK_STARTED,
            task_id="tsk_123",
            payload={"status": "running"},
        )
    )

    assert len(received) == 2
    assert received[0].event_type == EventType.TASK_CREATED
    assert received[1].event_type == EventType.TASK_STARTED


@pytest.mark.asyncio
async def test_event_bus_queue_streaming() -> None:
    bus = EventBus()
    sub_id, queue = await bus.create_queue()

    await bus.publish(
        EventEnvelope(
            event_type=EventType.AGENT_THOUGHT,
            task_id="tsk_456",
            payload={"thought": "analyzing repository"},
        )
    )

    event = await asyncio.wait_for(queue.get(), timeout=1.0)
    assert event.event_type == EventType.AGENT_THOUGHT
    assert event.payload["thought"] == "analyzing repository"

    await bus.remove_queue(sub_id)
