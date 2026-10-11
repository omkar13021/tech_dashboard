'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Lock, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionCatalogModule } from '@/services/permission.service';

interface PermissionMatrixProps {
  catalog: PermissionCatalogModule[];
  selected: string[];
  onChange: (keys: string[]) => void;
  /**
   * Upper bound. Keys NOT in this set are shown disabled ("inherited
   * restriction") — used for assistants, capped to the principal's permissions.
   */
  allowedKeys?: string[];
  disabled?: boolean;
}

/**
 * Tree-style permission picker: search, expand/collapse modules, select-all,
 * per-module select, tri-state module checkboxes, and visual indication of
 * permissions restricted by an upper bound (assistant ⊆ principal).
 */
export function PermissionMatrix({
  catalog,
  selected,
  onChange,
  allowedKeys,
  disabled = false,
}: PermissionMatrixProps) {
  const [search, setSearch] = React.useState('');
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const allowedSet = React.useMemo(
    () => (allowedKeys ? new Set(allowedKeys) : null),
    [allowedKeys],
  );

  const isAllowed = (key: string) => (allowedSet ? allowedSet.has(key) : true);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((m) => ({
        ...m,
        permissions: m.permissions.filter(
          (p) =>
            p.key.toLowerCase().includes(q) ||
            p.label.toLowerCase().includes(q) ||
            m.label.toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.permissions.length > 0);
  }, [catalog, search]);

  const setKeys = (next: Set<string>) => onChange([...next]);

  const toggleKey = (key: string) => {
    if (disabled || !isAllowed(key)) return;
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setKeys(next);
  };

  const toggleModule = (mod: PermissionCatalogModule) => {
    if (disabled) return;
    const keys = mod.permissions.map((p) => p.key).filter(isAllowed);
    const allSelected = keys.every((k) => selectedSet.has(k));
    const next = new Set(selectedSet);
    if (allSelected) keys.forEach((k) => next.delete(k));
    else keys.forEach((k) => next.add(k));
    setKeys(next);
  };

  const selectAll = () => {
    if (disabled) return;
    const next = new Set(selectedSet);
    catalog.forEach((m) =>
      m.permissions.forEach((p) => {
        if (isAllowed(p.key)) next.add(p.key);
      }),
    );
    setKeys(next);
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const totalSelectable = catalog.reduce(
    (acc, m) => acc + m.permissions.filter((p) => isAllowed(p.key)).length,
    0,
  );

  const moduleState = (mod: PermissionCatalogModule): boolean | 'indeterminate' => {
    const keys = mod.permissions.map((p) => p.key).filter(isAllowed);
    if (keys.length === 0) return false;
    const sel = keys.filter((k) => selectedSet.has(k)).length;
    if (sel === 0) return false;
    if (sel === keys.length) return true;
    return 'indeterminate';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions"
            className="h-9 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {selectedSet.size} / {totalSelectable} selected
          </Badge>
          {!disabled && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                Select all
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-lg ring-1 ring-foreground/10">
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            No permissions match your search.
          </p>
        )}
        {filtered.map((mod) => {
          const isCollapsed = collapsed.has(mod.module);
          const state = moduleState(mod);
          return (
            <div key={mod.module}>
              <div className="flex items-center gap-2 bg-slate-50/70 px-3 py-2 dark:bg-slate-800/40">
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(collapsed);
                    if (next.has(mod.module)) next.delete(mod.module);
                    else next.add(mod.module);
                    setCollapsed(next);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <Checkbox
                  checked={state}
                  onCheckedChange={() => toggleModule(mod)}
                  disabled={disabled}
                  aria-label={`Select all ${mod.label}`}
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {mod.label}
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {mod.permissions.filter((p) => selectedSet.has(p.key)).length}/
                  {mod.permissions.length}
                </Badge>
              </div>

              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mod.permissions.map((p) => {
                    const allowed = isAllowed(p.key);
                    return (
                      <label
                        key={p.key}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                          allowed
                            ? 'cursor-pointer hover:bg-muted'
                            : 'cursor-not-allowed opacity-50',
                        )}
                        title={allowed ? p.key : `Not available — restricted by principal`}
                      >
                        <Checkbox
                          checked={selectedSet.has(p.key)}
                          onCheckedChange={() => toggleKey(p.key)}
                          disabled={disabled || !allowed}
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          {p.label}
                        </span>
                        {!allowed && <Lock className="h-3 w-3 text-slate-400" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
