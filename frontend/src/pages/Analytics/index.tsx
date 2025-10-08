import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/Tabs';
import { Badge } from '../../components/UI/Badge';

import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign,
  Calendar,
  Activity,
  Target,
  Award,
  PieChart,
  LineChart
} from 'lucide-react';
import Dashboard from './Dashboard';
import Charts from './Charts';
import Reports from './Reports';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { overview, loading } = useAnalytics();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'charts', label: 'Charts', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive data analysis, visualizations, and reporting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-100 text-green-800">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Set Goals
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : overview?.total_students || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{overview?.enrollment_growth || 0}% this year
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : formatCurrency(overview?.total_revenue || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +8.2% vs last year
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : overview?.attendance_rate || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +2.1% vs last month
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Avg</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : overview?.performance_average || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +3.5% vs last term
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader title="Analytics Center" />
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <Dashboard />
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <Charts />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Reports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
                <p className="text-sm text-gray-600">Track student performance trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Financial Insights</h3>
                <p className="text-sm text-gray-600">Revenue and expense analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <LineChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enrollment Trends</h3>
                <p className="text-sm text-gray-600">Student enrollment patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      <Card>
        <CardHeader title="Recent Insights" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Performance Improvement</h4>
                <p className="text-sm text-gray-600">
                  Math scores have improved by 15% this quarter compared to last year
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">+15%</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Enrollment Growth</h4>
                <p className="text-sm text-gray-600">
                  New student enrollments increased by 12% this academic year
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">+12%</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Revenue Growth</h4>
                <p className="text-sm text-gray-600">
                  Monthly revenue has grown by 8.2% compared to the previous period
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">+8.2%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
