"""
Curriculum Updater MCP Server

Monitors Claude Code updates from Boris Cherny's X account, Anthropic blog,
changelog, and docs. Analyzes gaps against your learning curriculum and
suggests or applies updates.

Usage with Claude Code:
    Add to ~/.claude/settings.json under mcpServers:
    {
        "curriculum_updater": {
            "command": "python",
            "args": ["-m", "curriculum_updater_mcp.server"],
            "cwd": "/path/to/claude-curriculum-updater"
        }
    }
"""

import json
from datetime import datetime, timezone
from typing import Optional

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, ConfigDict

from .sources import (
    fetch_boris_x_posts,
    fetch_anthropic_blog,
    fetch_anthropic_changelog,
    fetch_claude_code_docs,
    fetch_github_releases,
    fetch_anthropic_youtube,
    fetch_reddit_claude,
    fetch_anthropic_discord,
    fetch_all_updates,
    Update,
)
from .analyzer import (
    analyze_gaps,
    generate_update_report,
    load_curriculum_file,
    save_curriculum_file,
    CURRICULUM_TOPIC_MAP,
)
from .cache import (
    load_cache,
    save_cache,
    mark_update_seen,
    mark_updates_seen,
    mark_update_applied,
    is_update_seen,
    get_update_key,
    get_last_check_time,
    load_curriculum_state,
    save_curriculum_state,
)

# --- Initialize Server ---

mcp = FastMCP("curriculum_updater_mcp")


# --- Input Models ---

class FetchUpdatesInput(BaseModel):
    """Input for fetching updates from all sources."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    days_back: int = Field(
        default=30,
        description="Number of days to look back for updates (1-90)",
        ge=1, le=90,
    )
    source: Optional[str] = Field(
        default=None,
        description="Specific source to fetch from: 'boris_x', 'anthropic_blog', 'anthropic_changelog', 'anthropic_docs', 'github_releases', 'youtube', 'reddit', 'discord', or None for all sources",
    )
    include_seen: bool = Field(
        default=False,
        description="Include updates that have already been seen/processed",
    )


class AnalyzeGapsInput(BaseModel):
    """Input for analyzing curriculum gaps."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    curriculum_path: Optional[str] = Field(
        default=None,
        description="Path to the curriculum markdown file. If not provided, uses the built-in topic map.",
    )
    days_back: int = Field(
        default=30,
        description="Number of days to look back for updates (1-90)",
        ge=1, le=90,
    )
    priority_filter: Optional[str] = Field(
        default=None,
        description="Filter results by priority: 'high', 'medium', 'low', or None for all",
    )


class ApplyUpdateInput(BaseModel):
    """Input for applying an update to the curriculum."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    curriculum_path: str = Field(
        ...,
        description="Path to the curriculum markdown file to update",
        min_length=1,
    )
    week: int = Field(
        ...,
        description="Week number to update (1-12), or 0 to add a new appendix section",
        ge=0, le=12,
    )
    section_title: str = Field(
        ...,
        description="Title of the new or updated section (e.g., 'Agent Teams Configuration')",
        min_length=1, max_length=200,
    )
    content: str = Field(
        ...,
        description="The content to add or replace in markdown format",
        min_length=1,
    )
    action: str = Field(
        default="append",
        description="How to apply: 'append' (add to week), 'replace' (replace section), 'new' (new week/appendix)",
    )
    reason: str = Field(
        ...,
        description="Brief explanation of why this update is needed",
        min_length=1, max_length=500,
    )


class SetCurriculumPathInput(BaseModel):
    """Input for setting the curriculum file path."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    path: str = Field(
        ...,
        description="Full path to the curriculum markdown file (e.g., '~/projects/curriculum/curriculum.md')",
        min_length=1,
    )
    current_week: int = Field(
        default=1,
        description="Your current week in the curriculum (1-12)",
        ge=1, le=12,
    )


class GetStatusInput(BaseModel):
    """Input for getting current status."""
    model_config = ConfigDict(extra="forbid")
    verbose: bool = Field(
        default=False,
        description="Include detailed cache and state information",
    )


# --- Tools ---

