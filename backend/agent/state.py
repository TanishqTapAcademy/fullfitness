from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    run_id: str  # Session scope for mem0 (e.g. "user_id:2026-04-22")
    db_user_id: str  # Internal DB user ID to avoid repeated lookups
    chat_history: list[dict]  # Recent chat messages from DB for conversational context
    memories: str
    user_profile: str
    recent_summary: str
