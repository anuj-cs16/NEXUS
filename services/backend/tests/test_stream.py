"""Tests for Real-time Streaming endpoints."""

import asyncio
import pytest

from nexus.core.event_bus import event_bus
from nexus.core.events import EventEnvelope, EventType
from nexus.api.endpoints.stream import task_sse_endpoint


@pytest.mark.asyncio
async def test_sse_event_generator() -> None:
    task_id = "tsk_stream123"

    # Call endpoint function to get StreamingResponse
    response = await task_sse_endpoint(task_id)
    assert response.status_code == 200
    assert response.media_type == "text/event-stream"

    gen = response.body_iterator

    # Start consuming next item in background
    consume_task = asyncio.create_task(anext(gen))
    await asyncio.sleep(0.05)  # Give time for queue creation

    # Publish an event to the bus
    await event_bus.publish(
        EventEnvelope(
            event_type=EventType.AGENT_THOUGHT,
            task_id=task_id,
            payload={"thought": "Processing request..."},
        )
    )

    item = await asyncio.wait_for(consume_task, timeout=2.0)
    assert "event: message" in item
    assert "Processing request..." in item
