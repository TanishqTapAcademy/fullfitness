from config import DIRECT_URL, OPENAI_API_KEY, MEM0_LLM_MODEL

_mem0_instance = None


def get_mem0():
    """Lazy initialization of Mem0 client. Returns None if API keys are missing."""
    global _mem0_instance
    if _mem0_instance is not None:
        return _mem0_instance

    if not OPENAI_API_KEY or not DIRECT_URL:
        return None

    from mem0 import Memory

    config = {
        "vector_store": {
            "provider": "supabase",
            "config": {
                "connection_string": DIRECT_URL,
                "collection_name": "memories",
                "embedding_model_dims": 1536,
                "index_method": "hnsw",
                "index_measure": "cosine_distance",
            },
        },
        "llm": {
            "provider": "openai",
            "config": {
                "model": MEM0_LLM_MODEL,
                "api_key": OPENAI_API_KEY,
            },
        },
        "embedder": {
            "provider": "openai",
            "config": {
                "model": "text-embedding-3-small",
                "api_key": OPENAI_API_KEY,
            },
        },
    }

    _mem0_instance = Memory.from_config(config)
    return _mem0_instance