@mcp.tool(
    name="curriculum_fetch_updates",
    annotations={
        "title": "Fetch Claude Code Updates",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    }
)
async def curriculum_fetch_updates(params: FetchUpdatesInput) -> str:
    """Fetch the latest Claude Code updates from Boris Cherny's X account,
    Anthropic blog, changelog, and documentation.

    Monitors multiple sources for new features, deprecations, model updates,
    and tool changes relevant to your Claude Code learning curriculum.

    Args:
        params (FetchUpdatesInput): Fetch parameters including:
            - days_back (int): How far back to look (1-90 days)
            - source (str): Specific source or None for all
            - include_seen (bool): Whether to include already-processed updates

    Returns:
        str: Markdown-formatted list of discovered updates with source, date, and tags
    """
    try:
        # Fetch from specified or all sources
        if params.source == "boris_x":
            updates = await fetch_boris_x_posts(params.days_back)
        elif params.source == "anthropic_blog":
            updates = await fetch_anthropic_blog(params.days_back)
        elif params.source == "anthropic_changelog":
            updates = await fetch_anthropic_changelog(params.days_back)
        elif params.source == "anthropic_docs":
            updates = await fetch_claude_code_docs()
        elif params.source == "github_releases":
            updates = await fetch_github_releases(params.days_back)
        elif params.source == "youtube":
            updates = await fetch_anthropic_youtube(params.days_back)
        elif params.source == "reddit":
            updates = await fetch_reddit_claude(params.days_back)
        elif params.source == "discord":
            updates = await fetch_anthropic_discord(params.days_back)
        else:
            updates = await fetch_all_updates(params.days_back)

        # Filter out seen updates unless requested
        if not params.include_seen:
            updates = [
                u for u in updates
                if not is_update_seen(get_update_key(u.source, u.title))
            ]

        # Mark new updates as seen (single batch write)
        mark_updates_seen([get_update_key(u.source, u.title) for u in updates])

        if not updates:
            last_check = get_last_check_time()
            return (
                f"No new updates found in the last {params.days_back} days.\n"
                f"Last check: {last_check or 'Never'}\n\n"
                f"Try increasing days_back or use include_seen=true to see all updates."
            )

        # Format results
        result = f"# Claude Code Updates ({len(updates)} found)\n\n"
        result += f"**Period:** Last {params.days_back} days\n"
        result += f"**Checked:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n\n"

        # Group by source
        by_source = {}
        for u in updates:
            source_name = {
                "x_boris": "🐦 Boris Cherny (X)",
                "anthropic_blog": "📝 Anthropic Blog",
                "anthropic_changelog": "📋 Anthropic Changelog",
                "anthropic_docs": "📖 Claude Code Docs",
                "github_releases": "🔖 GitHub Releases",
                "youtube_anthropic": "🎥 Anthropic YouTube",
                "reddit_claude": "💬 Reddit r/ClaudeAI",
                "discord_anthropic": "🎮 Anthropic Discord",
            }.get(u.source, u.source)

            if source_name not in by_source:
                by_source[source_name] = []
            by_source[source_name].append(u)

        for source_name, source_updates in by_source.items():
            result += f"## {source_name}\n\n"
            for u in source_updates:
                tags_str = ", ".join(f"`{t}`" for t in u.tags) if u.tags else "—"
                result += f"### {u.title}\n"
                result += f"- **Date:** {u.date}\n"
                result += f"- **Tags:** {tags_str}\n"
                result += f"- **URL:** {u.url}\n"
                result += f"- **Content:** {u.content[:300]}\n\n"

        return result

    except Exception as e:
        return f"Error fetching updates: {type(e).__name__}: {str(e)}\n\nThis may be due to network issues or rate limiting. Try again in a few minutes."


