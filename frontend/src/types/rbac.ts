// RBAC (Role-Based Access Control) Types

// User Types
export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  INSTITUTE_ADMIN = 'institute_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
}

// Admin Levels
export enum AdminLevel {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  INSTITUTE_ADMIN = 'institute_admin',
  DEPARTMENT_ADMIN = 'department_admin',
  FACULTY_ADMIN = 'faculty_admin',
  NONE = 'none',
}

// Permission Types
export enum Permission {
  // User Management
  MANAGE_USERS = 'manage_users',
  MANAGE_ADMINS = 'manage_admins',
  MANAGE_INSTITUTES = 'manage_institutes',
  MANAGE_TENANTS = 'manage_tenants',
  
  // Analytics & Reports
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_REPORTS = 'view_reports',
  MANAGE_REPORTS = 'manage_reports',
  
  // System Management
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_BILLING = 'manage_billing',
  MANAGE_SECURITY = 'manage_security',
  
  // Academic Management
  MANAGE_CLASSES = 'manage_classes',
  MANAGE_SUBJECTS = 'manage_subjects',
  MANAGE_COURSES = 'manage_courses',
  MANAGE_ASSIGNMENTS = 'manage_assignments',
  MANAGE_EXAMS = 'manage_exams',
  MANAGE_GRADES = 'manage_grades',
  
  // Attendance Management
  MANAGE_ATTENDANCE = 'manage_attendance',
  VIEW_ATTENDANCE = 'view_attendance',
  
  // Finance Management
  MANAGE_FINANCE = 'manage_finance',
  VIEW_FINANCE = 'view_finance',
  
  // Library Management
  MANAGE_LIBRARY = 'manage_library',
  VIEW_LIBRARY = 'view_library',
  
  // Transport Management
  MANAGE_TRANSPORT = 'manage_transport',
  VIEW_TRANSPORT = 'view_transport',
  
  // Hostel Management
  MANAGE_HOSTEL = 'manage_hostel',
  VIEW_HOSTEL = 'view_hostel',
  
  // HR Management
  MANAGE_HR = 'manage_hr',
  VIEW_HR = 'view_hr',
  
  // Inventory Management
  MANAGE_INVENTORY = 'manage_inventory',
  VIEW_INVENTORY = 'view_inventory',
  
  // E-commerce Management
  MANAGE_ECOMMERCE = 'manage_ecommerce',
  VIEW_ECOMMERCE = 'view_ecommerce',
  
  // E-learning Management
  MANAGE_ELEARNING = 'manage_elearning',
  VIEW_ELEARNING = 'view_elearning',
  
  // Events Management
  MANAGE_EVENTS = 'manage_events',
  VIEW_EVENTS = 'view_events',
  
  // Notices Management
  MANAGE_NOTICES = 'manage_notices',
  VIEW_NOTICES = 'view_notices',
  
  // AI Tools Management
  MANAGE_AI_TOOLS = 'manage_ai_tools',
  USE_AI_TOOLS = 'use_ai_tools',
}

// Resource Types
export enum ResourceType {
  USERS = 'users',
  ADMINS = 'admins',
  INSTITUTES = 'institutes',
  TENANTS = 'tenants',
  CLASSES = 'classes',
  SUBJECTS = 'subjects',
  COURSES = 'courses',
  ASSIGNMENTS = 'assignments',
  EXAMS = 'exams',
  GRADES = 'grades',
  ATTENDANCE = 'attendance',
  FINANCE = 'finance',
  LIBRARY = 'library',
  TRANSPORT = 'transport',
  HOSTEL = 'hostel',
  HR = 'hr',
  INVENTORY = 'inventory',
  ECOMMERCE = 'ecommerce',
  ELEARNING = 'elearning',
  EVENTS = 'events',
  NOTICES = 'notices',
  AI_TOOLS = 'ai_tools',
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  BILLING = 'billing',
  SECURITY = 'security',
}

// Action Types
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  GENERATE = 'generate',
  SCHEDULE = 'schedule',
  EXECUTE = 'execute',
  MONITOR = 'monitor',
  CONFIGURE = 'configure',
}

