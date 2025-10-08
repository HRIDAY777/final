import React from 'react';
import { useCallback, useMemo } from 'react';
import { useAuth } from '../stores/authStore';
import {
  UserPermissions,
  Permission,
  ResourceType,
  Action,
  PermissionCheck,
  PermissionResult,
  UserType,
  AdminLevel,
  AdminAssignment,
  getUserPermissions,
  hasPermission,
  hasResourcePermission,
  canAccessResource,
} from '../types/rbac';

// RBAC Hook
export const useRBAC = () => {
  const { user } = useAuth();

  // Get user permissions based on user data
  const userPermissions = useMemo((): UserPermissions => {
    if (!user) {
      return {
        userId: '',
        userType: UserType.STUDENT,
        adminLevel: AdminLevel.NONE,
        permissions: [],
        resources: [],
        actions: [],
        adminRoles: [],
        institutes: [],
        departments: [],
        classes: [],
        subjects: [],
      };
    }

    // Extract user type and admin level from user data
    const userType = (user.user_type as UserType) || UserType.STUDENT;
    const adminLevel = (user.admin_level as AdminLevel) || AdminLevel.NONE;

    // Extract admin roles from user data
    const adminRoles: AdminAssignment[] = user.admin_assignments || [];

    // Get base permissions from template
    const basePermissions = getUserPermissions(userType, adminLevel, adminRoles);

    // Merge with user-specific permissions
    return {
      ...basePermissions,
      userId: user.id || '',
      institutes: user.admin_institutes || [],
      departments: user.departments || [],
      classes: user.classes || [],
      subjects: user.subjects || [],
    };
  }, [user]);

  // Check if user has specific permission
  const can = useCallback(
    (permission: Permission): boolean => {
      return hasPermission(userPermissions, permission);
    },
    [userPermissions]
  );

  // Check if user can perform action on resource
  const canDo = useCallback(
    (resource: ResourceType, action: Action): boolean => {
      return hasResourcePermission(userPermissions, resource, action);
    },
    [userPermissions]
  );

  // Check if user can access specific resource with context
  const canAccess = useCallback(
    (check: PermissionCheck): PermissionResult => {
      return canAccessResource(userPermissions, check);
    },
    [userPermissions]
  );

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return userPermissions.adminLevel !== AdminLevel.NONE || 
           userPermissions.userType === UserType.ADMIN ||
           userPermissions.userType === UserType.SUPER_ADMIN ||
           userPermissions.userType === UserType.INSTITUTE_ADMIN;
  }, [userPermissions]);

  // Check if user is super admin
  const isSuperAdmin = useCallback((): boolean => {
    return userPermissions.userType === UserType.SUPER_ADMIN ||
           userPermissions.adminLevel === AdminLevel.SUPER_ADMIN;
  }, [userPermissions]);

  // Check if user is teacher
  const isTeacher = useCallback((): boolean => {
    return userPermissions.userType === UserType.TEACHER;
  }, [userPermissions]);

  // Check if user is student
  const isStudent = useCallback((): boolean => {
    return userPermissions.userType === UserType.STUDENT;
  }, [userPermissions]);

  // Check if user is parent
  const isParent = useCallback((): boolean => {
    return userPermissions.userType === UserType.PARENT;
  }, [userPermissions]);

  // Check if user is staff
  const isStaff = useCallback((): boolean => {
    return userPermissions.userType === UserType.STAFF;
  }, [userPermissions]);

  // Get user's accessible resources
  const getAccessibleResources = useCallback((): ResourceType[] => {
    return userPermissions.resources;
  }, [userPermissions]);

  // Get user's allowed actions
  const getAllowedActions = useCallback((): Action[] => {
    return userPermissions.actions;
  }, [userPermissions]);

  // Check if user can manage users
  const canManageUsers = useCallback((): boolean => {
    return can(Permission.MANAGE_USERS);
  }, [can]);

  // Check if user can manage admins
  const canManageAdmins = useCallback((): boolean => {
    return can(Permission.MANAGE_ADMINS);
  }, [can]);

  // Check if user can manage institutes
  const canManageInstitutes = useCallback((): boolean => {
    return can(Permission.MANAGE_INSTITUTES);
  }, [can]);

  // Check if user can view analytics
  const canViewAnalytics = useCallback((): boolean => {
    return can(Permission.VIEW_ANALYTICS);
  }, [can]);

  // Check if user can manage reports
  const canManageReports = useCallback((): boolean => {
    return can(Permission.MANAGE_REPORTS);
  }, [can]);

  // Check if user can manage settings
  const canManageSettings = useCallback((): boolean => {
    return can(Permission.MANAGE_SETTINGS);
  }, [can]);

  // Check if user can manage billing
  const canManageBilling = useCallback((): boolean => {
    return can(Permission.MANAGE_BILLING);
  }, [can]);

  // Check if user can manage security
  const canManageSecurity = useCallback((): boolean => {
    return can(Permission.MANAGE_SECURITY);
  }, [can]);

  // Academic permissions
  const canManageClasses = useCallback((): boolean => {
    return can(Permission.MANAGE_CLASSES);
  }, [can]);

  const canManageSubjects = useCallback((): boolean => {
    return can(Permission.MANAGE_SUBJECTS);
  }, [can]);

  const canManageCourses = useCallback((): boolean => {
    return can(Permission.MANAGE_COURSES);
  }, [can]);

  const canManageAssignments = useCallback((): boolean => {
    return can(Permission.MANAGE_ASSIGNMENTS);
  }, [can]);

  const canManageExams = useCallback((): boolean => {
    return can(Permission.MANAGE_EXAMS);
  }, [can]);

  const canManageGrades = useCallback((): boolean => {
    return can(Permission.MANAGE_GRADES);
  }, [can]);

  // Attendance permissions
  const canManageAttendance = useCallback((): boolean => {
    return can(Permission.MANAGE_ATTENDANCE);
  }, [can]);

  const canViewAttendance = useCallback((): boolean => {
    return can(Permission.VIEW_ATTENDANCE);
  }, [can]);

  // Finance permissions
  const canManageFinance = useCallback((): boolean => {
    return can(Permission.MANAGE_FINANCE);
  }, [can]);

  const canViewFinance = useCallback((): boolean => {
    return can(Permission.VIEW_FINANCE);
  }, [can]);

  // Library permissions
  const canManageLibrary = useCallback((): boolean => {
    return can(Permission.MANAGE_LIBRARY);
  }, [can]);

  const canViewLibrary = useCallback((): boolean => {
    return can(Permission.VIEW_LIBRARY);
  }, [can]);

  // Transport permissions
  const canManageTransport = useCallback((): boolean => {
    return can(Permission.MANAGE_TRANSPORT);
  }, [can]);

  const canViewTransport = useCallback((): boolean => {
    return can(Permission.VIEW_TRANSPORT);
  }, [can]);

  // Hostel permissions
  const canManageHostel = useCallback((): boolean => {
    return can(Permission.MANAGE_HOSTEL);
  }, [can]);

  const canViewHostel = useCallback((): boolean => {
    return can(Permission.VIEW_HOSTEL);
  }, [can]);

  // HR permissions
  const canManageHR = useCallback((): boolean => {
    return can(Permission.MANAGE_HR);
  }, [can]);

  const canViewHR = useCallback((): boolean => {
    return can(Permission.VIEW_HR);
  }, [can]);

  // Inventory permissions
  const canManageInventory = useCallback((): boolean => {
    return can(Permission.MANAGE_INVENTORY);
  }, [can]);

  const canViewInventory = useCallback((): boolean => {
    return can(Permission.VIEW_INVENTORY);
  }, [can]);

  // E-commerce permissions
  const canManageEcommerce = useCallback((): boolean => {
    return can(Permission.MANAGE_ECOMMERCE);
  }, [can]);

  const canViewEcommerce = useCallback((): boolean => {
    return can(Permission.VIEW_ECOMMERCE);
  }, [can]);

  // E-learning permissions
  const canManageElearning = useCallback((): boolean => {
    return can(Permission.MANAGE_ELEARNING);
  }, [can]);

  const canViewElearning = useCallback((): boolean => {
    return can(Permission.VIEW_ELEARNING);
  }, [can]);

  // Events permissions
  const canManageEvents = useCallback((): boolean => {
    return can(Permission.MANAGE_EVENTS);
  }, [can]);

  const canViewEvents = useCallback((): boolean => {
    return can(Permission.VIEW_EVENTS);
  }, [can]);

  // Notices permissions
  const canManageNotices = useCallback((): boolean => {
    return can(Permission.MANAGE_NOTICES);
  }, [can]);

  const canViewNotices = useCallback((): boolean => {
    return can(Permission.VIEW_NOTICES);
  }, [can]);

  // AI Tools permissions
  const canManageAITools = useCallback((): boolean => {
    return can(Permission.MANAGE_AI_TOOLS);
  }, [can]);

  const canUseAITools = useCallback((): boolean => {
    return can(Permission.USE_AI_TOOLS);
  }, [can]);

  // Get user's institutes
  const getUserInstitutes = useCallback((): string[] => {
    return userPermissions.institutes;
  }, [userPermissions]);

  // Get user's departments
  const getUserDepartments = useCallback((): string[] => {
    return userPermissions.departments;
  }, [userPermissions]);

  // Get user's classes
  const getUserClasses = useCallback((): string[] => {
    return userPermissions.classes;
  }, [userPermissions]);

  // Get user's subjects
  const getUserSubjects = useCallback((): string[] => {
    return userPermissions.subjects;
  }, [userPermissions]);

  // Check if user has access to specific institute
  const hasInstituteAccess = useCallback(
    (instituteId: string): boolean => {
      if (isSuperAdmin()) return true;
      return userPermissions.institutes.includes(instituteId);
    },
    [userPermissions, isSuperAdmin]
  );

  // Check if user has access to specific department
  const hasDepartmentAccess = useCallback(
    (departmentId: string): boolean => {
      if (isSuperAdmin()) return true;
      return userPermissions.departments.includes(departmentId);
    },
    [userPermissions, isSuperAdmin]
  );

  // Check if user has access to specific class
  const hasClassAccess = useCallback(
    (classId: string): boolean => {
      if (isSuperAdmin()) return true;
      return userPermissions.classes.includes(classId);
    },
    [userPermissions, isSuperAdmin]
  );

  // Check if user has access to specific subject
  const hasSubjectAccess = useCallback(
    (subjectId: string): boolean => {
      if (isSuperAdmin()) return true;
      return userPermissions.subjects.includes(subjectId);
    },
    [userPermissions, isSuperAdmin]
  );

  return {
    // User permissions
    userPermissions,
    
    // Basic permission checks
    can,
    canDo,
    canAccess,
    
    // Role checks
    isAdmin,
    isSuperAdmin,
    isTeacher,
    isStudent,
    isParent,
    isStaff,
    
    // Resource and action access
    getAccessibleResources,
    getAllowedActions,
    
    // System management permissions
    canManageUsers,
    canManageAdmins,
    canManageInstitutes,
    canViewAnalytics,
    canManageReports,
    canManageSettings,
    canManageBilling,
    canManageSecurity,
    
    // Academic permissions
    canManageClasses,
    canManageSubjects,
    canManageCourses,
    canManageAssignments,
    canManageExams,
    canManageGrades,
    
    // Attendance permissions
    canManageAttendance,
    canViewAttendance,
    
    // Finance permissions
    canManageFinance,
    canViewFinance,
    
    // Library permissions
    canManageLibrary,
    canViewLibrary,
    
    // Transport permissions
    canManageTransport,
    canViewTransport,
    
    // Hostel permissions
    canManageHostel,
    canViewHostel,
    
    // HR permissions
    canManageHR,
    canViewHR,
    
    // Inventory permissions
    canManageInventory,
    canViewInventory,
    
    // E-commerce permissions
    canManageEcommerce,
    canViewEcommerce,
    
    // E-learning permissions
    canManageElearning,
    canViewElearning,
    
    // Events permissions
    canManageEvents,
    canViewEvents,
    
    // Notices permissions
    canManageNotices,
    canViewNotices,
    
    // AI Tools permissions
    canManageAITools,
    canUseAITools,
    
    // Access checks
    getUserInstitutes,
    getUserDepartments,
    getUserClasses,
    getUserSubjects,
    hasInstituteAccess,
    hasDepartmentAccess,
    hasClassAccess,
    hasSubjectAccess,
  };
};

// Higher-order component for permission-based rendering
export const withPermission = (
  Component: React.ComponentType<any>,
  permission: Permission
) => {
  return (props: any) => {
    const { can } = useRBAC();
    
    if (!can(permission)) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Higher-order component for resource-based rendering
export const withResourcePermission = (
  Component: React.ComponentType<any>,
  resource: ResourceType,
  action: Action
) => {
  return (props: any) => {
    const { canDo } = useRBAC();
    
    if (!canDo(resource, action)) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Permission guard component
export const PermissionGuard: React.FC<{
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, fallback = null, children }) => {
  const { can } = useRBAC();
  
  if (!can(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Resource permission guard component
export const ResourcePermissionGuard: React.FC<{
  resource: ResourceType;
  action: Action;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ resource, action, fallback = null, children }) => {
  const { canDo } = useRBAC();
  
  if (!canDo(resource, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Access permission guard component
export const AccessPermissionGuard: React.FC<{
  check: PermissionCheck;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ check, fallback = null, children }) => {
  const { canAccess } = useRBAC();
  
  const result = canAccess(check);
  
  if (!result.allowed) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
