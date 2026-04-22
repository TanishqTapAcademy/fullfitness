import asyncio

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from agent.state import AgentState
from agent.prompts import build_system_prompt
from agent.context import (
    get_full_context,
    load_session_messages,
    save_memory,
)


async def load_context(state: AgentState) -> dict:
    """Pre-LLM node: fetch Mem0 memories, profile, and recent summary."""
    from main import db

    user_id = state["user_id"]
    run_id = state.get("run_id", "")

    # Get the last user message for memory search (handle multimodal content)
    last_user_msg = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            content = msg.content
            if isinstance(content, list):
                last_user_msg = " ".join(
                    p.get("text", "") for p in content if isinstance(p, dict) and p.get("type") == "text"
                )
            else:
                last_user_msg = content
            break

    # Single user lookup + parallel profile/summary fetch + two-tier memory search
    profile, summary, memories, db_user_id = await get_full_context(db, user_id, last_user_msg, run_id)

    # Load recent chat history from DB for conversational context
    chat_history: list[dict] = []
    if db_user_id:
        try:
            chat_history = await load_session_messages(db, db_user_id)
        except Exception as e:
            print(f"[context] chat history load error: {e}")

    return {
        "user_profile": profile,
        "recent_summary": summary,
        "memories": memories,
        "db_user_id": db_user_id,
        "chat_history": chat_history,
    }


async def call_model(state: AgentState) -> dict:
    """Main agent node: call LLM with tools bound."""
    from agent.graph import get_llm_with_tools

    system = build_system_prompt(
        user_profile=state.get("user_profile", ""),
        memories=state.get("memories", ""),
        recent_summary=state.get("recent_summary", ""),
        user_id=state.get("user_id", ""),
    )

    llm_with_tools = get_llm_with_tools()

    # Build message list: system + chat history (from DB) + current turn messages
    # Exclude the last DB message if it matches the current user message (already in state)
    chat_history = list(state.get("chat_history", []))
    if chat_history and chat_history[-1]["role"] == "user":
        raw_content = state["messages"][-1].content if state["messages"] else ""
        # Extract text for comparison (multimodal content is a list)
        if isinstance(raw_content, list):
            current_msg = " ".join(
                p.get("text", "") for p in raw_content if isinstance(p, dict) and p.get("type") == "text"
            )
        else:
            current_msg = raw_content
        if chat_history[-1]["content"] == current_msg:
            chat_history.pop()

    history_msgs = []
    for m in chat_history:
        if m["role"] == "user":
            # Rebuild multimodal message if image_url is in metadata
            meta = m.get("metadata") or {}
            if isinstance(meta, str):
                import json as _json
                try:
                    meta = _json.loads(meta)
                except Exception:
                    meta = {}
            image_url = meta.get("image_url")
            if image_url:
                history_msgs.append(HumanMessage(content=[
                    {"type": "text", "text": m["content"] if m["content"] != "[image]" else "Look at this image."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ]))
            else:
                history_msgs.append(HumanMessage(content=m["content"]))
        elif m["role"] == "assistant":
            history_msgs.append(AIMessage(content=m["content"]))

    messages = [SystemMessage(content=system)] + history_msgs + state["messages"]
    response = await llm_with_tools.ainvoke(messages)
    return {"messages": [response]}


async def save_memory_node(state: AgentState) -> dict:
    """Post-LLM node: load full session messages and save to Mem0 (awaited)."""
    from main import db

    user_id = state["user_id"]
    run_id = state.get("run_id", "")
    db_user_id = state.get("db_user_id", "")

    # Get current assistant response from graph state (not yet saved to DB)
    last_assistant = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, "content") and msg.type == "ai":
            last_assistant = msg.content if isinstance(msg.content, str) else ""
            break

    # Load full session messages from DB for richer extraction
    session_msgs: list[dict] = []
    if db_user_id:
        try:
            session_msgs = await load_session_messages(db, db_user_id)
        except Exception as e:
            print(f"[mem0] load session messages error: {e}")

    # Append current assistant response (not yet in DB)
    if last_assistant:
        session_msgs.append({"role": "assistant", "content": last_assistant})

    # Fallback: if DB returned nothing, use graph state
    if not session_msgs:
        last_user = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_user = msg.content if isinstance(msg.content, str) else ""
                break
        if last_user and last_assistant:
            session_msgs = [
                {"role": "user", "content": last_user},
                {"role": "assistant", "content": last_assistant},
            ]

    if session_msgs:
        # Awaited — ensures memory is saved before next turn
        await asyncio.to_thread(save_memory, user_id, run_id, session_msgs)

    return state