@mcp.tool(
    name="curriculum_analyze_gaps",
    annotations={
        "title": "Analyze Curriculum Gaps",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    }
)
async def curriculum_analyze_gaps(params: AnalyzeGapsInput) -> str:
    """Fetch latest updates and analyze gaps against your Claude Code curriculum.

    Compares recent updates from all sources against the curriculum's topic map
    to identify new features, deprecations, and changes that should be reflected
    in the learning material.

    Args:
        params (AnalyzeGapsInput): Analysis parameters including:
            - curriculum_path (str): Path to curriculum markdown file
            - days_back (int): How far back to look (1-90 days)
            - priority_filter (str): Filter by priority level

    Returns:
        str: Markdown report of gaps found with prioritized suggestions
    """
    try:
        # Fetch all updates
        updates = await fetch_all_updates(params.days_back)

        # Load curriculum content if path provided
        curriculum_content = None
        if params.curriculum_path:
            curriculum_content = load_curriculum_file(params.curriculum_path)
            if curriculum_content is None:
                return f"Error: Could not read curriculum file at '{params.curriculum_path}'. Please check the path exists."

        # Analyze gaps
        gaps = analyze_gaps(updates, curriculum_content)

        # Filter by priority if requested
        if params.priority_filter:
            gaps = [g for g in gaps if g.priority == params.priority_filter]

        # Generate report
        report = generate_update_report(gaps)
        return report

    except Exception as e:
        return f"Error analyzing gaps: {type(e).__name__}: {str(e)}"


@mcp.tool(
    name="curriculum_apply_update",
    annotations={
        "title": "Apply Curriculum Update",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    }
)
async def curriculum_apply_update(params: ApplyUpdateInput) -> str:
    """Apply a specific update to the curriculum markdown file.

    Modifies the curriculum file by appending content to an existing week,
    replacing a section, or adding a new appendix entry.

    Args:
        params (ApplyUpdateInput): Update parameters including:
            - curriculum_path (str): Path to the curriculum file
            - week (int): Week number (1-12) or 0 for new appendix
            - section_title (str): Title of the section to add/update
            - content (str): Markdown content to insert
            - action (str): 'append', 'replace', or 'new'
            - reason (str): Why this update is needed

    Returns:
        str: Confirmation of the update with details of what changed
    """
    try:
        # Load current curriculum
        current = load_curriculum_file(params.curriculum_path)
        if current is None:
            return f"Error: Could not read curriculum file at '{params.curriculum_path}'."

        # Build the update block — insert content as-is, no wrapper
        update_block = f"\n\n{params.content}\n"

        if params.action == "append" and params.week > 0:
            # Find the week section header
            week_pos = -1
            for pattern in [f"# WEEK {params.week}", f"## Week {params.week}", f"# Week {params.week}"]:
                pos = current.lower().find(pattern.lower())
                if pos != -1:
                    week_pos = pos
                    break

            if week_pos == -1:
                # Week not found, append at end
                updated = current + update_block
            else:
                # Find the boundary of the next section
                next_boundary = len(current)
                for search in [f"# week {params.week + 1}", "## phase", "## appendix"]:
                    pos = current.lower().find(search, week_pos + 1)
                    if pos != -1 and pos < next_boundary:
                        next_boundary = pos

                # Find the last --- separator before the boundary
                sep_pos = current.rfind("\n---", week_pos, next_boundary)

                if sep_pos != -1:
                    # Insert before the --- separator
                    insert_pos = sep_pos
                else:
                    # No separator found, insert before the next section
                    insert_pos = next_boundary

                updated = current[:insert_pos] + update_block + current[insert_pos:]

        elif params.action == "new" or params.week == 0:
            # Add as new appendix section at the end
            appendix_block = f"\n\n---\n\n### Appendix: {params.section_title}\n\n"
            appendix_block += params.content + "\n"
            updated = current + appendix_block

        elif params.action == "replace":
            # Find and replace an existing section
            # Look for the section title
            section_start = current.lower().find(params.section_title.lower())
            if section_start == -1:
                return f"Error: Could not find section '{params.section_title}' in the curriculum file. Use action='append' instead."

            # Find the next section header
            next_header = -1
            for i in range(section_start + len(params.section_title), len(current)):
                if current[i:i+3] in ["## ", "# "] or current[i:i+4] == "### ":
                    next_header = i
                    break

            if next_header == -1:
                updated = current[:section_start] + update_block
            else:
                updated = current[:section_start] + update_block + "\n" + current[next_header:]
        else:
            return f"Error: Invalid action '{params.action}'. Use 'append', 'replace', or 'new'."

        # Save the updated file
        if save_curriculum_file(params.curriculum_path, updated):
            # Track the applied update
            mark_update_applied(
                f"manual::{params.section_title[:50]}",
                f"Week {params.week}: {params.section_title} ({params.action})"
            )

            return (
                f"✅ **Curriculum updated successfully!**\n\n"
                f"- **File:** {params.curriculum_path}\n"
                f"- **Week:** {'Appendix' if params.week == 0 else f'Week {params.week}'}\n"
                f"- **Section:** {params.section_title}\n"
                f"- **Action:** {params.action}\n"
                f"- **Reason:** {params.reason}\n"
            )
        else:
            return f"Error: Failed to save updated curriculum to '{params.curriculum_path}'."

    except Exception as e:
        return f"Error applying update: {type(e).__name__}: {str(e)}"


