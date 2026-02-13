"""Tests for auto-apply functionality: content generation, gap conversion, apply logic, and backups."""

import pytest
from pathlib import Path
from curriculum_updater_mcp.analyzer import (
    _generate_update_content,
    convert_gaps_to_updates,
    apply_single_update,
    CurriculumGap,
    CurriculumUpdate,
)
from curriculum_updater_mcp.cache import create_curriculum_backup
from curriculum_updater_mcp.sources import Update


# --- Fixtures ---

@pytest.fixture
def make_gap():
    """Factory for creating test CurriculumGap objects."""
    def _make(
        title="Test Update",
        content="Some content here",
        source="anthropic_blog",
        url="https://example.com",
        date="2026-02-01",
        tags=None,
        affected_weeks=None,
        gap_type="new_feature",
        priority="high",
    ):
        update = Update(
            source=source,
            title=title,
            content=content,
            url=url,
            date=date,
            tags=tags or [],
        )
        return CurriculumGap(
            update=update,
            affected_weeks=affected_weeks or [0],
            gap_type=gap_type,
            priority=priority,
            suggestion=f"Suggestion for {title}",
        )
    return _make


@pytest.fixture
def sample_curriculum():
    """A minimal curriculum markdown for testing apply logic."""
    return """# Curriculum v2

## Phase I: Foundation

### WEEK 1: The Terminal
**Topics:**
- Terminal basics

---

### WEEK 2: Git & Version Control
**Topics:**
- Git fundamentals

---

## Phase II: Building

### WEEK 9: Skills & Hooks
**Topics:**
- Hooks events

---

### WEEK 10: MCP Servers
**Topics:**
- MCP setup

---

## Appendix A: CLI Reference
| Flag | Description |
| --print | Output mode |
"""


# --- _generate_update_content ---

