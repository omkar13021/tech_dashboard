# Production Cleanup — Audit & Classification (Phases 1-4)

Date: 2026-07-11
Scope: entire `client/` and `backend/` trees.

**No git repository exists in this project.** Every deletion below is effectively permanent — there is no `git revert`/history to fall back on. Recommend initializing git (or at minimum a manual zip backup) before executing anything past what's already done in this pass.

**Already executed** (explicitly requested mid-audit): sidebar navigation entries pointing to placeholder pages were removed from `client/config/navigation.ts` and `client/config/adminNavigation.ts` — Companies, Departments, Department, Team, Projects, Reports, Analytics, Settings. The underlying page files were **not** deleted, only unlinked from nav. Frontend still type-checks cleanly.

---

## 1. Frontend Pages & Routing

| Route | Status | Verdict |
|---|---|---|
| `/my-day`, `/important`, `/planned`, `/assigned`, `/meetings`, `/tasks`, `/dashboard` | Real, wired to tasks module | KEEP |
| `/assistants`, `/roles`, `/users`, `/audit`, `/performance` | Real, full CRUD/query wired to live backend modules | KEEP |
| `/auth/login`, `/auth/signup`, `/unauthorized`, `/[...not-found]` | Real | KEEP |
| `/companies`, `/departments`, `/department`, `/team`, `/projects`, `/reports`, `/analytics`, `/system-settings` | `ComingSoon` stub only, no API wiring, no backend module | **Nav links removed already.** Page files still exist, reachable by direct URL. |
| `/roles-permissions` | `ComingSoon` stub, was never in sidebar | **LIKELY-DUPLICATE** of `/roles` (real). Orphan. |
| `/audit-logs` | `ComingSoon` stub, was never in sidebar | **LIKELY-DUPLICATE** of `/audit` (real). Orphan. |
| `/my-projects`, `/my-reports` | `ComingSoon` stubs, ASSOCIATE-only guard, never in sidebar | Unlinked personal-scope variants of Projects/Reports — same "no backend" status as their parent features. Orphan. |
| `/integrations` | `ComingSoon` stub, never in sidebar | Orphan, no backend concept at all. |

**Recommendation:** the 5 orphan pages (`roles-permissions`, `audit-logs`, `my-projects`, `my-reports`, `integrations`) are unreachable from any UI and are the safest page-level deletions in the whole audit — nothing links to them, nothing calls an API from them. The 8 nav-removed placeholder pages (companies/departments/department/team/projects/reports/analytics/system-settings) are a product-scope question, not a cleanup question — recommend keeping the files until there's a decision on whether these features ship or get cut entirely.

## 2. Sidebar / Navigation (see "already executed" above)

Additional finding not yet acted on: the **ASSISTANT** role is not a member of the frontend `UserRole` type (`client/types/auth.types.ts`) and has no entry in `navigationSections`, so a logged-in delegated assistant gets an empty personal-nav section by default (they only see whatever `permissionNavSections` grants them via their delegated permissions). This is a **functional gap**, not dead code — flagging for product decision, not touching it in this cleanup pass.

## 3. Frontend Components / Hooks / Services / Store

Confirmed **safe to remove** (zero import sites anywhere outside their own file):
- `client/components/auth/ProtectedRoute.tsx` — entire file (component + `withProtection` + 5 role HOCs). Real route protection goes through `PermissionRoute`/`RoleGuard` instead.
- `client/components/guards/PermissionGuard.tsx` — orphaned; `authz/PermissionGate.tsx` is what's actually used everywhere.
- `client/hooks/usePermissions.tsx` — legacy pre-`useAuthz` RBAC layer (`AccessControl`/`getRoleConfig`-based). 8 of its 9 exports (`usePermissions`, `useRoleConfig`, `useNavigation`, `useDashboardTabs`, `useDashboardWidgets`, `withRoleAccess`, `usePermission`, `usePermissionsCheck`) have zero callers. **Its 9th export, `useAuth`, is live and used in 5 places** (dashboard, unauthorized, RoleGuard, DynamicSidebar, UserFormDialog) — that one needs to be extracted to its own file before the rest of `usePermissions.tsx` can be deleted.
- 9 dead slice exports across `assistantSlice`, `auditSlice`, `authSlice`, `performanceSlice`, `roleSlice`, `taskSlice`, `userSlice` — action creators/thunks never dispatched anywhere (`clearAssistantsError`, `clearSelectedAudit`, `fetchAuditEntry`, `setCredentials`, `clearAuth`, `clearTargetError`, `clearRolesError`, `fetchTasks` alias, `clearUsersError`).

