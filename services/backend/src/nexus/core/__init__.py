"""NEXUS core package — cross-cutting infrastructure."""

from nexus.core.event_bus import EventBus, event_bus
from nexus.core.events import EventEnvelope, EventType
from nexus.core.exceptions import NexusError

__all__ = [
    "EventBus",
    "EventEnvelope",
    "EventType",
    "NexusError",
    "event_bus",
]
