# CleverCreator.ai - Startup Guide

## Quick Start Options

### Option 1: Smart Fresh Start (Recommended) 🚀
**Automatically finds a free port and starts a fresh session**

```batch
start-fresh.bat
```

This will:
- Auto-detect a free port (starting from 9001)
- Ask for confirmation
- Update backend/.env and frontend/.env automatically
- Add firewall rule if needed
- Start both servers in new windows

**With specific port:**
```batch
start-fresh.bat 9005
```

---

### Option 2: Traditional Start (Fixed Port 9001)
**Kills old sessions and uses port 9001**

```batch
start-dev.bat
```

This will:
- Kill all Python and Node processes
- Kill old CMD windows
- Start on port 9001
- Start both servers

---

### Option 3: Deep Clean + Start
**Complete reset with cache clearing**

```batch
powershell -ExecutionPolicy Bypass -File deep-clean.ps1
start-dev.bat
```

This will:
- Kill all processes
- Clear Python `__pycache__`
- Clear `.pyc` files
- Verify ports are free
- Then start normally

---

## Cleanup Scripts

### Force Cleanup
```batch
powershell -ExecutionPolicy Bypass -File force-cleanup.ps1
```
Kills all Python/Node processes and CMD windows.

### Deep Clean
```batch
powershell -ExecutionPolicy Bypass -File deep-clean.ps1
```
Force cleanup + clears Python bytecode cache.

---

## Access URLs

After starting:

- **Frontend (Browser)**: http://localhost:5173
- **Backend API Docs**: http://localhost:PORT/docs (PORT = 9001 or your chosen port)
- **Network Access**: http://192.168.1.35:5173 (from other devices)

---

## Troubleshooting

### "Port already in use"
- Use `start-fresh.bat` to auto-detect a free port
- Or manually specify: `start-fresh.bat 9010`

### Still seeing old code (1024 instead of 4096)
1. Run `deep-clean.ps1` to clear Python cache
2. Hard refresh browser: **Ctrl + Shift + R**
3. Use `start-fresh.bat` for completely new session

### Multiple sessions running
- Check Task Manager for python.exe processes
- Run `force-cleanup.ps1` to kill all
- Or just use `start-fresh.bat` to start on a new port

---

## Files Overview

| File | Purpose |
|------|---------|
| `start-fresh.bat` | Smart startup with auto port detection |
| `start-dev.bat` | Traditional startup (kills old, uses 9001) |
| `force-cleanup.ps1` | Kill all Python/Node processes |
| `deep-clean.ps1` | Force cleanup + clear Python cache |
| `kill-backends.ps1` | Legacy cleanup script |

---

## Recommended Workflow

**First time / After code changes:**
```batch
deep-clean.ps1
start-fresh.bat
```

**Quick restart:**
```batch
start-fresh.bat
```

**Multiple instances:**
```batch
start-fresh.bat 9001
start-fresh.bat 9002
start-fresh.bat 9003
```
