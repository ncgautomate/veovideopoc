# End-to-End Testing Guide

This document provides comprehensive testing procedures for the Veo Video Generator webapp.

## Prerequisites

- Both backend and frontend servers running
- Valid Google Gemini API key configured
- Test images available (PNG or JPEG, under 20MB)

## Test Environment Setup

```bash
# Start both servers
# Option 1: Using startup script
./start-dev.sh       # Mac/Linux
start-dev.bat        # Windows

# Option 2: Manual start (see QUICKSTART.md)
```

Verify servers are running:
- Backend: http://localhost:8000/api/health
- Frontend: http://localhost:5173

## Test Suite

### 1. Backend API Testing

#### 1.1 Health Check
```bash
curl http://localhost:8000/api/health
```
**Expected Result:**
```json
{
  "status": "healthy",
  "service": "Veo Video Generation API",
  "version": "1.0.0"
}
```

#### 1.2 Image Upload
```bash
curl -X POST "http://localhost:8000/api/upload-image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/test/image.jpg"
```
**Expected Result:**
```json
{
  "image_id": "abc123...",
  "filename": "image.jpg",
  "size": 123456,
  "message": "Image uploaded successfully"
}
```

**Test Cases:**
- ✅ Upload valid PNG image
- ✅ Upload valid JPEG image
- ❌ Upload file > 20MB (should fail)
- ❌ Upload non-image file (should fail)
- ❌ Upload without file (should fail)

#### 1.3 Video Generation
```bash
curl -X POST "http://localhost:8000/api/generate-video" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A sunset over the ocean",
    "image_id": "abc123...",
    "resolution": "720p",
    "duration": 8,
    "aspect_ratio": "16:9"
  }'
```
**Expected Result:**
```json
{
  "operation_id": "xyz789...",
  "status": "processing"
}
```

**Test Cases:**
- ✅ Generate with 720p resolution
- ✅ Generate with 1080p resolution
- ✅ Generate with 4-second duration
- ✅ Generate with 6-second duration
- ✅ Generate with 8-second duration
- ✅ Generate with 16:9 aspect ratio
- ✅ Generate with 9:16 aspect ratio
- ✅ Generate with negative prompt
- ❌ Generate without image_id (should fail)
- ❌ Generate with invalid image_id (should fail)

#### 1.4 Status Polling
```bash
curl http://localhost:8000/api/video-status/xyz789...
```
**Expected Result (processing):**
```json
{
  "done": false,
  "status": "processing (15s elapsed)",
  "video_url": null
}
```

**Expected Result (completed):**
```json
{
  "done": true,
  "status": "completed",
  "video_url": "/api/videos/video123..."
}
```

**Test Cases:**
- ✅ Poll while processing (done: false)
- ✅ Poll when complete (done: true, video_url present)
- ❌ Poll with invalid operation_id (should return error)

#### 1.5 Video Download
```bash
curl http://localhost:8000/api/videos/video123... --output test_video.mp4
```
**Expected Result:**
- MP4 file downloaded successfully
- File size > 0 bytes
- Video playable with audio

**Test Cases:**
- ✅ Download completed video
- ❌ Download with invalid video_id (should fail with 404)

### 2. Frontend UI Testing

Open http://localhost:5173 in your browser.

#### 2.1 Initial Load
**Test Steps:**
1. Open http://localhost:5173
2. Verify page loads without errors
3. Check browser console for errors (F12)

**Expected Results:**
- ✅ Page displays "Veo Video Generator" header
- ✅ "Powered by Google Veo 3.1" badge visible
- ✅ Upload image section visible
- ✅ Step indicator shows "1. Upload Image"
- ✅ No console errors

#### 2.2 Image Upload Flow
**Test Steps:**
1. Click on upload area OR drag & drop an image
2. Verify image preview appears
3. Check that "Create Prompt" step activates

**Expected Results:**
- ✅ Drag & drop highlights upload area
- ✅ Image preview shows correctly
- ✅ Upload progress indicator appears briefly
- ✅ Step indicator advances to "2. Create Prompt"
- ✅ Prompt form becomes visible

