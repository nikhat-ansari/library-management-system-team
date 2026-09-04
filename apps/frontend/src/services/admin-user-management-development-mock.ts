import type {
  CreateStaffRequest,
  StaffAccountStatus,
  StaffUser,
  StaffValidationErrors,
  UpdateStaffRequest,
  UpdateStaffStatusRequest,
} from '../types/admin-user-management';

export type AdminUsersMockScenario = 'standard' | 'empty' | 'error';

export class AdminUsersMockError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: StaffValidationErrors = {},
  ) {
    super(message);
    this.name = 'AdminUsersMockError';
  }
}

export interface AdminUsersDevelopmentMock {
  getStaff(): Promise<StaffUser[]>;
  getStaffById(id: string): Promise<StaffUser>;
  createStaff(payload: CreateStaffRequest): Promise<StaffUser>;
  updateStaff(id: string, payload: UpdateStaffRequest): Promise<StaffUser>;
  updateStatus(id: string, payload: UpdateStaffStatusRequest): Promise<StaffUser>;
}

const initialStaff: StaffUser[] = [
  {
    id: 'staff-ayesha-khan',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@library.local',
    role: 'STAFF',
    accountStatus: 'active',
    createdAt: '2026-09-01T09:15:00.000Z',
    updatedAt: '2026-09-03T11:20:00.000Z',
  },
  {
    id: 'staff-riya-sharma',
    name: 'Riya Sharma',
    email: 'riya.sharma@library.local',
    role: 'STAFF',
    accountStatus: 'active',
    createdAt: '2026-09-02T10:30:00.000Z',
    updatedAt: '2026-09-03T14:05:00.000Z',
  },
  {
    id: 'staff-neha-patil',
    name: 'Neha Patil',
    email: 'neha.patil@library.local',
    role: 'STAFF',
    accountStatus: 'inactive',
    createdAt: '2026-09-03T08:45:00.000Z',
    updatedAt: '2026-09-04T09:10:00.000Z',
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pause = () => new Promise<void>((resolve) => window.setTimeout(resolve, 500));
const clone = (staff: StaffUser): StaffUser => ({ ...staff });

function normalizeScenario(value: string): AdminUsersMockScenario {
  return value === 'empty' || value === 'error' ? value : 'standard';
}

function validateStaff(payload: CreateStaffRequest | UpdateStaffRequest): StaffValidationErrors {
  const fields: StaffValidationErrors = {};
  if (!payload.name.trim()) fields.name = 'Name is required.';
  if (!payload.email.trim()) fields.email = 'Email is required.';
  else if (!emailPattern.test(payload.email.trim())) fields.email = 'Enter a valid email address.';
  if ('role' in payload && payload.role !== 'STAFF') {
    fields.role = 'Only the staff role can be created here.';
  }
  return fields;
}

function newId() {
  return `staff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAdminUsersDevelopmentMock(scenarioValue: string): AdminUsersDevelopmentMock {
  const scenario = normalizeScenario(scenarioValue);
  let staff = scenario === 'empty' ? [] : initialStaff.map(clone);

  const ensureAvailable = async () => {
    await pause();
    if (scenario === 'error') {
      throw new AdminUsersMockError('The temporary development service is unavailable. Please try again.', 503);
    }
  };

  const findStaff = (id: string) => {
    const found = staff.find((user) => user.id === id);
    if (!found) throw new AdminUsersMockError('Staff member not found.', 404);
    return found;
  };

  const ensureUniqueEmail = (email: string, excludedId?: string) => {
    const duplicate = staff.some(
      (user) => user.id !== excludedId && user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new AdminUsersMockError('This email is already in use.', 409, {
        email: 'This email is already in use.',
      });
    }
  };

  return {
    async getStaff() {
      await ensureAvailable();
      return staff.map(clone);
    },

    async getStaffById(id) {
      await ensureAvailable();
      return clone(findStaff(id));
    },

    async createStaff(payload) {
      await ensureAvailable();
      const fields = validateStaff(payload);
      if (Object.keys(fields).length) throw new AdminUsersMockError('Please correct the highlighted fields.', 422, fields);
      ensureUniqueEmail(payload.email);
      const now = new Date().toISOString();
      const created: StaffUser = {
        id: newId(),
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        role: 'STAFF',
        accountStatus: 'active',
        createdAt: now,
        updatedAt: now,
      };
      staff = [created, ...staff];
      return clone(created);
    },

    async updateStaff(id, payload) {
      await ensureAvailable();
      const existing = findStaff(id);
      const fields = validateStaff(payload);
      if (Object.keys(fields).length) throw new AdminUsersMockError('Please correct the highlighted fields.', 422, fields);
      ensureUniqueEmail(payload.email, id);
      const updated: StaffUser = {
        ...existing,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      };
      staff = staff.map((user) => (user.id === id ? updated : user));
      return clone(updated);
    },

    async updateStatus(id, payload) {
      await ensureAvailable();
      const existing = findStaff(id);
      const accountStatus: StaffAccountStatus = payload.accountStatus;
      if (accountStatus !== 'active' && accountStatus !== 'inactive') {
        throw new AdminUsersMockError('Choose a valid account status.', 422, {
          form: 'Choose a valid account status.',
        });
      }
      const updated: StaffUser = { ...existing, accountStatus, updatedAt: new Date().toISOString() };
      staff = staff.map((user) => (user.id === id ? updated : user));
      return clone(updated);
    },
  };
}
