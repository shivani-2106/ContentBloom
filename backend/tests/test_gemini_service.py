"""
Unit tests for ContentBloom AI — Phase 2 Gemini integration.

All Gemini SDK calls are mocked so these tests:
  - Do not require a real API key.
  - Do not make any network calls.
  - Do not consume API quota.

Run with:
    python -m pytest tests/ -v
"""

import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio  # noqa: F401 — registers asyncio mode

# Ensure the backend package root is on sys.path when pytest is invoked
# from the backend/ directory.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.gemini_service import (  # noqa: E402
    _PLACEHOLDER,
    _build_prompt,
    generate_content,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SAMPLE_CONTENT = (
    "Artificial intelligence is transforming how businesses operate. "
    "Companies that adopt AI tools early are seeing 30% productivity gains "
    "and significant cost reductions across departments."
)


def _make_mock_response(text: str) -> MagicMock:
    """Build a fake Gemini response object with a .text attribute."""
    mock = MagicMock()
    mock.text = text
    return mock


# ---------------------------------------------------------------------------
# _build_prompt tests
# ---------------------------------------------------------------------------

class TestBuildPrompt:

    def test_contains_source_content(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "linkedin", "social_post"
        )
        assert SAMPLE_CONTENT in prompt

    def test_contains_platform(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "instagram", "social_post"
        )
        assert "Instagram" in prompt

    def test_contains_content_type(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "linkedin", "video_script"
        )
        assert "Video Script" in prompt

    def test_contains_platform_guidance_linkedin(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "linkedin", "social_post"
        )
        assert "LinkedIn" in prompt
        assert "hashtags" in prompt.lower()

    def test_contains_carousel_guidance(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "instagram", "carousel"
        )
        assert "Slide" in prompt

    def test_contains_safety_instruction(self):
        prompt = _build_prompt(
            SAMPLE_CONTENT, "linkedin", "social_post"
        )
        assert "Do not invent" in prompt

    def test_unknown_platform_falls_back_gracefully(self):
        # Unknown platforms should use the default platform guidance.
        prompt = _build_prompt(
            SAMPLE_CONTENT, "tiktok", "social_post"
        )
        assert SAMPLE_CONTENT in prompt


# ---------------------------------------------------------------------------
# generate_content — missing / placeholder key tests
# ---------------------------------------------------------------------------

class TestMissingKey:

    @pytest.mark.asyncio
    async def test_raises_value_error_when_key_missing(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "")

        with pytest.raises(
            ValueError,
            match="GEMINI_API_KEY is not configured",
        ):
            await generate_content(
                SAMPLE_CONTENT, "linkedin", "social_post"
            )

    @pytest.mark.asyncio
    async def test_raises_value_error_for_placeholder_key(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", _PLACEHOLDER)

        with pytest.raises(
            ValueError,
            match="GEMINI_API_KEY is not configured",
        ):
            await generate_content(
                SAMPLE_CONTENT, "linkedin", "social_post"
            )

    @pytest.mark.asyncio
    async def test_error_message_does_not_contain_key(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "")

        with pytest.raises(ValueError) as exc_info:
            await generate_content(
                SAMPLE_CONTENT, "linkedin", "social_post"
            )

        assert "AIza" not in str(exc_info.value)
        assert _PLACEHOLDER not in str(exc_info.value)


# ---------------------------------------------------------------------------
# generate_content — successful Gemini call (mocked)
# ---------------------------------------------------------------------------

class TestSuccessfulGeneration:

    @pytest.mark.asyncio
    async def test_returns_generated_text(self, monkeypatch):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        expected = "This is the AI-generated LinkedIn post."
        mock_response = _make_mock_response(expected)

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = AsyncMock(
                return_value=mock_response
            )

            result = await generate_content(
                SAMPLE_CONTENT, "linkedin", "social_post"
            )

        assert result == expected

    @pytest.mark.asyncio
    async def test_uses_configured_model(self, monkeypatch):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )
        monkeypatch.setenv(
            "GEMINI_MODEL", "gemini-1.5-pro"
        )

        mock_response = _make_mock_response("Some content")

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_aio_call = AsyncMock(
                return_value=mock_response
            )
            mock_client_instance.aio.models.generate_content = (
                mock_aio_call
            )

            await generate_content(
                SAMPLE_CONTENT, "instagram", "carousel"
            )

            call_kwargs = mock_aio_call.call_args
            assert (
                call_kwargs.kwargs.get("model")
                == "gemini-1.5-pro"
            )

    @pytest.mark.asyncio
    async def test_all_platforms_and_types(self, monkeypatch):
        """Smoke-test every platform and content-type combination."""
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        mock_response = _make_mock_response(
            "Generated content"
        )

        platforms = [
            "linkedin",
            "instagram",
            "youtube_shorts",
        ]

        content_types = [
            "social_post",
            "video_script",
            "carousel",
        ]

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = (
                AsyncMock(return_value=mock_response)
            )

            for platform in platforms:
                for content_type in content_types:
                    result = await generate_content(
                        SAMPLE_CONTENT,
                        platform,
                        content_type,
                    )

                    assert isinstance(result, str)
                    assert len(result) > 0


