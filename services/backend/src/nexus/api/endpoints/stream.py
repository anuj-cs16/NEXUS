"""Real-time event streaming endpoints — WebSocket and Server-Sent Events (SSE).

Per Real-Time Engine (Backend Architecture §15):
Streams typed JSON EventEnvelopes to desktop UI and mobile companion.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from nexus.core.event_bus import event_bus
from nexus.core.events import EventEnvelope

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.websocket("/ws/tasks/{task_id}")
async def task_websocket_endpoint(websocket: WebSocket, task_id: str) -> None:
    """WebSocket endpoint for bi-directional real-time task event streaming."""
    await websocket.accept()
    sub_id, queue = await event_bus.create_queue(filter_key=task_id)
    logger.info("stream.ws_connected", task_id=task_id, sub_id=sub_id)

    try:
        while True:
            # Get event from queue or wait with timeout
            try:
                event: EventEnvelope = await asyncio.wait_for(queue.get(), timeout=25.0)
                # Filter by task_id if event has a task_id attached
                if event.task_id and event.task_id != task_id:
                    continue
                await websocket.send_text(event.model_dump_json())
            except asyncio.TimeoutError:
                # Send heartbeat ping to keep connection alive
                await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        logger.info("stream.ws_disconnected", task_id=task_id, sub_id=sub_id)
    except Exception as e:
        logger.exception("stream.ws_error", task_id=task_id, error=str(e))
    finally:
        await event_bus.remove_queue(sub_id)


@router.get("/events/tasks/{task_id}")
async def task_sse_endpoint(task_id: str) -> StreamingResponse:
    """SSE endpoint for unidirectional event streaming to web/mobile clients."""

    async def event_generator() -> AsyncIterator[str]:
        sub_id, queue = await event_bus.create_queue(filter_key=task_id)
        logger.info("stream.sse_connected", task_id=task_id, sub_id=sub_id)
        try:
            while True:
                try:
                    event: EventEnvelope = await asyncio.wait_for(queue.get(), timeout=25.0)
                    if event.task_id and event.task_id != task_id:
                        continue
                    yield f"event: message\ndata: {event.model_dump_json()}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            logger.info("stream.sse_disconnected", task_id=task_id, sub_id=sub_id)
        finally:
            await event_bus.remove_queue(sub_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
