class SubscriberConflictError(Exception):
    """Raised when subscriber creation violates uniqueness."""


class SubscriberNotFoundError(Exception):
    """Raised when a subscriber lookup or delete misses the email."""

