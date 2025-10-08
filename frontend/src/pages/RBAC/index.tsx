import React, { useState } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/Tabs';
import RoleManager from '../../components/RBAC/RoleManager';
import PermissionGuard from '../../components/RBAC/PermissionGuard';
import { Permission } from '../../types/rbac';

const RBACPage: React.FC = () => {
  const { isAdmin, canManageAdmins, canManageUsers } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader title="Access Denied" />
          <div className="p-4 text-center text-gray-600">
            You do not have permission to access RBAC management.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Role-Based Access Control</h1>
        <p className="text-gray-600 mt-2">
          Manage user roles, permissions, and access control across the system.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader title="Total Users" />
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600">1,234</div>
                <div className="text-sm text-gray-500">Active users in system</div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Admin Roles" />
              <div className="p-4">
                <div className="text-3xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-500">Custom roles created</div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Active Assignments" />
              <div className="p-4">
                <div className="text-3xl font-bold text-purple-600">89</div>
                <div className="text-sm text-gray-500">Role assignments</div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent Activity" />
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600">45</div>
                <div className="text-sm text-gray-500">Actions today</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader title="Permission Distribution" />
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Super Admins</span>
                    <span className="text-sm text-gray-500">3 users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Admins</span>
                    <span className="text-sm text-gray-500">8 users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Institute Admins</span>
                    <span className="text-sm text-gray-500">25 users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Regular Users</span>
                    <span className="text-sm text-gray-500">1,198 users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent Activity" />
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Role assigned to John Doe</div>
                      <div className="text-xs text-gray-500">2 minutes ago</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New admin role created</div>
                      <div className="text-xs text-gray-500">15 minutes ago</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">User permissions updated</div>
                      <div className="text-xs text-gray-500">1 hour ago</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Role assignment deactivated</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <PermissionGuard permission={Permission.MANAGE_ADMINS}>
            <RoleManager />
          </PermissionGuard>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <PermissionGuard permission={Permission.MANAGE_USERS}>
            <Card>
              <CardHeader title="User Management" />
              <div className="p-4">
                <div className="text-center text-gray-600">
                  User management interface will be implemented here.
                </div>
              </div>
            </Card>
          </PermissionGuard>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader title="Audit Logs" />
            <div className="p-4">
              <div className="text-center text-gray-600">
                Audit logs interface will be implemented here.
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RBACPage;
