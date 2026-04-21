from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from config import OPENROUTER_API_KEY, OPENROUTER_MODEL
from agent.state import AgentState
from agent.nodes import load_context, call_model, save_memory_node
from agent.tools import all_tools

_llm = None
_llm_with_tools = None


def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model=OPENROUTER_MODEL,
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            streaming=True,
        )
    return _llm


def get_llm_with_tools():
    global _llm_with_tools
    if _llm_with_tools is None:
        _llm_with_tools = get_llm().bind_tools(all_tools)
    return _llm_with_tools


def should_continue(state: AgentState) -> str:
    """Route: if the last message has tool calls, go to tools. Otherwise save memory and end."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "save_memory"


def build_graph():
    """Construct and compile the LangGraph agent."""
    graph = StateGraph(AgentState)

    # Nodes
    graph.add_node("load_context", load_context)
    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode(all_tools))
    graph.add_node("save_memory", save_memory_node)

    # Edges
    graph.set_entry_point("load_context")
    graph.add_edge("load_context", "agent")
    graph.add_conditional_edges("agent", should_continue, {
        "tools": "tools",
        "save_memory": "save_memory",
    })
    graph.add_edge("tools", "agent")
    graph.add_edge("save_memory", END)

    return graph.compile()
