"""Data source fetchers for Claude Code updates."""

import asyncio
import json
import re
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional

import httpx
from bs4 import BeautifulSoup


# --- Data Models ---

@dataclass
class Update:
    """A single update/announcement about Claude Code."""
    source: str  # "x_boris", "anthropic_blog", "anthropic_changelog", "anthropic_docs", "github_releases", "youtube_anthropic", "reddit_claude", "discord_anthropic"
    title: str
    content: str
    url: str
    date: str  # ISO format
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


# --- Constants ---

BORIS_X_URL = "https://x.com/anthropaboris"
ANTHROPIC_BLOG_URL = "https://www.anthropic.com/news"
ANTHROPIC_CHANGELOG_URL = "https://docs.anthropic.com/en/changelog"
ANTHROPIC_DOCS_URL = "https://docs.anthropic.com/en/docs"
CLAUDE_CODE_DOCS_URL = "https://docs.anthropic.com/en/docs/claude-code"

# New sources
GITHUB_RELEASES_URL = "https://github.com/anthropics/claude-code/releases"
GITHUB_RELEASES_API = "https://api.github.com/repos/anthropics/claude-code/releases"
ANTHROPIC_YOUTUBE_URL = "https://www.youtube.com/@anthropic-ai"
REDDIT_CLAUDE_URL = "https://www.reddit.com/r/ClaudeAI"
REDDIT_CLAUDE_JSON = "https://www.reddit.com/r/ClaudeAI/new.json"
ANTHROPIC_DISCORD_URL = "https://discord.com/invite/anthropic"

# Nitter instances as fallback for X scraping
NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.esmailelbob.xyz",
]

# Keywords that signal Claude Code relevance
CLAUDE_CODE_KEYWORDS = [
    "claude code", "claude-code", "@anthropic-ai/claude-code",
    "mcp", "model context protocol", "claude.md", "CLAUDE.md",
    "hooks", "slash commands", "agent", "agentic",
    "parallel sessions", "skills", "skill.md",
    "opus", "sonnet", "haiku", "claude 4", "claude 3.5",
    "terminal", "cli", "command line",
    "npm install", "pip install",
    "context window", "token",
    "tool use", "function calling",
    "anthropic api", "sdk",
    "plan mode", "auto mode",
    "git integration", "github",
    "agent teams", "multi-agent",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


# --- Fetchers ---

async def fetch_boris_x_posts(days_back: int = 30) -> list[Update]:
    """
    Fetch recent posts from Boris Cherny's X account.
    Tries Nitter instances first, falls back to direct X scraping.
    """
    updates = []

    # Try Nitter instances first (more scrapeable)
    for nitter_url in NITTER_INSTANCES:
        try:
            updates = await _fetch_from_nitter(nitter_url, "anthropaboris", days_back)
            if updates:
                return updates
        except Exception:
            continue

    # Fallback: try scraping X directly
    try:
        updates = await _fetch_from_x_direct("anthropaboris", days_back)
    except Exception:
        pass

    return updates


async def _fetch_from_nitter(base_url: str, username: str, days_back: int) -> list[Update]:
    """Scrape posts from a Nitter instance."""
    updates = []
    url = f"{base_url}/{username}"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    timeline_items = soup.select(".timeline-item, .tweet-body, .tweet")

    for item in timeline_items[:50]:  # Check up to 50 recent posts
        try:
            # Extract text content
            text_el = item.select_one(".tweet-content, .tweet-text, .content")
            if not text_el:
                continue
            text = text_el.get_text(strip=True)

            # Check relevance
            if not _is_claude_relevant(text):
                continue

            # Extract date
            date_el = item.select_one("time, .tweet-date a")
            date_str = ""
            if date_el:
                date_str = date_el.get("datetime", date_el.get("title", ""))

            # Extract link
            link_el = item.select_one(".tweet-link, a[href*='/status/']")
            post_url = ""
            if link_el:
                href = link_el.get("href", "")
                post_url = f"https://x.com{href}" if href.startswith("/") else href

            updates.append(Update(
                source="x_boris",
                title=_extract_title(text),
                content=text,
                url=post_url or f"https://x.com/{username}",
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(text),
            ))
        except Exception:
            continue

    return updates


async def _fetch_from_x_direct(username: str, days_back: int) -> list[Update]:
    """
    Attempt to fetch from X directly.
    This is a best-effort approach — X's anti-scraping is aggressive.
    Returns whatever we can get from the public profile page.
    """
    updates = []
    url = f"https://x.com/{username}"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=HEADERS)
        if response.status_code != 200:
            return updates

    # X's public page has limited content, but we can extract what's there
    soup = BeautifulSoup(response.text, "html.parser")

    # Look for tweet text in meta tags and structured data
    meta_desc = soup.find("meta", {"name": "description"})
    if meta_desc:
        content = meta_desc.get("content", "")
        if _is_claude_relevant(content):
            updates.append(Update(
                source="x_boris",
                title=_extract_title(content),
                content=content,
                url=url,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(content),
            ))

    # Also check og:description
    og_desc = soup.find("meta", {"property": "og:description"})
    if og_desc and og_desc != meta_desc:
        content = og_desc.get("content", "")
        if _is_claude_relevant(content):
            updates.append(Update(
                source="x_boris",
                title=_extract_title(content),
                content=content,
                url=url,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(content),
            ))

    return updates


