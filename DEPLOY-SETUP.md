# Deploy Phantom Protocol (one-time setup)

You only do this **once**. After you connect your GitHub repo, every `git push` will auto-deploy.

---

## Why Render asked for payment

The repo’s **Blueprint** (`render.yaml`) creates **3 services** (app + 2 validators). Render’s **free tier allows only 1 web service**, so it prompts for a plan. Use one of the options below to stay free.

---

## Option A: Render FREE – 1 service only (full app, no payment)

1. Go to **https://render.com** and sign in with GitHub.

2. **Do not use Blueprint.** Instead: **New +** → **Web Service**.

3. Connect GitHub and select the repo **Phanton-Protocol/core**. Branch: `main`.

4. Configure the one service:
   - **Name:** `phantom-protocol` (or any name).
   - **Runtime:** Node.
   - **Build Command:** (paste this)
     ```bash
     npm install && npm run backend:install && NODE_ENV=development npm run frontend:install && NODE_ENV=development npm run build --prefix frontend
     ```
   - **Start Command:** `node backend/src/index.js`
   - **Instance type:** leave as **Free**.

5. Click **Create Web Service**. Wait for the first deploy to finish.

6. Your app URL: `https://phantom-protocol-xxxx.onrender.com` (from the service page).  
   Auto-deploy: on by default for pushes to `main`.

**Optional:** In the service → **Environment**, add variables from `render.env.example` (e.g. `RPC_URL`, `CHAIN_ID`, `DEV_BYPASS_PROOFS`). Validators are not run (only 1 service), but deposits, swaps, withdraw, Key, Payroll still work.

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
