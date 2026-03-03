export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_OWNER = 'org_owner',
  GAS_MANAGER = 'gas_manager',
  FUEL_MANAGER = 'fuel_manager',
  SALES_STAFF = 'sales_staff',
}

export enum BranchType {
  GAS = 'gas',
  FUEL = 'fuel',
}

export enum TenantPlan {
  PERSONAL = 'personal',
  ORGANISATION = 'organisation',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}