# ---------------------------------------------------------------------------
# generate_content — error / edge-case handling (mocked)
# ---------------------------------------------------------------------------

class TestErrorHandling:

    @pytest.mark.asyncio
    async def test_raises_runtime_error_on_empty_response(
        self, monkeypatch
    ):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        mock_response = _make_mock_response("")

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = (
                AsyncMock(return_value=mock_response)
            )

            with pytest.raises(
                RuntimeError,
                match="empty response",
            ):
                await generate_content(
                    SAMPLE_CONTENT, "linkedin", "social_post"
                )

    @pytest.mark.asyncio
    async def test_raises_runtime_error_on_none_text(
        self, monkeypatch
    ):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        mock_response = _make_mock_response(None)

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = (
                AsyncMock(return_value=mock_response)
            )

            with pytest.raises(
                RuntimeError,
                match="empty response",
            ):
                await generate_content(
                    SAMPLE_CONTENT, "linkedin", "social_post"
                )

    @pytest.mark.asyncio
    async def test_api_error_raises_safe_runtime_error(
        self, monkeypatch
    ):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        from google.genai import errors as genai_errors

        # The SDK expects response_json to be a dictionary.
        # Passing a string here causes an AttributeError inside
        # the SDK before our service can handle the API error.
        simulated_api_error = genai_errors.APIError(
            500,
            {
                "message": (
                    "Internal error with secret details"
                )
            },
        )

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = (
                AsyncMock(side_effect=simulated_api_error)
            )

            with pytest.raises(RuntimeError) as exc_info:
                await generate_content(
                    SAMPLE_CONTENT, "linkedin", "social_post"
                )

            # Raw API error details and fake credentials must not
            # be exposed to the caller.
            assert (
                "Internal error with secret details"
                not in str(exc_info.value)
            )
            assert (
                "fake-key-for-testing"
                not in str(exc_info.value)
            )

    @pytest.mark.asyncio
    async def test_unexpected_exception_raises_safe_runtime_error(
        self, monkeypatch
    ):
        monkeypatch.setenv(
            "GEMINI_API_KEY", "fake-key-for-testing"
        )

        with patch(
            "services.gemini_service.genai.Client"
        ) as MockClient:

            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance

            mock_client_instance.aio.models.generate_content = (
                AsyncMock(
                    side_effect=ConnectionError(
                        "Network failure with internal IP 10.0.0.1"
                    )
                )
            )

            with pytest.raises(RuntimeError) as exc_info:
                await generate_content(
                    SAMPLE_CONTENT, "linkedin", "social_post"
                )

            # Internal network details and fake credentials must
            # not leak through the exception.
            assert "10.0.0.1" not in str(exc_info.value)
            assert (
                "fake-key-for-testing"
                not in str(exc_info.value)
            )


# ---------------------------------------------------------------------------
# generate_image_prompt tests
# ---------------------------------------------------------------------------

