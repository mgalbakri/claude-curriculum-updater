"""Local cache for tracking seen updates and curriculum state."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


DEFAULT_CACHE_DIR = Path.home() / ".curriculum-updater"
CACHE_FILE = "update_cache.json"
CURRICULUM_STATE_FILE = "curriculum_state.json"


def get_cache_dir() -> Path:
    """Get or create the cache directory."""
    cache_dir = DEFAULT_CACHE_DIR
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def load_cache() -> dict:
    """Load the update cache from disk."""
    cache_file = get_cache_dir() / CACHE_FILE
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"seen_updates": [], "last_check": None, "applied_updates": []}


def save_cache(cache: dict) -> None:
    """Save the update cache to disk."""
    cache_file = get_cache_dir() / CACHE_FILE
    cache_file.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def mark_update_seen(update_key: str) -> None:
    """Mark an update as seen."""
    cache = load_cache()
    if update_key not in cache["seen_updates"]:
        cache["seen_updates"].append(update_key)
    cache["last_check"] = datetime.now(timezone.utc).isoformat()
    save_cache(cache)


def mark_update_applied(update_key: str, details: str) -> None:
    """Mark an update as applied to the curriculum."""
    cache = load_cache()
    cache["applied_updates"].append({
        "key": update_key,
        "details": details,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    })
    save_cache(cache)


def is_update_seen(update_key: str) -> bool:
    """Check if an update has already been seen."""
    cache = load_cache()
    return update_key in cache["seen_updates"]


def get_last_check_time() -> Optional[str]:
    """Get the timestamp of the last update check."""
    cache = load_cache()
    return cache.get("last_check")


def get_update_key(source: str, title: str) -> str:
    """Generate a unique key for an update."""
    # Simple hash based on source + first 50 chars of title
    clean_title = title.lower().strip()[:50]
    return f"{source}::{clean_title}"


def load_curriculum_state() -> dict:
    """Load the curriculum progress state."""
    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    if state_file.exists():
        try:
            return json.loads(state_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "current_week": 1,
        "curriculum_version": "v2",
        "curriculum_path": None,
        "last_updated": None,
    }


def save_curriculum_state(state: dict) -> None:
    """Save curriculum progress state."""
    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")
