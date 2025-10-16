import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  CogIcon,
  CreditCardIcon,
  BellIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface BillingSettings {
  currency: string;
  taxRate: number;
  lateFeeRate: number;
  gracePeriodDays: number;
  autoGenerateInvoices: boolean;
  sendPaymentReminders: boolean;
  reminderDaysBefore: number;
  paymentGatewayEnabled: boolean;
  paymentGatewayConfig: {
    provider: string;
    apiKey: string;
    secretKey: string;
    webhookUrl: string;
    testMode: boolean;
  };
  invoiceSettings: {
    autoNumbering: boolean;
    prefix: string;
    nextNumber: number;
    terms: string;
    footer: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderFrequency: string;
  };
}

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'testing';
  supportedMethods: string[];
  transactionFee: number;
  setupDate: string;
  lastUsed: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<BillingSettings>({
    currency: 'USD',
    taxRate: 0,
    lateFeeRate: 5.0,
    gracePeriodDays: 7,
    autoGenerateInvoices: true,
    sendPaymentReminders: true,
    reminderDaysBefore: 3,
    paymentGatewayEnabled: false,
    paymentGatewayConfig: {
      provider: 'stripe',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      testMode: true
    },
    invoiceSettings: {
      autoNumbering: true,
      prefix: 'INV',
      nextNumber: 1001,
      terms: 'Payment is due within 30 days of invoice date.',
      footer: 'Thank you for your business.'
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reminderFrequency: 'weekly'
    }
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'gateways' | 'invoices' | 'notifications'>('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPaymentGateways: PaymentGateway[] = [
      {
        id: '1',
        name: 'Stripe Payment Gateway',
        provider: 'stripe',
        status: 'active',
        supportedMethods: ['Credit Card', 'Debit Card', 'Digital Wallets'],
        transactionFee: 2.9,
        setupDate: '2024-01-01',
        lastUsed: '2024-01-15'
      },
      {
        id: '2',
        name: 'PayPal Express',
        provider: 'paypal',
        status: 'testing',
        supportedMethods: ['PayPal', 'Credit Card'],
        transactionFee: 3.5,
        setupDate: '2024-01-10',
        lastUsed: '2024-01-12'
      }
    ];

    setTimeout(() => {
      setPaymentGateways(mockPaymentGateways);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/finance/settings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const savedSettings = await response.json();
      console.log('Settings saved successfully:', savedSettings);
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleTestGateway = async (gatewayId: string) => {
    try {
      const response = await fetch(`/api/finance/payment-gateways/${gatewayId}/test/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Gateway test failed');
      }
      
      const result = await response.json();
      console.log('Gateway test result:', result);
      alert(`Gateway test ${result.success ? 'successful' : 'failed'}`);
    } catch (error) {
      console.error('Error testing gateway:', error);
      alert('Gateway test failed. Please check your configuration.');
    }
  };

  const handleAddGateway = async () => {
    const gatewayName = prompt('Enter gateway name:');
    if (!gatewayName) return;
    
    const provider = prompt('Enter provider (stripe/paypal/square/razorpay):');
    if (!provider) return;
    
    try {
      const response = await fetch('/api/finance/payment-gateways/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gatewayName,
          provider: provider,
          status: 'inactive',
          is_active: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add gateway');
      }
      
      const newGateway = await response.json();
      console.log('Gateway added:', newGateway);
      setPaymentGateways(prev => [...prev, newGateway]);
      alert('Payment gateway added successfully');
    } catch (error) {
      console.error('Error adding gateway:', error);
      alert('Failed to add gateway. Please try again.');
    }
  };

  const handleRemoveGateway = async (gatewayId: string) => {
    if (window.confirm('Are you sure you want to remove this payment gateway?')) {
      try {
        const response = await fetch(`/api/finance/payment-gateways/${gatewayId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove gateway');
        }
        
        console.log('Gateway removed:', gatewayId);
        setPaymentGateways(prev => prev.filter(g => g.id !== gatewayId));
        alert('Payment gateway removed successfully');
      } catch (error) {
        console.error('Error removing gateway:', error);
        alert('Failed to remove gateway. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      testing: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure payment gateways, billing rules, and system preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General Settings', icon: CogIcon },
            { id: 'gateways', label: 'Payment Gateways', icon: CreditCardIcon },
            { id: 'invoices', label: 'Invoice Settings', icon: DocumentTextIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Currency and Tax Settings */}
          <Card>
            <CardHeader title="Currency & Tax Settings" />
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Fee Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeeRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, lateFeeRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.gracePeriodDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, gracePeriodDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="30"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader title="Automation Settings" />
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto-generate Invoices</h4>
                    <p className="text-sm text-gray-600">Automatically generate invoices for recurring fees</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoGenerateInvoices}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoGenerateInvoices: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Send Payment Reminders</h4>
                    <p className="text-sm text-gray-600">Automatically send payment reminders to customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendPaymentReminders}
                      onChange={(e) => setSettings(prev => ({ ...prev, sendPaymentReminders: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.sendPaymentReminders && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Days Before Due Date
                    </label>
                    <input
                      type="number"
                      value={settings.reminderDaysBefore}
                      onChange={(e) => setSettings(prev => ({ ...prev, reminderDaysBefore: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="30"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Payment Gateway Configuration */}
          <Card>
            <CardHeader title="Payment Gateway Configuration" />
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Enable Payment Gateway</h4>
                    <p className="text-sm text-gray-600">Allow online payments through payment gateways</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentGatewayEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, paymentGatewayEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.paymentGatewayEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Provider
                      </label>
                      <select
                        value={settings.paymentGatewayConfig.provider}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          paymentGatewayConfig: { ...prev.paymentGatewayConfig, provider: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="square">Square</option>
                        <option value="razorpay">Razorpay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.paymentGatewayConfig.apiKey}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            paymentGatewayConfig: { ...prev.paymentGatewayConfig, apiKey: e.target.value }
                          }))}
                          className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showApiKey ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretKey ? 'text' : 'password'}
                          value={settings.paymentGatewayConfig.secretKey}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            paymentGatewayConfig: { ...prev.paymentGatewayConfig, secretKey: e.target.value }
                          }))}
                          className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecretKey ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.paymentGatewayConfig.webhookUrl}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          paymentGatewayConfig: { ...prev.paymentGatewayConfig, webhookUrl: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.paymentGatewayConfig.testMode}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          paymentGatewayConfig: { ...prev.paymentGatewayConfig, testMode: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Test Mode
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Payment Gateways List */}
          <Card>
            <CardHeader 
              title="Configured Payment Gateways" 
              right={
                <Button onClick={handleAddGateway} className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Gateway
                </Button>
              }
            />
            <div className="p-4">
              <div className="space-y-4">
                {paymentGateways.map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{gateway.name}</h4>
                        {getStatusBadge(gateway.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Supported: {gateway.supportedMethods.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Transaction Fee: {gateway.transactionFee}% • Last Used: {new Date(gateway.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleTestGateway(gateway.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleRemoveGateway(gateway.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Invoice Settings" />
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoiceSettings.prefix}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, prefix: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    value={settings.invoiceSettings.nextNumber}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, nextNumber: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Terms & Conditions
                  </label>
                  <textarea
                    value={settings.invoiceSettings.terms}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, terms: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Footer
                  </label>
                  <textarea
                    value={settings.invoiceSettings.footer}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, footer: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Notification Settings" />
            <div className="p-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Send payment reminders and receipts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notificationSettings: { ...prev.notificationSettings, emailNotifications: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Send payment reminders via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.smsNotifications}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notificationSettings: { ...prev.notificationSettings, smsNotifications: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Send notifications to mobile apps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.pushNotifications}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notificationSettings: { ...prev.notificationSettings, pushNotifications: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    value={settings.notificationSettings.reminderFrequency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notificationSettings: { ...prev.notificationSettings, reminderFrequency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
