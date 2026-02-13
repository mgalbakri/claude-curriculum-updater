"""Tests for the cache module."""

import json
import pytest
from pathlib import Path
from claude_code_mastery.cache import (
    get_update_key,
)


class TestGetUpdateKey:
    def test_basic_key(self):
        key = get_update_key("anthropic_blog", "Hello World")
        assert key == "anthropic_blog::hello world"

    def test_truncation(self):
        long_title = "A" * 100
        key = get_update_key("test", long_title)
        # Title should be truncated to 50 chars
        assert len(key.split("::")[1]) == 50

    def test_case_normalisation(self):
        key1 = get_update_key("test", "Hello World")
        key2 = get_update_key("test", "hello world")
        assert key1 == key2

    def test_different_sources_different_keys(self):
        key1 = get_update_key("blog", "Same Title")
        key2 = get_update_key("reddit", "Same Title")
        assert key1 != key2
