# Network Access Troubleshooting Guide

## Issue
Remote computers on the same network (192.168.1.x) can access the frontend UI but cannot make API calls to the backend or view videos.

## Configuration Summary
- **Host Computer IP**: 192.168.1.35
- **Frontend**: http://192.168.1.35:5173
- **Backend**: http://192.168.1.35:9000
- **Network Profile**: Private (Correct ✓)
- **Firewall Rules**: Configured ✓

## Diagnostic Steps

### Step 1: Test from Remote Computer
From the **remote computer**, open PowerShell and run these commands:

```powershell
# Test if port 9000 is accessible
Test-NetConnection -ComputerName 192.168.1.35 -Port 9000

# Test if port 5173 is accessible
Test-NetConnection -ComputerName 192.168.1.35 -Port 5173

# Test backend health endpoint
Invoke-RestMethod -Uri "http://192.168.1.35:9000/api/health" -Method GET

# Test backend root endpoint
Invoke-RestMethod -Uri "http://192.168.1.35:9000/" -Method GET
```

### Step 2: Test with curl (Alternative)
If PowerShell commands don't work, try using curl from remote computer:

```cmd
curl http://192.168.1.35:9000/api/health
curl http://192.168.1.35:9000/
```

### Step 3: Browser Test from Remote Computer
Open a browser on the remote computer and navigate to:

1. **Backend Root**: http://192.168.1.35:9000/
   - Should show API information

2. **Backend Health**: http://192.168.1.35:9000/api/health
   - Should show: `{"status":"healthy","service":"CleverCreator.ai API"}`

3. **Network Test Page**: http://192.168.1.35:5173/network-test.html
   - Click all test buttons and report results

4. **API Documentation**: http://192.168.1.35:9000/docs
   - Should show FastAPI Swagger UI

### Step 4: Check Browser Console
1. On remote computer, open the app: http://192.168.1.35:5173
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Try to generate a video or use chat
5. Look for error messages that show:
   - What URL is being called
   - What error is returned (CORS, Network, 404, etc.)

### Step 5: Check Backend Logs
On the **host computer** (192.168.1.35), while someone on remote computer tries to access:
1. Watch the backend terminal/console
2. Look for incoming requests
3. If you see NO requests, the connection isn't reaching the backend
4. If you see requests with errors, note the error message

## Common Issues and Fixes

### Issue 1: "Failed to fetch" or "Network Error"
**Symptom**: Browser shows network error, no request in backend logs
**Cause**: Request not reaching backend (firewall or network issue)
**Fix**:
- Verify both computers are on same subnet (192.168.1.x)
- Temporarily disable Windows Firewall to test: `netsh advfirewall set allprofiles state off`
- If it works with firewall off, re-enable firewall and check rules
- Re-enable firewall: `netsh advfirewall set allprofiles state on`

### Issue 2: CORS Error
**Symptom**: Browser console shows "CORS policy" error
**Cause**: Backend CORS not configured for remote computer's requests
**Fix**: Already configured with regex pattern for 192.168.1.x network

### Issue 3: Frontend shows localhost URLs
**Symptom**: Network tab shows requests to http://localhost:9000 instead of 192.168.1.35:9000
**Cause**: Frontend .env not loaded or dev server not restarted
**Fix**:
1. Stop frontend dev server
2. Verify frontend/.env has: `VITE_BACKEND_URL=http://192.168.1.35:9000`
3. Restart frontend: `cd frontend && npm run dev`

### Issue 4: Videos not loading
**Symptom**: Video generation works but videos don't play
**Cause**: Video files not accessible over network
**Fix**:
- Videos are served via FileResponse from backend
- If backend is accessible, videos should work
- Check backend logs when video fails to load
- Verify videos exist in backend/videos/ folder

## Firewall Rules Applied

### Port Rules
```
Rule Name: CleverCreator Backend
Port: TCP 9000
Direction: Inbound
Action: Allow
Profiles: Domain, Private, Public

Rule Name: CleverCreator Frontend
Port: TCP 5173
Direction: Inbound
Action: Allow
Profiles: Domain, Private, Public
```

### Application Rules
```
Rule Name: Python Backend Server
Program: C:\Program Files\Python\Python312\python.exe
Direction: Inbound
Action: Allow

Rule Name: Python Backend Server (313)
Program: C:\Users\saift\AppData\Local\Programs\Python\Python313\python.exe
Direction: Inbound
Action: Allow
```

## Quick Fix Checklist

- [ ] Both computers on same network (192.168.1.x)?
- [ ] Frontend .env has correct backend URL (192.168.1.35:9000)?
- [ ] Frontend dev server restarted after .env change?
- [ ] Backend running on host computer?
- [ ] Backend listening on 0.0.0.0:9000 (not 127.0.0.1)?
- [ ] Firewall rules enabled on host computer?
- [ ] Network profile is "Private" (not Public)?
- [ ] Can ping 192.168.1.35 from remote computer?
- [ ] Test-NetConnection shows port 9000 is open?
- [ ] Backend health endpoint works from remote browser?

## Testing Order

1. **Ping Test**: From remote computer: `ping 192.168.1.35`
2. **Port Test**: From remote computer: `Test-NetConnection -ComputerName 192.168.1.35 -Port 9000`
3. **Browser Test**: From remote computer: `http://192.168.1.35:9000/api/health`
4. **Frontend Test**: From remote computer: `http://192.168.1.35:5173`
5. **Network Test Page**: From remote computer: `http://192.168.1.35:5173/network-test.html`

## Need More Help?

If all tests pass but the app still doesn't work:
1. Check antivirus software on host computer
2. Check if VPN is active on either computer
3. Check router settings for AP isolation (prevents devices from talking to each other)
4. Try accessing from host computer using 192.168.1.35 instead of localhost
