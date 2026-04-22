import json
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage

from prisma import Json
from auth import require_auth
from posthog_client import capture as posthog_capture
from storage import upload_image

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/stream")
async def chat_stream(
    message: str = Form(""),
    image: Optional[UploadFile] = File(None),
    user: dict = Depends(require_auth),
):
    """SSE streaming chat endpoint. Runs the LangGraph agent and streams tokens."""
    from main import db
    from agent.graph import build_graph

    user_id = user.get("sub", "")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    # Handle image upload if present
    image_url: str | None = None
    if image and image.filename:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported image type: {image.content_type}")
        file_bytes = await image.read()
        if len(file_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail="Image exceeds 5 MB limit")
        image_url = upload_image(file_bytes, user_id, image.content_type)

    text = message.strip()
    if not text and not image_url:
        raise HTTPException(status_code=400, detail="Message or image required")

    # Save user message to DB
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if db_user:
        create_data: dict = {
            "role": "user",
            "content": text or "[image]",
            "user": {"connect": {"id": db_user.id}},
        }
        if image_url:
            create_data["metadata"] = Json(json.dumps({"image_url": image_url}))
        await db.chatmessage.create(data=create_data)

    # Build the HumanMessage — multimodal if image present
    if image_url:
        human_content = [
            {"type": "text", "text": text or "What do you see in this image?"},
            {"type": "image_url", "image_url": {"url": image_url}},
        ]
    else:
        human_content = text

    graph = build_graph()
    run_id = f"{user_id}:{date.today().isoformat()}"

    async def event_stream():
        full_response = ""
        tool_logs = []

        try:
            async for event in graph.astream_events(
                {
                    "messages": [HumanMessage(content=human_content)],
                    "user_id": user_id,
                    "run_id": run_id,
                },
                version="v2",
            ):
                kind = event.get("event", "")

                # Stream LLM tokens
                if kind == "on_chat_model_stream":
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        content = chunk.content
                        if isinstance(content, str):
                            full_response += content
                            yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

                # Tool execution results
                elif kind == "on_tool_end":
                    output = event.get("data", {}).get("output", "")
                    tool_name = event.get("name", "")
                    if tool_name and output:
                        # Extract .content from ToolMessage objects, fall back to str
                        result = getattr(output, "content", None) or str(output)
                        log_entry = {"tool": tool_name, "result": result}
                        tool_logs.append(log_entry)
                        yield f"data: {json.dumps({'type': 'extraction', 'logs': [log_entry]})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # Fire PostHog events without blocking the stream
        posthog_capture(user_id, "chat_response_generated", {
            "response_length": len(full_response),
            "tool_count": len(tool_logs),
        })
        for tl in tool_logs:
            posthog_capture(user_id, "tool_called", {"tool_name": tl["tool"]})

        # Save assistant message to DB
        if db_user and full_response:
            create_data = {
                    "role": "assistant",
                    "content": full_response,
                    "user": {"connect": {"id": db_user.id}},
                }
            if tool_logs:
                create_data["metadata"] = Json(json.dumps({"tool_logs": tool_logs}))
            await db.chatmessage.create(data=create_data)

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history")
async def chat_history(
    before: str = "",
    limit: int = 20,
    user: dict = Depends(require_auth),
):
    """Get paginated chat history. Uses cursor-based pagination."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if not db_user:
        return {"messages": []}

    # Clamp limit to avoid abuse
    limit = min(limit, 50)

    where: dict = {"user_id": db_user.id}

    # Use Prisma skip/cursor for efficient pagination instead of extra lookup
    cursor_kwargs: dict = {}
    if before:
        cursor_kwargs["cursor"] = {"id": before}
        cursor_kwargs["skip"] = 1  # skip the cursor item itself

    messages = await db.chatmessage.find_many(
        where=where,
        order={"created_at": "desc"},
        take=limit,
        **cursor_kwargs,
    )

    return {
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "metadata": m.metadata,
                "created_at": m.created_at.isoformat(),
            }
            for m in reversed(messages)
        ],
        "has_more": len(messages) == limit,
    }


@router.get("/context")
async def chat_context(user: dict = Depends(require_auth)):
    """SSE stream: LLM-generated opener based on user profile, time, and recent activity."""
    from main import db
    from agent.context import get_recent_summary_for_user, get_user_profile
    from agent.graph import get_llm

    user_id = user.get("sub", "")
    db_user = await db.user.find_first(where={"supabase_id": user_id})

    hour = datetime.now().hour
    time_of_day = "morning" if hour < 12 else "afternoon" if hour < 17 else "evening"

    if db_user:
        profile = await get_user_profile(db, user_id)
        summary = await get_recent_summary_for_user(db, db_user)
        msg_count = await db.chatmessage.count(where={"user_id": db_user.id})
        is_first = msg_count == 0
    else:
        profile = "New user"
        summary = "No activity yet."
        is_first = True

    first_ctx = " This is their FIRST time chatting — introduce yourself briefly as their coach." if is_first else ""
    prompt = (
        f"You are Coach — a direct, warm fitness coach in the Fity app. "
        f"It's {time_of_day}.{first_ctx} "
        f"User: {profile}. Recent 7 days: {summary}. "
        f"Write a single short opener message (1-2 sentences). No emojis. Sound like a real coach texting."
    )

    llm = get_llm()

    async def event_stream():
        full_response = ""
        try:
            async for chunk in llm.astream(prompt):
                if chunk.content:
                    full_response += chunk.content
                    yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # Save opener to DB so we have a record of coach-initiated messages
        if db_user and full_response:
            await db.chatmessage.create(
                data={
                    "role": "assistant",
                    "content": full_response,
                    "user": {"connect": {"id": db_user.id}},
                }
            )

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
