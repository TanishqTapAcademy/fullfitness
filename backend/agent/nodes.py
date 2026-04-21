from langchain_core.messages import HumanMessage, SystemMessage

from agent.state import AgentState
from agent.prompts import build_system_prompt
from agent.context import (
    get_full_context,
    save_memory,
)


async def load_context(state: AgentState) -> dict:
    """Pre-LLM node: fetch Mem0 memories, profile, and recent summary."""
    from main import db

    user_id = state["user_id"]

    # Get the last user message for memory search
    last_user_msg = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            last_user_msg = msg.content
            break

    # Single user lookup + parallel profile/summary fetch
    profile, summary, memories, db_user_id = await get_full_context(db, user_id, last_user_msg)

    return {
        "user_profile": profile,
        "recent_summary": summary,
        "memories": memories,
        "db_user_id": db_user_id,
    }


async def call_model(state: AgentState) -> dict:
    """Main agent node: call LLM with tools bound."""
    from agent.graph import get_llm_with_tools

    system = build_system_prompt(
        user_profile=state.get("user_profile", ""),
        memories=state.get("memories", ""),
        recent_summary=state.get("recent_summary", ""),
    )

    llm_with_tools = get_llm_with_tools()
    messages = [SystemMessage(content=system)] + state["messages"]
    response = await llm_with_tools.ainvoke(messages)
    return {"messages": [response]}


async def save_memory_node(state: AgentState) -> dict:
    """Post-LLM node: save the exchange to Mem0 for long-term memory."""
    user_id = state["user_id"]

    last_user = ""
    last_assistant = ""
    for msg in reversed(state["messages"]):
        if not last_assistant and hasattr(msg, "content") and msg.type == "ai":
            last_assistant = msg.content if isinstance(msg.content, str) else ""
        if not last_user and isinstance(msg, HumanMessage):
            last_user = msg.content if isinstance(msg.content, str) else ""
        if last_user and last_assistant:
            break

    if last_user and last_assistant:
        save_memory(
            user_id,
            [
                {"role": "user", "content": last_user},
                {"role": "assistant", "content": last_assistant},
            ],
        )

    return state
