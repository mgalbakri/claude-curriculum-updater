"""Tests for email notification logic in the scheduler module."""

import sys
from unittest.mock import patch, MagicMock
import pytest

from curriculum_updater_mcp.scheduler import (
    send_email_notification,
    _send_via_mail_app,
)


# --- _send_via_mail_app ---

class TestSendViaMailApp:
    @patch("curriculum_updater_mcp.scheduler.subprocess.run")
    def test_success(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stderr="")
        result = _send_via_mail_app("test@example.com", "Test Subject", "Test body")
        assert result is True
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        assert call_args[0][0][0] == "osascript"

    @patch("curriculum_updater_mcp.scheduler.subprocess.run")
    def test_failure(self, mock_run):
        mock_run.return_value = MagicMock(returncode=1, stderr="Error")
        result = _send_via_mail_app("test@example.com", "Subject", "Body")
        assert result is False

    @patch("curriculum_updater_mcp.scheduler.subprocess.run")
    def test_escapes_quotes(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stderr="")
        _send_via_mail_app("test@example.com", 'Has "quotes"', 'Body with "quotes"')
        call_args = mock_run.call_args
        script = call_args[0][0][2]  # The AppleScript string
        assert '\\"' in script  # Quotes should be escaped

    @patch("curriculum_updater_mcp.scheduler.subprocess.run")
    def test_escapes_backslashes(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stderr="")
        _send_via_mail_app("test@example.com", "Has \\backslash", "Body")
        call_args = mock_run.call_args
        script = call_args[0][0][2]
        assert "\\\\" in script


# --- send_email_notification ---

class TestSendEmailNotification:
    @pytest.mark.asyncio
    @patch("curriculum_updater_mcp.scheduler._send_via_mail_app", return_value=True)
    async def test_uses_mail_app_on_macos(self, mock_mail_app):
        """On macOS, should try Mail.app first."""
        config = {"notify_email": "test@example.com"}
        with patch.object(sys, "platform", "darwin"):
            result = await send_email_notification(config, "Subject", "Body")
        assert result is True
        mock_mail_app.assert_called_once_with("test@example.com", "Subject", "Body")

    @pytest.mark.asyncio
    async def test_no_email_returns_false(self):
        config = {"notify_email": None}
        result = await send_email_notification(config, "Subject", "Body")
        assert result is False

    @pytest.mark.asyncio
    async def test_empty_email_returns_false(self):
        config = {}
        result = await send_email_notification(config, "Subject", "Body")
        assert result is False

    @pytest.mark.asyncio
    @patch("curriculum_updater_mcp.scheduler._send_via_mail_app", return_value=False)
    async def test_falls_back_to_smtp(self, mock_mail_app):
        """If Mail.app fails and SMTP is configured, tries SMTP."""
        config = {
            "notify_email": "test@example.com",
            "smtp_server": "smtp.example.com",
            "smtp_port": 587,
            "smtp_user": "user",
            "smtp_password": "pass",
            "email_from": "from@example.com",
        }
        with patch.object(sys, "platform", "darwin"), \
             patch("smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__ = MagicMock(return_value=mock_server)
            mock_smtp.return_value.__exit__ = MagicMock(return_value=False)
            result = await send_email_notification(config, "Subject", "Body")
        assert result is True

    @pytest.mark.asyncio
    @patch("curriculum_updater_mcp.scheduler._send_via_mail_app", return_value=False)
    @patch("curriculum_updater_mcp.scheduler.subprocess.run")
    async def test_falls_back_to_mailto(self, mock_run, mock_mail_app):
        """If both Mail.app and SMTP fail, tries mailto: URL."""
        config = {"notify_email": "test@example.com"}
        mock_run.return_value = MagicMock(returncode=0)
        with patch.object(sys, "platform", "darwin"):
            result = await send_email_notification(config, "Subject", "Body")
        assert result is True
        # Check that 'open' was called with a mailto: URL
        mailto_call = mock_run.call_args
        assert "mailto:" in mailto_call[0][0][1]
