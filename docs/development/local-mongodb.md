# Local MongoDB and Module 1 verification

This project uses one MongoDB connection in `@lms/user-service`. The API Gateway forwards authentication requests to `@lms/auth-service`, which reads users through the user service. Keep local credentials in the repository-root `.env` file only.

## Configure the local environment

Copy `.env.example` to `.env`, then provide values for `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and the nine `DEV_SEED_*` variables. Use one MongoDB database name in `MONGODB_URI` so the user collection is isolated for local practice. `JWT_SECRET` must be the same for every local auth-service process.

The non-secret service URLs default to localhost, but may be set in `.env` if ports differ:

- `USER_SERVICE_URL=http://localhost:3002`
- `AUTH_SERVICE_URL=http://localhost:3001`
- `FRONTEND_ORIGIN=http://localhost:5173`

## Seed the three development users

Run this only after MongoDB is reachable:

```powershell
npm run seed:dev-users --workspace=@lms/user-service
```

The command is idempotent, is refused when `NODE_ENV=production`, and creates or updates one `ADMIN`, `STAFF`, and `MEMBER` user from the matching `DEV_SEED_*` variables. Passwords are hashed with the same bcryptjs (10 rounds) implementation as normal user creation and never printed.

## Run Module 1 locally

Start these three terminals from the repository root:

```powershell
npm run start:dev --workspace=@lms/user-service
npm run start:dev --workspace=@lms/auth-service
npm run start:dev --workspace=@lms/api-gateway
```

Swagger is available at `http://localhost:3002/api/docs`, `http://localhost:3001/api/docs`, and `http://localhost:3000/api/docs`. Start the frontend with `npm run dev:frontend` and open its Vite URL.

Use the seeded email/password pairs to call `POST http://localhost:3000/api/auth/login`. Send the returned access token as `Authorization: Bearer <token>` to `GET http://localhost:3000/api/users/me`; missing or invalid tokens return an authentication error. `POST http://localhost:3000/api/auth/logout` with that header invalidates the token via the existing token-version mechanism. The frontend retains its existing redirects: `ADMIN` to `/admin`, `STAFF` to `/librarian`, and `MEMBER` to `/member`.

To observe later modules end-to-end, use the browser Network panel alongside MongoDB Compass or `mongosh`: perform an action, inspect its API response, then confirm the affected document in the database named by `MONGODB_URI` and the corresponding UI refresh.
