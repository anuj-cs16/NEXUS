"""NEXUS Event Bus — async in-memory pub/sub dispatcher.

Enables decoupled communication between services, agents, and
the real-time streaming layer (WebSocket/SSE).
"""

from __future__ import annotations

import asyncio
from collections import defaultdict
from collections.abc import Callable, Coroutine
from typing import TYPE_CHECKING, Any
from uuid import uuid4

import structlog

if TYPE_CHECKING:
    from nexus.core.events import EventEnvelope

logger = structlog.get_logger(__name__)

# Type alias for async event handlers
EventHandler = Callable[["EventEnvelope"], Coroutine[Any, Any, None]]


class EventBus:
    """Async in-memory event bus with topic-based routing.

    Supports:
    - Type-specific subscriptions (e.g., "task.created")
    - Wildcard subscriptions ("*" receives all events)
    - Queue-based subscribers for streaming (WebSocket/SSE)
    """

    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = defaultdict(list)
        self._queues: dict[str, asyncio.Queue[EventEnvelope]] = {}
        self._lock = asyncio.Lock()

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Register an async handler for a specific event type.

        Args:
            event_type: Event type string (e.g., "task.created") or "*" for all.
            handler: Async callable receiving an EventEnvelope.
        """
        self._handlers[event_type].append(handler)
        logger.debug("event_bus.subscribe", event_type=event_type)

    def unsubscribe(self, event_type: str, handler: EventHandler) -> None:
        """Remove a handler from the subscription list."""
        handlers = self._handlers.get(event_type, [])
        if handler in handlers:
            handlers.remove(handler)
            logger.debug("event_bus.unsubscribe", event_type=event_type)

    async def create_queue(self, filter_key: str | None = None) -> tuple[str, asyncio.Queue[EventEnvelope]]:
        """Create a new subscriber queue for streaming.

        Args:
            filter_key: Optional key to filter events (e.g., task_id).

        Returns:
            Tuple of (subscription_id, queue).
        """
        sub_id = f"sub_{uuid4().hex[:12]}"
        queue: asyncio.Queue[EventEnvelope] = asyncio.Queue(maxsize=1000)
        async with self._lock:
            self._queues[sub_id] = queue
        logger.debug("event_bus.queue_created", sub_id=sub_id, filter_key=filter_key)
        return sub_id, queue

    async def remove_queue(self, sub_id: str) -> None:
        """Remove a subscriber queue."""
        async with self._lock:
            self._queues.pop(sub_id, None)
        logger.debug("event_bus.queue_removed", sub_id=sub_id)

    async def publish(self, event: EventEnvelope) -> None:
        """Publish an event to all matching subscribers.

        Dispatches to:
        1. Handlers registered for the specific event type
        2. Handlers registered for wildcard ("*")
        3. All subscriber queues
        """
        event_type = event.event_type.value if hasattr(event.event_type, "value") else str(event.event_type)

        logger.debug(
            "event_bus.publish",
            event_type=event_type,
            event_id=event.event_id,
            task_id=event.task_id,
        )

        # Dispatch to type-specific handlers
        for handler in self._handlers.get(event_type, []):
            try:
                await handler(event)
            except Exception:
                logger.exception("event_bus.handler_error", event_type=event_type)

        # Dispatch to wildcard handlers
        for handler in self._handlers.get("*", []):
            try:
                await handler(event)
            except Exception:
                logger.exception("event_bus.wildcard_handler_error", event_type=event_type)

        # Dispatch to all queues (non-blocking)
        async with self._lock:
            for sub_id, queue in self._queues.items():
                try:
                    queue.put_nowait(event)
                except asyncio.QueueFull:
                    logger.warning("event_bus.queue_full", sub_id=sub_id)


# Global singleton
event_bus = EventBus()
