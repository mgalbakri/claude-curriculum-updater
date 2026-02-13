"""Tests for the curriculum analyzer module."""

import pytest
from claude_code_mastery.analyzer import (
    _is_bugfix_release,
    _find_affected_weeks,
    _classify_gap,
    _topic_already_covered,
    _assess_priority,
    _generate_suggestion,
    _consolidate_releases,
    _deduplicate_cross_source,
    analyze_gaps,
    CurriculumGap,
    CURRICULUM_TOPIC_MAP,
)
from claude_code_mastery.sources import Update


# --- Fixtures ---

@pytest.fixture
def sample_curriculum():
    """A minimal curriculum markdown for testing."""
    return """
# 12-Week Claude Code Mastery Curriculum v2.1

## Phase 1: Foundation (Weeks 1-3)

### WEEK 1: The Terminal & File System
**Topics:**
- Terminal basics, bash commands
- Node.js and npm setup
- Token optimization and /compact

### WEEK 2: Git & Version Control
**Topics:**
- Git fundamentals, branches
- GitHub pull requests

### WEEK 3: Claude Code: First Contact
**Topics:**
- Claude Code installation and auth
- Plan mode, diffs, /clear, /help
- Models: Opus 4.6, Sonnet 4.5, Haiku 4.5
- CLAUDE.md project context

## Phase 2: Building (Weeks 4-8)

### WEEK 9: Skills, Hooks & Custom Commands
**Topics:**
- Skill frontmatter, SKILL.MD
- Hook events and hook types (command, prompt, agent)
- /hooks menu
- Custom slash commands via .claude/commands

### WEEK 10: MCP Servers & Plugins
**Topics:**
- MCP server setup, MCP tool, MCP serve
- Model Context Protocol
- fastmcp

### WEEK 11: Agent Teams & Parallel Sessions
**Topics:**
- Built-in subagent types
- Custom agents
- Agent SDK

## Appendix B: CLI Reference
| Flag | Description |
| --print | Output-only mode |
| --model | Select model |
| CLAUDE_MODEL | Environment variable |
| ANTHROPIC_API_KEY | Auth key |

## Appendix G: Permissions
- Permission mode, allowedTools
- bypassPermissions
- Sandbox configuration

## Appendix I: IDE Integrations
- VS Code, JetBrains integration
- IDE integration settings
"""


@pytest.fixture
def make_update():
    """Factory for creating test Update objects."""
    def _make(title="Test Update", content="", source="anthropic_blog",
              url="", date="2025-05-01", tags=None):
        return Update(
            source=source,
            title=title,
            content=content or title,
            url=url,
            date=date,
            tags=tags or [],
        )
    return _make


# --- _is_bugfix_release ---

class TestIsBugfixRelease:
    def test_empty_body(self):
        assert _is_bugfix_release("") is True

    def test_only_fixes(self):
        body = "- Fixed auth issue\n- Fix token counting"
        assert _is_bugfix_release(body) is True

    def test_has_features(self):
        body = "- Added new hook events\n- Fixed bug"
        assert _is_bugfix_release(body) is False

    def test_new_keyword_in_body(self):
        body = "Introducing support for agent teams"
        assert _is_bugfix_release(body) is False

    def test_only_fix_prefixed_lines(self):
        body = "- Fixed crash on startup\n- Fixed memory leak\n- Fixed test flakiness"
        assert _is_bugfix_release(body) is True


# --- _find_affected_weeks ---

class TestFindAffectedWeeks:
    def test_git_matches_week2(self):
        result = _find_affected_weeks("improved git integration")
        assert 2 in result

    def test_mcp_matches_week10(self):
        result = _find_affected_weeks("new mcp server feature")
        assert 10 in result

    def test_hooks_matches_week9(self):
        result = _find_affected_weeks("new hooks feature pretooluse")
        assert 9 in result

    def test_no_match_returns_zero(self):
        result = _find_affected_weeks("completely unrelated topic xyz")
        assert result == [0]

    def test_multiple_weeks(self):
        result = _find_affected_weeks("git hooks and mcp integration")
        assert 2 in result  # git
        assert 9 in result  # hooks


# --- _topic_already_covered ---

class TestTopicAlreadyCovered:
    def test_opus_model_covered(self, make_update, sample_curriculum):
        u = make_update(title="Claude Opus 4.6 released", content="New model")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is True

    def test_sonnet_model_covered(self, make_update, sample_curriculum):
        u = make_update(title="Sonnet 4.5 benchmarks", content="Performance")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is True

    def test_hooks_covered(self, make_update, sample_curriculum):
        u = make_update(title="Hooks system update", content="Hook events improved")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is True

    def test_mcp_server_covered(self, make_update, sample_curriculum):
        u = make_update(title="MCP server configuration guide", content="MCP tool setup")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is True

    def test_agent_sdk_covered(self, make_update, sample_curriculum):
        u = make_update(title="Agent SDK released", content="Build custom agents")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is True

    def test_url_matching(self, make_update, sample_curriculum):
        curriculum = sample_curriculum + "\nhttps://example.com/already-there"
        u = make_update(title="Something", url="https://example.com/already-there")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, curriculum) is True

    def test_novel_topic_not_covered(self, make_update, sample_curriculum):
        u = make_update(title="Brand new quantum computing feature", content="Quantum integration")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, sample_curriculum) is False

    def test_version_matching(self, make_update, sample_curriculum):
        curriculum = sample_curriculum + "\nClaude Code v2.1.32 released"
        u = make_update(title="Release notes", content="Changes in v2.1.32 and v2.1.31")
        text = f"{u.title} {u.content}".lower()
        assert _topic_already_covered(u, text, curriculum) is True


