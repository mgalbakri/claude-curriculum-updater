"""Tests for the documentation diffing engine."""

import pytest
from claude_code_mastery.docs_differ import (
    _section_hash,
    _extract_sections,
    diff_snapshots,
    changes_to_updates,
    _extract_diff_tags,
)


# --- _section_hash ---

class TestSectionHash:
    def test_same_text_same_hash(self):
        assert _section_hash("Hello world") == _section_hash("Hello world")

    def test_normalised_matching(self):
        # Extra whitespace should be normalised
        assert _section_hash("hello  world") == _section_hash("hello world")

    def test_case_insensitive(self):
        assert _section_hash("Hello") == _section_hash("hello")

    def test_different_text_different_hash(self):
        assert _section_hash("Hello") != _section_hash("Goodbye")


# --- _extract_sections ---

class TestExtractSections:
    def test_basic_extraction(self):
        html = """
        <main>
            <h1>Title</h1>
            <p>Some content here</p>
            <h2>Section Two</h2>
            <p>More content</p>
        </main>
        """
        sections = _extract_sections(html)
        assert "Title" in sections
        assert "Section Two" in sections

    def test_removes_nav(self):
        html = """
        <nav><a href="/">Home</a></nav>
        <main>
            <h1>Main Content</h1>
            <p>Real content</p>
        </main>
        <footer>Footer text</footer>
        """
        sections = _extract_sections(html)
        assert "Main Content" in sections
        # Nav and footer content should be excluded
        all_text = " ".join(sections.values())
        assert "Home" not in all_text

    def test_intro_section(self):
        html = """
        <main>
            <p>Intro paragraph before any heading</p>
            <h2>First Section</h2>
            <p>Section content</p>
        </main>
        """
        sections = _extract_sections(html)
        assert "__intro__" in sections


# --- diff_snapshots ---

class TestDiffSnapshots:
    def test_added_section(self):
        old = {"pages": {"https://example.com/page1": {"sections": {}}}}
        new = {"pages": {"https://example.com/page1": {"sections": {
            "New Section": {"text": "Content", "hash": "abc123"}
        }}}}
        changes = diff_snapshots(old, new)
        assert len(changes) == 1
        assert changes[0]["type"] == "added"
        assert changes[0]["section"] == "New Section"

    def test_removed_section(self):
        old = {"pages": {"https://example.com": {"sections": {
            "Old Section": {"text": "Content", "hash": "abc123"}
        }}}}
        new = {"pages": {"https://example.com": {"sections": {}}}}
        changes = diff_snapshots(old, new)
        assert len(changes) == 1
        assert changes[0]["type"] == "removed"

    def test_modified_section(self):
        old = {"pages": {"https://example.com": {"sections": {
            "Section": {"text": "Old content", "hash": "old_hash"}
        }}}}
        new = {"pages": {"https://example.com": {"sections": {
            "Section": {"text": "New content", "hash": "new_hash"}
        }}}}
        changes = diff_snapshots(old, new)
        assert len(changes) == 1
        assert changes[0]["type"] == "modified"

    def test_no_changes(self):
        snap = {"pages": {"https://example.com": {"sections": {
            "Section": {"text": "Content", "hash": "same_hash"}
        }}}}
        changes = diff_snapshots(snap, snap)
        assert len(changes) == 0

    def test_new_page(self):
        old = {"pages": {}}
        new = {"pages": {"https://new-page.com": {"sections": {
            "Intro": {"text": "Hello", "hash": "abc"}
        }}}}
        changes = diff_snapshots(old, new)
        assert len(changes) == 1
        assert changes[0]["type"] == "added"

    def test_removed_page(self):
        old = {"pages": {"https://old-page.com": {"sections": {
            "Intro": {"text": "Hello", "hash": "abc"}
        }}}}
        new = {"pages": {}}
        changes = diff_snapshots(old, new)
        assert len(changes) == 1
        assert changes[0]["type"] == "removed"


# --- changes_to_updates ---

class TestChangesToUpdates:
    def test_added_change(self):
        changes = [{
            "type": "added",
            "page": "https://docs.example.com/hooks",
            "section": "New Hook Events",
            "old_text": None,
            "new_text": "Added 5 new hook events for lifecycle management",
        }]
        updates = changes_to_updates(changes)
        assert len(updates) == 1
        assert "New docs section" in updates[0].title
        assert updates[0].source == "docs_diff"
        assert "hooks" in updates[0].tags

    def test_removed_change(self):
        changes = [{
            "type": "removed",
            "page": "https://docs.example.com/old",
            "section": "Deprecated Feature",
            "old_text": "This feature was removed",
            "new_text": None,
        }]
        updates = changes_to_updates(changes)
        assert len(updates) == 1
        assert "Removed" in updates[0].title

    def test_modified_change(self):
        changes = [{
            "type": "modified",
            "page": "https://docs.example.com/mcp",
            "section": "MCP Configuration",
            "old_text": "Old MCP setup",
            "new_text": "Updated MCP configuration with new options",
        }]
        updates = changes_to_updates(changes)
        assert len(updates) == 1
        assert "Updated" in updates[0].title
        assert "mcp" in updates[0].tags


# --- _extract_diff_tags ---

class TestExtractDiffTags:
    def test_hooks_tagged(self):
        tags = _extract_diff_tags("New Hook Events", "lifecycle hooks")
        assert "hooks" in tags
        assert "docs-change" in tags

    def test_mcp_tagged(self):
        tags = _extract_diff_tags("MCP Setup", "server configuration")
        assert "mcp" in tags

    def test_no_special_tags(self):
        tags = _extract_diff_tags("General", "some text")
        assert tags == ["docs-change"]
