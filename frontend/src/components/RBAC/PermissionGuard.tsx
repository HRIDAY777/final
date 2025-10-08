import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { Permission, ResourceType, Action } from '../../types/rbac';

interface PermissionGuardProps {
  permission?: Permission;
  resource?: ResourceType;
  action?: Action;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  resource,
  action,
  fallback = null,
  children
}) => {
  const { can, canDo } = useRBAC();

  // Check permission
  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  // Check resource permission
  if (resource && action && !canDo(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
