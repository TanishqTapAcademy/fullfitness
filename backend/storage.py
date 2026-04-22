import mimetypes
import uuid

from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

_client: Client | None = None
BUCKET = "chat-images"


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client


def upload_image(file_bytes: bytes, user_id: str, content_type: str) -> str:
    """Upload image to Supabase Storage. Returns the public URL."""
    ext = mimetypes.guess_extension(content_type) or ".jpg"
    ext = ext.lstrip(".")
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"{user_id}/{filename}"

    client = _get_client()
    client.storage.from_(BUCKET).upload(
        path=path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "false"},
    )
    return client.storage.from_(BUCKET).get_public_url(path)
