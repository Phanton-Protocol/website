# Deploy Phantom Protocol (one-time setup)

You only do this **once**. After you connect your GitHub repo, every `git push` will auto-deploy.

---

## Why Render asked for payment

The repo’s **Blueprint** (`render.yaml`) creates **3 services** (app + 2 validators). Render’s **free tier allows only 1 web service**, so it prompts for a plan. Use one of the options below to stay free.

---

## Option A: Render FREE – 1 service only (API backend, no payment)

The backend API lives in **phantom-relayer-dashboard**. Use **Root Directory** so Render builds and runs only that app.

1. Go to **https://render.com** and sign in with GitHub.

2. **Do not use Blueprint** (it creates 3 services). Instead: **New +** → **Web Service**.

3. Connect GitHub and select the repo **Phanton-Protocol/core**. Branch: `main`.

4. **Advanced** → set **Root Directory** to: `phantom-relayer-dashboard`

5. Configure the one service:
   - **Name:** `phantom-protocol` (or any name).
   - **Runtime:** Node.
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `node backend/src/index.js`
   - **Instance type:** leave as **Free**.

6. Click **Create Web Service**. Wait for the first deploy to finish.

7. Your API URL: `https://phantom-protocol-xxxx.onrender.com` (from the service page).  
   Auto-deploy: on by default for pushes to `main`.

**Environment:** Render sets `PORT` and `RENDER=true` automatically. In the service → **Environment**, add variables from `render.env.example` (e.g. `RPC_URL`, `CHAIN_ID`, `SHIELDED_POOL_ADDRESS`, `DEV_BYPASS_PROOFS`). Validators are not run (only 1 service), but deposits, swaps, withdraw, Key, Payroll still work.

**Config files (staging → mainnet):** The backend also supports committed config files in `config/`:\n- `config/bscTestnet.json`\n- `config/bscMainnet.json`\n\nBy default the backend selects the config file by `CHAIN_ID`. You can override with:\n- `PHANTOM_CONFIG_PATH` (absolute/relative path to a config JSON)\n- `PHANTOM_CONFIG_DIR` (directory containing the chain config files)\n\nEnvironment variables still take precedence over file values.\n+
---

### If you see "Not Found" or "This service has been suspended"

- **Suspended:** Render can **suspend** a service (e.g. free tier limits, billing, or inactivity). In that case every URL (including `/health`) returns a Render page saying "This service has been suspended." **Fix:** Log in at **https://dashboard.render.com** → open your **phantom-protocol** web service → use **Resume** or **Unsuspend** (or fix billing/account if prompted). Then trigger a **Manual Deploy** if needed.
- **Not Found on a path:** If the service is running but a path returns "Not Found", check the URL (root `/` and `/health` are valid). Other API paths are in DEVELOPER_SPEC.md.

### If the service shows "Crashed" or won’t start

- **Logs:** In Render dashboard → your service → **Logs**. Look for the first error (e.g. "Cannot find module", "EADDRINUSE", "ENOENT").
- **Root Directory:** Must be `phantom-relayer-dashboard`. If it’s blank or wrong, the build/start will fail (no `backend/`).
- **Build command:** Must run from `phantom-relayer-dashboard`, so use `cd backend && npm install`. Start must be `node backend/src/index.js`.
- **Free tier sleep:** On the free plan, the service **spins down after ~15 minutes of no traffic**. The first request after that can take 30–60 seconds; Render may show "Service Unavailable" until it wakes. That’s normal, not a crash. Use **Settings** → **Health Check Path** = `/health` so Render pings your app.
- **Database:** On Render the disk is read-only except `/tmp`. The backend uses `/tmp/relayer.db` when `RENDER` is set (Render sets this automatically). If you see DB or permission errors, ensure **Environment** does not override `RENDER`.
- **Port:** The app uses `process.env.PORT`; Render sets this. The server binds to `0.0.0.0` so it accepts external requests.

---

## Option B: Vercel (frontend only – free, no card)

1. **Sign up / log in**  
   Go to **https://vercel.com** and sign in with GitHub.

2. **Import project**  
   - Click **Add New…** → **Project**.  
   - Import from GitHub and select **Phanton-Protocol/core**.  
   - Vercel will use the repo's `vercel.json` (build command, output dir).  
   - Click **Deploy**.

3. **Your live URL**  
   When the build finishes, Vercel gives you a URL like `https://core-xxxx.vercel.app`.

4. **Auto-deploy**  
   Every push to `main` will trigger a new deploy.

**Note:** On Vercel you only get the **frontend**. Your **backend API** must be running elsewhere (e.g. on Render) and you set `VITE_API_URL` to that backend URL in Vercel's Environment Variables.

---

## Option C: Deploy only the `Website` folder (marketing site) on Render

Render uses **Root Directory** so it only builds and deploys that folder.

1. Go to **https://render.com** and sign in with GitHub.

2. **New +** → **Static Site** (not Web Service – the marketing site is static after build).

3. Connect GitHub and select the repo **Phanton-Protocol/core**. Branch: `main`.

4. Set these so Render uses only the website:
   - **Name:** `phantom-website` (or any name).
   - **Root Directory:** `Website`  
     ← This is how Render knows to deploy only the website. Leave "Root Directory" blank in the first screen; after connecting the repo, open **Advanced** and set **Root Directory** to `Website`.
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`  
     (Vite outputs the built site to `dist` inside `Website`.)

5. Click **Create Static Site**. Wait for the deploy.

6. Your site URL: `https://phantom-website-xxxx.onrender.com`. Auto-deploy on push to `main` is on by default.

**Summary:** Root Directory = `Website` makes Render treat `Website` as the project root, so it only runs `npm install` and `npm run build` there and publishes `Website/dist`.

---

## Summary

| Option | Cost | What you get |
|--------|------|----------------------|
| **Render – 1 Web Service** (Option A) | Free | Full app (frontend + API), 1 service, no validators |
| **Vercel** (Option B) | Free | Frontend only; backend must be hosted elsewhere |
| **Render – Static Site** (Option C) | Free | Only the **Website** folder (marketing site) |
| **Render Blueprint** (`render.yaml`) | Paid | Full app + 2 validator services (3 services) |

**Deploy only the website folder:** Use **Option C**. Set **Root Directory** to `Website`, **Build Command** to `npm install && npm run build`, **Publish Directory** to `dist`.
