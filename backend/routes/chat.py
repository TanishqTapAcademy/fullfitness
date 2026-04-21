import json
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from auth import require_auth
from posthog_client import capture as posthog_capture

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/stream")
async def chat_stream(body: ChatRequest, user: dict = Depends(require_auth)):
    """SSE streaming chat endpoint. Runs the LangGraph agent and streams tokens."""
    from main import db
    from agent.graph import build_graph

    user_id = user.get("sub", "")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    # Save user message to DB
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if db_user:
        await db.chatmessage.create(
            data={
                "user_id": db_user.id,
                "role": "user",
                "content": body.message,
            }
        )

    graph = build_graph()

    async def event_stream():
        full_response = ""
        tool_logs = []

        try:
            async for event in graph.astream_events(
                {
                    "messages": [HumanMessage(content=body.message)],
                    "user_id": user_id,
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
                        log_entry = {"tool": tool_name, "result": str(output)}
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
            await db.chatmessage.create(
                data={
                    "user_id": db_user.id,
                    "role": "assistant",
                    "content": full_response,
                    "metadata": json.dumps({"tool_logs": tool_logs}) if tool_logs else None,
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
    """Get a proactive opener message based on time of day and recent activity."""
    from main import db
    from agent.context import get_recent_summary_for_user

    user_id = user.get("sub", "")
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if not db_user:
        return {"opener": "Hey. What's on the menu today?"}

    # Pass db_user directly to avoid a second user lookup
    summary = await get_recent_summary_for_user(db, db_user)
    hour = datetime.now().hour

    if hour < 12:
        time_context = "morning"
    elif hour < 17:
        time_context = "afternoon"
    else:
        time_context = "evening"

    # Simple rule-based opener (avoids extra LLM call for speed)
    if "No activity" in summary:
        openers = {
            "morning": "Morning. What's the plan today?",
            "afternoon": "Afternoon check-in. Done anything yet?",
            "evening": "Evening. How'd today go?",
        }
    else:
        openers = {
            "morning": "Back at it. What are we hitting today?",
            "afternoon": "How's the day going? Log anything new?",
            "evening": "Good session today? Let's recap.",
        }

    return {"opener": openers.get(time_context, "Hey. What's happening?")}