**Test Cases:**
- ✅ Drag & drop PNG image
- ✅ Drag & drop JPEG image
- ✅ Click to browse and select image
- ✅ Remove image and re-upload
- ❌ Drop non-image file (should show error)
- ❌ Drop file > 20MB (should show error)

#### 2.3 Prompt Form
**Test Steps:**
1. Fill in prompt textarea
2. Configure parameters (resolution, duration, aspect ratio)
3. Optionally add negative prompt
4. Click "Generate Video"

**Expected Results:**
- ✅ Character counter updates as typing (max 1024)
- ✅ Prompt tips section can be expanded/collapsed
- ✅ All parameter dropdowns are functional
- ✅ Submit button becomes enabled when prompt is filled
- ✅ Submit button shows loading state when clicked

**Test Cases:**
- ✅ Enter short prompt (< 100 chars)
- ✅ Enter detailed prompt (500+ chars)
- ✅ Enter max length prompt (1024 chars)
- ❌ Try to exceed 1024 chars (should be blocked)
- ✅ Toggle all resolution options
- ✅ Toggle all duration options
- ✅ Toggle all aspect ratio options
- ✅ Add negative prompt
- ✅ Leave negative prompt empty

#### 2.4 Video Generation & Polling
**Test Steps:**
1. After clicking "Generate Video"
2. Observe progress indicator
3. Wait for completion (11s - 6min)

**Expected Results:**
- ✅ Step indicator shows "3. Generate Video"
- ✅ Animated spinner appears
- ✅ Elapsed time updates in real-time
- ✅ Progress bar animates
- ✅ Status text shows "Generating your video with AI..."
- ✅ Processing info cards visible
- ✅ Page polls backend every 10 seconds
- ✅ On completion, advances to video player

**Test Cases:**
- ✅ Wait for successful completion
- ✅ Verify no console errors during polling
- ⚠️  Simulate network error (disconnect, should show error)

#### 2.5 Video Player
**Test Steps:**
1. After video generation completes
2. Verify video player appears
3. Test playback controls
4. Test download button
5. Test "Generate Another" button

**Expected Results:**
- ✅ Success banner displays
- ✅ Video player loads with controls
- ✅ Video has audio track
- ✅ Play/pause controls work
- ✅ Volume control works
- ✅ Download button downloads MP4 file
- ✅ "Generate Another" resets to upload step

**Test Cases:**
- ✅ Play video
- ✅ Pause video
- ✅ Adjust volume
- ✅ Download video (check downloads folder)
- ✅ Click "Generate Another Video" (should reset app)

### 3. Responsive Design Testing

Test on different screen sizes:

#### 3.1 Desktop (1920x1080)
- ✅ Full width content up to max-width
- ✅ All elements visible and properly spaced
- ✅ Images and videos display at good size

#### 3.2 Tablet (768x1024)
- ✅ Content adapts to smaller width
- ✅ Parameter grid stacks to single column
- ✅ Touch-friendly button sizes
- ✅ No horizontal scrolling

#### 3.3 Mobile (375x667)
- ✅ All content readable
- ✅ Forms are usable
- ✅ Video player works
- ✅ Drag & drop works with touch
- ✅ No overlapping elements

### 4. Error Handling Testing

#### 4.1 Backend Errors
**Test:** Stop backend server while frontend is running

**Expected:**
- ✅ Frontend shows error message
- ✅ Error is user-friendly
- ✅ App doesn't crash

#### 4.2 Invalid API Key
**Test:** Set invalid GEMINI_API_KEY

**Expected:**
- ✅ Video generation fails gracefully
- ✅ Error message displayed to user
- ✅ Can retry with different parameters

#### 4.3 Network Errors
**Test:** Disconnect internet during generation

**Expected:**
- ✅ Polling stops after timeout
- ✅ Error message shown
- ✅ User can retry

#### 4.4 Large File Upload
**Test:** Upload file > 20MB

**Expected:**
- ✅ Client-side validation prevents upload
- ✅ Alert shown to user
- ✅ If bypass client validation, backend rejects

