/**
 * Pure, dynamic permission helpers. The permission set is the EFFECTIVE set
 * resolved by the backend (role permissions + grants − revokes, capped for
 * assistants) and stored in `state.auth.permissions`. Frontend checks are for
 * UI/UX only — the backend remains the source of truth.
 */

export function hasPermission(permissions: string[], key: string): boolean {
  return permissions.includes(key);
}

export function hasAnyPermission(permissions: string[], keys: string[]): boolean {
  if (!keys.length) return true;
  return keys.some((k) => permissions.includes(k));
}

export function hasAllPermissions(permissions: string[], keys: string[]): boolean {
  if (!keys.length) return true;
  return keys.every((k) => permissions.includes(k));
}

/** Requirement descriptor usable by gates and route guards. */
export interface PermissionRequirement {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
}

export function satisfiesRequirement(
  permissions: string[],
  req: PermissionRequirement,
): boolean {
  if (req.permission && !hasPermission(permissions, req.permission)) return false;
  if (req.anyOf && !hasAnyPermission(permissions, req.anyOf)) return false;
  if (req.allOf && !hasAllPermissions(permissions, req.allOf)) return false;
  return true;
}
