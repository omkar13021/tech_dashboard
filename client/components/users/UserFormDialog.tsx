'use client';

import React from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DEPARTMENT_OPTIONS,
  Department,
  ManagedUser,
  ROLE_OPTIONS,
  UserFormValues,
  UserStatus,
} from '@/types/user.types';
import { UserRole } from '@/types/auth.types';
import { getManagerOptions } from '@/lib/user-utils';
import { useAuth } from '@/hooks/usePermissions';
import { useAuthz } from '@/hooks/useAuthz';
import { canManageTargetRole } from '@/lib/userPermissions';

const NO_MANAGER = 'NONE';
const NO_DEPARTMENT = 'NONE';

type Mode = 'create' | 'edit';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  /** Existing user when editing. */
  user?: ManagedUser | null;
  /** All users — used to derive manager options when `managerOptions` is absent. */
  allUsers: ManagedUser[];
  /** Explicit manager options (e.g. the in-scope managers facet from the API). */
  managerOptions?: ManagerOption[];
  /** Returns false to keep the dialog open (e.g. on a failed request). */
  onSubmit: (values: UserFormValues) => void | Promise<boolean>;
}

type FormErrors = Partial<Record<keyof UserFormValues, string>>;
type ManagerOption = { id: string; label: string };

function emptyForm(): UserFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ASSOCIATE',
    department: null,
    managerId: null,
    status: 'ACTIVE',
    jobTitle: '',
    phone: '',
    location: '',
    profileImage: null,
  };
}

function formFromUser(user: ManagedUser): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    confirmPassword: '',
    role: user.role,
    department: user.department,
    managerId: user.managerId,
    status: user.status,
    jobTitle: user.jobTitle ?? '',
    phone: user.phone ?? '',
    location: user.location ?? '',
    profileImage: user.profileImage ?? null,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Small labelled section used to group the form professionally. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-slate-600 dark:text-slate-400">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * The actual form. Mounted fresh each time the dialog opens (the dialog content
 * unmounts on close), so `useState` re-seeds from `initialValues` without an
 * effect.
 */
