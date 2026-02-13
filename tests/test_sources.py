"""Tests for the data source fetchers."""

import pytest
from claude_code_mastery.sources import (
    _is_claude_relevant,
    _extract_title,
    _extract_tags,
    _content_hash,
    _is_within_window,
    Update,
)
from datetime import datetime, timezone, timedelta


# --- _is_claude_relevant ---

class TestIsClaudeRelevant:
    def test_direct_mention(self):
        assert _is_claude_relevant("Claude Code update") is True

    def test_mcp_mention(self):
        assert _is_claude_relevant("New MCP features") is True

    def test_model_mention(self):
        assert _is_claude_relevant("Opus model performance") is True

    def test_irrelevant(self):
        assert _is_claude_relevant("How to make pancakes") is False

    def test_case_insensitive(self):
        assert _is_claude_relevant("CLAUDE CODE is great") is True

    def test_hooks_relevant(self):
        assert _is_claude_relevant("hooks system update") is True

    def test_agent_teams(self):
        assert _is_claude_relevant("agent teams orchestration") is True

    def test_sdk_mention(self):
        assert _is_claude_relevant("new SDK released") is True


# --- _extract_title ---

class TestExtractTitle:
    def test_short_text(self):
        assert _extract_title("Hello world") == "Hello world"

    def test_sentence_extraction(self):
        result = _extract_title("First sentence. Second sentence.")
        assert result == "First sentence"

    def test_long_text_truncated(self):
        long = "A" * 100
        result = _extract_title(long)
        assert len(result) <= 80


# --- _extract_tags ---

class TestExtractTags:
    def test_claude_code(self):
        tags = _extract_tags("claude code update")
        assert "claude-code" in tags

    def test_mcp(self):
        tags = _extract_tags("model context protocol features")
        assert "mcp" in tags

    def test_multiple_tags(self):
        tags = _extract_tags("claude code hooks and mcp")
        assert "claude-code" in tags
        assert "hooks" in tags
        assert "mcp" in tags

    def test_model_update(self):
        tags = _extract_tags("new opus model released")
        assert "model-update" in tags

    def test_no_tags(self):
        tags = _extract_tags("nothing relevant here")
        assert tags == []


# --- _content_hash ---

class TestContentHash:
    def test_same_content_same_hash(self):
        u1 = Update(source="test", title="Hello", content="World", url="", date="", tags=[])
        u2 = Update(source="test", title="Hello", content="World", url="", date="", tags=[])
        assert _content_hash(u1) == _content_hash(u2)

    def test_different_content_different_hash(self):
        u1 = Update(source="test", title="Hello", content="World", url="", date="", tags=[])
        u2 = Update(source="test", title="Goodbye", content="World", url="", date="", tags=[])
        assert _content_hash(u1) != _content_hash(u2)

    def test_different_source_different_hash(self):
        u1 = Update(source="blog", title="Hello", content="World", url="", date="", tags=[])
        u2 = Update(source="reddit", title="Hello", content="World", url="", date="", tags=[])
        assert _content_hash(u1) != _content_hash(u2)


# --- _is_within_window ---

class TestIsWithinWindow:
    def test_recent_date(self):
        recent = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        assert _is_within_window(recent, cutoff) is True

    def test_old_date(self):
        old = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        assert _is_within_window(old, cutoff) is False

    def test_unparseable_included(self):
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        assert _is_within_window("not-a-date", cutoff) is True

    def test_z_suffix(self):
        recent = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        assert _is_within_window(recent, cutoff) is True
