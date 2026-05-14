from contextlib import asynccontextmanager
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from src.api_config import API_PREFIX
from src.database.factory import get_db, init_database, shutdown_database
from src.database.interface import DatabaseInterface
from src.exceptions import register_exception_handlers
from src.filedisk import FileDiskInterface, get_file_disk
from src.modules.blog import BlogsFunction
from src.modules.image import ImagesFunction
from src.modules.message import MessagesFunction
from src.modules.project import ProjectsFunction
from src.modules.subscriber import SubscribersFunction
from src.modules.work import WorksFunction
from src.schemas import (
    BlogCreate,
    BlogCreateResponse,
    BlogDeleteResponse,
    BlogListParams,
    BlogListResponse,
    BlogPublic,
    BlogUpdateResponse,
    ImageDeleteResponse,
    ImageKind,
    ImageListResponse,
    ImageWriteResponse,
    MarkdownSaveResponse,
    MarkdownWriteBody,
    MessageCreate,
    MessageCreateResponse,
    MessageDeleteResponse,
    MessageListParams,
    MessageListResponse,
    ProjectCreate,
    ProjectCreateResponse,
    ProjectDeleteResponse,
    ProjectListParams,
    ProjectListResponse,
    ProjectPublic,
    ProjectUpdateResponse,
    SubscriberCreate,
    SubscriberCreateResponse,
    SubscriberDeleteResponse,
    SubscriberListParams,
    SubscriberListResponse,
    WorkListParams,
    WorkListResponse,
    WorkFeaturedResponse,
    WorkSummaryResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield
    shutdown_database()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)

api_router = APIRouter(prefix=API_PREFIX)


def blog_service(
    db: DatabaseInterface = Depends(get_db),
    disk: FileDiskInterface = Depends(get_file_disk),
) -> BlogsFunction:
    return BlogsFunction(db, disk)


def project_service(
    db: DatabaseInterface = Depends(get_db),
    disk: FileDiskInterface = Depends(get_file_disk),
) -> ProjectsFunction:
    return ProjectsFunction(db, disk)


def message_service(db: DatabaseInterface = Depends(get_db)) -> MessagesFunction:
    return MessagesFunction(db)


def subscriber_service(
    db: DatabaseInterface = Depends(get_db),
) -> SubscribersFunction:
    return SubscribersFunction(db)


def work_service(db: DatabaseInterface = Depends(get_db)) -> WorksFunction:
    return WorksFunction(db)


def image_service(disk: FileDiskInterface = Depends(get_file_disk)) -> ImagesFunction:
    return ImagesFunction(disk)


def _validate_upload(upload: UploadFile) -> None:
    if not upload.filename:
        raise HTTPException(status_code=422, detail="File name is required.")
    ctype = (upload.content_type or "").lower()
    if ctype and not ctype.startswith("image/"):
        raise HTTPException(status_code=422, detail="Only image uploads are allowed.")


@app.get("/healthz")
def healthz():
    return {"message": "Blog API is running"}


@api_router.get("/blogs", response_model=BlogListResponse)
def list_blogs(
    params: Annotated[BlogListParams, Depends()],
    service: BlogsFunction = Depends(blog_service),
):
    """Paginated blog list (newest ``created_on`` first). Default 10 per page."""
    return service.list_blogs(params)


@api_router.get("/blogs/{slug}", response_model=BlogPublic)
def get_blog_by_slug(slug: str, service: BlogsFunction = Depends(blog_service)):
    return service.get_blog_by_slug(slug)


@api_router.post("/blogs", response_model=BlogCreateResponse)
def create_blog(
    request: BlogCreate, service: BlogsFunction = Depends(blog_service)
):
    return service.create_blog(request)


@api_router.put("/blogs/{slug}", response_model=BlogUpdateResponse)
def update_blog(
    slug: str,
    request: BlogCreate,
    service: BlogsFunction = Depends(blog_service),
):
    return service.update_blog(slug, request)


@api_router.put("/blogs/{slug}/markdown", response_model=MarkdownSaveResponse)
def save_blog_markdown(
    slug: str,
    body: MarkdownWriteBody,
    service: BlogsFunction = Depends(blog_service),
):
    """Persist markdown body to blog storage and normalize ``filepath_md``."""
    return service.save_blog_markdown(slug, body)


@api_router.delete("/blogs/{slug}", response_model=BlogDeleteResponse)
def delete_blog(slug: str, service: BlogsFunction = Depends(blog_service)):
    return service.delete_blog(slug)


@api_router.get("/projects", response_model=ProjectListResponse)
def list_projects(
    params: Annotated[ProjectListParams, Depends()],
    service: ProjectsFunction = Depends(project_service),
):
    """Paginated project list (newest ``created_on`` first). Default 10 per page."""
    return service.list_projects(params)


@api_router.get("/projects/{slug}", response_model=ProjectPublic)
def get_project_by_slug(
    slug: str, service: ProjectsFunction = Depends(project_service)
):
    return service.get_project_by_slug(slug)


