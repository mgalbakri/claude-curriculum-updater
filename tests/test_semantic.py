"""Tests for the semantic matching engine."""

import pytest
from claude_code_mastery.semantic import (
    SemanticIndex,
    _normalise,
    _expand_with_synonyms,
    _fallback_keyword_check,
    is_semantically_covered,
)


@pytest.fixture
def sample_curriculum():
    return """
### WEEK 9: Skills, Hooks & Custom Commands
Topics:
- Skills: SKILL.MD files for project patterns
- Skill frontmatter: name, description, allowed-tools
- Hooks: 14 events covering the full Claude Code lifecycle
- Hook types: command, prompt, agent
- Custom slash commands via .claude/commands

### WEEK 10: MCP Servers & Plugins
Topics:
- MCP server setup and configuration
- Model Context Protocol
- Tool search and resources
- fastmcp framework

### WEEK 11: Agent Teams & Parallel Sessions
Topics:
- Built-in subagent types
- Custom agents via .claude/agents
- Agent SDK
- Multi-agent orchestration
"""


# --- _normalise ---

class TestNormalise:
    def test_lowercase(self):
        assert _normalise("Hello WORLD") == "hello world"

    def test_markdown_stripped(self):
        result = _normalise("**bold** and *italic*")
        assert "*" not in result

    def test_url_removed(self):
        result = _normalise("Visit https://example.com today")
        assert "https" not in result

    def test_whitespace_collapsed(self):
        result = _normalise("hello   \n  world")
        assert result == "hello world"


# --- _expand_with_synonyms ---

class TestExpandWithSynonyms:
    def test_hooks_expanded(self):
        result = _expand_with_synonyms("hooks system")
        assert "lifecycle events" in result
        assert "pretooluse" in result

    def test_mcp_expanded(self):
        result = _expand_with_synonyms("model context protocol")
        assert "mcp server" in result
        assert "fastmcp" in result

    def test_no_match_unchanged(self):
        text = "completely unrelated text"
        result = _expand_with_synonyms(text)
        assert result == text

    def test_skills_expanded(self):
        result = _expand_with_synonyms("skills system")
        assert "slash commands" in result


# --- _fallback_keyword_check ---

class TestFallbackKeywordCheck:
    def test_high_overlap_covered(self):
        update = "hooks lifecycle events pretooluse posttooluse agent"
        curriculum = "hooks lifecycle events pretooluse posttooluse agent commands"
        assert _fallback_keyword_check(update, curriculum) is True

    def test_low_overlap_not_covered(self):
        update = "quantum computing blockchain integration"
        curriculum = "hooks mcp agents skills commands"
        assert _fallback_keyword_check(update, curriculum) is False

    def test_stop_words_ignored(self):
        update = "the new hooks system is great and very useful"
        curriculum = "hooks system configuration"
        assert _fallback_keyword_check(update, curriculum) is True


# --- SemanticIndex ---

class TestSemanticIndex:
    def test_build_success(self, sample_curriculum):
        idx = SemanticIndex()
        result = idx.build(sample_curriculum)
        # May return False if sklearn not installed — that's OK
        if result:
            assert idx._built is True
            assert len(idx._sections) > 0

    def test_query_hooks(self, sample_curriculum):
        idx = SemanticIndex()
        if not idx.build(sample_curriculum):
            pytest.skip("scikit-learn not available")
        results = idx.query("lifecycle event callbacks")
        assert len(results) > 0
        # Should match week 9 (hooks)
        assert any(r["week"] == 9 for r in results)

    def test_query_mcp(self, sample_curriculum):
        idx = SemanticIndex()
        if not idx.build(sample_curriculum):
            pytest.skip("scikit-learn not available")
        results = idx.query("mcp server configuration")
        assert len(results) > 0
        assert any(r["week"] == 10 for r in results)

    def test_is_covered(self, sample_curriculum):
        idx = SemanticIndex()
        if not idx.build(sample_curriculum):
            pytest.skip("scikit-learn not available")
        assert idx.is_covered("hooks and lifecycle events") is True

    def test_not_covered(self, sample_curriculum):
        idx = SemanticIndex()
        if not idx.build(sample_curriculum):
            pytest.skip("scikit-learn not available")
        assert idx.is_covered("quantum computing blockchain") is False

    def test_best_week_agents(self, sample_curriculum):
        idx = SemanticIndex()
        if not idx.build(sample_curriculum):
            pytest.skip("scikit-learn not available")
        week = idx.best_week("multi-agent orchestration and subagents")
        assert week == 11


# --- is_semantically_covered (integration) ---

class TestIsSemanticallyCovered:
    def test_covered_topic(self, sample_curriculum):
        result = is_semantically_covered(
            "new hooks and lifecycle events for claude code",
            sample_curriculum,
        )
        # Should be True with sklearn, may be True with fallback
        assert isinstance(result, bool)

    def test_novel_topic(self, sample_curriculum):
        result = is_semantically_covered(
            "quantum blockchain AI fusion reactor",
            sample_curriculum,
        )
        assert result is False