### 5. Performance Testing

#### 5.1 Image Upload Speed
- ✅ Small image (< 1MB): < 1 second
- ✅ Medium image (5MB): 1-3 seconds
- ✅ Large image (15MB): 3-5 seconds

#### 5.2 Video Generation Time
- ✅ 720p, 4s: ~30-90 seconds
- ✅ 720p, 8s: ~60-180 seconds
- ✅ 1080p, 8s: ~90-360 seconds

#### 5.3 Polling Overhead
- ✅ Polling doesn't freeze UI
- ✅ Polling stops when complete
- ✅ No memory leaks from polling

### 6. Integration Testing Checklist

Complete end-to-end workflow test:

- [ ] Start both servers successfully
- [ ] Frontend loads without errors
- [ ] Upload image via drag & drop
- [ ] Image preview displays correctly
- [ ] Fill in prompt with all parameters
- [ ] Click "Generate Video"
- [ ] Progress indicator shows and updates
- [ ] Video generation completes successfully
- [ ] Video plays with audio
- [ ] Download video successfully
- [ ] Click "Generate Another Video"
- [ ] App resets to upload step
- [ ] Upload different image and repeat

### 7. Browser Compatibility

Test on multiple browsers:

#### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] Video playback smooth
- [ ] Audio plays correctly

#### Firefox
- [ ] All features work
- [ ] Video playback smooth
- [ ] Audio plays correctly

#### Safari (Mac)
- [ ] All features work
- [ ] Video playback smooth
- [ ] Audio plays correctly

### 8. Console Logs Verification

Check browser console (F12) for:
- ✅ No errors during normal operation
- ✅ No warnings about missing dependencies
- ✅ No CORS errors
- ✅ API calls complete successfully

Check backend logs for:
- ✅ Successful startup messages
- ✅ API requests logged
- ✅ No Python errors
- ✅ Video generation status updates

## Test Data

### Sample Images
Prepare test images:
- `test_small.jpg` - 500KB, 1024x768
- `test_medium.png` - 5MB, 1920x1080
- `test_large.jpg` - 15MB, 4000x3000
- `test_portrait.png` - 2MB, 1080x1920

### Sample Prompts

**Simple Prompt:**
```
A sunset over the ocean with gentle waves
```

**Detailed Prompt:**
```
A chef preparing pasta in a modern kitchen. "This is my
grandmother's recipe," the chef says warmly. Sound of
sizzling garlic and bubbling sauce. Smooth camera dolly
from left to right. Warm lighting, professional food
photography style.
```

**With Negative Prompt:**
```
Prompt: A beautiful garden with colorful flowers
Negative: blurry, low quality, distorted
```

## Automated Testing (Future Enhancement)

For production, consider adding:
- Jest/React Testing Library for component tests
- Cypress or Playwright for E2E automation
- API integration tests with pytest
- Load testing with Artillery or k6

## Bug Reporting Template

When finding issues, report with:

```
**Environment:**
- OS: Windows 10 / Mac OS / Linux
- Browser: Chrome 120
- Backend running: Yes/No
- Frontend running: Yes/No

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if applicable]

**Console Logs:**
[Browser console errors]

**Backend Logs:**
[Backend terminal output]
```

## Test Results Sign-Off

After completing all tests, document results:

```
Test Date: YYYY-MM-DD
Tester: [Name]
Environment: [Local/Docker/Other]

✅ Backend API Tests: PASS / FAIL
✅ Frontend UI Tests: PASS / FAIL
✅ Responsive Design: PASS / FAIL
✅ Error Handling: PASS / FAIL
✅ Performance: PASS / FAIL
✅ Integration: PASS / FAIL
✅ Browser Compat: PASS / FAIL

Notes:
[Any issues or observations]
```

## Next Steps After Testing

Once all tests pass:
1. Proceed to Phase 5: Dockerization
2. Prepare for production deployment
3. Set up monitoring and logging
4. Configure CI/CD pipeline

---

**Happy Testing!** 🧪✅
