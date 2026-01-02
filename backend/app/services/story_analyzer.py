"""
Story Analyzer Service
Uses Gemini AI to break down a story prompt into sequential scene descriptions
for video generation (4-8 segments × 8 seconds each)
"""

import google.generativeai as genai
from typing import List
import json
import re
from app.config import get_settings
from app.models import SceneDescription, AspectRatio

settings = get_settings()


class StoryAnalyzer:
    """Service to analyze story prompts and generate 8-scene storyboards"""

    def __init__(self):
        """Initialize Gemini AI with API key"""
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(
            model_name=settings.chat_model,  # Use same chat model (Gemini 2.0 Flash)
            generation_config={
                "temperature": 0.7,  # Creative but consistent
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 4096,
            }
        )

    async def analyze_story(
        self,
        story_prompt: str,
        aspect_ratio: AspectRatio = AspectRatio.LANDSCAPE,
        scene_count: int = 4,
        duration: int = 8,
        default_camera_style: str = None,
        default_style_control: str = None
    ) -> List[SceneDescription]:
        """
        Break down a story into sequential scenes for video generation

        Args:
            story_prompt: User's story description (20-8192 characters)
            aspect_ratio: Video format for shot composition guidance
            scene_count: Number of scenes to generate (4 for testing, 8 for full)
            duration: Duration per scene in seconds (4, 6, or 8)
            default_camera_style: Optional default camera movement for all scenes
            default_style_control: Optional default visual style for all scenes

        Returns:
            List of SceneDescription objects with detailed video prompts and camera/style settings
        """

        # Determine shot framing based on aspect ratio
        framing_guide = "cinematic widescreen" if aspect_ratio == AspectRatio.LANDSCAPE else "vertical mobile-friendly"

        # Determine camera and style instructions
        if default_camera_style and default_style_control:
            camera_style_instruction = f"""
CAMERA & STYLE (USER-SPECIFIED DEFAULTS):
- Apply camera movement: "{default_camera_style}" to ALL scenes
- Apply visual style: "{default_style_control}" to ALL scenes
- These are fixed defaults - use them for every scene
"""
        elif default_camera_style:
            camera_style_instruction = f"""
CAMERA & STYLE (MIXED DEFAULTS):
- Apply camera movement: "{default_camera_style}" to ALL scenes
- Visual style: Intelligently choose appropriate visual styles for each scene based on the story mood, setting, and narrative (e.g., "cinematic" for dramatic moments, "documentary" for realistic scenes, "vintage" for nostalgic content)
"""
        elif default_style_control:
            camera_style_instruction = f"""
CAMERA & STYLE (MIXED DEFAULTS):
- Camera movement: Intelligently choose appropriate camera movements for each scene based on the action and pacing (e.g., "static" for intimate moments, "pan" for reveals, "zoom in" for focus, "aerial view" for establishing shots)
- Apply visual style: "{default_style_control}" to ALL scenes
"""
        else:
            camera_style_instruction = """
CAMERA & STYLE (AI SMART DEFAULTS):
- Intelligently choose appropriate camera movements for each scene based on the action, pacing, and narrative flow
  Examples: "static" for dialogue/intimate moments, "pan left/right" for reveals, "zoom in" for emotional focus, "aerial view" for establishing shots, "tracking shot" for following action, "handheld" for urgency/chaos
- Intelligently choose appropriate visual styles for each scene based on the story mood, setting, and tone
  Examples: "cinematic" for dramatic/epic stories, "documentary" for realistic content, "vintage" for period pieces, "film noir" for dark/mystery, "vibrant saturated" for energetic/colorful scenes, "moody dark" for suspense
- Vary camera and style choices across scenes to create visual interest and match the narrative arc
"""

        # Construct system instruction for AI
        total_duration = scene_count * duration
        system_instruction = f"""You are an expert video storyboard creator for AI video generation.

Your task: Break the user's story into EXACTLY {scene_count} sequential scenes for {total_duration}-second video generation.
Each scene will be {duration} seconds long and generated using Google Veo 3.1 AI video model.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY {scene_count} scenes - no more, no less
2. Each scene must have a detailed, visual prompt (100-500 characters)
3. Maintain character consistency - use same character descriptions across scenes
4. Include specific details: camera angles, lighting, actions, emotions
5. Progressive narrative - each scene should advance the story
6. Format: {framing_guide} shots
7. Each prompt should be self-contained but reference previous context for continuity

OUTPUT FORMAT (JSON):
{{
  "scenes": [
    {{
      "scene_number": 1,
      "prompt": "Detailed visual description of scene 1...",
      "duration": {duration},
      "camera_style": "appropriate camera movement",
      "style_control": "appropriate visual style"
    }},
    ...
  ]
}}

{camera_style_instruction}

PROMPT WRITING GUIDELINES:
- Start with camera movement (e.g., "Slow pan across...", "Close-up of...", "Aerial view...")
- Describe the subject/character with consistent details (clothing, appearance, age)
- Include setting details (time of day, location, weather, lighting)
- Specify action or emotion (what's happening, how characters feel)
- Add cinematic details (depth of field, color grading, atmosphere)

EXAMPLE GOOD PROMPT:
"Close-up of a young woman in her 30s with curly brown hair and blue sweater, sitting at a cafe window, morning golden hour light streaming in, she looks thoughtful as she writes in a leather journal, shallow depth of field, warm color tones, peaceful atmosphere"

Now generate {scene_count} scenes for this story:"""

        # Create chat session
        chat = self.model.start_chat(history=[])

        # Send the story prompt with instructions
        full_prompt = f"{system_instruction}\n\nSTORY: {story_prompt}"

        try:
            response = chat.send_message(full_prompt)
            response_text = response.text

            # Extract JSON from response (AI might add explanation text)
            scenes_data = self._extract_json(response_text)

            # Validate and create SceneDescription objects
            scenes = []
            if scenes_data and "scenes" in scenes_data:
                for idx, scene in enumerate(scenes_data["scenes"][:scene_count], start=1):  # Ensure max scene_count
                    scenes.append(SceneDescription(
                        scene_number=idx,
                        prompt=scene.get("prompt", ""),
                        duration=duration,
                        camera_style=scene.get("camera_style") or default_camera_style,
                        style_control=scene.get("style_control") or default_style_control
                    ))

            # If we got fewer scenes than requested, pad with continuation prompts
            while len(scenes) < scene_count:
                scene_num = len(scenes) + 1
                scenes.append(SceneDescription(
                    scene_number=scene_num,
                    prompt=f"Continuation of the story, scene {scene_num} of {scene_count}",
                    duration=duration,
                    camera_style=default_camera_style,
                    style_control=default_style_control
                ))

            # Ensure exactly scene_count scenes
            return scenes[:scene_count]

        except Exception as e:
            print(f"❌ Story analysis error: {e}")
            # Fallback: Create generic scenes from the original prompt
            return self._create_fallback_scenes(story_prompt, scene_count, duration, default_camera_style, default_style_control)

    def _extract_json(self, text: str) -> dict:
        """
        Extract JSON object from AI response text
        AI might wrap JSON in markdown code blocks or add explanatory text
        """
        try:
            # Try direct JSON parse first
            return json.loads(text)
        except json.JSONDecodeError:
            # Look for JSON in markdown code blocks
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass

            # Look for any JSON object in the text
            json_match = re.search(r'\{.*"scenes".*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    pass

        return {}

    def _create_fallback_scenes(
        self,
        story_prompt: str,
        scene_count: int = 4,
        duration: int = 8,
        default_camera_style: str = None,
        default_style_control: str = None
    ) -> List[SceneDescription]:
        """
        Create fallback scenes if AI parsing fails
        Splits the story into parts with basic scene progression
        """
        # Truncate story prompt if too long
        base_prompt = story_prompt[:500]

        # Create full template pool (8 scenes) and slice as needed
        scene_templates = [
            f"Opening scene: {base_prompt}, establishing shot, wide angle",
            f"Scene 2: {base_prompt}, medium shot, introducing main elements",
            f"Scene 3: {base_prompt}, close-up on key details",
            f"Scene 4: {base_prompt}, action or interaction begins",
            f"Scene 5: {base_prompt}, development of the narrative",
            f"Scene 6: {base_prompt}, climax or key moment",
            f"Scene 7: {base_prompt}, resolution beginning",
            f"Scene 8: {base_prompt}, closing shot, cinematic ending"
        ]

        # For counts less than 8, strategically select scenes
        if scene_count == 4:
            selected_templates = [scene_templates[i] for i in [0, 3, 5, 7]]
        elif scene_count == 5:
            selected_templates = [scene_templates[i] for i in [0, 2, 4, 5, 7]]
        elif scene_count == 6:
            selected_templates = [scene_templates[i] for i in [0, 2, 3, 4, 5, 7]]
        elif scene_count == 7:
            selected_templates = [scene_templates[i] for i in [0, 1, 2, 4, 5, 6, 7]]
        else:  # 8 scenes
            selected_templates = scene_templates

        return [
            SceneDescription(
                scene_number=idx + 1,
                prompt=prompt,
                duration=duration,
                camera_style=default_camera_style,
                style_control=default_style_control
            )
            for idx, prompt in enumerate(selected_templates)
        ]


# Global instance
story_analyzer = StoryAnalyzer()
