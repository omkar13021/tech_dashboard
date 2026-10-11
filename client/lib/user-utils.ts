import { ManagedUser, ROLE_META } from '@/types/user.types';

/**
 * Pure display helpers for the User Management module. Data is loaded from the
 * API (see services/user.service.ts) — these are presentation-only utilities.
 */

export function getFullName(user: Pick<ManagedUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getInitials(
  user: Pick<ManagedUser, 'firstName' | 'lastName'>,
): string {
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

/**
 * Deterministic, muted avatar tint per user — keeps the table calm while still
 * making rows visually distinguishable (Microsoft 365 persona style).
 */
const AVATAR_TINTS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
];

export function getAvatarTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

/** Candidate managers for the create/edit form (anyone who can manage others). */
export function getManagerOptions(
  users: ManagedUser[],
  excludeId?: string,
): { id: string; label: string }[] {
  return users
    .filter((u) => u.id !== excludeId && u.role !== 'ASSOCIATE')
    .map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName} · ${ROLE_META[u.role].label}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
