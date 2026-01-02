"""
FFmpeg Service
Handles video processing tasks: frame extraction and segment stitching
Requires FFmpeg to be installed on the system
"""

import subprocess
import asyncio
from pathlib import Path
from typing import List, Optional
import shutil


class FFmpegService:
    """Service for video processing using FFmpeg"""

    def __init__(self):
        """Initialize and verify FFmpeg installation"""
        self.ffmpeg_available = self._check_ffmpeg()

        if not self.ffmpeg_available:
            print("WARNING: FFmpeg not found! Video stitching will not work.")
            print("Install FFmpeg: https://ffmpeg.org/download.html")

    def _check_ffmpeg(self) -> bool:
        """Check if FFmpeg is installed and accessible"""
        return shutil.which("ffmpeg") is not None

    async def extract_final_frame(
        self,
        video_path: Path,
        output_path: Path
    ) -> Path:
        """
        Extract the last frame from a video file

        Args:
            video_path: Path to source video file
            output_path: Path where frame image should be saved (e.g., frame.jpg)

        Returns:
            Path to extracted frame image

        Raises:
            Exception if FFmpeg is not available or extraction fails
        """
        if not self.ffmpeg_available:
            raise Exception("FFmpeg is not installed. Cannot extract frames.")

        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        # FFmpeg command to extract last frame
        # -sseof -1: Seek to 1 second before end of file
        # -frames:v 1: Extract exactly 1 frame
        # -q:v 2: High quality JPEG (1-31, lower = better)
        cmd = [
            "ffmpeg",
            "-sseof", "-1",          # Seek to near end of file
            "-i", str(video_path),    # Input video
            "-update", "1",           # Update single output file
            "-frames:v", "1",         # Extract 1 frame
            "-q:v", "2",              # High quality
            str(output_path),         # Output image
            "-y"                      # Overwrite without asking
        ]

        print(f"   🖼️  Extracting frame: {video_path.name} → {output_path.name}")

        try:
            # Run FFmpeg in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                subprocess.run,
                cmd,
                subprocess.PIPE,  # Capture stdout
                subprocess.PIPE,  # Capture stderr
                True              # Check return code
            )

            if output_path.exists():
                print(f"   ✅ Frame extracted successfully")
                return output_path
            else:
                raise Exception("Frame extraction completed but output file not found")

        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else "Unknown error"
            raise Exception(f"FFmpeg frame extraction failed: {error_msg}")

    async def stitch_segments_with_blending(
        self,
        segment_paths: List[Path],
        output_path: Path,
        transition_duration: float = 0.5
    ) -> Path:
        """
        Stitch multiple video segments with crossfade transitions

        Args:
            segment_paths: List of paths to video segments (in order)
            output_path: Path for final stitched video
            transition_duration: Duration of crossfade in seconds (default: 0.5)

        Returns:
            Path to stitched video file

        Raises:
            Exception if FFmpeg is not available or stitching fails
        """
        if not self.ffmpeg_available:
            raise Exception("FFmpeg is not installed. Cannot stitch videos.")

        if len(segment_paths) < 2:
            raise ValueError("Need at least 2 segments to stitch")

        # Verify all segment files exist
        for path in segment_paths:
            if not path.exists():
                raise FileNotFoundError(f"Segment not found: {path}")

        print(f"\n✂️  Stitching {len(segment_paths)} segments with {transition_duration}s crossfades...")

        # Build FFmpeg filter_complex for xfade transitions
        filter_complex = self._build_xfade_filter(len(segment_paths), transition_duration)

        # Build FFmpeg command
        cmd = ["ffmpeg"]

        # Add all input files
        for segment in segment_paths:
            cmd.extend(["-i", str(segment)])

        # Add filter complex and output options
        cmd.extend([
            "-filter_complex", filter_complex,
            "-c:v", "libx264",      # H.264 video codec
            "-preset", "medium",     # Encoding speed/quality trade-off
            "-crf", "23",            # Constant Rate Factor (18-28, lower = better quality)
            "-c:a", "aac",           # AAC audio codec
            "-b:a", "192k",          # Audio bitrate
            "-movflags", "+faststart",  # Enable streaming
            str(output_path),
            "-y"                     # Overwrite without asking
        ])

        print(f"   Running FFmpeg with {len(segment_paths)} inputs...")

        try:
            # Run FFmpeg in thread pool (can take several minutes)
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                subprocess.run,
                cmd,
                subprocess.PIPE,
                subprocess.PIPE,
                True
            )

            if output_path.exists():
                file_size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"   ✅ Stitching completed: {file_size_mb:.2f} MB")
                return output_path
            else:
                raise Exception("FFmpeg completed but output file not found")

        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else "Unknown error"
            raise Exception(f"FFmpeg stitching failed: {error_msg}")

    def _build_xfade_filter(self, num_segments: int, transition_duration: float) -> str:
        """
        Build FFmpeg filter_complex for crossfade transitions

        Example for 3 segments with 0.5s transitions:
        [0][1]xfade=transition=fade:duration=0.5:offset=7.5[v01];
        [v01][2]xfade=transition=fade:duration=0.5:offset=15.5[v02];
        [v02]concat=n=1:v=1:a=1

        Args:
            num_segments: Number of video segments
            transition_duration: Duration of each crossfade

        Returns:
            FFmpeg filter_complex string
        """
        if num_segments < 2:
            return "[0:v][0:a]concat=n=1:v=1:a=1[outv][outa]"

        # Each segment is 8 seconds
        segment_duration = 8.0

        filters = []
        current_label = None

        for i in range(num_segments - 1):
            # Calculate offset: when to start the transition
            # For 8-second segments with 0.5s transitions:
            # Transition 1: offset = 8 - 0.5 = 7.5
            # Transition 2: offset = (8 - 0.5) + 8 - 0.5 = 15.0
            if i == 0:
                offset = segment_duration - transition_duration
            else:
                offset = (segment_duration * (i + 1)) - (transition_duration * (i + 1))

            # Input labels
            input1 = current_label if current_label else f"[{i}:v]"
            input2 = f"[{i+1}:v]"

            # Output label
            output_label = f"[v{i}{i+1}]"

            # Xfade filter
            xfade = f"{input1}{input2}xfade=transition=fade:duration={transition_duration}:offset={offset}{output_label}"
            filters.append(xfade)

            current_label = output_label

        # Audio mixing
        audio_inputs = "".join([f"[{i}:a]" for i in range(num_segments)])
        audio_filter = f"{audio_inputs}concat=n={num_segments}:v=0:a=1[outa]"

        # Combine video and audio filters
        video_chain = ";".join(filters)
        full_filter = f"{video_chain};{audio_filter}"

        # Map final outputs
        final_video = current_label if current_label else "[0:v]"
        full_filter += f";{final_video}copy[outv]"

        # Return simplified version that FFmpeg can understand
        return full_filter.replace("copy", "")


# Global instance
ffmpeg_service = FFmpegService()