Confirmed KEEP (real usage found): everything under `components/assistants`, `components/authz`, `components/performance`, `components/roles`, `components/users`, `components/common`, `useUserPermissions.ts` (genuinely distinct from `useAuthz` — adds row-level user-management gating), `useAppDispatch`/`useAppSelector`. No dead CSS exists (no orphaned `.module.css`, single `globals.css` imported correctly). No orphaned Redux slice (all 7 have live subscribers).

## 4. Backend

**Confirmed dead, safe to remove:**
- **`backend/src/rbac/` — entire module.** Its own docblock says *"Demonstrates role-based access control with various protected endpoints"*; handlers are literally labeled *"Demo endpoint..."*. All 8 routes return canned strings, zero Prisma calls, zero frontend callers (grepped `client/` for any `/rbac` reference — none). Delete the directory and its registration in `app.module.ts`.
- `backend/src/auth/utils/role.utils.ts`: `hasRolePermission`, `getManageableRoles`, `hasAllRoles` — zero callers anywhere in `backend/src`.

**Confirmed dead, flag only (Prisma schema — no deletions this pass):**
- Models `TaskUpdate`, `TimeLog`, `TaskBlocker` — fully modeled, zero service-layer code touches them.
- Enum members `TaskAssignmentType.DELEGATE_SUBTASK`/`AUTO_REASSIGN`, `TaskActivityType.BLOCKED/UNBLOCKED/ON_HOLD/RESUMED/TIME_LOGGED/SUBTASK_ADDED/DELETED` — defined, never assigned.
- No dead fields found on any live model (User's profileImage/jobTitle/phone/location/lastActiveAt/principalId are all actively read/written).

**Architectural finding, NOT a delete-candidate — needs a migration plan:**
Two parallel, complete RBAC implementations coexist:
1. Legacy static system (`auth/guards/roles.guard.ts`, `auth/guards/permission.guard.ts`, `auth/decorators/roles.decorator.ts`, `auth/permissions/user-permission.policy.ts`) — hardcoded role→permission maps.
2. New dynamic system (`authz/permission-resolver.service.ts`, `authz/permission.guard.ts`, `authz/permission-registry.ts`) — DB-backed, used by every module except one.

`backend/src/users/` is the **only** module still on the legacy system. It's not broken, but it means the codebase enforces authorization two different ways depending on which controller you're looking at. Recommend migrating `users.controller.ts`/`user-action.service.ts` to `DynamicPermissionGuard` as a dedicated follow-up (not a blind deletion — this changes real enforcement logic and needs its own test pass), which would then let the entire legacy guard/decorator/policy trio be retired.

**Minor duplicate-logic, lower priority:** `requirePermission`/`assertWithinPrincipal`/`assertAssignable` are near-identical between `assistants` and `roles` action services; three independent org-visibility-scope resolvers exist in `users`, `performance`, and `authz`. Both are refactor targets (Phase 6 "merge duplicate services/utilities"), not deletions.

No commented-out code blocks or TODO/FIXME/HACK markers were found anywhere in the 9 audited backend modules.

---

## Recommended next step

Given there's no git safety net, I'd like to batch the **confirmed-safe** deletions/refactors into one reviewable pass rather than doing them piecemeal:
1. Delete `backend/src/rbac/` + its `app.module.ts` registration, and the 3 dead `role.utils.ts` exports.
2. Delete `client/components/auth/ProtectedRoute.tsx`.
3. Extract `useAuth` out of `client/hooks/usePermissions.tsx` into its own file, update its 5 call sites, then delete the rest of `usePermissions.tsx`.
4. Delete `client/components/guards/PermissionGuard.tsx` and its re-export in `guards/index.ts`.
5. Remove the 9 dead slice exports.
6. Delete the 5 confirmed-orphan placeholder pages (`roles-permissions`, `audit-logs`, `my-projects`, `my-reports`, `integrations`).

Everything else in this report (the `users` module legacy-auth migration, duplicate scope-resolvers, the 8 nav-unlinked placeholder pages, the 3 unused Prisma models) is flagged for your decision, not queued for automatic removal.
