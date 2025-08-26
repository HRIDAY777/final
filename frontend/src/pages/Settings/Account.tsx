import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import PWAInstall from '../../components/UI/PWAInstall';
import {
  UserIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface AccountInfo {
  id: string;
  username: string;
  email: string;
  account_type: 'free' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'expired' | 'cancelled' | 'trial';
  subscription_plan: string;
  subscription_start: string;
  subscription_end: string;
  storage_used: number;
  storage_limit: number;
  last_login: string;
  account_created: string;
  is_verified: boolean;
  is_active: boolean;
  features: {
    storage: boolean;
    analytics: boolean;
    priority_support: boolean;
    custom_branding: boolean;
    api_access: boolean;
  };
}

const Account: React.FC = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockAccountInfo: AccountInfo = {
      id: '1',
      username: 'johndoe',
      email: 'john.doe@example.com',
      account_type: 'premium',
      subscription_status: 'active',
      subscription_plan: 'Premium Plan',
      subscription_start: '2024-01-01T00:00:00Z',
      subscription_end: '2024-12-31T23:59:59Z',
      storage_used: 2.5,
      storage_limit: 10,
      last_login: '2024-12-15T14:30:00Z',
      account_created: '2020-01-15T10:00:00Z',
      is_verified: true,
      is_active: true,
      features: {
        storage: true,
        analytics: true,
        priority_support: true,
        custom_branding: false,
        api_access: false
      }
    };

    setTimeout(() => {
      setAccountInfo(mockAccountInfo);
      setLoading(false);
    }, 1000);
  }, []);

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Expired</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Cancelled</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Trial</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'free':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Free</span>;
      case 'premium':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Premium</span>;
      case 'enterprise':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Enterprise</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    // Simulate data export
    await new Promise(resolve => setTimeout(resolve, 3000));
    setShowExportModal(false);
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Simulate account deletion
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowDeleteModal(false);
    setDeleting(false);
  };

  const formatStorage = (gb: number) => {
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    } else {
      return `${(gb * 1024).toFixed(0)} MB`;
    }
  };

  const getStoragePercentage = () => {
    if (!accountInfo) return 0;
    return (accountInfo.storage_used / accountInfo.storage_limit) * 100;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account not found</h3>
          <p className="text-gray-600">Unable to load account information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600">Manage your account details and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Overview */}
        <Card>
          <CardHeader title="Account Overview" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Account Type</h3>
                <p className="text-sm text-gray-600">{accountInfo.subscription_plan}</p>
              </div>
              <div className="flex space-x-2">
                {getAccountTypeBadge(accountInfo.account_type)}
                {getSubscriptionStatusBadge(accountInfo.subscription_status)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Username</h3>
                <p className="text-sm text-gray-600">@{accountInfo.username}</p>
              </div>
              <div className="flex items-center">
                {accountInfo.is_verified ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">{accountInfo.email}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-600">
                  {accountInfo.is_active ? 'Active' : 'Suspended'}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                accountInfo.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {accountInfo.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader title="Subscription Details" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Plan</h3>
                <p className="text-sm text-gray-600">{accountInfo.subscription_plan}</p>
              </div>
              <CreditCardIcon className="w-5 h-5 text-gray-400" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Billing Period</h3>
              <p className="text-sm text-gray-600">
                {new Date(accountInfo.subscription_start).toLocaleDateString()} - {new Date(accountInfo.subscription_end).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Next Billing</h3>
              <p className="text-sm text-gray-600">
                {new Date(accountInfo.subscription_end).toLocaleDateString()}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full">
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </div>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader title="Storage Usage" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Used Storage</span>
              <span className="text-sm text-gray-600">
                {formatStorage(accountInfo.storage_used)} / {formatStorage(accountInfo.storage_limit)}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  getStoragePercentage() > 90 ? 'bg-red-500' : 
                  getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getStoragePercentage()}%` }}
              ></div>
            </div>

            <div className="text-xs text-gray-500">
              {getStoragePercentage().toFixed(1)}% used
            </div>

            {getStoragePercentage() > 90 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                  Storage almost full. Consider upgrading your plan.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Account Activity */}
        <Card>
          <CardHeader title="Account Activity" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Last Login</span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(accountInfo.last_login).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Account Created</span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(accountInfo.account_created).toLocaleDateString()}
              </span>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                View Activity Log
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader title="Plan Features" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(accountInfo.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-700 capitalize">
                  {feature.replace('_', ' ')}
                </span>
                {enabled ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* PWA Installation */}
      <Card>
        <CardHeader title="App Installation" />
        <div className="p-6">
          <PWAInstall showStatus={true} showInstallButton={true} />
        </div>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader title="Account Actions" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowExportModal(true)}
              className="w-full"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <p className="text-gray-600 mb-6">
              This will export all your data including profile, preferences, and activity history. 
              The export may take a few minutes to complete.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportData}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> All your data, including profile information, preferences, 
                and activity history will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
                             <Button
                 onClick={handleDeleteAccount}
                 disabled={deleting}
                 className="bg-red-600 hover:bg-red-700 text-white"
               >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;


