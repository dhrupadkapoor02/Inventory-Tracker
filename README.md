# Smart Inventory & Expiry Tracker

PERN stack application for tracking inventory, expiry, purchases/sales, with AI-powered product insights.

## Structure
- `backend/` — Node.js + Express + Prisma + PostgreSQL API
- `frontend/` — React + Tailwind + Axios client (scaffolded in a later phase)

## Build Plan
1. **Phase 1** — Backend project setup, config, security middleware, Prisma schema (Auth models)
2. Phase 2 — Auth APIs: Register, Login, OTP verification, Forgot Password, JWT + Refresh Tokens
3. Phase 3 — Role-based auth middleware + Frontend auth pages
4. Phase 4 — Inventory core: Categories, Suppliers, Products
5. Phase 5 — Purchases, Sales, Inventory Logs
6. Phase 6 — Dashboard, Search, Pagination, Low Stock & Expiry Alerts
7. Phase 7 — AI Product Insights feature
8. Phase 8 — Deployment (Frontend, Backend, DB) on free-tier services
