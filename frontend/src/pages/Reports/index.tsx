import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/Tabs';
import { 
  FileText, 
  Calendar, 
  Download, 
  Plus, 
  BarChart3,
  Clock
} from 'lucide-react';
import ReportTemplates from './components/ReportTemplates';
import GeneratedReports from './components/GeneratedReports';
import ScheduledReports from './components/ScheduledReports';
import ReportDashboard from './components/ReportDashboard';
import CreateReportModal from './components/CreateReportModal';
import { useReports } from '@/hooks/useAnalytics';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { reports, templates, loading, error, getReports, getTemplates } = useReports();

  // Calculate stats from the data
  const stats = {
    templates: templates.length,
    generated: reports.length,
    scheduled: 0, // TODO: Add scheduled reports
    thisMonth: reports.filter(report => {
      const reportDate = new Date(report.generated_at);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'generated', label: 'Generated', icon: Download },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate, schedule, and manage comprehensive reports for your school
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.templates || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.generated || 0}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.scheduled || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.thisMonth || 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader title="Report Management" />
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <ReportDashboard />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <ReportTemplates />
            </TabsContent>

            <TabsContent value="generated" className="mt-6">
              <GeneratedReports />
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              <ScheduledReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Report Modal */}
      <CreateReportModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default ReportsPage;
