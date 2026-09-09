export type OperationalPermissionCode =
  | 'BOOK_MANAGEMENT'
  | 'MEMBER_MANAGEMENT'
  | 'ISSUE_RETURN_RENEWAL'
  | 'FINE_MANAGEMENT'
  | 'RESERVATION_MANAGEMENT'
  | 'SHELF_MANAGEMENT'
  | 'SEAT_MANAGEMENT'
  | 'OPERATIONAL_REPORT_ACCESS';

export interface OperationalPermission {
  code: OperationalPermissionCode;
  name: string;
  description: string;
}

export interface StaffPermissions {
  userId: string;
  permissions: OperationalPermissionCode[];
}
