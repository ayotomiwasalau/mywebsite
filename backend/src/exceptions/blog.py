class BlogNotFoundError(Exception):
    """Raised when a blog row is missing (maps to HTTP 404)."""


class BlogConflictError(Exception):
    """Raised when id or slug already exists or unique index rejects write (HTTP 409)."""
