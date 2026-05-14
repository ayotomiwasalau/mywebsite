from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .blog import BlogConflictError, BlogNotFoundError
from .project import ProjectConflictError, ProjectNotFoundError
from .message import MessageNotFoundError
from .subscriber import SubscriberConflictError, SubscriberNotFoundError


def register_exception_handlers(app: FastAPI) -> None:
    """Attach domain exception → HTTP response mapping to ``app``."""

    @app.exception_handler(BlogNotFoundError)
    async def blog_not_found_handler(
        _request: Request, exc: BlogNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(BlogConflictError)
    async def blog_conflict_handler(
        _request: Request, exc: BlogConflictError
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(ProjectNotFoundError)
    async def project_not_found_handler(
        _request: Request, exc: ProjectNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ProjectConflictError)
    async def project_conflict_handler(
        _request: Request, exc: ProjectConflictError
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(SubscriberConflictError)
    async def subscriber_conflict_handler(
        _request: Request, exc: SubscriberConflictError
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(SubscriberNotFoundError)
    async def subscriber_not_found_handler(
        _request: Request, exc: SubscriberNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(MessageNotFoundError)
    async def message_not_found_handler(
        _request: Request, exc: MessageNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})
