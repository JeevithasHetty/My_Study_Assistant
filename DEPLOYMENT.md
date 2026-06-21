# StudentOS AI — Deployment Guide

Two realistic paths are covered here:

- **Option A — Single VPS with Docker Compose.** Everything (Postgres, backend, frontend) on one server you control. More setup work up front, full control, predictable flat cost.
- **Option B — Split managed hosting.** Frontend on Vercel, backend on Railway, database on Neon. Less setup, generous free tiers, scales without you touching a server, but three dashboards to manage instead of one.

Pick A if you want one place everything lives and don't mind a bit of Linux. Pick B if you want the fastest path to a live URL with the least ops work.

Either way, **read the "Before you deploy" section first** — it covers two things that will break the app silently if skipped.

---

## Before you deploy — two things that will break the app if you skip them

### 1. CORS — your frontend's real domain must be allowed

The backend only accepts requests from origins explicitly listed in `ALLOWED_ORIGINS`. By default that's just `localhost` — correct for local dev, but it will silently block every API call from your deployed frontend with a CORS error in the browser console if you forget to update it.

Once you know your frontend's real URL, set:
```
ALLOWED_ORIGINS=https://your-frontend-domain.com
```
on the **backend's** environment (not the frontend's). Comma-separate multiple origins if you have more than one (e.g. a custom domain plus the platform's auto-generated one).

### 2. `VITE_API_URL` is baked in at build time, not read at runtime

This trips people up constantly. Vite inlines `VITE_API_URL` directly into the compiled JavaScript when `npm run build` runs — it is **not** read fresh from the environment when the app starts, unlike a typical backend process. If you build the frontend pointing at `localhost:8000` and then change the environment variable afterward, nothing happens — the old value is permanently baked into the static files you already built. **You must set `VITE_API_URL` to your real backend URL before running the build**, every time the backend's URL changes.

---

## Option A — Single VPS with Docker Compose

Best for: wanting one server, predictable ~$5-12/month cost, full control.

### A1. Provision a server

Any of these work — pick based on price/familiarity:
- **DigitalOcean** — Droplet, Ubuntu 24.04, "Basic" plan, 2GB RAM minimum (1GB will struggle once Postgres + backend + frontend are all running)
- **Hetzner** — CX22 or similar, cheapest per-GB option
- **Linode/Akamai** — comparable to DigitalOcean
- **AWS Lightsail** — if you want to stay in the AWS ecosystem without full EC2 complexity

Whichever you pick: create the server, note its public IP, and make sure you can SSH in:
```bash
ssh root@your.server.ip
```

### A2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```
This single command installs Docker and Docker Compose on Ubuntu/Debian. Verify:
```bash
docker --version
docker compose version
```

### A3. Point your domain at the server (optional but recommended)

In your domain registrar's DNS settings, add two **A records** pointing at your server's IP:
```
A    @       your.server.ip       (root domain, e.g. studentos.ai)
A    api     your.server.ip       (subdomain for the backend, e.g. api.studentos.ai)
```
DNS propagation can take a few minutes to a few hours. You can proceed with the rest of setup while waiting — just use the server's raw IP for testing until DNS resolves.

### A4. Get the code onto the server

From your local machine, upload the project (the simplest way, since this isn't a git repo yet):
```bash
scp -r /path/to/StudentOS-AI-Complete root@your.server.ip:/opt/studentos
```
Or, if you push it to a private GitHub repo first:
```bash
ssh root@your.server.ip
git clone https://github.com/your-username/studentos.git /opt/studentos
```

### A5. Configure environment variables

```bash
cd /opt/studentos
cp .env.example .env
nano .env   # or vim
```
Fill in for real:
```
POSTGRES_PASSWORD=<generate a strong password>
SECRET_KEY=<generate a long random string>
GROQ_API_KEY=<your real Groq key>
YOUTUBE_API_KEY=<your real YouTube key, optional>
VITE_API_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```
Generate strong random values for `POSTGRES_PASSWORD` and `SECRET_KEY` rather than leaving the example defaults — anyone who finds the default `SECRET_KEY` in this guide could forge valid login tokens for your deployed app:
```bash
openssl rand -hex 32
```
Run that twice and use one output for each.

### A6. Put a reverse proxy + HTTPS in front of everything

`docker-compose.yml` as shipped exposes the backend on port 8000 and the frontend on port 5173 directly — fine for testing via IP, not fine for a real domain over HTTPS. The cleanest fix is **Caddy**, which gets you free automatic HTTPS (via Let's Encrypt) with almost no configuration — much simpler than manually wrangling Certbot and nginx.

Install Caddy on the host (outside Docker, fronting both containers):
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Replace `/etc/caddy/Caddyfile` with:
```
yourdomain.com {
    reverse_proxy localhost:5173
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

Restart Caddy:
```bash
sudo systemctl restart caddy
```
Caddy automatically requests and renews Let's Encrypt certificates for both domains the first time it starts — no manual certbot steps needed, as long as your DNS A records (from A3) are already pointing at this server.

### A7. Start everything

```bash
cd /opt/studentos
docker compose up -d --build
```
`-d` runs it detached (keeps running after you disconnect SSH). First run will take a few minutes — building both images, pulling Postgres, then waiting for the database healthcheck before starting the backend (the `service_healthy` condition in `docker-compose.yml` exists specifically so the backend doesn't try to connect before Postgres is actually ready).

Check everything came up:
```bash
docker compose ps
docker compose logs -f backend    # watch for errors; Ctrl+C to stop following
```

### A8. Verify

- `https://api.yourdomain.com/health` should return `{"status": "ok"}` or similar
- `https://api.yourdomain.com/docs` should show the FastAPI interactive docs
- `https://yourdomain.com` should load the landing page
- Sign up for an account through the real UI and confirm login works — this exercises the full chain (frontend → CORS → backend → Postgres)

### A9. Keep it running across reboots and updates

Docker Compose's `restart: unless-stopped` (already set on every service in `docker-compose.yml`) means containers automatically restart if the server reboots or a container crashes — no extra systemd unit needed.

To deploy a code update later:
```bash
cd /opt/studentos
git pull                      # or re-upload via scp
docker compose up -d --build  # rebuilds only what changed
```

### A10. Basic firewall

Lock down the server so only SSH, HTTP, and HTTPS are reachable from outside (Caddy handles 80/443; the app containers' ports 8000/5173 don't need to be open externally since Caddy proxies to `localhost`):
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Option B — Split managed hosting (Vercel + Railway + Neon)

Best for: fastest path to a live URL, zero server maintenance, generous free tiers for a project at this stage.

### B1. Database — Neon (managed Postgres)

1. Go to neon.tech, sign up, create a new project.
2. Neon gives you a connection string immediately — copy it. It looks like:
   ```
   postgresql://user:password@ep-something.region.aws.neon.tech/studentos_db?sslmode=require
   ```
3. That's your `DATABASE_URL`. Keep this tab open — you'll paste it into Railway next.

*(Supabase or Railway's own Postgres add-on work equally well here — Neon is just a clean, fast, generous free-tier default.)*

### B2. Backend — Railway

1. Go to railway.app, sign up, **New Project → Deploy from GitHub repo** (push this project to a GitHub repo first if you haven't — Railway deploys from git, not a zip upload).
2. Railway will detect the `backend/Dockerfile` automatically since this project has one. If it asks for a root directory, point it at `/backend`.
3. Once the service is created, go to its **Variables** tab and add:
   ```
   DATABASE_URL=<paste the Neon connection string from B1>
   SECRET_KEY=<run `openssl rand -hex 32` locally and paste the output>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GROQ_API_KEY=<your real Groq key>
   YOUTUBE_API_KEY=<your real YouTube key, optional>
   UPLOAD_DIR=uploads
   RESUME_UPLOAD_DIR=resume_uploads
   MAX_FILE_SIZE_MB=10
   ALLOWED_ORIGINS=https://your-app-name.vercel.app
   ```
   (You'll come back and update `ALLOWED_ORIGINS` once you know your actual Vercel URL from B3 — Railway redeploys automatically when you change a variable.)
4. Railway auto-assigns a public URL like `https://studentos-backend-production.up.railway.app`. Find it under the service's **Settings → Networking → Generate Domain** if it isn't already there. **Copy this URL** — you need it for the frontend's `VITE_API_URL`.
5. Deploy. Watch the build logs; once it's live, visit `<your-railway-url>/health` to confirm it's responding.

> **Note on file uploads with this option:** Railway's filesystem is ephemeral by default — uploaded resumes/PDFs stored on local disk (`uploads/`, `resume_uploads/`) will be **wiped on every redeploy**. For a portfolio/demo project this is usually fine. If you need uploads to persist long-term, add a Railway **Volume** mounted at `/app/uploads` and `/app/resume_uploads` in the service settings, or migrate file storage to S3-compatible object storage (a larger change outside the scope of this guide).

### B3. Frontend — Vercel

1. Go to vercel.com, sign up, **Add New → Project**, import the same GitHub repo.
2. When asked for the **Root Directory**, set it to `frontend`.
3. Vercel auto-detects Vite. Confirm the build settings are:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Before deploying, add an environment variable:
   ```
   VITE_API_URL=<the Railway backend URL from B2, e.g. https://studentos-backend-production.up.railway.app>
   ```
   This is the step that matters most — remember from the top of this guide, this value gets baked into the build, so it must be set *before* you click deploy.
5. Deploy. Vercel gives you a URL like `https://studentos-ai.vercel.app`.
6. **Go back to Railway** (B2) and update `ALLOWED_ORIGINS` to this real Vercel URL, then let it redeploy. Until you do this, login/signup will fail in the browser console with a CORS error even though both services are individually running fine.

### B4. Verify

Same checklist as Option A's A8 — visit the Vercel URL, sign up for a real account, confirm the dashboard loads. Open your browser's dev tools Network tab if anything fails; a CORS error here almost always means B3's last step (updating `ALLOWED_ORIGINS`) was missed or the Vercel URL doesn't match exactly (including `https://`, no trailing slash).

### B5. Custom domain (optional)

Both Vercel and Railway support adding a custom domain for free under their **Settings → Domains** tab — point your domain's DNS at the CNAME they give you. If you do this, update `ALLOWED_ORIGINS` on Railway to your custom domain (in addition to or instead of the `.vercel.app` one) and re-deploy.

---

## Environment variable reference

| Variable | Where it lives | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | backend | Yes | Full Postgres connection string |
| `SECRET_KEY` | backend | Yes | JWT signing secret — generate fresh, never reuse the repo's example value |
| `GROQ_API_KEY` | backend | Yes | Every AI feature depends on this |
| `YOUTUBE_API_KEY` | backend | No | Only powers Document Tutor's video tab |
| `ALLOWED_ORIGINS` | backend | Yes in production | Comma-separated frontend URL(s); defaults to localhost only |
| `VITE_API_URL` | frontend | Yes | Must be set **before** `npm run build` — baked in at build time |
| `POSTGRES_PASSWORD` | Option A only | Yes | Only relevant if you're running Postgres yourself via Docker Compose |

---

## Post-deployment checklist

- [ ] `SECRET_KEY` is a freshly generated random value, not the repo's example
- [ ] `ALLOWED_ORIGINS` matches your real frontend URL exactly (scheme + domain, no trailing slash)
- [ ] `VITE_API_URL` was set before the frontend was built, and points at the real backend URL
- [ ] Sign-up → login → dashboard load all work end-to-end through the real deployed URLs, not just locally
- [ ] Resume upload + AI analysis works (this is the one feature that exercises file upload, Groq, and the database all in one request — a good single smoke test)
- [ ] `GROQ_API_KEY` has not hit a rate limit or billing issue on Groq's console — if every AI feature returns an empty or generic error, check there first before assuming it's a code bug

## Common failure modes and what they actually mean

| Symptom | Likely cause |
|---|---|
| Frontend loads, but nothing happens on login (console shows a CORS error) | `ALLOWED_ORIGINS` on the backend doesn't include your real frontend URL |
| Frontend loads, login works, but every API call 404s or hits the wrong host | `VITE_API_URL` was wrong or unset when the frontend was built — fix the variable and rebuild, not just redeploy |
| Backend won't start, logs show a database connection error | `DATABASE_URL` is wrong, or (Option A specifically) the backend started before Postgres's healthcheck passed — check `docker compose logs db` |
| AI features return generic/empty responses | `GROQ_API_KEY` missing, invalid, or rate-limited — check Groq's console directly |
| Uploaded resumes/documents vanish after a while | (Option B) Railway's ephemeral filesystem wiped them on redeploy — see the note in B2 |
