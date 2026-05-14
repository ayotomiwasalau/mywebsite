class ProjectNotFoundError(Exception):
    """Raised when a project row is missing (maps to HTTP 404)."""


class ProjectConflictError(Exception):
    """Raised when id or slug already exists or unique index rejects write (HTTP 409)."""
