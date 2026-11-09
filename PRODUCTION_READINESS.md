# R-Store production readiness

## Changes on feature/production-readiness
- Corrected backend authentication middleware import and removed the invalid root-level import.
- Added configurable PORT and CORS allowlist using CLIENT_URL.
- Added health endpoint and suppressed database error details in db-test.
- Added production cookie flags, proxy trust and mandatory session secret.
- Separated Node production start from nodemon development start.
- Removed default Vite starter CSS constraints and improved responsive baseline.
- Ignored frontend .env files for future commits.

## Remaining release blockers
1. **Session persistence:** express-session MemoryStore is not suitable for production. Configure a durable shared session store (such as PostgreSQL) before deploying.
2. **Payment integrity:** verify Stripe webhook signature, persist checkout sessions/orders, and only mark orders paid after server-side confirmation. Audit checkout and order ownership.
3. **Database:** review schema/migrations, least-privilege credentials, backups and SSL certificate verification.
4. **Security:** audit all authentication, admin routes, request validation, rate limits, and sensitive responses.
5. **Frontend:** confirm storefront navigation, guest browsing, mobile layout, image loading and API error handling.
6. **Secrets:** frontend/.env was historically committed; check its history and rotate any exposed secrets. Do not store secrets under VITE_.
7. **Verification:** run npm ci, npm run build, npm run lint, npm test in frontend; run npm ci and node --check app.js in backend; run integration tests against a staging database.

## Deployment plan
- Frontend: Vercel, root directory frontend, build npm run build, output dist; set VITE_API_URL to backend HTTPS URL.
- Backend: persistent Node hosting, root directory backend, start npm start; configure DATABASE_URL, SESSION_SECRET, CLIENT_URL, STRIPE_SECRET_KEY and NODE_ENV=production.
- Set HTTPS and verify cross-site cookie support, CORS, session persistence, checkout webhooks and database connectivity.
- Do not deploy to production until release blockers are resolved.
