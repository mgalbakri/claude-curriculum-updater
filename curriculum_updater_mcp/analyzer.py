"""Curriculum analysis and update logic."""

import json
import os
import re
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

from .sources import Update


# --- Data Models ---

@dataclass
class CurriculumGap:
    """A gap between current curriculum and latest updates."""
    update: Update
    affected_weeks: list[int]  # Which weeks this affects (0 = new topic needed)
    gap_type: str  # "new_feature", "deprecated", "updated", "new_topic"
    priority: str  # "high", "medium", "low"
    suggestion: str  # What to change in the curriculum
    
    def to_dict(self) -> dict:
        result = asdict(self)
        return result


@dataclass
class CurriculumUpdate:
    """A specific update to apply to the curriculum."""
    week: int  # 0 = new appendix item
    section: str  # Which section to update
    action: str  # "add", "replace", "append"
    content: str  # The new content
    reason: str  # Why this update is needed


# --- Curriculum Topic Map ---
# Maps curriculum weeks to their core topics for gap analysis

CURRICULUM_TOPIC_MAP = {
    1: {
        "title": "The Terminal & File System",
        "topics": ["terminal", "bash", "file system", "node.js", "npm", "command line", "cli"],
        "phase": "Foundation",
    },
    2: {
        "title": "Git & Version Control",
        "topics": ["git", "github", "version control", "branches", "pull requests", "commits"],
        "phase": "Foundation",
    },
    3: {
        "title": "Claude Code: First Contact",
        "topics": ["claude code install", "authentication", "plan mode", "diffs", "/compact", "/clear", "/help", "/model", "claude.md", "CLAUDE.md"],
        "phase": "Foundation",
    },
    4: {
        "title": "First Full Application",
        "topics": ["react", "next.js", "web app", "vercel", "deployment", "components"],
        "phase": "Building",
    },
    5: {
        "title": "Databases & APIs",
        "topics": ["database", "supabase", "sql", "api", "rest", "crud", "schema"],
        "phase": "Building",
    },
    6: {
        "title": "Authentication & Dashboards",
        "topics": ["auth", "authentication", "dashboard", "login", "protected routes", "responsive"],
        "phase": "Building",
    },
    7: {
        "title": "Testing & Quality",
        "topics": ["testing", "unit test", "integration test", "verification loop", "/code-review"],
        "phase": "Building",
    },
    8: {
        "title": "Second Project: Domain Deep Dive",
        "topics": ["project scoping", "external apis", "data visualization", "documentation", "readme"],
        "phase": "Building",
    },
    9: {
        "title": "Skills, Hooks & Custom Commands",
        "topics": ["skills", "skill.md", "hooks", "pretooluse", "posttooluse", "custom commands", "slash commands", ".claude/commands"],
        "phase": "Mastery",
    },
    10: {
        "title": "MCP Servers & Plugins",
        "topics": ["mcp", "model context protocol", "mcp server", "fastmcp", "plugins", "external tools"],
        "phase": "Mastery",
    },
    11: {
        "title": "Agent Teams & Parallel Sessions",
        "topics": ["agent teams", "multi-agent", "parallel sessions", "headless mode", "orchestration", "background tasks"],
        "phase": "Mastery",
    },
    12: {
        "title": "Capstone & Portfolio",
        "topics": ["capstone", "portfolio", "production", "ci/cd", "professional workflow", "full project"],
        "phase": "Mastery",
    },
}


# --- Analysis Functions ---

def analyze_gaps(updates: list[Update], curriculum_content: Optional[str] = None) -> list[CurriculumGap]:
    """
    Compare updates against the curriculum and identify gaps.
    
    Args:
        updates: List of recent updates from various sources
        curriculum_content: Optional raw markdown of the current curriculum file
        
    Returns:
        List of identified gaps with suggestions
    """
    gaps = []
    
    for update in updates:
        update_text = f"{update.title} {update.content}".lower()
        
        # Find which weeks this update affects
        affected_weeks = _find_affected_weeks(update_text)
        
        # Determine gap type and priority
        gap_type = _classify_gap(update, update_text, curriculum_content)
        priority = _assess_priority(update, gap_type, affected_weeks)
        
        # Generate suggestion
        suggestion = _generate_suggestion(update, affected_weeks, gap_type)
        
        if suggestion:  # Only include if we have actionable suggestion
            gaps.append(CurriculumGap(
                update=update,
                affected_weeks=affected_weeks,
                gap_type=gap_type,
                priority=priority,
                suggestion=suggestion,
            ))
    
    # Sort by priority (high first)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    gaps.sort(key=lambda g: priority_order.get(g.priority, 3))
    
    return gaps


def _find_affected_weeks(text: str) -> list[int]:
    """Find which curriculum weeks are affected by this update."""
    affected = []
    
    for week_num, info in CURRICULUM_TOPIC_MAP.items():
        for topic in info["topics"]:
            if topic in text:
                if week_num not in affected:
                    affected.append(week_num)
                break
    
    # If no existing week matches, this might be a new topic
    if not affected:
        affected = [0]  # 0 = needs new section or appendix
    
    return sorted(affected)


