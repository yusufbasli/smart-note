"""
AI Service — Smart-Note & Task Orchestrator
-------------------------------------------
Sends note content to OpenAI GPT-4o-mini and extracts:
  • Category : #work | #school | #personal | #health | #finance | #other
  • Summary  : short 1-2 sentence summary
  • Tasks    : to-do items detected in the content (if any)

Returned data structure:
    {
        "category": "#work",
        "summary": "...",
        "tasks": ["task 1", "task 2"]   # may be empty
    }

DRAFT STATUS: The OpenAI call becomes active once a real API key is configured.
"""

import json
import logging

from openai import OpenAI, OpenAIError

from app.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """
You are a note analysis assistant. Analyse the user's note content and respond with the following JSON format:

{
  "category": "<single category: #work | #school | #personal | #health | #finance | #other>",
  "summary": "<concise 1-2 sentence summary>",
  "tasks": ["<task 1>", "<task 2>"]
}

Rules:
- Return only valid JSON, no extra text.
- tasks may be an empty list []; leave it empty if no explicit to-do items are found.
- Infer the category from the content; use #other when uncertain.
""".strip()


def analyze_note(content: str) -> dict | None:
    """
    Analyses note content and returns category + summary + task list.

    Returns:
        dict with keys: category, summary, tasks
        None — API key not configured or an error occurred
    """
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-..."):
        logger.warning("OPENAI_API_KEY not configured; AI analysis skipped.")
        return None

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": content},
            ],
            temperature=0.2,          # lower temperature for consistent output
            max_tokens=512,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        result: dict = json.loads(raw)

        # Basic field validation
        if "category" not in result or "summary" not in result:
            logger.error("AI response is missing expected fields: %s", raw)
            return None

        result.setdefault("tasks", [])
        return result

    except (OpenAIError, json.JSONDecodeError, KeyError) as exc:
        logger.error("AI analysis failed: %s", exc)
        return None