// Role Interface
export interface Role {
  id: string;
  name: string;
  description: string;
  type: UserType | AdminLevel;
  permissions: Permission[];
  resources: ResourceType[];
  actions: Action[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin Role Interface
export interface AdminRole {
  id: string;
  name: string;
  roleType: AdminLevel;
  description: string;
  permissions: {
    canManageUsers: boolean;
    canManageAdmins: boolean;
    canManageInstitutes: boolean;
    canManageTenants: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
    canManageBilling: boolean;
    canManageSecurity: boolean;
  };
  applicableInstitutes: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Assignment Interface
export interface AdminAssignment {
  id: string;
  userId: string;
  roleId: string;
  instituteId?: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  notes?: string;
}

// User Permissions Interface
export interface UserPermissions {
  userId: string;
  userType: UserType;
  adminLevel: AdminLevel;
  permissions: Permission[];
  resources: ResourceType[];
  actions: Action[];
  adminRoles: AdminAssignment[];
  institutes: string[];
  departments: string[];
  classes: string[];
  subjects: string[];
}

// Permission Check Interface
export interface PermissionCheck {
  resource: ResourceType;
  action: Action;
  resourceId?: string;
  instituteId?: string;
  departmentId?: string;
  classId?: string;
  subjectId?: string;
}

// RBAC Context Interface
export interface RBACContext {
  user: UserPermissions;
  currentInstitute?: string;
  currentDepartment?: string;
  currentClass?: string;
  currentSubject?: string;
}

// Permission Result Interface
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  context?: RBACContext;
}

// Role Template Interface
export interface RoleTemplate {
  name: string;
  description: string;
  type: UserType | AdminLevel;
  defaultPermissions: Permission[];
  defaultResources: ResourceType[];
  defaultActions: Action[];
  isSystem: boolean;
}

// Predefined Role Templates
export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  [UserType.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    type: UserType.SUPER_ADMIN,
    defaultPermissions: Object.values(Permission),
    defaultResources: Object.values(ResourceType),
    defaultActions: Object.values(Action),
    isSystem: true,
  },
  [UserType.ADMIN]: {
    name: 'Administrator',
    description: 'System administrator with most permissions',
    type: UserType.ADMIN,
    defaultPermissions: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_INSTITUTES,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_SETTINGS,
      Permission.MANAGE_BILLING,
      Permission.MANAGE_CLASSES,
      Permission.MANAGE_SUBJECTS,
      Permission.MANAGE_COURSES,
      Permission.MANAGE_ASSIGNMENTS,
      Permission.MANAGE_EXAMS,
      Permission.MANAGE_GRADES,
      Permission.MANAGE_ATTENDANCE,
      Permission.MANAGE_FINANCE,
      Permission.MANAGE_LIBRARY,
      Permission.MANAGE_TRANSPORT,
      Permission.MANAGE_HOSTEL,
      Permission.MANAGE_HR,
      Permission.MANAGE_INVENTORY,
      Permission.MANAGE_ECOMMERCE,
      Permission.MANAGE_ELEARNING,
      Permission.MANAGE_EVENTS,
      Permission.MANAGE_NOTICES,
      Permission.MANAGE_AI_TOOLS,
      Permission.MANAGE_REPORTS,
    ],
    defaultResources: Object.values(ResourceType),
    defaultActions: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.LIST,
      Action.EXPORT,
      Action.IMPORT,
      Action.APPROVE,
      Action.REJECT,
      Action.PUBLISH,
      Action.ARCHIVE,
      Action.RESTORE,
      Action.ASSIGN,
      Action.UNASSIGN,
      Action.GENERATE,
      Action.SCHEDULE,
      Action.EXECUTE,
      Action.MONITOR,
      Action.CONFIGURE,
    ],
    isSystem: true,
  },
  [UserType.INSTITUTE_ADMIN]: {
    name: 'Institute Administrator',
    description: 'Institute-level administrator',
    type: UserType.INSTITUTE_ADMIN,
    defaultPermissions: [
      Permission.MANAGE_USERS,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_CLASSES,
      Permission.MANAGE_SUBJECTS,
      Permission.MANAGE_COURSES,
      Permission.MANAGE_ASSIGNMENTS,
      Permission.MANAGE_EXAMS,
      Permission.MANAGE_GRADES,
      Permission.MANAGE_ATTENDANCE,
      Permission.VIEW_FINANCE,
      Permission.MANAGE_LIBRARY,
      Permission.MANAGE_TRANSPORT,
      Permission.MANAGE_HOSTEL,
      Permission.VIEW_HR,
      Permission.MANAGE_INVENTORY,
      Permission.VIEW_ECOMMERCE,
      Permission.MANAGE_ELEARNING,
      Permission.MANAGE_EVENTS,
      Permission.MANAGE_NOTICES,
      Permission.USE_AI_TOOLS,
      Permission.MANAGE_REPORTS,
    ],
    defaultResources: [
      ResourceType.USERS,
      ResourceType.CLASSES,
      ResourceType.SUBJECTS,
      ResourceType.COURSES,
      ResourceType.ASSIGNMENTS,
      ResourceType.EXAMS,
      ResourceType.GRADES,
      ResourceType.ATTENDANCE,
      ResourceType.FINANCE,
      ResourceType.LIBRARY,
      ResourceType.TRANSPORT,
      ResourceType.HOSTEL,
      ResourceType.HR,
      ResourceType.INVENTORY,
      ResourceType.ECOMMERCE,
      ResourceType.ELEARNING,
      ResourceType.EVENTS,
      ResourceType.NOTICES,
      ResourceType.AI_TOOLS,
      ResourceType.REPORTS,
      ResourceType.ANALYTICS,
    ],
    defaultActions: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
      Action.LIST,
      Action.EXPORT,
      Action.IMPORT,
      Action.APPROVE,
      Action.REJECT,
      Action.PUBLISH,
      Action.ARCHIVE,
      Action.RESTORE,
      Action.ASSIGN,
      Action.UNASSIGN,
      Action.GENERATE,
      Action.SCHEDULE,
      Action.EXECUTE,
      Action.MONITOR,
    ],
    isSystem: true,
  },
  [UserType.TEACHER]: {
    name: 'Teacher',
    description: 'Teacher with class and subject management permissions',
    type: UserType.TEACHER,
    defaultPermissions: [
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_ASSIGNMENTS,
      Permission.MANAGE_EXAMS,
      Permission.MANAGE_GRADES,
      Permission.VIEW_ATTENDANCE,
      Permission.VIEW_LIBRARY,
      Permission.USE_AI_TOOLS,
      Permission.VIEW_REPORTS,
    ],
    defaultResources: [
      ResourceType.ASSIGNMENTS,
      ResourceType.EXAMS,
      ResourceType.GRADES,
      ResourceType.ATTENDANCE,
      ResourceType.LIBRARY,
      ResourceType.AI_TOOLS,
      ResourceType.REPORTS,
      ResourceType.ANALYTICS,
    ],
    defaultActions: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.LIST,
      Action.EXPORT,
      Action.APPROVE,
      Action.REJECT,
      Action.PUBLISH,
      Action.ASSIGN,
      Action.GENERATE,
      Action.EXECUTE,
    ],
    isSystem: true,
  },
  [UserType.STUDENT]: {
    name: 'Student',
    description: 'Student with limited access to their own data',
    type: UserType.STUDENT,
    defaultPermissions: [
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_LIBRARY,
      Permission.USE_AI_TOOLS,
      Permission.VIEW_REPORTS,
    ],
    defaultResources: [
      ResourceType.ASSIGNMENTS,
      ResourceType.EXAMS,
      ResourceType.GRADES,
      ResourceType.ATTENDANCE,
      ResourceType.LIBRARY,
      ResourceType.AI_TOOLS,
      ResourceType.REPORTS,
      ResourceType.ANALYTICS,
    ],
    defaultActions: [
      Action.READ,
      Action.LIST,
      Action.EXPORT,
      Action.EXECUTE,
    ],
    isSystem: true,
  },
  [UserType.PARENT]: {
    name: 'Parent',
    description: 'Parent with access to their children\'s data',
    type: UserType.PARENT,
    defaultPermissions: [
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_REPORTS,
    ],
    defaultResources: [
      ResourceType.GRADES,
      ResourceType.ATTENDANCE,
      ResourceType.REPORTS,
      ResourceType.ANALYTICS,
    ],
    defaultActions: [
      Action.READ,
      Action.LIST,
      Action.EXPORT,
    ],
    isSystem: true,
  },
  [UserType.STAFF]: {
    name: 'Staff',
    description: 'General staff member with basic permissions',
    type: UserType.STAFF,
    defaultPermissions: [
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_LIBRARY,
      Permission.VIEW_INVENTORY,
      Permission.VIEW_REPORTS,
    ],
    defaultResources: [
      ResourceType.LIBRARY,
      ResourceType.INVENTORY,
      ResourceType.REPORTS,
      ResourceType.ANALYTICS,
    ],
    defaultActions: [
      Action.READ,
      Action.LIST,
      Action.EXPORT,
    ],
    isSystem: true,
  },
};