def _classify_gap(update: Update, text: str, curriculum_content: Optional[str]) -> str:
    """Classify the type of gap."""
    
    # Check for deprecation signals
    deprecation_signals = ["deprecated", "removed", "no longer", "replaced by", "breaking change", "sunset"]
    if any(signal in text for signal in deprecation_signals):
        return "deprecated"
    
    # Check for new feature signals
    new_signals = ["introducing", "new feature", "now available", "just shipped", "launched", "announcing", "release"]
    if any(signal in text for signal in new_signals):
        return "new_feature"
    
    # Check for updates to existing features
    update_signals = ["updated", "improved", "enhanced", "faster", "better", "changed", "upgrade"]
    if any(signal in text for signal in update_signals):
        return "updated"
    
    # If curriculum content is provided, check if topic exists
    if curriculum_content:
        # Extract key terms from the update
        key_terms = [t for t in update.tags if t not in ["claude-code"]]
        if key_terms:
            content_lower = curriculum_content.lower()
            if not any(term.replace("-", " ") in content_lower for term in key_terms):
                return "new_topic"
    
    return "new_feature"


def _assess_priority(update: Update, gap_type: str, affected_weeks: list[int]) -> str:
    """Assess the priority of addressing this gap."""
    
    # Deprecations are always high priority
    if gap_type == "deprecated":
        return "high"
    
    # New features from official sources are high priority
    if gap_type == "new_feature" and update.source in ["anthropic_blog", "anthropic_changelog", "github_releases"]:
        return "high"
    
    # Updates to foundation weeks (1-3) are high priority for beginners
    if any(w in [1, 2, 3] for w in affected_weeks):
        return "high"
    
    # Boris's posts about major features
    if update.source == "x_boris" and any(tag in update.tags for tag in ["claude-code", "mcp", "agent-teams", "model-update"]):
        return "medium"
    
    # Everything else
    return "low"


def _generate_suggestion(update: Update, affected_weeks: list[int], gap_type: str) -> str:
    """Generate a specific suggestion for how to update the curriculum."""
    
    week_refs = ", ".join(
        f"Week {w}" if w > 0 else "New Section" 
        for w in affected_weeks
    )
    
    if gap_type == "deprecated":
        return (
            f"⚠️ DEPRECATION: {update.title}\n"
            f"Affects: {week_refs}\n"
            f"Action: Review and remove/replace deprecated content.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "new_feature":
        return (
            f"🆕 NEW FEATURE: {update.title}\n"
            f"Add to: {week_refs}\n"
            f"Action: Add new topic or exercise covering this feature.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "updated":
        return (
            f"🔄 UPDATE: {update.title}\n"
            f"Update: {week_refs}\n"
            f"Action: Refresh existing content to reflect changes.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    if gap_type == "new_topic":
        return (
            f"📚 NEW TOPIC: {update.title}\n"
            f"Consider: Adding to {week_refs} or creating supplemental material.\n"
            f"Details: {update.content[:200]}\n"
            f"Source: {update.url}"
        )
    
    return ""


def generate_update_report(gaps: list[CurriculumGap]) -> str:
    """Generate a formatted markdown report of all gaps and suggestions."""
    
    if not gaps:
        return "✅ **Curriculum is up to date!** No gaps found between latest updates and current curriculum content."
    
    high = [g for g in gaps if g.priority == "high"]
    medium = [g for g in gaps if g.priority == "medium"]
    low = [g for g in gaps if g.priority == "low"]
    
    report = "# Curriculum Update Report\n\n"
    report += f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
    report += f"**Total gaps found:** {len(gaps)} ({len(high)} high, {len(medium)} medium, {len(low)} low priority)\n\n"
    
    if high:
        report += "## 🔴 High Priority\n\n"
        for gap in high:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    if medium:
        report += "## 🟡 Medium Priority\n\n"
        for gap in medium:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    if low:
        report += "## 🟢 Low Priority\n\n"
        for gap in low:
            report += f"{gap.suggestion}\n\n---\n\n"
    
    # Summary of affected weeks
    all_weeks = set()
    for gap in gaps:
        all_weeks.update(gap.affected_weeks)
    
    report += "## Affected Weeks Summary\n\n"
    for week in sorted(all_weeks):
        if week == 0:
            report += "- **New Section Needed** — Content that doesn't fit existing weeks\n"
        else:
            info = CURRICULUM_TOPIC_MAP.get(week, {})
            title = info.get("title", "Unknown")
            count = sum(1 for g in gaps if week in g.affected_weeks)
            report += f"- **Week {week}: {title}** — {count} update(s)\n"
    
    return report


def load_curriculum_file(path: str) -> Optional[str]:
    """Load curriculum markdown file from disk."""
    try:
        p = Path(path).expanduser()
        if p.exists():
            return p.read_text(encoding="utf-8")
    except Exception:
        pass
    return None


def save_curriculum_file(path: str, content: str) -> bool:
    """Save updated curriculum to disk."""
    try:
        p = Path(path).expanduser()
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return True
    except Exception:
        return False
