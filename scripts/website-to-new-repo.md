# Create a new public GitHub repo from the Website folder

Run these in **PowerShell** from any folder (e.g. your home or desktop). Replace `YOUR_GITHUB_USERNAME` and `phantom-website` with your GitHub username and desired repo name.

---

## 1. Create a new folder with only Website contents (no node_modules)

```powershell
$source = "g:\PhantomProtocol\Website"
$dest   = "g:\phantom-website"
New-Item -ItemType Directory -Path $dest -Force
robocopy $source $dest /E /XD node_modules dist .git /NFL /NDL /NJH /NJS
```

---

## 2. Turn it into a Git repo and make first commit

```powershell
Set-Location g:\phantom-website
git init
git add .
git commit -m "Initial commit: Phantom Protocol marketing website"
git branch -M main
```

---

## 3. Create the new repo on GitHub

- Go to **https://github.com/new**
- **Repository name:** `phantom-website` (or any name)
- **Public**
- Do **not** add README, .gitignore, or license (you already have content)
- Click **Create repository**

---

## 4. Add GitHub as remote and push

Use the URL GitHub shows (replace with your username and repo name):

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/phantom-website.git
git push -u origin main
```

---

## 5. (Optional) Make sure it’s public

On the repo page: **Settings** → **General** → **Danger Zone** → confirm **Visibility** is **Public**.

---

Done. Your repo is at `https://github.com/YOUR_GITHUB_USERNAME/phantom-website` and you can deploy it with Render/Vercel by connecting this repo and using build command `npm install && npm run build`, publish directory `dist` (no root directory needed – the repo is already only the website).