class TestImagePromptGeneration:

    @pytest.mark.asyncio
    async def test_generate_image_prompt_success(self, monkeypatch):
        import json
        from services.gemini_service import generate_image_prompt

        monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-testing")

        fake_spec = {
            "title": "Minimalist Workstation",
            "primary_prompt": "Clean modern desk with laptop and natural sunlight",
            "negative_prompt": "blurry, low resolution",
            "aspect_ratio": "1:1",
            "platform": "instagram",
            "visual_style": "minimalist",
            "subject": "Laptop and coffee",
            "composition": "Centered flat lay",
            "lighting": "Soft morning sunlight",
            "color_palette": ["#0284c7", "#f8fafc"],
            "background": "White oak table",
            "copy_ready_midjourney": "Clean modern desk --ar 1:1",
            "copy_ready_dalle": "Clean modern desk",
        }

        mock_response = _make_mock_response(json.dumps(fake_spec))

        with patch("services.gemini_service.genai.Client") as MockClient:
            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance
            mock_client_instance.aio.models.generate_content = AsyncMock(
                return_value=mock_response
            )

            result = await generate_image_prompt(
                source_content="How to build remote work habits",
                platform="instagram",
                visual_style="minimalist",
                aspect_ratio="1:1",
            )

        assert result["title"] == "Minimalist Workstation"
        assert result["generation_available"] is False
        assert result["aspect_ratio"] == "1:1"
        assert "primary_prompt" in result
        assert result["content_format"] == "promotional"
        assert "key_points" in result
        assert len(result["key_points"]) >= 1

    @pytest.mark.asyncio
    async def test_generate_image_prompt_custom_parameters(self, monkeypatch):
        import json
        from services.gemini_service import generate_image_prompt

        monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-testing")

        fake_spec = {
            "title": "Educational Growth Framework",
            "headline": "3 Steps to Scale Content",
            "subhead": "Actionable blueprint for founders",
            "badge": "GROWTH GUIDE",
            "content_format": "educational_explainer",
            "key_points": ["Audit channels", "Build distribution engine", "Automate workflows"],
            "metric_callout": "10X OUTPUT",
            "cta_text": "DOWNLOAD FRAMEWORK",
            "primary_prompt": "Infographic educational layout modern minimalism",
            "negative_prompt": "clutter, blurry",
            "aspect_ratio": "4:5",
            "platform": "carousel",
            "visual_style": "flat_vector",
            "subject": "Growth framework steps",
            "composition": "Three card hierarchy",
            "lighting": "Studio diffuse",
            "color_palette": ["#4f46e5", "#06b6d4"],
            "background": "Dark slate",
            "copy_ready_midjourney": "Prompt --ar 4:5",
            "copy_ready_dalle": "Prompt",
        }

        mock_response = _make_mock_response(json.dumps(fake_spec))

        with patch("services.gemini_service.genai.Client") as MockClient:
            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance
            mock_client_instance.aio.models.generate_content = AsyncMock(
                return_value=mock_response
            )

            result = await generate_image_prompt(
                source_content="Content distribution guide for founders",
                platform="carousel",
                visual_style="flat_vector",
                aspect_ratio="4:5",
                content_format="educational_explainer",
                creative_instructions="Focus on 3 concrete steps with bold badges",
                brand_color_primary="#4f46e5",
                brand_color_accent="#06b6d4",
            )

        assert result["content_format"] == "educational_explainer"
        assert result["headline"] == "3 Steps to Scale Content"
        assert result["metric_callout"] == "10X OUTPUT"
        assert len(result["key_points"]) == 3


# ---------------------------------------------------------------------------
# generate_video_plan tests
# ---------------------------------------------------------------------------

