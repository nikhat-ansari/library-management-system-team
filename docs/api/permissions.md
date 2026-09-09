# Admin Permissions API

All endpoints require `Authorization: Bearer <ADMIN access token>`.

- `GET /api/admin/permissions` returns `{ "permissions": [{ "code", "name", "description" }] }`.
- `GET /api/admin/users/:id/permissions` returns `{ "userId": "...", "permissions": ["..."] }`.
- `PUT /api/admin/users/:id/permissions` replaces the complete set. Body: `{ "permissions": ["ISSUE_RETURN_RENEWAL"] }`. It returns `{ "userId": "...", "permissions": ["..."], "updatedAt": "..." }`.

The valid codes are `BOOK_MANAGEMENT`, `MEMBER_MANAGEMENT`, `ISSUE_RETURN_RENEWAL`, `FINE_MANAGEMENT`, `RESERVATION_MANAGEMENT`, `SHELF_MANAGEMENT`, `SEAT_MANAGEMENT`, and `OPERATIONAL_REPORT_ACCESS`.

Missing or invalid tokens return 401; authenticated non-admin users return 403; malformed IDs or invalid codes return 400; an ID that is not an existing `LIBRARIAN_STAFF` user returns 404.

## Applying an operational permission

Operational controllers must compose the existing JWT guard with `PermissionGuard` and mark each protected handler with `@RequirePermission('<code>')`. The guard permits ADMIN, permits a `LIBRARIAN_STAFF` user only with that assigned code, and rejects MEMBER or unassigned staff with 403. It reads current permissions from MongoDB through the existing token validation flow, so an updated permission set is effective immediately.

No operational API controller exists in the current repository (catalog, circulation, reservation, fine, seat, and report services only provide health routes), so this change deliberately does not manufacture operational endpoints merely to attach a permission decorator.