@api_router.post("/projects", response_model=ProjectCreateResponse)
def create_project(
    request: ProjectCreate, service: ProjectsFunction = Depends(project_service)
):
    return service.create_project(request)


@api_router.put("/projects/{slug}", response_model=ProjectUpdateResponse)
def update_project(
    slug: str,
    request: ProjectCreate,
    service: ProjectsFunction = Depends(project_service),
):
    return service.update_project(slug, request)


@api_router.put("/projects/{slug}/markdown", response_model=MarkdownSaveResponse)
def save_project_markdown(
    slug: str,
    body: MarkdownWriteBody,
    service: ProjectsFunction = Depends(project_service),
):
    """Persist markdown body to project storage and normalize ``filepath_md``."""
    return service.save_project_markdown(slug, body)


@api_router.delete("/projects/{slug}", response_model=ProjectDeleteResponse)
def delete_project(
    slug: str, service: ProjectsFunction = Depends(project_service)
):
    return service.delete_project(slug)


@api_router.get("/images", response_model=ImageListResponse)
def list_images(
    kind: Annotated[Optional[ImageKind], Query()] = None,
    service: ImagesFunction = Depends(image_service),
):
    """List stored blog/project images (from disk or S3)."""
    return service.list_images(kind_filter=kind)


@api_router.post("/images", response_model=ImageWriteResponse)
async def upload_image(
    kind: Annotated[ImageKind, Form()],
    slug: Annotated[str, Form()],
    file: UploadFile = File(...),
    service: ImagesFunction = Depends(image_service),
):
    _validate_upload(file)
    content = await file.read()
    try:
        return service.save_image(
            kind=kind, slug=slug, image_name=file.filename or "", content=content
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@api_router.put("/images/{kind}/{slug}/{image_name}", response_model=ImageWriteResponse)
async def replace_image(
    kind: ImageKind,
    slug: str,
    image_name: str,
    file: UploadFile = File(...),
    service: ImagesFunction = Depends(image_service),
):
    _validate_upload(file)
    content = await file.read()
    try:
        return service.replace_image(
            kind=kind, slug=slug, image_name=image_name, content=content
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@api_router.delete(
    "/images/{kind}/{slug}/{image_name}", response_model=ImageDeleteResponse
)
def delete_image(
    kind: ImageKind,
    slug: str,
    image_name: str,
    service: ImagesFunction = Depends(image_service),
):
    try:
        return service.delete_image(kind=kind, slug=slug, image_name=image_name)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@api_router.get("/messages", response_model=MessageListResponse)
def list_messages(
    params: Annotated[MessageListParams, Depends()],
    service: MessagesFunction = Depends(message_service),
):
    """Paginated contact message list (newest ``created_on`` first)."""
    return service.list_messages(params)


@api_router.post("/messages", response_model=MessageCreateResponse)
def create_message(
    request: MessageCreate, service: MessagesFunction = Depends(message_service)
):
    return service.create_message(request)


@api_router.delete("/messages/{message_id}", response_model=MessageDeleteResponse)
def delete_message(
    message_id: str, service: MessagesFunction = Depends(message_service)
):
    """Remove contact message by document ``id`` (path segment is URL-encoded)."""
    return service.delete_message_by_id(message_id)


@api_router.get("/subscribers", response_model=SubscriberListResponse)
def list_subscribers(
    params: Annotated[SubscriberListParams, Depends()],
    service: SubscribersFunction = Depends(subscriber_service),
):
    """Paginated subscribers list (newest ``created_on`` first)."""
    return service.list_subscribers(params)


@api_router.post("/subscribers", response_model=SubscriberCreateResponse)
def create_subscriber(
    request: SubscriberCreate,
    service: SubscribersFunction = Depends(subscriber_service),
):
    return service.create_subscriber(request)


@api_router.delete("/subscribers/{subscriber_id}", response_model=SubscriberDeleteResponse)
def delete_subscriber(
    subscriber_id: str, service: SubscribersFunction = Depends(subscriber_service)
):
    """Remove subscriber by document ``id`` (path segment is URL-decoded)."""
    return service.delete_subscriber_by_id(subscriber_id)


@api_router.get("/work", response_model=WorkListResponse)
def list_work(
    params: Annotated[WorkListParams, Depends()],
    service: WorksFunction = Depends(work_service),
):
    """
    Merged blogs + projects, newest ``created_on`` first, paginated with
    ``page`` and ``per_page``.
    """
    return service.list_work(params)


@api_router.get("/work-summary", response_model=WorkSummaryResponse)
def get_work_summary(service: WorksFunction = Depends(work_service)):
    """Dashboard summary counts for admin work overview."""
    return service.get_work_summary()


@api_router.get("/work-featured", response_model=WorkFeaturedResponse)
def list_work_featured(service: WorksFunction = Depends(work_service)):
    """Featured work cards ordered by ``feat_order``."""
    return service.list_work_featured()


app.include_router(api_router)

handler = Mangum(app)
