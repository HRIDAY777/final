import React, { useState, useEffect } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { Permission, ResourceType, Action } from '../../types/rbac';
import { Card, CardHeader } from '../UI/Card';
import { Button } from '../UI/Button';
import Input from '../UI/Input';
import Checkbox from '../UI/Checkbox';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../UI/Table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../UI/DropdownMenu';
import { toast } from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  type: string;
  permissions: Permission[];
  resources: ResourceType[];
  actions: Action[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoleManagerProps {
  onRoleChange?: (role: Role) => void;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ onRoleChange }) => {
  const { canManageAdmins, canManageUsers } = useRBAC();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    permissions: [] as Permission[],
    resources: [] as ResourceType[],
    actions: [] as Action[]
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin-roles/');
      const data = await response.json();
      setRoles(data.results || data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin-roles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newRole = await response.json();
        setRoles([...roles, newRole]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          type: '',
          permissions: [],
          resources: [],
          actions: []
        });
        toast.success('Role created successfully');
      } else {
        toast.error('Failed to create role');
      }
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!canManageAdmins()) {
      toast.error('You do not have permission to delete roles');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/admin-roles/${roleId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoles(roles.filter(role => role.id !== roleId));
        toast.success('Role deleted successfully');
      } else {
        toast.error('Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const togglePermission = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const toggleResource = (resource: ResourceType) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.includes(resource)
        ? prev.resources.filter(r => r !== resource)
        : [...prev.resources, resource]
    }));
  };

  const toggleAction = (action: Action) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  if (!canManageAdmins()) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader title="Access Denied" />
          <div className="p-4 text-center text-gray-600">
            You do not have permission to manage roles.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create New Role
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader title="Create New Role" />
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="custom">Custom</option>
                  <option value="institute_admin">Institute Admin</option>
                  <option value="department_admin">Department Admin</option>
                  <option value="faculty_admin">Faculty Admin</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Permissions</h3>
                <div className="space-y-2">
                  {Object.values(Permission).map(permission => (
                    <Checkbox
                      key={permission}
                      label={permission.replace(/_/g, ' ')}
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Resources</h3>
                <div className="space-y-2">
                  {Object.values(ResourceType).map(resource => (
                    <Checkbox
                      key={resource}
                      label={resource.replace(/_/g, ' ')}
                      checked={formData.resources.includes(resource)}
                      onChange={() => toggleResource(resource)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  {Object.values(Action).map(action => (
                    <Checkbox
                      key={action}
                      label={action.replace(/_/g, ' ')}
                      checked={formData.actions.includes(action)}
                      onChange={() => toggleAction(action)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Role
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Existing Roles" />
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {role.permissions.length} permissions
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedRole(role)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRole(role.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RoleManager;