function UserForm({
  mode,
  initialValues,
  managerOptions,
  onSubmit,
  onCancel,
}: {
  mode: Mode;
  initialValues: UserFormValues;
  managerOptions: ManagerOption[];
  onSubmit: (values: UserFormValues) => void | Promise<boolean>;
  onCancel: () => void;
}) {
  const [values, setValues] = React.useState<UserFormValues>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { userRole } = useAuth();
  const { has } = useAuthz();

  // Role options are gated by the role hierarchy; changing an existing user's
  // role requires the user.assign permission (resolved from the backend).
  const assignableRoles = React.useMemo(
    () => ROLE_OPTIONS.filter((opt) => canManageTargetRole(userRole, opt.value)),
    [userRole],
  );
  const roleLocked = mode === 'edit' && !has('user.assign');

  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Local-only preview; no upload happens in this UI-only phase.
      set('profileImage', URL.createObjectURL(file));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.firstName.trim()) next.firstName = 'First name is required';
    if (!values.lastName.trim()) next.lastName = 'Last name is required';
    if (!values.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(values.email)) next.email = 'Enter a valid email address';

    // Passwords are required on create; optional on edit (validated only if set).
    const passwordRequired = mode === 'create';
    if (passwordRequired && !values.password) {
      next.password = 'Password is required';
    } else if (values.password && values.password.length < 8) {
      next.password = 'Use at least 8 characters';
    }
    if ((passwordRequired || values.password) && values.password !== values.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await onSubmit(values);
    // On failure the parent keeps the dialog open — re-enable the form.
    if (result === false) setSubmitting(false);
  };

  const initials =
    `${values.firstName?.[0] ?? ''}${values.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
      <div className="max-h-[calc(90vh-9.5rem)] space-y-6 overflow-y-auto px-6 py-5">
        {/* ---------------- Profile ---------------- */}
        <Section title="Profile" description="Basic identity and contact information.">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {values.profileImage ? (
                <AvatarImage src={values.profileImage} alt="Profile preview" />
              ) : null}
              <AvatarFallback className="bg-slate-100 text-base font-semibold text-slate-500 dark:bg-slate-800">
                {values.profileImage ? null : initials === '?' ? (
                  <ImagePlus className="h-5 w-5" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload photo
                </Button>
                {values.profileImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-slate-500"
                    onClick={() => set('profileImage', null)}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-400">PNG or JPG, up to 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleImagePick}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First Name" required error={errors.firstName}>
              <Input
                id="firstName"
                value={values.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="Jane"
                className="h-9"
              />
            </Field>
            <Field id="lastName" label="Last Name" required error={errors.lastName}>
              <Input
                id="lastName"
                value={values.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Doe"
                className="h-9"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane.doe@maven-erp.com"
                className="h-9"
              />
            </Field>
            <Field id="jobTitle" label="Job Title">
              <Input
                id="jobTitle"
                value={values.jobTitle}
                onChange={(e) => set('jobTitle', e.target.value)}
                placeholder="Software Engineer"
                className="h-9"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="phone" label="Phone">
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 90000 00000"
                className="h-9"
              />
            </Field>
            <Field id="location" label="Location">
              <Input
                id="location"
                value={values.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Bengaluru, IN"
                className="h-9"
              />
            </Field>
          </div>
        </Section>

        {/* ---------------- Security ---------------- */}
        <div className="border-t pt-6">
          <Section
            title="Security"
            description={
              mode === 'edit'
                ? 'Leave blank to keep the current password.'
                : 'Set an initial password for the account.'
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="password"
                label="Password"
                required={mode === 'create'}
                error={errors.password}
              >
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-9"
                />
              </Field>
              <Field
                id="confirmPassword"
                label="Confirm Password"
                required={mode === 'create'}
                error={errors.confirmPassword}
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-9"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* ---------------- Organization ---------------- */}
        <div className="border-t pt-6">
          <Section title="Organization" description="Role, department and reporting line.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="role" label="Role" required>
                <Select
                  value={values.role}
                  onValueChange={(v) => set('role', v as UserRole)}
                  disabled={roleLocked}
                >
                  <SelectTrigger id="role" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="department" label="Department">
                <Select
                  value={values.department ?? NO_DEPARTMENT}
                  onValueChange={(v) =>
                    set('department', v === NO_DEPARTMENT ? null : (v as Department))
                  }
                >
                  <SelectTrigger id="department" className="h-9">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPARTMENT}>No department</SelectItem>
                    {DEPARTMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="manager" label="Manager">
                <Select
                  value={values.managerId ?? NO_MANAGER}
                  onValueChange={(v) => set('managerId', v === NO_MANAGER ? null : v)}
                >
                  <SelectTrigger id="manager" className="h-9">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MANAGER}>No manager</SelectItem>
                    {managerOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>
        </div>

        {/* ---------------- Status ---------------- */}
        <div className="border-t pt-6">
          <Section title="Status" description="Controls whether the user can sign in.">
            <div className="flex flex-wrap gap-2">
              {(['ACTIVE', 'INACTIVE'] as UserStatus[]).map((status) => {
                const selected = values.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set('status', status)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300'
                        : 'border-border text-slate-600 hover:bg-muted dark:text-slate-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                      )}
                    />
                    {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      </div>

      <DialogFooter className="border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create User' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  allUsers,
  managerOptions: providedManagerOptions,
  onSubmit,
}: UserFormDialogProps) {
  const managerOptions = React.useMemo(() => {
    const excludeId = mode === 'edit' ? user?.id : undefined;
    const base =
      providedManagerOptions ?? getManagerOptions(allUsers, excludeId);
    return base.filter((opt) => opt.id !== excludeId);
  }, [providedManagerOptions, allUsers, mode, user?.id]);

  const initialValues =
    mode === 'edit' && user ? formFromUser(user) : emptyForm();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base">
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new employee and assign their role, department and access.'
              : 'Update employee details, role, department and access.'}
          </DialogDescription>
        </DialogHeader>

        {/* Keyed so a fresh form mounts per open / per target user. */}
        <UserForm
          key={`${mode}-${user?.id ?? 'new'}`}
          mode={mode}
          initialValues={initialValues}
          managerOptions={managerOptions}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
