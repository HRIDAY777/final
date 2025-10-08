import React, { useState } from 'react';
import { Card, CardContent } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/Tabs';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  BarChart3,
  Plus,
  Building,
  UserCheck,
  FileText,
  TrendingUp
} from 'lucide-react';
import HRDashboard from './components/HRDashboard';
import Employees from './components/Employees';
import Payroll from './components/Payroll';

import { useHR } from '@/hooks/useHR';

const HRPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats, isLoading } = useHR();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR & Payroll</h1>
          <p className="text-gray-600 mt-2">
            Manage staff, payroll, attendance, and performance
          </p>
        </div>
                 <Button className="flex items-center gap-2">
           <Plus className="w-4 h-4" />
           Add Employee
         </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.total_employees || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.active_employees || 0}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.departments_count || 0}
                </p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.pending_leaves || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
             <Card>
         <CardContent>
           <div className="mb-4">
             <h3 className="text-lg font-semibold">HR Management</h3>
           </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <HRDashboard />
            </TabsContent>

            <TabsContent value="employees" className="mt-6">
              <Employees />
            </TabsContent>

            <TabsContent value="payroll" className="mt-6">
              <Payroll />
            </TabsContent>

                         <TabsContent value="leave" className="mt-6">
               <div className="text-center py-8">
                 <p className="text-gray-500">Leave Management - Coming Soon</p>
               </div>
             </TabsContent>

             <TabsContent value="attendance" className="mt-6">
               <div className="text-center py-8">
                 <p className="text-gray-500">Attendance - Coming Soon</p>
               </div>
             </TabsContent>

             <TabsContent value="performance" className="mt-6">
               <div className="text-center py-8">
                 <p className="text-gray-500">Performance - Coming Soon</p>
               </div>
             </TabsContent>

             <TabsContent value="departments" className="mt-6">
               <div className="text-center py-8">
                 <p className="text-gray-500">Departments - Coming Soon</p>
               </div>
             </TabsContent>

             <TabsContent value="documents" className="mt-6">
               <div className="text-center py-8">
                 <p className="text-gray-500">Documents - Coming Soon</p>
               </div>
             </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRPage;