# --- _classify_gap ---

class TestClassifyGap:
    def test_deprecation_detected(self, make_update):
        u = make_update(title="Feature deprecated", content="This feature is deprecated")
        text = f"{u.title} {u.content}".lower()
        assert _classify_gap(u, text, None) == "deprecated"

    def test_new_feature_detected(self, make_update):
        u = make_update(title="Introducing new hooks", content="Now available")
        text = f"{u.title} {u.content}".lower()
        assert _classify_gap(u, text, None) == "new_feature"

    def test_already_covered(self, make_update, sample_curriculum):
        u = make_update(title="Opus 4.6 analysis", content="Performance review")
        text = f"{u.title} {u.content}".lower()
        assert _classify_gap(u, text, sample_curriculum) == "already_covered"


# --- _assess_priority ---

class TestAssessPriority:
    def test_deprecation_is_high(self, make_update):
        u = make_update()
        assert _assess_priority(u, "deprecated", [5]) == "high"

    def test_bugfix_release_is_low(self, make_update):
        u = make_update(source="github_releases", tags=["bugfix"])
        assert _assess_priority(u, "new_feature", [0]) == "low"

    def test_blog_new_feature_is_high(self, make_update):
        u = make_update(source="anthropic_blog")
        assert _assess_priority(u, "new_feature", [5]) == "high"

    def test_foundation_week_is_high(self, make_update):
        u = make_update(source="reddit_claude")
        assert _assess_priority(u, "updated", [1]) == "high"


# --- _consolidate_releases ---

class TestConsolidateReleases:
    def test_separates_features_and_bugfixes(self, make_update):
        releases = [
            make_update(
                title="v2.1.40", source="github_releases",
                content="- Added new feature\n- Improved performance",
            ),
            make_update(
                title="v2.1.39", source="github_releases",
                content="- Fixed crash\n- Fixed auth bug",
            ),
        ]
        result = _consolidate_releases(releases)
        assert len(result) == 2  # One feature summary, one bugfix summary

    def test_empty_releases(self):
        assert _consolidate_releases([]) == []


# --- _deduplicate_cross_source ---

class TestDeduplicateCrossSource:
    def test_merges_same_topic(self, make_update):
        gap1 = CurriculumGap(
            update=make_update(title="Opus 4.6 released", source="anthropic_blog"),
            affected_weeks=[3],
            gap_type="new_feature",
            priority="high",
            suggestion="Add opus 4.6",
        )
        gap2 = CurriculumGap(
            update=make_update(title="Opus 4.6 benchmarks", source="reddit_claude"),
            affected_weeks=[3],
            gap_type="new_feature",
            priority="low",
            suggestion="Opus 4.6 scores",
        )
        result = _deduplicate_cross_source([gap1, gap2])
        assert len(result) == 1
        assert result[0].source_count == 2
        assert result[0].priority == "high"  # Keeps highest priority

    def test_keeps_different_topics(self, make_update):
        gap1 = CurriculumGap(
            update=make_update(title="MCP update", content="mcp features"),
            affected_weeks=[10],
            gap_type="new_feature",
            priority="high",
            suggestion="Add MCP",
        )
        gap2 = CurriculumGap(
            update=make_update(title="Something else entirely", content="no keywords"),
            affected_weeks=[0],
            gap_type="new_topic",
            priority="low",
            suggestion="New topic",
        )
        result = _deduplicate_cross_source([gap1, gap2])
        assert len(result) == 2


# --- analyze_gaps (integration) ---

class TestAnalyzeGaps:
    def test_no_updates_no_gaps(self):
        assert analyze_gaps([], None) == []

    def test_with_curriculum_filters_covered(self, make_update, sample_curriculum):
        updates = [
            make_update(title="Opus 4.6 released", content="New model"),
            make_update(title="Hooks system update", content="Hook events and types"),
        ]
        gaps = analyze_gaps(updates, sample_curriculum)
        # Both should be filtered as covered
        assert len(gaps) == 0

    def test_novel_topic_creates_gap(self, make_update, sample_curriculum):
        updates = [
            make_update(
                title="Introducing real-time collaboration",
                content="Multiple users can now edit simultaneously with presence indicators and cursor sharing",
                source="anthropic_blog",
            ),
        ]
        gaps = analyze_gaps(updates, sample_curriculum)
        assert len(gaps) >= 1