class TestVideoPlanGeneration:

    @pytest.mark.asyncio
    async def test_generate_video_plan_success(self, monkeypatch):
        import json
        from services.gemini_service import generate_video_plan

        monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-testing")

        fake_plan = {
            "title": "3 Productivity Hacks",
            "hook": "Stop wasting 2 hours every morning.",
            "total_duration_seconds": 30,
            "platform": "youtube_shorts",
            "target_audience": "creators",
            "tone": "friendly",
            "summary": "Short guide to morning routines",
            "scenes": [
                {
                    "scene_number": 1,
                    "duration_seconds": 5,
                    "visual_description": "Close up of alarm clock buzzing",
                    "voiceover": "Stop wasting two hours every single morning.",
                    "on_screen_text": "DON'T SNOOZE",
                    "transition": "Fast Whip Pan",
                    "visual_prompt": "Alarm clock on bedside table cinematic",
                },
                {
                    "scene_number": 2,
                    "duration_seconds": 15,
                    "visual_description": "Time-lapse of desk setup and focused work",
                    "voiceover": "Instead, pick your single most impactful task the night before.",
                    "on_screen_text": "RULE 1: PLAN AT NIGHT",
                    "transition": "Zoom Cut",
                    "visual_prompt": "Clean modern desk setup with notebook",
                },
            ],
            "call_to_action": "Follow for daily productivity systems.",
            "audio_suggestion": "Upbeat lo-fi electronic, 120 BPM",
        }

        mock_response = _make_mock_response(json.dumps(fake_plan))

        with patch("services.gemini_service.genai.Client") as MockClient:
            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance
            mock_client_instance.aio.models.generate_content = AsyncMock(
                return_value=mock_response
            )

            result = await generate_video_plan(
                source_content="How to stop wasting time in the morning",
                platform="youtube_shorts",
                target_duration=30,
                tone="friendly",
                target_audience="creators",
            )

        assert result["title"] == "3 Productivity Hacks"
        assert result["hook"] == "Stop wasting 2 hours every morning."
        assert len(result["scenes"]) == 2
        assert result["generation_available"] is False
        assert result["scenes"][0]["composition_type"] == "hook_intro"
        assert result["scenes"][1]["composition_type"] == "cta_outro"

    @pytest.mark.asyncio
    async def test_generate_video_plan_with_compositions_and_styles(self, monkeypatch):
        import json
        from services.gemini_service import generate_video_plan

        monkeypatch.setenv("GEMINI_API_KEY", "fake-key-for-testing")

        fake_plan = {
            "title": "Scaling SaaS with AI",
            "hook": "90% of founders fail at scaling content. Here's why.",
            "total_duration_seconds": 45,
            "platform": "tiktok",
            "target_audience": "startups",
            "tone": "inspirational",
            "visual_style": "kinetic_tech",
            "content_format": "listicle",
            "summary": "3-step listicle for scaling tech content",
            "scenes": [
                {
                    "scene_number": 1,
                    "duration_seconds": 4,
                    "composition_type": "hook_intro",
                    "visual_description": "Pulsing neon countdown with alert icon",
                    "voiceover": "90 percent of founders fail at scaling content.",
                    "on_screen_text": "THE 90% TRAP",
                    "caption_keyword": "TRAP",
                    "transition": "Whip Pan",
                    "visual_prompt": "Futuristic neon analytics screen",
                },
                {
                    "scene_number": 2,
                    "duration_seconds": 8,
                    "composition_type": "stat_chart",
                    "visual_description": "Animated bar chart rocketing upward",
                    "voiceover": "Teams using automated multi-format engines see a 4x throughput surge.",
                    "on_screen_text": "4X OUTPUT SURGE",
                    "caption_keyword": "4X",
                    "transition": "Zoom Blur",
                    "visual_prompt": "3D glowing holographic chart",
                    "chart_data": {"label": "Content Velocity", "value": 85, "unit": "%", "subtitle": "vs manual writing"},
                },
                {
                    "scene_number": 3,
                    "duration_seconds": 5,
                    "composition_type": "cta_outro",
                    "visual_description": "Pulsating subscribe badge and glowing handle",
                    "voiceover": "Follow ContentBloom for daily distribution blueprints.",
                    "on_screen_text": "FOLLOW FOR BLUEPRINTS",
                    "caption_keyword": "FOLLOW",
                    "transition": "Cross Fade",
                    "visual_prompt": "Clean social media interface card",
                },
            ],
            "call_to_action": "Follow ContentBloom for daily distribution blueprints.",
            "audio_suggestion": "Cyberpunk synthwave rhythm, 128 BPM",
        }

        mock_response = _make_mock_response(json.dumps(fake_plan))

        with patch("services.gemini_service.genai.Client") as MockClient:
            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance
            mock_client_instance.aio.models.generate_content = AsyncMock(
                return_value=mock_response
            )

            result = await generate_video_plan(
                source_content="How to scale SaaS content without hiring an agency",
                platform="tiktok",
                target_duration=45,
                tone="inspirational",
                target_audience="startups",
                visual_style="kinetic_tech",
                content_format="listicle",
                additional_instructions="Include a stat chart in scene 2",
            )

        assert result["title"] == "Scaling SaaS with AI"
        assert result["visual_style"] == "kinetic_tech"
        assert result["content_format"] == "listicle"
        assert len(result["scenes"]) == 3
        assert result["scenes"][1]["composition_type"] == "stat_chart"
        assert result["scenes"][1]["chart_data"]["value"] == 85
        assert result["scenes"][2]["composition_type"] == "cta_outro"