@mcp.tool(
    name="curriculum_set_path",
    annotations={
        "title": "Set Curriculum File Path",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def curriculum_set_path(params: SetCurriculumPathInput) -> str:
    """Set the path to your curriculum markdown file and your current progress week.

    This configures the MCP server to know where your curriculum lives on disk
    so that subsequent analysis and update tools can find it automatically.

    Args:
        params (SetCurriculumPathInput): Configuration including:
            - path (str): Full path to the curriculum markdown file
            - current_week (int): Your current week (1-12)

    Returns:
        str: Confirmation of the configuration
    """
    # Verify the file exists
    content = load_curriculum_file(params.path)
    if content is None:
        return (
            f"⚠️ Warning: File not found at '{params.path}'.\n"
            f"The path has been saved, but make sure the file exists before running analysis.\n"
            f"You can create it later and the tools will pick it up."
        )

    # Save state
    state = load_curriculum_state()
    state["curriculum_path"] = params.path
    state["current_week"] = params.current_week
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    save_curriculum_state(state)

    file_size = len(content)
    return (
        f"✅ **Curriculum configured!**\n\n"
        f"- **File:** {params.path}\n"
        f"- **Size:** {file_size:,} characters\n"
        f"- **Current Week:** {params.current_week}\n"
        f"- **Phase:** {CURRICULUM_TOPIC_MAP.get(params.current_week, {}).get('phase', 'Unknown')}\n\n"
        f"You can now use `curriculum_analyze_gaps` and `curriculum_apply_update` tools."
    )


@mcp.tool(
    name="curriculum_status",
    annotations={
        "title": "Get Curriculum Updater Status",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def curriculum_status(params: GetStatusInput) -> str:
    """Get the current status of the curriculum updater — configuration,
    last check time, number of tracked updates, and your progress.

    Args:
        params (GetStatusInput): Status options:
            - verbose (bool): Include detailed cache information

    Returns:
        str: Formatted status report
    """
    state = load_curriculum_state()
    cache = load_cache()

    current_week = state.get("current_week", 1)
    week_info = CURRICULUM_TOPIC_MAP.get(current_week, {})

    result = "# Curriculum Updater Status\n\n"
    result += f"**Current Week:** {current_week} — {week_info.get('title', 'Unknown')}\n"
    result += f"**Phase:** {week_info.get('phase', 'Unknown')}\n"
    result += f"**Curriculum File:** {state.get('curriculum_path', 'Not set')}\n"
    result += f"**Last Check:** {cache.get('last_check', 'Never')}\n"
    result += f"**Updates Tracked:** {len(cache.get('seen_updates', []))}\n"
    result += f"**Updates Applied:** {len(cache.get('applied_updates', []))}\n"

    if params.verbose:
        result += "\n## Recent Applied Updates\n\n"
        applied = cache.get("applied_updates", [])
        if applied:
            for a in applied[-10:]:  # Last 10
                result += f"- `{a.get('applied_at', '')}` — {a.get('details', '')}\n"
        else:
            result += "No updates applied yet.\n"

        result += "\n## Curriculum Week Map\n\n"
        for week, info in CURRICULUM_TOPIC_MAP.items():
            marker = "👉" if week == current_week else "  "
            result += f"{marker} **Week {week}:** {info['title']} ({info['phase']})\n"

    return result


# --- Entry Point ---

def main():
    """Run the MCP server."""
    mcp.run()


if __name__ == "__main__":
    main()