async def fetch_anthropic_blog(days_back: int = 30) -> list[Update]:
    """Fetch recent Claude-related posts from Anthropic's blog."""
    updates = []

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(ANTHROPIC_BLOG_URL, headers=HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Anthropic blog uses various article card patterns
    articles = soup.select("a[href*='/news/'], a[href*='/research/'], article a")

    seen_urls = set()
    for article in articles[:30]:
        try:
            href = article.get("href", "")
            if not href or href in seen_urls:
                continue

            full_url = href if href.startswith("http") else f"https://www.anthropic.com{href}"
            seen_urls.add(href)

            # Get title
            title_el = article.select_one("h2, h3, .title, span")
            title = title_el.get_text(strip=True) if title_el else ""
            if not title:
                title = article.get_text(strip=True)[:100]

            # Get description
            desc_el = article.select_one("p, .description, .summary")
            desc = desc_el.get_text(strip=True) if desc_el else ""

            combined = f"{title} {desc}".lower()

            # Filter for Claude Code relevance
            if not any(kw in combined for kw in ["claude code", "claude-code", "mcp", "developer", "tool", "agent", "sdk", "api", "model", "opus", "sonnet", "haiku", "claude 4", "claude 3"]):
                continue

            # Get date
            date_el = article.select_one("time, .date, [datetime]")
            date_str = ""
            if date_el:
                date_str = date_el.get("datetime", date_el.get_text(strip=True))

            updates.append(Update(
                source="anthropic_blog",
                title=title,
                content=desc or title,
                url=full_url,
                date=date_str or datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(combined),
            ))
        except Exception:
            continue

    return updates


async def fetch_anthropic_changelog(days_back: int = 30) -> list[Update]:
    """Fetch recent entries from Anthropic's changelog."""
    updates = []

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(ANTHROPIC_CHANGELOG_URL, headers=HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Changelog entries
    entries = soup.select("article, .changelog-entry, section, [class*='changelog']")
    if not entries:
        # Try broader selectors
        entries = soup.select("h2, h3")

    for entry in entries[:20]:
        try:
            title = entry.get_text(strip=True)[:200]
            if not title:
                continue

            # Get sibling content
            content_parts = []
            sibling = entry.find_next_sibling()
            while sibling and sibling.name not in ["h2", "h3", "article"]:
                text = sibling.get_text(strip=True)
                if text:
                    content_parts.append(text)
                sibling = sibling.find_next_sibling()
                if len(content_parts) > 5:
                    break

            content = " ".join(content_parts)
            combined = f"{title} {content}".lower()

            if not _is_claude_relevant(combined):
                continue

            updates.append(Update(
                source="anthropic_changelog",
                title=title,
                content=content or title,
                url=ANTHROPIC_CHANGELOG_URL,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(combined),
            ))
        except Exception:
            continue

    return updates


async def fetch_claude_code_docs() -> list[Update]:
    """Fetch current Claude Code documentation structure for gap analysis."""
    updates = []

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(CLAUDE_CODE_DOCS_URL, headers=HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Extract documentation sections/features
    sections = soup.select("a[href*='/docs/claude-code'], nav a, .sidebar a")

    seen = set()
    for section in sections:
        try:
            title = section.get_text(strip=True)
            href = section.get("href", "")
            if not title or title in seen:
                continue
            seen.add(title)

            full_url = href if href.startswith("http") else f"https://docs.anthropic.com{href}"

            updates.append(Update(
                source="anthropic_docs",
                title=title,
                content=f"Documentation section: {title}",
                url=full_url,
                date=datetime.now(timezone.utc).isoformat(),
                tags=_extract_tags(title.lower()),
            ))
        except Exception:
            continue

    return updates


async def fetch_github_releases(days_back: int = 30) -> list[Update]:
    """Fetch recent releases from the Claude Code GitHub repository."""
    updates = []

    # Try the GitHub API first (structured JSON, no auth needed for public repos)
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            response = await client.get(
                GITHUB_RELEASES_API,
                headers={
                    **HEADERS,
                    "Accept": "application/vnd.github+json",
                },
                params={"per_page": 20},
            )
            response.raise_for_status()
            releases = response.json()

            for release in releases:
                title = release.get("name", "") or release.get("tag_name", "")
                body = release.get("body", "") or ""
                tag = release.get("tag_name", "")
                url = release.get("html_url", GITHUB_RELEASES_URL)
                date = release.get("published_at", "")

                if not title:
                    continue

                # All releases are relevant — this is the Claude Code repo
                content = f"Release {tag}: {body[:500]}" if body else f"Release {tag}"

                updates.append(Update(
                    source="github_releases",
                    title=f"Claude Code {title}",
                    content=content,
                    url=url,
                    date=date or datetime.now(timezone.utc).isoformat(),
                    tags=["claude-code", "release"] + _extract_tags(f"{title} {body}".lower()),
                ))

            return updates

        except Exception:
            pass

    # Fallback: scrape the releases HTML page
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(GITHUB_RELEASES_URL, headers=HEADERS)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        release_entries = soup.select("[data-test-selector='release-entry'], .release, section")

        for entry in release_entries[:20]:
            title_el = entry.select_one("h2 a, .release-title a, a[href*='/releases/tag/']")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            url = f"https://github.com{href}" if href.startswith("/") else href

            body_el = entry.select_one(".markdown-body, .release-body")
            body = body_el.get_text(strip=True)[:500] if body_el else ""

            date_el = entry.select_one("relative-time, time")
            date = date_el.get("datetime", "") if date_el else ""

            updates.append(Update(
                source="github_releases",
                title=f"Claude Code {title}",
                content=body or title,
                url=url,
                date=date or datetime.now(timezone.utc).isoformat(),
                tags=["claude-code", "release"] + _extract_tags(f"{title} {body}".lower()),
            ))
    except Exception:
        pass

    return updates


async def fetch_anthropic_youtube(days_back: int = 30) -> list[Update]:
    """Fetch recent videos from Anthropic's YouTube channel."""
    updates = []

    # YouTube channel page — scrape video titles and descriptions
    urls_to_try = [
        "https://www.youtube.com/@anthropic-ai/videos",
        "https://www.youtube.com/@AnthropicAI/videos",
    ]

    for url in urls_to_try:
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(url, headers=HEADERS)
                if response.status_code != 200:
                    continue

            soup = BeautifulSoup(response.text, "html.parser")

            # YouTube embeds video data in script tags as JSON
            scripts = soup.find_all("script")
            for script in scripts:
                text = script.get_text()
                if "videoRenderer" not in text and "gridVideoRenderer" not in text:
                    continue

                # Extract video titles using regex
                title_matches = re.findall(r'"title":\{"runs":\[\{"text":"([^"]+)"\}', text)
                video_id_matches = re.findall(r'"videoId":"([^"]+)"', text)
                desc_matches = re.findall(r'"descriptionSnippet":\{"runs":\[\{"text":"([^"]+)"', text)

                for i, title in enumerate(title_matches[:15]):
                    if not _is_claude_relevant(title.lower()):
                        continue

                    video_id = video_id_matches[i] if i < len(video_id_matches) else ""
                    desc = desc_matches[i] if i < len(desc_matches) else ""
                    video_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else url

                    updates.append(Update(
                        source="youtube_anthropic",
                        title=title,
                        content=desc or title,
                        url=video_url,
                        date=datetime.now(timezone.utc).isoformat(),
                        tags=["video"] + _extract_tags(f"{title} {desc}".lower()),
                    ))

                if updates:
                    break  # Got data from script tags

            # Fallback: try meta tags
            if not updates:
                meta_tags = soup.find_all("meta", {"property": "og:title"})
                for meta in meta_tags:
                    title = meta.get("content", "")
                    if _is_claude_relevant(title.lower()):
                        updates.append(Update(
                            source="youtube_anthropic",
                            title=title,
                            content=title,
                            url=url,
                            date=datetime.now(timezone.utc).isoformat(),
                            tags=["video"] + _extract_tags(title.lower()),
                        ))

            if updates:
                break  # Found results from this URL

        except Exception:
            continue

    return updates


async def fetch_reddit_claude(days_back: int = 30) -> list[Update]:
    """Fetch recent posts from r/ClaudeAI subreddit."""
    updates = []

    # Reddit provides JSON feeds without authentication
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(
                REDDIT_CLAUDE_JSON,
                headers={
                    "User-Agent": "CurriculumUpdater/1.0 (Claude Code Learning Tool)",
                    "Accept": "application/json",
                },
                params={"limit": 50},
            )
            response.raise_for_status()
            data = response.json()

        posts = data.get("data", {}).get("children", [])

        for post in posts:
            post_data = post.get("data", {})
            title = post_data.get("title", "")
            selftext = post_data.get("selftext", "")
            url = post_data.get("url", "")
            permalink = post_data.get("permalink", "")
            created = post_data.get("created_utc", 0)
            score = post_data.get("score", 0)
            flair = post_data.get("link_flair_text", "") or ""

            if not title:
                continue

            combined = f"{title} {selftext} {flair}".lower()

            # Filter for Claude Code relevance — be stricter with Reddit
            # since there's a lot of noise
            if not _is_claude_relevant(combined):
                continue

            # Only include posts with some engagement (score > 5)
            if score < 5:
                continue

            post_url = f"https://www.reddit.com{permalink}" if permalink else url
            date_str = datetime.fromtimestamp(created, tz=timezone.utc).isoformat() if created else ""

            updates.append(Update(
                source="reddit_claude",
                title=title,
                content=selftext[:500] if selftext else title,
                url=post_url,
                date=date_str,
                tags=["community"] + _extract_tags(combined),
            ))

    except Exception:
        pass

    # Fallback: scrape HTML if JSON fails
    if not updates:
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(
                    REDDIT_CLAUDE_URL,
                    headers=HEADERS,
                )
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    post_links = soup.select("a[href*='/r/ClaudeAI/comments/']")

                    seen_urls = set()
                    for link in post_links[:30]:
                        title = link.get_text(strip=True)
                        href = link.get("href", "")
                        if not title or len(title) < 10 or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        if not _is_claude_relevant(title.lower()):
                            continue

                        full_url = href if href.startswith("http") else f"https://www.reddit.com{href}"

                        updates.append(Update(
                            source="reddit_claude",
                            title=title,
                            content=title,
                            url=full_url,
                            date=datetime.now(timezone.utc).isoformat(),
                            tags=["community"] + _extract_tags(title.lower()),
                        ))
        except Exception:
            pass

    return updates


async def fetch_anthropic_discord(days_back: int = 30) -> list[Update]:
    """
    Check Anthropic's Discord for updates.

    Note: Discord doesn't allow scraping without bot authentication.
    This fetcher checks Anthropic's Discord invite page and any public
    announcement widgets for surface-level info. For full Discord monitoring,
    you would need a Discord bot token configured separately.
    """
    updates = []

    # Discord servers aren't publicly scrapeable without a bot token.
    # But we can check for any public-facing info on the invite page
    # and Anthropic pages that reference Discord announcements.
    try:
        # Check Anthropic's community page for Discord-sourced announcements
        community_urls = [
            "https://www.anthropic.com/discord",
            "https://www.anthropic.com/community",
        ]

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            for url in community_urls:
                try:
                    response = await client.get(url, headers=HEADERS)
                    if response.status_code != 200:
                        continue

                    soup = BeautifulSoup(response.text, "html.parser")

                    # Look for announcement-style content
                    announcements = soup.select("article, .announcement, .post, h2, h3")
                    for ann in announcements[:10]:
                        text = ann.get_text(strip=True)
                        if not text or not _is_claude_relevant(text.lower()):
                            continue

                        updates.append(Update(
                            source="discord_anthropic",
                            title=_extract_title(text),
                            content=text[:500],
                            url=url,
                            date=datetime.now(timezone.utc).isoformat(),
                            tags=["community", "discord"] + _extract_tags(text.lower()),
                        ))
                except Exception:
                    continue

    except Exception:
        pass

    # If no results, add a note about Discord requiring bot access
    if not updates:
        updates.append(Update(
            source="discord_anthropic",
            title="Discord monitoring limited",
            content=(
                "Discord content requires a bot token for full monitoring. "
                "Consider joining Anthropic's Discord manually for real-time updates. "
                "Key channels to watch: #announcements, #claude-code, #developers."
            ),
            url=ANTHROPIC_DISCORD_URL,
            date=datetime.now(timezone.utc).isoformat(),
            tags=["community", "discord"],
        ))

    return updates


async def fetch_all_updates(days_back: int = 30) -> list[Update]:
    """Fetch updates from all sources. Returns combined, deduplicated list."""
    all_updates = []

    # Fetch from all sources in parallel
    fetchers = {
        "Boris Cherny X": fetch_boris_x_posts(days_back),
        "Anthropic Blog": fetch_anthropic_blog(days_back),
        "Anthropic Changelog": fetch_anthropic_changelog(days_back),
        "Claude Code Docs": fetch_claude_code_docs(),
        "GitHub Releases": fetch_github_releases(days_back),
        "Anthropic YouTube": fetch_anthropic_youtube(days_back),
        "Reddit r/ClaudeAI": fetch_reddit_claude(days_back),
        "Anthropic Discord": fetch_anthropic_discord(days_back),
    }

    settled = await asyncio.gather(
        *fetchers.values(), return_exceptions=True
    )

    for name, result in zip(fetchers, settled):
        if isinstance(result, Exception):
            continue
        all_updates.extend(result)

    # Deduplicate by content similarity
    seen_content = set()
    unique_updates = []
    for u in all_updates:
        # Simple dedup by first 100 chars of content
        key = u.content[:100].lower().strip()
        if key not in seen_content:
            seen_content.add(key)
            unique_updates.append(u)

    return unique_updates


# --- Helpers ---

def _is_claude_relevant(text: str) -> bool:
    """Check if text is relevant to Claude Code / developer tools."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in CLAUDE_CODE_KEYWORDS)


def _extract_title(text: str) -> str:
    """Extract a short title from a longer text."""
    # Use first sentence or first 80 chars
    first_sentence = re.split(r'[.!?\n]', text)[0].strip()
    if len(first_sentence) > 80:
        return first_sentence[:77] + "..."
    return first_sentence


def _extract_tags(text: str) -> list[str]:
    """Extract relevant tags from text."""
    text_lower = text.lower()
    tags = []
    tag_map = {
        "claude code": "claude-code",
        "mcp": "mcp",
        "model context protocol": "mcp",
        "hooks": "hooks",
        "skills": "skills",
        "agent teams": "agent-teams",
        "parallel sessions": "parallel-sessions",
        "opus": "model-update",
        "sonnet": "model-update",
        "haiku": "model-update",
        "api": "api",
        "sdk": "sdk",
        "claude.md": "claude-md",
        "plan mode": "plan-mode",
        "context window": "context-window",
        "git": "git",
        "tool use": "tool-use",
    }
    for keyword, tag in tag_map.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    return tags
