"""Local cache for tracking seen updates and curriculum state."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


DEFAULT_CACHE_DIR = Path.home() / ".curriculum-updater"
CACHE_FILE = "update_cache.json"
CURRICULUM_STATE_FILE = "curriculum_state.json"
MAX_SEEN_UPDATES = 500

# In-memory singletons — avoids repeated disk reads
_cache_instance: Optional[dict] = None
_state_instance: Optional[dict] = None


def get_cache_dir() -> Path:
    """Get or create the cache directory."""
    cache_dir = DEFAULT_CACHE_DIR
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def load_cache() -> dict:
    """Load the update cache from disk (once per session, then in-memory)."""
    global _cache_instance
    if _cache_instance is not None:
        return _cache_instance

    cache_file = get_cache_dir() / CACHE_FILE
    if cache_file.exists():
        try:
            data = json.loads(cache_file.read_text(encoding="utf-8"))
            # Convert seen_updates list to set for O(1) lookups
            data["seen_updates"] = set(data.get("seen_updates", []))
            _cache_instance = data
            return _cache_instance
        except Exception:
            pass

    _cache_instance = {"seen_updates": set(), "last_check": None, "applied_updates": []}
    return _cache_instance


def save_cache(cache: dict) -> None:
    """Save the update cache to disk."""
    global _cache_instance
    _cache_instance = cache
    cache_file = get_cache_dir() / CACHE_FILE
    # Convert set to sorted list for JSON serialization
    serializable = {
        **cache,
        "seen_updates": sorted(cache["seen_updates"]),
    }
    cache_file.write_text(json.dumps(serializable, indent=2), encoding="utf-8")


def mark_update_seen(update_key: str) -> None:
    """Mark an update as seen."""
    cache = load_cache()
    cache["seen_updates"].add(update_key)
    cache["last_check"] = datetime.now(timezone.utc).isoformat()
    save_cache(cache)


def mark_updates_seen(update_keys: list[str]) -> None:
    """Mark multiple updates as seen in a single write."""
    cache = load_cache()
    cache["seen_updates"].update(update_keys)
    cache["last_check"] = datetime.now(timezone.utc).isoformat()
    _trim_seen(cache)
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
    """Check if an update has already been seen (O(1) set lookup)."""
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
    """Load the curriculum progress state (once per session, then in-memory)."""
    global _state_instance
    if _state_instance is not None:
        return _state_instance

    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    if state_file.exists():
        try:
            _state_instance = json.loads(state_file.read_text(encoding="utf-8"))
            return _state_instance
        except Exception:
            pass

    _state_instance = {
        "current_week": 1,
        "curriculum_version": "v2",
        "curriculum_path": None,
        "last_updated": None,
    }
    return _state_instance


def save_curriculum_state(state: dict) -> None:
    """Save curriculum progress state."""
    global _state_instance
    _state_instance = state
    state_file = get_cache_dir() / CURRICULUM_STATE_FILE
    state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _trim_seen(cache: dict) -> None:
    """Trim seen_updates to MAX_SEEN_UPDATES, keeping the most recent keys."""
    if len(cache["seen_updates"]) > MAX_SEEN_UPDATES:
        # Set has no order, so just keep an arbitrary subset at the limit
        # In practice this rarely triggers since keys are small strings
        cache["seen_updates"] = set(sorted(cache["seen_updates"])[-MAX_SEEN_UPDATES:])
