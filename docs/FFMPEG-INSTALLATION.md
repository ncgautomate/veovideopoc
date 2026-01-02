# FFmpeg Installation Guide

FFmpeg is required for the 60-second sequential video feature to extract frames and stitch video segments together.

## 📋 Table of Contents
- [Windows Installation](#windows-installation)
- [macOS Installation](#macos-installation)
- [Linux Installation](#linux-installation)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Windows Installation

### Method 1: Using Scoop (Recommended for Windows)

Scoop is a command-line installer for Windows that makes it easy to install and manage software.

#### Step 1: Install Scoop

Open PowerShell and run:

```powershell
# Set execution policy to allow script execution
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Scoop
irm get.scoop.sh | iex
```

#### Step 2: Install FFmpeg

```powershell
# Install FFmpeg via Scoop
scoop install ffmpeg

# Verify installation
ffmpeg -version
```

**Expected Output:**
```
ffmpeg version 6.x.x Copyright (c) 2000-2024 the FFmpeg developers
built with gcc x.x.x (GCC)
configuration: ...
```

---

### Method 2: Manual Installation (Windows)

If you prefer to install manually without package managers:

#### Step 1: Download FFmpeg

1. Visit the official FFmpeg builds page:
   - **Recommended**: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip`

2. Alternative source:
   - https://github.com/BtbN/FFmpeg-Builds/releases
   - Download: `ffmpeg-master-latest-win64-gpl.zip`

#### Step 2: Extract Files

1. Extract the downloaded ZIP file to a permanent location:
   ```
   C:\ffmpeg\
   ```

2. Inside you should see:
   ```
   C:\ffmpeg\
     ├── bin\
     │   ├── ffmpeg.exe
     │   ├── ffplay.exe
     │   └── ffprobe.exe
     ├── doc\
     └── presets\
   ```

#### Step 3: Add to System PATH

**Option A: Using PowerShell (Permanent)**

```powershell
# Add FFmpeg to PATH for current user
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = $currentPath + ";C:\ffmpeg\bin"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")

# Restart PowerShell for changes to take effect
```

**Option B: Using System Settings (GUI)**

1. Open **System Properties**:
   - Right-click **This PC** → **Properties**
   - Click **Advanced system settings**
   - Click **Environment Variables**

2. Under **User variables**, find **Path**, click **Edit**

3. Click **New** and add:
   ```
   C:\ffmpeg\bin
   ```

4. Click **OK** on all dialogs

5. **Restart** your terminal/PowerShell

#### Step 4: Verify Installation

```powershell
# Restart PowerShell, then run:
ffmpeg -version
```

---

### Method 3: Using winget (Windows Package Manager)

If you have Windows 10/11 with winget installed:

```powershell
# Install FFmpeg
winget install ffmpeg

# Verify installation
ffmpeg -version
```

---

## macOS Installation

### Method 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### Method 2: Using MacPorts

```bash
# Install FFmpeg
sudo port install ffmpeg

# Verify installation
ffmpeg -version
```

---

## Linux Installation

### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install FFmpeg
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

### Fedora/RHEL/CentOS

```bash
# Install FFmpeg
sudo dnf install ffmpeg

# Verify installation
ffmpeg -version
```

### Arch Linux

```bash
# Install FFmpeg
sudo pacman -S ffmpeg

# Verify installation
ffmpeg -version
```

---

## Verification

After installation, verify FFmpeg is working correctly:

### Check Version

```bash
ffmpeg -version
```

**Expected Output:**
```
ffmpeg version 6.x.x Copyright (c) 2000-2024 the FFmpeg developers
built with ...
configuration: ...
libavutil      58.x.xxx / 58.x.xxx
libavcodec     60.x.xxx / 60.x.xxx
...
```

### Check PATH

**Windows:**
```powershell
where ffmpeg
```

**macOS/Linux:**
```bash
which ffmpeg
```

**Expected Output:**
- Should show the path to ffmpeg executable
- Example: `C:\ffmpeg\bin\ffmpeg.exe` (Windows)
- Example: `/usr/local/bin/ffmpeg` (macOS)
- Example: `/usr/bin/ffmpeg` (Linux)

### Test FFmpeg

Run a simple test:

```bash
# Display help
ffmpeg -h

# Display available encoders
ffmpeg -encoders

# Display available decoders
ffmpeg -decoders
```

---

## Troubleshooting

### Issue: "ffmpeg is not recognized as an internal or external command"

**Solution for Windows:**
1. Verify FFmpeg is in PATH:
   ```powershell
   $env:Path -split ';' | Select-String ffmpeg
   ```

2. If not found, add to PATH manually (see Method 2, Step 3 above)

3. **Restart your terminal/IDE** after adding to PATH

4. If still not working, use absolute path temporarily:
   ```powershell
   C:\ffmpeg\bin\ffmpeg.exe -version
   ```

---

### Issue: Permission Denied (Linux/macOS)

**Solution:**
```bash
# Make ffmpeg executable
sudo chmod +x /usr/local/bin/ffmpeg

# Or reinstall with package manager
sudo apt install --reinstall ffmpeg  # Ubuntu/Debian
brew reinstall ffmpeg                # macOS
```

---

### Issue: FFmpeg installed but CleverCreator.ai can't find it

**Solution:**

1. **Restart the backend server** after installing FFmpeg

2. Check backend logs for FFmpeg detection:
   ```bash
   # Backend should show on startup:
   # ⚠️  WARNING: FFmpeg not found! Video stitching will not work.
   # OR
   # ✅ FFmpeg detected: /path/to/ffmpeg
   ```

3. If FFmpeg is installed but not detected, check PATH in the terminal running the backend:
   ```bash
   # Test in same terminal where backend runs
   ffmpeg -version
   ```

4. Try running backend with explicit PATH:
   ```bash
   # Windows
   $env:Path += ";C:\ffmpeg\bin"
   python -m uvicorn app.main:app --reload

   # Linux/macOS
   export PATH="$PATH:/usr/local/bin"
   uvicorn app.main:app --reload
   ```

---

### Issue: Old FFmpeg version

**Check version requirements:**
- Minimum recommended: **FFmpeg 4.4+**
- Tested with: **FFmpeg 6.0+**

**Upgrade:**

```bash
# Windows (Scoop)
scoop update ffmpeg

# macOS (Homebrew)
brew upgrade ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt upgrade ffmpeg

# Manual: Download latest from https://ffmpeg.org/download.html
```

---

## What Does CleverCreator.ai Use FFmpeg For?

### 1. Frame Extraction
Extracts the last frame from each 8-second video segment to use as a reference image for the next segment, ensuring visual continuity.

**Command Example:**
```bash
ffmpeg -sseof -1 -i segment.mp4 -frames:v 1 frame.jpg -y
```

### 2. Video Stitching with Crossfades
Combines 8 video segments into a single 60-second video with smooth 0.5-second crossfade transitions between segments.

**Command Example:**
```bash
ffmpeg -i seg1.mp4 -i seg2.mp4 ... -i seg8.mp4 \
  -filter_complex "[0][1]xfade=transition=fade:duration=0.5:offset=7.5[v01]; ..." \
  -c:v libx264 -c:a aac final.mp4
```

---

## Additional Resources

- **Official FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **FFmpeg Wiki**: https://trac.ffmpeg.org/wiki
- **Scoop (Windows)**: https://scoop.sh
- **Homebrew (macOS)**: https://brew.sh

---

## Support

If you encounter issues not covered in this guide:

1. Check FFmpeg installation: `ffmpeg -version`
2. Check CleverCreator.ai backend logs for errors
3. Report issues at: https://github.com/yourusername/veo2-video-poc-webapp/issues

---

**Last Updated:** 2025-01-02
**CleverCreator.ai Version:** 1.0.0
