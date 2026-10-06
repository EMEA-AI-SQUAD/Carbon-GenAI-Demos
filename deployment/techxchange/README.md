# TechXChange Lab 1127 — LPAR Deployment

> **Branch:** `feature/lab1127-techxchange`  
> **LPAR:** `9.8.70.150` (root, password auth)  
> **Spyre cards:** `9.8.70.146`

---

## What this is

This branch deploys the standard Carbon GenAI Demo from `main` onto a bare-metal IBM Power LPAR, and adds an **IBM Spyre hardware accelerator toggle** to the UI.

Students attending Lab 1127 at TechXChange can:
1. Run an Entity Extraction (or other) demo against the **local llama.cpp** inference engine, which uses IBM Power's built-in Matrix Maths Accelerator (MMA).
2. Flip the **MMA ↔ ⚡ Spyre** toggle in the header and re-run the same prompt — inference is now served by the IBM Spyre cards on `9.8.70.146`, which return noticeably faster results.

This makes it a live, tactile demonstration of hardware-accelerated AI inference on IBM Power.

---

## Architecture

```
Browser
  │
  │  GET/POST /api/chat  (Next.js App Router route)
  ↓
Next.js (port 3000 on 9.8.70.150)
  │
  ├─ useSpyre = false ──→ http://localhost:8080  (llama.cpp / IBM Power MMA)
  └─ useSpyre = true  ──→ http://9.8.70.146:8080 (IBM Spyre hardware accelerator)
```

The toggle state is held in React context (`SpyreContext`) and persisted to `localStorage`. It is sent as `{ useSpyre: true|false }` in every request body to `/api/chat`. The field is stripped before the request is forwarded upstream, so both backends receive a standard OpenAI-compatible payload.

---

## First-time deploy

From your local machine (requires `ssh` with access to `9.8.70.150`):

```bash
# From the repo root
bash deployment/techxchange/deploy-techxchange-lpar.sh
```

You will be prompted **once** for the root password. The script then runs ~12 steps remotely:

| Step | Action |
|------|--------|
| 1 | Pre-flight checks (OS, disk) |
| 2 | System update (`dnf -y update`) |
| 3 | Install Node.js, Python, build tools |
| 4 | Clone repo on branch `feature/lab1127-techxchange` |
| 5 | Install yarn + pm2 globally |
| 6 | Install Node.js dependencies |
| 7 | Build Next.js app |
| 8 | Python venv + PyTorch/OpenBLAS for llama.cpp |
| 9 | Build llama.cpp (skipped if binary exists) |
| 10 | Download Granite 4.0 Micro GGUF model |
| 11 | Start all services via pm2 (llama, proxy, nextjs) |
| 12 | Verify ports 8080 / 3001 / 3000 and Spyre reachability |

**Total time (first run):** ~25–40 minutes (llama.cpp build + model download dominate)  
**Subsequent runs** (binary + model cached): ~5 minutes

---

## After deploy

| Service | URL |
|---------|-----|
| Demo UI | `http://9.8.70.150:3000` |
| LLM (local) | `http://9.8.70.150:8080` |
| Proxy | `http://9.8.70.150:3001` |
| Spyre | `http://9.8.70.146:8080` (separate host) |

---

## pm2 quick reference (on the LPAR)

```bash
pm2 list                    # show all processes and status
pm2 logs genai-nextjs       # Next.js output (see Spyre/MMA logs)
pm2 logs genai-llama        # llama-server output
pm2 restart all             # restart everything
pm2 restart genai-nextjs    # restart only the UI (after code changes)
```

---

## Rebuilding after code changes

```bash
ssh root@9.8.70.150
cd ~/Carbon-GenAI-Demos
git pull origin feature/lab1127-techxchange
cd carbon-ui
yarn build
pm2 restart genai-nextjs
```

---

## How the Spyre toggle works (for students)

The toggle in the header bar switches the backend that processes your AI prompts:

- **MMA (off)** — inference runs on this IBM Power server using the Matrix Maths Accelerator built into the processor. Solid baseline performance.
- **⚡ Spyre (on)** — inference is offloaded to IBM Spyre hardware accelerator cards on `9.8.70.146`. Spyre is purpose-built for LLM inference and should return results noticeably faster.

The UI shows a green `⚡ Spyre` or blue `🔵 IBM Power MMA` tag next to the "Send Prompt to LLM" button so you always know which backend is active.

The actual routing happens in [`carbon-ui/src/app/api/chat/route.js`](../../carbon-ui/src/app/api/chat/route.js) — a simple server-side Next.js API route that reads `useSpyre` from the request body and forwards to the appropriate upstream URL.

---

## Key files changed vs `main`

| File | Change |
|------|--------|
| `carbon-ui/src/app/spyre-context.js` | New — React context for the toggle |
| `carbon-ui/src/app/api/chat/route.js` | New — unified LLM proxy with Spyre support |
| `carbon-ui/src/components/Header/Header.js` | Spyre toggle added to header bar |
| `carbon-ui/src/app/providers.js` | Wrapped in `<SpyreProvider>` |
| `carbon-ui/src/app/entextract/page.js` | Uses `/api/chat` + shows backend tag |
| `carbon-ui/next.config.js` | Documents SPYRE_URL / LLAMA_URL env vars |
| `deployment/ecosystem.config.js` | SPYRE_URL + LLAMA_URL added to nextjs env |
| `deployment/techxchange/deploy-techxchange-lpar.sh` | New deployment script |

---

*Made with Bob*
