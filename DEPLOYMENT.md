# Deployment Guide

This deploys the whole stack on free tiers, no credit card required anywhere:

- **Database**: [Neon](https://neon.tech) — serverless Postgres, permanent free tier
- **Backend**: [Render](https://render.com) — free Web Service
- **Frontend**: [Render](https://render.com) — free Static Site

> Free-tier trade-off to know upfront: Render's free Web Service spins down after 15 minutes of no traffic and takes ~30-60 seconds to wake up on the next request. Fine for a portfolio/demo project; mention it if you're showing this to someone live ("first load may take a moment, it's waking up from sleep").

---

## 1. Push your project to GitHub

Render deploys from a Git repo, so this has to happen first.

```bash
cd Inventory-Tracker
git add .
`git commit -m "chore: prepare for deployment"`
git push origin main
```

If you haven't created a GitHub repo yet: create one at github.com (empty, no README), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/inventory-tracker.git
git branch -M main
git push -u origin main
```

---

## 2. Database — Neon

1. Go to https://neon.tech → sign up (GitHub login works) → **Create a project**
2. Name it anything (e.g. `inventory-tracker`), pick a region close to you
3. On the project dashboard, find **Connection string** — copy the one labeled for your default branch. It looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this tab open — you'll paste this as `DATABASE_URL` in Render shortly.

That's the entire database setup. Neon requires no server management.

---

## 3. Backend — Render Web Service

1. Go to https://render.com → sign up → **New +** → **Web Service**
2. Connect your GitHub account, select your `inventory-tracker` repo
3. Configure:
   - **Name**: `inventory-tracker-backend` (or anything)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Under **Environment Variables**, add every variable from your `backend/.env` file:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `CLIENT_URL` | *(leave a placeholder for now, e.g. `http://localhost:5173` — you'll update this in step 5)* |
   | `DATABASE_URL` | *(the Neon connection string from step 2)* |
   | `JWT_ACCESS_SECRET` | *(generate a new long random string — don't reuse a local dev secret)* |
   | `JWT_REFRESH_SECRET` | *(a different long random string)* |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `COOKIE_SECURE` | `true` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | *(your email)* |
   | `SMTP_PASS` | *(your app password)* |
   | `SMTP_FROM` | `"Inventory Tracker <no-reply@inventorytracker.com>"` |
   | `AI_API_KEY` | *(your Gemini key)* |
   | `AI_MODEL` | `gemini-2.5-flash` |

   For the JWT secrets, generate strong random values, e.g. run this locally and paste the output:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Run it twice — once for each secret.

5. Click **Create Web Service**. Render will build and deploy. Watch the logs — the `postinstall` hook runs `prisma generate`, and on boot, `npm start` runs `prisma migrate deploy` automatically before starting the server, applying all your migrations to the fresh Neon database.
6. Once live, copy your backend's URL, e.g. `https://inventory-tracker-backend.onrender.com`

---

## 4. Frontend — Render Static Site

1. Render dashboard → **New +** → **Static Site**
2. Select the same repo
3. Configure:
   - **Name**: `inventory-tracker-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://inventory-tracker-backend.onrender.com/api` *(your backend URL from step 3, + `/api`)* |

   **Important**: Vite bakes `VITE_` variables in at *build time*, not runtime. Set this before the first deploy, or trigger a manual redeploy after adding/changing it.
5. Under **Redirects/Rewrites**, add a rule (needed for React Router to work on page refresh/direct links):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**. Once live, copy your frontend's URL, e.g. `https://inventory-tracker-frontend.onrender.com`

---

## 5. Connect the two: update CORS

Go back to your **backend** Web Service on Render → Environment → update:

```
CLIENT_URL = https://inventory-tracker-frontend.onrender.com
```

Save — Render will automatically redeploy the backend with the correct CORS origin. Without this step, the browser will block requests from your frontend with a CORS error.

---

## 6. Test it

1. Visit your frontend URL
2. First load may take ~30-60s (backend waking up from sleep) — this is normal on the free tier
3. Register a new account, verify OTP via the email you set up, log in
4. Create a category, supplier, product; try a purchase and a sale
5. Try "Generate AI Insights" on a product

---

## Keeping it alive (optional)

Since the free backend sleeps after 15 minutes of inactivity, if you want it to feel more responsive for a demo (e.g. showing a recruiter), you can use a free uptime pinger like [UptimeRobot](https://uptimerobot.com) to hit `https://your-backend.onrender.com/api/health` every 10 minutes. This is optional and not required for the project to work correctly — just a smoother demo experience.

---

## Updating the deployed app later

Any `git push` to your `main` branch triggers automatic redeploys on both Render services. No manual redeploy steps needed for future changes — just commit and push as usual.
