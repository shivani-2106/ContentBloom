from fastapi import APIRouter, HTTPException

from models import (
    GenerateRequest,
    GenerateResponse,
    ImproveRequest,
    GenerateAllRequest,
    ImproveAllRequest,
    ImagePromptRequest,
    ImagePromptResponse,
    VideoPlanRequest,
    VideoPlanResponse,
)

from services.gemini_service import (
    generate_content,
    improve_content,
    generate_all_formats,
    improve_all_formats,
    generate_image_prompt,
    generate_video_plan,
)

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    try:
        result_text = await generate_content(
            source_content=request.source_content,
            platform=request.platform.value,
            content_type=request.content_type.value,
            tone=request.tone,
            target_audience=request.target_audience,
            length=request.length,
            include_hashtags=request.include_hashtags,
            include_emojis=request.include_emojis,
        )

        return GenerateResponse(
            result=result_text,
            platform=request.platform,
            content_type=request.content_type,
        )

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Content generation failed. Please try again.",
        ) from None


@router.post("/improve", response_model=GenerateResponse)
async def improve(request: ImproveRequest):
    try:
        result_text = await improve_content(
            source_content=request.source_content,
            current_content=request.current_content,
            platform=request.platform.value,
            content_type=request.content_type.value,
            tone=request.tone,
            target_audience=request.target_audience,
            length=request.length,
            include_hashtags=request.include_hashtags,
            include_emojis=request.include_emojis,
        )

        return GenerateResponse(
            result=result_text,
            platform=request.platform,
            content_type=request.content_type,
        )

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Content improvement failed. Please try again.",
        ) from None

@router.post("/generate-all")
async def generate_all(request: GenerateAllRequest):
    try:
        results = await generate_all_formats(
            source_content=request.source_content,
            tone=request.tone,
            target_audience=request.target_audience,
            length=request.length,
            include_hashtags=request.include_hashtags,
            include_emojis=request.include_emojis,
        )
        return {
            "results": results,
            "source_content": request.source_content,
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Multi-format content generation failed. Please try again.",
        ) from None

@router.post("/improve-all")
async def improve_all(request: ImproveAllRequest):
    try:
        results = await improve_all_formats(
            source_content=request.source_content,
            current_results=request.current_results,
            tone=request.tone,
            target_audience=request.target_audience,
            length=request.length,
            include_hashtags=request.include_hashtags,
            include_emojis=request.include_emojis,
        )

        return {
            "results": results,
            "source_content": request.source_content,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Multi-format content improvement failed. Please try again.",
        ) from None

@router.post("/generate-image-prompt", response_model=ImagePromptResponse)
async def generate_image_prompt_endpoint(request: ImagePromptRequest):
    try:
        data = await generate_image_prompt(
            source_content=request.source_content,
            platform=request.platform,
            visual_style=request.visual_style,
            aspect_ratio=request.aspect_ratio,
            content_format=request.content_format,
            creative_instructions=request.creative_instructions,
            brand_color_primary=request.brand_color_primary,
            brand_color_accent=request.brand_color_accent,
        )
        return ImagePromptResponse(**data)

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Visual prompt generation failed. Please try again.",
        ) from None

@router.post("/generate-video-plan", response_model=VideoPlanResponse)
async def generate_video_plan_endpoint(request: VideoPlanRequest):
    try:
        data = await generate_video_plan(
            source_content=request.source_content,
            platform=request.platform,
            target_duration=request.target_duration,
            tone=request.tone,
            target_audience=request.target_audience,
            visual_style=request.visual_style,
            content_format=request.content_format,
            additional_instructions=request.additional_instructions,
        )
        return VideoPlanResponse(**data)

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Video plan generation failed. Please try again.",
        ) from None
