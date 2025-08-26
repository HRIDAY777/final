import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { apiService } from '../../services/api';
import {
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface HostelRule {
  id: number;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Rules: React.FC = () => {
  const [rules, setRules] = useState<HostelRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<HostelRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [ruleForm, setRuleForm] = useState({
    title: '',
    description: '',
    category: '',
    is_active: true
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchRules();
  }, [currentPage, filters]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockRules: HostelRule[] = [
        {
          id: 1,
          title: 'Quiet Hours',
          description: 'Quiet hours are from 10:00 PM to 7:00 AM. During these hours, students must maintain silence and avoid any activities that may disturb others.',
          category: 'General Conduct',
          is_active: true,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          title: 'Visitor Policy',
          description: 'Visitors are allowed only during designated hours (2:00 PM to 8:00 PM). All visitors must be registered at the front desk and accompanied by the host student.',
          category: 'Visitors',
          is_active: true,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 3,
          title: 'Room Maintenance',
          description: 'Students are responsible for keeping their rooms clean and tidy. Regular inspections will be conducted to ensure compliance with cleanliness standards.',
          category: 'Maintenance',
          is_active: true,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 4,
          title: 'Electrical Appliances',
          description: 'Only approved electrical appliances are allowed in rooms. High-power devices like heaters and cooking appliances are strictly prohibited.',
          category: 'Safety',
          is_active: true,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 5,
          title: 'Smoking Policy',
          description: 'Smoking is strictly prohibited in all hostel buildings and common areas. Designated smoking areas are available outside the buildings.',
          category: 'Health & Safety',
          is_active: true,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 6,
          title: 'Pet Policy',
          description: 'Pets are not allowed in hostel rooms or common areas. This policy is in place to ensure the comfort and safety of all residents.',
          category: 'General Conduct',
          is_active: false,
          created_by: 'Admin User',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        }
      ];

      // Apply filters
      let filteredRules = mockRules.filter(rule => {
        if (filters.category && rule.category !== filters.category) return false;
        if (filters.status === 'active' && !rule.is_active) return false;
        if (filters.status === 'inactive' && rule.is_active) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            rule.title.toLowerCase().includes(searchLower) ||
            rule.description.toLowerCase().includes(searchLower) ||
            rule.category.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRules = filteredRules.slice(startIndex, endIndex);

      setRules(paginatedRules);
      setTotalCount(filteredRules.length);
      setTotalPages(Math.ceil(filteredRules.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCreateRule = async () => {
    try {
      // Mock API call
      console.log('Creating rule:', ruleForm);
      setShowRuleModal(false);
      setRuleForm({
        title: '',
        description: '',
        category: '',
        is_active: true
      });
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleUpdateRule = async () => {
    try {
      // Mock API call
      console.log('Updating rule:', ruleForm);
      setShowRuleModal(false);
      setIsEditing(false);
      setRuleForm({
        title: '',
        description: '',
        category: '',
        is_active: true
      });
      fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleEditRule = (rule: HostelRule) => {
    setSelectedRule(rule);
    setRuleForm({
      title: rule.title,
      description: rule.description,
      category: rule.category,
      is_active: rule.is_active
    });
    setIsEditing(true);
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      // Mock API call
      console.log('Deleting rule:', ruleId);
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'General Conduct': 'bg-blue-100 text-blue-800',
      'Visitors': 'bg-purple-100 text-purple-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Safety': 'bg-red-100 text-red-800',
      'Health & Safety': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filterOptions = [
    { label: 'All Categories', value: '' },
    { label: 'General Conduct', value: 'General Conduct' },
    { label: 'Visitors', value: 'Visitors' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Safety', value: 'Safety' },
    { label: 'Health & Safety', value: 'Health & Safety' },
  ];

  const statusOptions = [
    { label: 'All Rules', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const categoryOptions = [
    { label: 'General Conduct', value: 'General Conduct' },
    { label: 'Visitors', value: 'Visitors' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Safety', value: 'Safety' },
    { label: 'Health & Safety', value: 'Health & Safety' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Rules & Regulations"
        description="Manage hostel rules, policies, and regulations for student conduct"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowRuleModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search by rule title, description, or category..."
        filterOptions={[
          { key: 'category', label: 'Category', options: filterOptions },
          { key: 'status', label: 'Status', options: statusOptions },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(rule.category)}`}>
                        {rule.category}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.is_active)}`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {rule.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Created by: {rule.created_by}</span>
                <span>Updated: {new Date(rule.updated_at).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRule(rule);
                      setShowDetailModal(true);
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRule(rule)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Rule Modal */}
      <Modal
        isOpen={showRuleModal}
        onClose={() => {
          setShowRuleModal(false);
          setIsEditing(false);
          setRuleForm({
            title: '',
            description: '',
            category: '',
            is_active: true
          });
        }}
        title={isEditing ? 'Edit Rule' : 'Add New Rule'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Rule Title"
            value={ruleForm.title}
            onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
            required
          />

          <Select
            label="Category"
            value={ruleForm.category}
            onChange={(value) => setRuleForm({ ...ruleForm, category: value })}
            options={categoryOptions}
            required
          />

          <Textarea
            label="Description"
            value={ruleForm.description}
            onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
            rows={6}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={ruleForm.is_active}
              onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active Rule
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowRuleModal(false);
              setIsEditing(false);
              setRuleForm({
                title: '',
                description: '',
                category: '',
                is_active: true
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={isEditing ? handleUpdateRule : handleCreateRule}
          >
            {isEditing ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </Modal>

      {/* Rule Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Rule Details"
        size="lg"
      >
        {selectedRule && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedRule.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedRule.category)}`}>
                        {selectedRule.category}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRule.is_active)}`}>
                        {selectedRule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedRule.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRule.created_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRule.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRule.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRule.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleEditRule(selectedRule)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Rule
              </Button>
              <Button variant="primary">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Print Rule
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Rules;