class TestGenerateUpdateContent:
    def test_new_feature_with_week(self, make_gap):
        gap = make_gap(
            title="New Agent SDK Feature",
            content="The agent SDK now supports streaming responses",
            affected_weeks=[9],
            gap_type="new_feature",
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert cu.week == 9
        assert cu.action == "append"
        assert "New Agent SDK Feature" in cu.content
        assert "auto" in cu.reason.lower()

    def test_new_feature_without_week(self, make_gap):
        gap = make_gap(
            title="Brand New Concept",
            content="Something entirely new",
            affected_weeks=[0],
            gap_type="new_feature",
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert cu.week == 0
        assert cu.action == "new"

    def test_deprecated_generates_warning(self, make_gap):
        gap = make_gap(
            title="Old Feature Removed",
            content="This feature is no longer available",
            affected_weeks=[3],
            gap_type="deprecated",
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert cu.action == "append"
        assert "Deprecation Notice" in cu.content

    def test_updated_generates_update_note(self, make_gap):
        gap = make_gap(
            title="MCP Configuration Changed",
            content="New config options available",
            affected_weeks=[10],
            gap_type="updated",
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert cu.action == "append"
        assert cu.week == 10
        assert "Update" in cu.content

    def test_new_topic_forces_appendix(self, make_gap):
        gap = make_gap(
            title="Quantum Integration",
            content="New quantum computing integration",
            affected_weeks=[5],
            gap_type="new_topic",
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert cu.week == 0
        assert cu.action == "new"

    def test_unknown_gap_type_returns_none(self, make_gap):
        gap = make_gap(gap_type="unknown_type")
        cu = _generate_update_content(gap)
        assert cu is None

    def test_content_includes_source_url(self, make_gap):
        gap = make_gap(
            title="Test Feature",
            url="https://anthropic.com/test",
            affected_weeks=[1],
        )
        cu = _generate_update_content(gap)
        assert cu is not None
        assert "https://anthropic.com/test" in cu.content


# --- convert_gaps_to_updates ---

class TestConvertGapsToUpdates:
    def test_empty_gaps(self):
        assert convert_gaps_to_updates([]) == []

    def test_converts_multiple(self, make_gap):
        gaps = [
            make_gap(title="Feature A", affected_weeks=[1]),
            make_gap(title="Feature B", affected_weeks=[2]),
        ]
        result = convert_gaps_to_updates(gaps)
        assert len(result) == 2
        assert all(isinstance(r, CurriculumUpdate) for r in result)

    def test_skips_unconvertible(self, make_gap):
        gaps = [
            make_gap(title="Valid", affected_weeks=[1]),
            make_gap(title="Invalid", gap_type="unknown_xyz"),
        ]
        result = convert_gaps_to_updates(gaps)
        assert len(result) == 1


# --- apply_single_update ---

class TestApplySingleUpdate:
    def test_append_to_existing_week(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=1,
            section="New Topic",
            action="append",
            content="**New Topic** (added 2026-02-13)\nSome new content here.",
            reason="Test append",
        )
        result = apply_single_update(sample_curriculum, cu)
        assert "New Topic" in result
        assert "Some new content here" in result
        # The new content should appear somewhere in the curriculum
        assert len(result) > len(sample_curriculum)

    def test_append_to_missing_week_appends_at_end(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=99,
            section="Far Future Topic",
            action="append",
            content="Content for week 99",
            reason="Test missing week",
        )
        result = apply_single_update(sample_curriculum, cu)
        assert result.endswith("Content for week 99\n")

    def test_new_creates_appendix(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=0,
            section="New Appendix Section",
            action="new",
            content="Appendix content here.",
            reason="Test new appendix",
        )
        result = apply_single_update(sample_curriculum, cu)
        assert "### Appendix: New Appendix Section" in result
        assert "Appendix content here." in result

    def test_replace_existing_section(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=1,
            section="The Terminal",
            action="replace",
            content="Completely replaced content.",
            reason="Test replace",
        )
        result = apply_single_update(sample_curriculum, cu)
        assert "Completely replaced content" in result

    def test_replace_missing_section_raises(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=1,
            section="Nonexistent Section XYZ",
            action="replace",
            content="Replacement",
            reason="Test missing replace",
        )
        with pytest.raises(ValueError, match="Could not find section"):
            apply_single_update(sample_curriculum, cu)

    def test_invalid_action_raises(self, sample_curriculum):
        cu = CurriculumUpdate(
            week=1,
            section="Test",
            action="delete",
            content="Content",
            reason="Test invalid",
        )
        with pytest.raises(ValueError, match="Invalid action"):
            apply_single_update(sample_curriculum, cu)

    def test_sequential_applies(self, sample_curriculum):
        """Multiple sequential updates should all be present."""
        cu1 = CurriculumUpdate(
            week=0, section="First New", action="new",
            content="First appendix.", reason="Test 1",
        )
        cu2 = CurriculumUpdate(
            week=0, section="Second New", action="new",
            content="Second appendix.", reason="Test 2",
        )
        result = apply_single_update(sample_curriculum, cu1)
        result = apply_single_update(result, cu2)
        assert "First appendix." in result
        assert "Second appendix." in result
        assert "### Appendix: First New" in result
        assert "### Appendix: Second New" in result


# --- create_curriculum_backup ---

class TestCreateCurriculumBackup:
    def test_backup_creates_file(self, tmp_path):
        # Create a curriculum file
        curriculum = tmp_path / "curriculum.md"
        curriculum.write_text("# Test Curriculum\n\nContent here.", encoding="utf-8")

        backup_path = create_curriculum_backup(str(curriculum))
        assert backup_path is not None
        assert Path(backup_path).exists()
        assert "backup" in backup_path

    def test_backup_content_matches(self, tmp_path):
        original_content = "# Curriculum\n\nLine 1\nLine 2\nLine 3"
        curriculum = tmp_path / "curriculum.md"
        curriculum.write_text(original_content, encoding="utf-8")

        backup_path = create_curriculum_backup(str(curriculum))
        backup_content = Path(backup_path).read_text(encoding="utf-8")
        assert backup_content == original_content

    def test_backup_cleanup_keeps_max(self, tmp_path):
        curriculum = tmp_path / "curriculum.md"
        curriculum.write_text("content", encoding="utf-8")

        # Create 12 backups
        for i in range(12):
            backup = tmp_path / f"curriculum.md.backup.2026-01-{i+1:02d}-090000"
            backup.write_text(f"backup {i}", encoding="utf-8")

        # Create one more via the function
        create_curriculum_backup(str(curriculum))

        # Count remaining backups
        backups = list(tmp_path.glob("curriculum.md.backup.*"))
        assert len(backups) <= 10

    def test_backup_nonexistent_file(self, tmp_path):
        result = create_curriculum_backup(str(tmp_path / "nonexistent.md"))
        assert result is None
