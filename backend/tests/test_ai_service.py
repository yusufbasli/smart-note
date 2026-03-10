"""
Unit tests for app.services.ai_service.analyze_note.

All OpenAI network calls are replaced by mocks — no real API key is needed.
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from openai import OpenAIError

from app.services.ai_service import analyze_note


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_mock_client(response_dict: dict) -> MagicMock:
    """Return a mock OpenAI client whose completions.create() returns response_dict as JSON."""
    completion = MagicMock()
    completion.choices[0].message.content = json.dumps(response_dict)
    client = MagicMock()
    client.chat.completions.create.return_value = completion
    return client


_VALID_KEY = "sk-testkey12345678901234567890"
_FULL_RESPONSE = {
    "category": "#work",
    "summary": "A note about work tasks.",
    "tasks": ["Write report", "Send email"],
}


# ── Key-guard tests ───────────────────────────────────────────────────────────

def test_returns_none_when_api_key_empty():
    with patch("app.services.ai_service.settings") as mock_settings:
        mock_settings.OPENAI_API_KEY = ""
        assert analyze_note("some content") is None


def test_returns_none_when_api_key_is_placeholder():
    with patch("app.services.ai_service.settings") as mock_settings:
        mock_settings.OPENAI_API_KEY = "sk-..."
        assert analyze_note("some content") is None


# ── Happy-path tests ──────────────────────────────────────────────────────────

def test_successful_analysis_returns_parsed_dict():
    mock_client = _make_mock_client(_FULL_RESPONSE)
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        result = analyze_note("Write the quarterly report and email the boss.")

    assert result is not None
    assert result["category"] == "#work"
    assert result["summary"] == "A note about work tasks."
    assert result["tasks"] == [
        {"text": "Write report", "when": None},
        {"text": "Send email", "when": None},
    ]


def test_tasks_defaults_to_empty_list_when_absent():
    payload = {"category": "#personal", "summary": "Just a personal note."}
    mock_client = _make_mock_client(payload)
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        result = analyze_note("Just a personal note with no tasks.")

    assert result is not None
    assert result["tasks"] == []


def test_openai_client_receives_note_content():
    """Verify the note content is forwarded to the API call."""
    mock_client = _make_mock_client(_FULL_RESPONSE)
    content = "Call dentist tomorrow at 10am."
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        analyze_note(content)

    call_kwargs = mock_client.chat.completions.create.call_args
    messages = call_kwargs.kwargs.get("messages") or call_kwargs.args[0]
    user_messages = [m for m in messages if m["role"] == "user"]
    assert any(content in m["content"] for m in user_messages)


# ── Error-handling tests ──────────────────────────────────────────────────────

def test_returns_none_on_openai_error():
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = OpenAIError("network failure")
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        assert analyze_note("some content") is None


def test_returns_none_on_invalid_json_response():
    completion = MagicMock()
    completion.choices[0].message.content = "not valid json {{{"
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = completion
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        assert analyze_note("some content") is None


def test_returns_none_when_response_missing_required_fields():
    # Valid JSON but lacks 'category' and 'summary'
    mock_client = _make_mock_client({"tasks": ["Task 1"]})
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        assert analyze_note("some content") is None


def test_returns_none_when_response_missing_only_summary():
    mock_client = _make_mock_client({"category": "#work", "tasks": []})
    with (
        patch("app.services.ai_service.settings") as mock_settings,
        patch("app.services.ai_service.OpenAI", return_value=mock_client),
    ):
        mock_settings.OPENAI_API_KEY = _VALID_KEY
        assert analyze_note("some content") is None
