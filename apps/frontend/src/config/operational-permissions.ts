import type { OperationalPermissionCode } from '../types/admin-permissions';

/**
 * Presentation-only grouping for the canonical operational permission codes.
 * The backend remains the source of permission definitions and enforcement.
 */
export const operationalPermissionGroups: ReadonlyArray<{ title: string; codes: readonly OperationalPermissionCode[] }> = [
  { title: 'Book Management', codes: ['BOOK_MANAGEMENT'] },
  { title: 'Member Management', codes: ['MEMBER_MANAGEMENT'] },
  { title: 'Circulation', codes: ['ISSUE_RETURN_RENEWAL'] },
  { title: 'Fine Management', codes: ['FINE_MANAGEMENT'] },
  { title: 'Reservations', codes: ['RESERVATION_MANAGEMENT'] },
  { title: 'Shelf Management', codes: ['SHELF_MANAGEMENT'] },
  { title: 'Seat Management', codes: ['SEAT_MANAGEMENT'] },
  { title: 'Operational Reports', codes: ['OPERATIONAL_REPORT_ACCESS'] },
];