// Permission Check Functions
export const hasPermission = (
  userPermissions: UserPermissions,
  permission: Permission
): boolean => {
  return userPermissions.permissions.includes(permission);
};

export const hasResourcePermission = (
  userPermissions: UserPermissions,
  resource: ResourceType,
  action: Action
): boolean => {
  return (
    userPermissions.resources.includes(resource) &&
    userPermissions.actions.includes(action)
  );
};

export const canAccessResource = (
  userPermissions: UserPermissions,
  check: PermissionCheck
): PermissionResult => {
  const { resource, action, resourceId, instituteId } = check;

  // Check if user has basic resource and action permissions
  if (!hasResourcePermission(userPermissions, resource, action)) {
    return {
      allowed: false,
      reason: `User does not have ${action} permission on ${resource}`,
    };
  }

  // Check institute-level access
  if (instituteId && userPermissions.institutes.length > 0) {
    if (!userPermissions.institutes.includes(instituteId)) {
      return {
        allowed: false,
        reason: `User does not have access to institute ${instituteId}`,
      };
    }
  }

  // Check admin role permissions
  const activeAdminRoles = userPermissions.adminRoles.filter(
    (assignment) => assignment.isActive && !assignment.expiresAt
  );

  if (activeAdminRoles.length > 0) {
    // Admin users have broader access
    return { allowed: true };
  }

  // For specific resource checks
  if (resourceId) {
    // Implement specific resource ownership checks here
    // This would depend on the specific resource type
  }

  return { allowed: true };
};

export const getUserPermissions = (
  userType: UserType,
  adminLevel: AdminLevel,
  adminRoles: AdminAssignment[] = []
): UserPermissions => {
  const template = ROLE_TEMPLATES[userType] || ROLE_TEMPLATES[UserType.STUDENT];

  return {
    userId: '',
    userType,
    adminLevel,
    permissions: template.defaultPermissions,
    resources: template.defaultResources,
    actions: template.defaultActions,
    adminRoles,
    institutes: [],
    departments: [],
    classes: [],
    subjects: [],
  };
};

// All types are already exported as interfaces above
