# Task Management Module — System Audit

Date: 2026-07-11
Scope: `backend/src/tasks`, `backend/src/authz`, `backend/src/audit`, `backend/src/performance`, `backend/prisma/schema.prisma` (Task-related models) and `client/app/(main)/tasks`, `client/components/tasks`, `client/services/task.service.ts`, `client/store/slices/taskSlice.ts`, `client/types/task.types.ts`, dashboard/reports pages.

**Headline finding:** this is not a greenfield build. There is a working, permission-correct core (create/update/delete/complete/status/priority/comments/checklist steps, single-task list UI, detail panel) sitting underneath a Prisma schema that already anticipates most of the enterprise feature set (assignment history, activity feed, time logs, blockers, subtask hierarchy) — but almost none of that richer schema is wired to any service or UI code. The gap is "finish what's scaffolded," not "design from scratch."

---

## 1. Existing Features (confirmed working end-to-end, DB → API → UI)

| Feature | Backend | Frontend |
|---|---|---|
| Create / update / delete task | `task-action.service.ts` (`CREATE/UPDATE/DELETE`) | `TaskPage.tsx`, `TaskDetailPanel.tsx` |
| Complete / uncomplete, toggle important, toggle My Day | ✅ | `TaskCard.tsx`, `TaskDetailPanel.tsx` |
| Priority change, status change, due-date change | ✅ | `TaskDetailPanel.tsx` |
| Duplicate task | ✅ | `TaskCard.tsx` |
| Archive / Restore (maps to CANCELLED/TODO) | ✅ | not exposed in UI |
| Checklist (`TaskStep`: add/update/delete/toggle) | ✅ fully implemented | ❌ no UI renders `task.steps` at all |
| Comments (add/update/delete) | ✅ fully implemented | ❌ no UI at all |
| Attachments (add/delete) | ✅ fully implemented | ❌ no UI at all |
| Accept/Reject assignment, Review→Complete (separation of duties: assignee can't self-approve) | ✅ real, correct logic in `task-access.util.ts` | ❌ no UI |
| Bulk update/delete/complete/assign | ✅ handlers exist | ❌ no multi-select UI anywhere |
| List/query with filters, canned views (My Day/Important/Planned/Assigned/Meetings) | ✅ | ✅ (but see §9 — filters computed client-side, not via API) |
| Permission-scoped visibility (SELF/OWN_TEAM/OWN_DEPARTMENT/GLOBAL-equivalent) | ✅ centralized in `PermissionResolverService` + `task-access.util.ts` | ❌ no client-side permission gating on task actions |
| Dashboard task widgets (My Day/Overdue/Meetings/completion %) | n/a | ✅ but computed client-side from already-loaded tasks, not via `/tasks/dashboard` |

## 2. Missing Features (schema exists, zero implementation)

These Prisma models are fully defined but have **zero backend service code and zero frontend UI**:
- **`TaskAssignment`** — delegation/reassignment history trail (ASSIGN/REASSIGN/DELEGATE_SUBTASK/AUTO_REASSIGN). Nothing writes to this table today; reassignment happens as a bare field overwrite with no history.
- **`TaskActivity`** — the intended per-task activity feed (18 event types defined, including SUBMITTED_FOR_REVIEW/APPROVED/REJECTED/BLOCKED). Never populated.
- **`TaskUpdate`** — daily progress-update feed. Never populated.
- **`TimeLog`** — time tracking. Never populated.
- **`TaskBlocker`** — blocker raise/resolve trail. Never populated (task.isBlocked is a denormalized flag with no source of truth).
- **Subtask hierarchy** (`Task.parentId`/`children`) — field exists, no handler ever sets it, no UI shows a subtask tree.

Entirely absent from both layers:
- Recurring tasks (`isRecurring`/`recurrencePattern` fields exist on the frontend `Task` type only — not even in the Prisma schema; needs design per the original ask).
- Watchers/followers — no model, no field, no UI.
- Domain events — no `EventEmitterModule` anywhere; nothing to trigger notifications/dashboard-refresh/audit off of.
- Notifications — no module, no email/push/webhook code anywhere in the repo.
- Kanban board, Calendar view, Timeline/activity view — none exist (only stray lucide icons and a date-picker).
- Export (CSV/PDF) — not implemented, listed as "coming soon" only in the Reports placeholder.
- Dedicated task reporting — task metrics are computed inline in `performance-query.service.ts` against `Task` directly; no `reports` module despite `report.view`/`report.export` permission keys already existing in the registry.

## 3. Broken / Incomplete Flows

- **Assign/Reassign is a UI dead end.** "Assign to me" / "Assign to someone else" / "Move to Project" context-menu items in `TaskCard.tsx` have no `onClick` handler — they render but do nothing, despite a fully working `task.assign`/`task.reassign` permission model and backend handler.
- **Dashboard summary endpoint is unused.** `GET /tasks/dashboard` exists and is permission-correct, but the frontend dashboard recomputes the same numbers client-side from the full in-memory task list instead of calling it — two sources of truth that will silently diverge once list pagination or server-side filtering is introduced.
- **Status/UI mismatch.** `TaskStatus` only has `TODO/IN_PROGRESS/COMPLETED/CANCELLED` on the frontend type, but `GroupNavigation`/`GroupedTaskList` group tasks into "Review" and "Blocked" buckets that don't correspond to any real status value.
- **Zero audit trail.** The `TaskActivity` model's own schema comment claims sensitive actions are "also written to the global AuditLog via AuditService" — this is false; grep confirms zero `AuditService` usage anywhere in `backend/src/tasks`, and `audit-actions.ts` has no task-related keys at all. Every status change, assignment, deletion, and completion today is untracked.
- **Legacy dead controller path.** `backend/src/tasks/tasks.service.ts` (465 lines) is a full duplicate implementation with its own weaker, role-string-based authorization (bypasses `PermissionResolverService` entirely) — currently unreachable since `tasks.module.ts` never provides it, but a landmine if anyone re-wires it in.
- **`GET /tasks/query` and `GET /tasks`** in `tasks.controller.ts` are byte-identical duplicate routes.

## 4. Duplicate Logic

- `getTaskInclude()` Prisma include shape is copy-pasted three times (`tasks.service.ts`, `task-query.service.ts`, `task-action.service.ts`).
- `FilterChips.tsx` and `GroupedTaskList.tsx` are fully-built, entirely dead components (not rendered anywhere; `PagedTaskList.tsx` does the real work) — ~630 combined lines of orphaned UI duplicating list/grouping logic.
- `TaskCard.tsx` and `TaskDetailPanel.tsx` each independently reimplement `formatDueDate`/`getDueDateColor`.
- Assign/Move-to-Project stub menus are duplicated verbatim between the right-click `ContextMenu` and the ⋯ `DropdownMenu` in `TaskCard.tsx`.
- Two divergent PRIORITY_CONFIG/STATUS_CONFIG definitions (canonical one in `task.types.ts`, an emoji-styled duplicate in the dead `FilterChips.tsx`).
- 7 of 9 methods on `task.service.ts` (frontend) are never called (`getTask`, `getMyDayTasks`, `getImportantTasks`, `getPlannedTasks`, `getAssignedTasks`, `getMeetingTasks`, `getDashboardSummary`) — the UI fetches the full task list once and filters client-side instead, making these canned-view endpoints and their query params dead weight.
- 6 of `taskSlice.ts`'s exported actions (`setActiveCategory`, `setFilters`, `clearFilters`, `optimisticUpdate`, `optimisticAdd`, `optimisticDelete`) have no call sites — filter/sort/search state lives in local component state instead, never synced to the store.

## 5. Missing APIs (backend endpoints that should exist but don't)

- Reassignment-history read endpoint (`GET /tasks/:id/assignments`).
- Activity feed read endpoint (`GET /tasks/:id/activity`).
- Time-log CRUD endpoints.
- Blocker raise/resolve endpoints (currently only a denormalized boolean flag, no history, no reason tracking).
- Subtask create/list endpoints (`parentId`-aware).
- "Submit for review" as a distinct action from generic `CHANGE_STATUS` (the `TaskActivityType.SUBMITTED_FOR_REVIEW/APPROVED/REJECTED` enum values exist but nothing ever emits them).
- Recurring task definition/instantiation endpoints (needs schema design first — see §2).
- Watchers add/remove endpoints (needs schema design first).
- Task-specific reporting endpoints (trend/aggregate reports distinct from `performance` module's per-employee scope).
- Export endpoint (CSV/PDF).
- Dead permission keys with no backing handler: `task.approve`, `task.export` — either implement or remove from the registry.

## 6. Missing Frontend Screens

- Kanban board — not present at all.
- Calendar view — not present at all.
- Timeline / per-task activity view — not present (an unrelated `UserActivityTimeline` exists for user profiles only).
- Bulk-action UI (checkbox multi-select, bulk toolbar) — backend handlers exist, no UI trigger exists.
- Assignment history UI.
- Checklist UI (`task.steps` — backend fully built, zero UI).
- Comments UI (backend fully built, zero UI).
- Attachments UI (backend fully built, zero UI).
- Accept/Reject/Review-Approve UI (backend fully built with correct separation-of-duties logic, zero UI).
- Watchers UI, recurring-task UI (both need backend design first).
- Real reports (Reports and My Reports pages are both `ComingSoon` placeholders today).
- Export UI.
- Advanced search beyond a single free-text field.

## 7. Permission Inconsistencies

- `tasks.controller.ts` skips the declarative `DynamicPermissionGuard` + `@RequirePermissions` pattern used by `roles.controller.ts` and `performance.controller.ts`, pushing all enforcement into service-layer calls instead. Functionally safe today (service layer does check correctly) but inconsistent with the rest of the codebase's stated architecture, and easy to regress if a new endpoint is added without remembering the service-layer check.
- The dead `tasks.service.ts` bypasses `PermissionResolverService` entirely with hardcoded role-string comparisons (`userRole === 'SUPERADMIN'`) — inert today only because it's unregistered; must be deleted, not left as an attractive nuisance.
- Frontend has zero permission gating in any task component (`PermissionGate`/`PermissionGuard`/`RoleGuard`/`hasPermission` — all exist and are used elsewhere, e.g. `reports/page.tsx`, but never imported into `components/tasks/*`). Every action button renders unconditionally regardless of whether the viewer actually has `task.assign`/`task.delete`/`task.review`/etc. — actions currently fail server-side (correctly) but the UI offers no visual feedback, which is both a permission-consistency gap and a UX gap.
- `Reports` (gated by `report.view` permission) and `My Reports` (gated by `RoleGuard allowedRoles={['ASSOCIATE']}`) use two different gating strategies for conceptually similar pages — one permission-based, one role-based, contradicting the "use only EffectivePermissionResolver, never roles directly" principle already in place for the rest of the app.
- `task.approve` and `task.export` exist in the permission registry with no code path checking them — dead surface that could give a false sense of coverage.

## 8. UX Inconsistencies

- Assign/Reassign/Move-to-Project menu items are visibly present but silently do nothing — a "broken promise" affordance, worse than not showing the option at all.
- Dashboard and detail-panel completion metrics can diverge from the backend's own `/tasks/dashboard` calculation since the frontend never calls it.
- "Review"/"Blocked" group headers appear in navigation with no corresponding status value ever reachable through the status-change UI — dead-end groups that will always render empty or miscategorize.
- No loading/error states differentiate "no permission to view this" from "no data" — since there's no client-side permission awareness, a 403 from a bulk or assign action will surface as a generic error rather than a clear "you don't have permission" message.
- `TaskDetailPanel` is a global slide-over mounted at the app-shell level, not scoped to the tasks route — acceptable pattern, but worth documenting so future contributors don't duplicate it as a page-level component.

---

## Summary / Prioritization Signal

The system's foundation (permission resolver, task-access scoping, core CRUD) is solid and should be preserved, not rewritten. The highest-leverage gaps, roughly in dependency order:

1. **Audit trail** (zero today, schema already implies it exists — reputational/compliance risk if left as-is).
2. **Delete dead code** (`tasks.service.ts`, `FilterChips.tsx`, `GroupedTaskList.tsx`, unused service methods/slice actions) — pure risk reduction, no feature work.
3. **Wire existing backend capability to UI**: comments, attachments, checklist, assign/reassign, accept/reject/review — this is the single biggest ROI item since backend work is already done.
4. **Assignment history / activity feed** — populate `TaskAssignment`/`TaskActivity` on every mutation; this unlocks status-tracking (Phase 8 of the original ask) almost for free since the schema already models it.
5. Client-side permission gating on task action buttons.
6. New surface area requiring real design: recurring tasks, watchers, domain events/notifications, Kanban/Calendar/Timeline views, dedicated task reporting.

This document is Phase 1 output only. No code has been changed. Recommend aligning on prioritization before Phase 2 (synchronization) or any implementation begins, given the scale of the remaining phases in the original request.
