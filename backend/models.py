"""
Pydantic models (request / response schemas) for ContentBloom AI.
"""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Platform(str, Enum):
    linkedin = "linkedin"
    instagram = "instagram"
    youtube_shorts = "youtube_shorts"


class ContentType(str, Enum):
    social_post = "social_post"
    video_script = "video_script"
    carousel = "carousel"
    image_prompt = "image_prompt"


class GenerateRequest(BaseModel):
    """Payload sent by the frontend to request content generation."""

    source_content: str = Field(
        ...,
        min_length=50,
        description="The raw blog post, article, or transcript to repurpose.",
    )
    platform: Platform = Field(..., description="Target social media platform.")
    content_type: ContentType = Field(
        ..., description="Type of content to generate."
    )

    tone: Literal[
        "professional", "friendly", "witty", "inspirational"
    ] = Field(
        default="friendly",
        description="Desired writing tone.",
    )
    target_audience: Literal[
        "students", "creators", "startups", "businesses", "general"
    ] = Field(
        default="general",
        description="Intended target audience.",
    )
    length: Literal["short", "medium", "long"] = Field(
        default="medium",
        description="Desired content length.",
    )
    include_hashtags: bool = Field(
        default=True,
        description="Whether to include relevant hashtags.",
    )
    include_emojis: bool = Field(
        default=True,
        description="Whether to include appropriate emojis.",
    )


class GenerateResponse(BaseModel):
    """Payload returned to the frontend after generation."""

    result: str = Field(..., description="The generated content text.")
    platform: Platform
    content_type: ContentType

class ImproveRequest(BaseModel):
    source_content: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The original source material."
    )
    current_content: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The generated content to improve."
    )
    platform: Platform
    content_type: ContentType
    tone: Literal["professional", "friendly", "witty", "inspirational"] = "friendly"
    target_audience: Literal["students", "creators", "startups", "businesses", "general"] = "general"
    length: Literal["short", "medium", "long"] = "medium"
    include_hashtags: bool = True
    include_emojis: bool = True

class GenerateAllRequest(BaseModel):
    source_content: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="The original idea, article, or source material."
    )
    tone: Literal["professional", "friendly", "witty", "inspirational"] = "friendly"
    target_audience: Literal["students", "creators", "startups", "businesses", "general"] = "general"
    length: Literal["short", "medium", "long"] = "medium"
    include_hashtags: bool = True
    include_emojis: bool = True

class ImproveAllRequest(BaseModel):
    """Request to improve all four generated content formats."""

    source_content: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="The original source material.",
    )

    current_results: dict[str, str] = Field(
        ...,
        description="Current content for LinkedIn, Instagram, YouTube Shorts, and carousel.",
    )

    tone: Literal[
        "professional", "friendly", "witty", "inspirational"
    ] = "friendly"

    target_audience: Literal[
        "students", "creators", "startups", "businesses", "general"
    ] = "general"

    length: Literal["short", "medium", "long"] = "medium"

    include_hashtags: bool = True
    include_emojis: bool = True

class ImagePromptRequest(BaseModel):
    source_content: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Source content or idea to create visual concept for.",
    )
    platform: str = Field(
        default="instagram",
        description="Target platform (linkedin, instagram, youtube_shorts, carousel).",
    )
    visual_style: str = Field(
        default="minimalist",
        description="Visual style (minimalist, 3d_render, cinematic, flat_vector, neon_tech, editorial).",
    )
    aspect_ratio: str = Field(
        default="1:1",
        description="Target aspect ratio (1:1, 16:9, 9:16, 4:5, 1.91:1).",
    )
    content_format: str = Field(
        default="promotional",
        description="Target graphic layout format (promotional, educational_explainer, product_ad, listicle, announcement, infographic, minimal_card).",
    )
    creative_instructions: str = Field(
        default="",
        description="Optional additional creative instructions for the visual design.",
    )
    brand_color_primary: str | None = Field(
        default=None,
        description="Optional hex code or name of brand primary color.",
    )
    brand_color_accent: str | None = Field(
        default=None,
        description="Optional hex code or name of brand accent color.",
    )

class ImagePromptResponse(BaseModel):
    title: str
    primary_prompt: str
    negative_prompt: str
    aspect_ratio: str
    platform: str
    visual_style: str
    subject: str
    composition: str
    lighting: str
    color_palette: list[str] = Field(default_factory=list)
    background: str
    copy_ready_midjourney: str
    copy_ready_dalle: str
    generation_available: bool = False
    image_url: str | None = None
    content_format: str = "promotional"
    headline: str = ""
    subhead: str = ""
    badge: str = ""
    key_points: list[str] = Field(default_factory=list)
    metric_callout: str = ""
    cta_text: str = ""


class SceneItem(BaseModel):
    scene_number: int = Field(..., description="Scene number in sequence")
    duration_seconds: int = Field(..., description="Estimated duration in seconds")
    visual_description: str = Field(..., description="Detailed description of what is visible on screen")
    voiceover: str = Field(..., description="Spoken narration for this scene")
    on_screen_text: str = Field(..., description="Text overlays, captions, or kinetic typography")
    transition: str = Field(default="Cut", description="Transition to next scene")
    visual_prompt: str = Field(default="", description="Image/video diffusion prompt to generate background/b-roll")
    composition_type: str = Field(
        default="hook_intro",
        description="Scene composition: hook_intro, stat_chart, step_card, comparison, graphic_asset, quote_narrative, cta_outro",
    )
    chart_data: dict | None = Field(
        default=None,
        description="Optional chart/metric data { label, value, unit, subtitle }",
    )
    bullet_points: list[str] = Field(
        default_factory=list,
        description="Key points or step items for this scene",
    )
    caption_keyword: str = Field(
        default="",
        description="Key word to emphasize in kinetic caption",
    )


class VideoPlanRequest(BaseModel):
    source_content: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Source content, article, or topic for the video plan.",
    )
    platform: str = Field(
        default="youtube_shorts",
        description="Target platform (youtube_shorts, instagram_reels, tiktok, linkedin_video).",
    )
    target_duration: int = Field(
        default=30,
        description="Target video duration in seconds (15, 30, 45, 60).",
    )
    tone: Literal["professional", "friendly", "witty", "inspirational"] = "friendly"
    target_audience: Literal["students", "creators", "startups", "businesses", "general"] = "general"
    visual_style: str = Field(
        default="kinetic_tech",
        description="Visual video style (kinetic_tech, minimal_modern, creator_vibrant, editorial_dark).",
    )
    content_format: str = Field(
        default="educational_explainer",
        description="Video format archetype (educational_explainer, promotional, product_demo, listicle, storytelling).",
    )
    additional_instructions: str = Field(
        default="",
        description="User creative direction or custom requirements.",
    )


class VideoPlanResponse(BaseModel):
    title: str
    hook: str
    total_duration_seconds: int
    platform: str
    target_audience: str
    tone: str
    summary: str
    scenes: list[SceneItem] = Field(default_factory=list)
    call_to_action: str
    audio_suggestion: str
    generation_available: bool = False
    visual_style: str = "kinetic_tech"
    content_format: str = "educational_explainer"
