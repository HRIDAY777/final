import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/UI/Select';

// Simple Input component for this file
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ 
  className = '', 
  ...props 
}) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);

// Simple Table components for this file
const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <table className={`w-full ${className}`}>{children}</table>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-200">{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>
);

const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>{children}</td>
);

// Simple Dropdown components for this file
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">{children}</div>
);

const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <button className={`p-2 rounded-md hover:bg-gray-100 ${className}`}>{children}</button>
);

const DropdownMenuContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border ${className}`}>{children}</div>
);

const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
  >
    {children}
  </button>
);
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Users, 
  TrendingUp,
  DollarSign,
  BookOpen,
  Clock,
  MoreHorizontal,
  Search,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Download as DownloadIcon,
  Share2,
  Printer,
  Mail
} from 'lucide-react';

// Mock data for reports
const mockReports = [
  {
    id: '1',
    title: 'Student Performance Report',
    description: 'Comprehensive analysis of student academic performance',
    type: 'performance',
    category: 'academic',
    lastGenerated: '2024-01-22',
    status: 'completed',
    size: '2.4 MB',
    icon: TrendingUp
  },
  {
    id: '2',
    title: 'Attendance Summary Report',
    description: 'Monthly attendance statistics and trends',
    type: 'attendance',
    category: 'academic',
    lastGenerated: '2024-01-21',
    status: 'completed',
    size: '1.8 MB',
    icon: Calendar
  },
  {
    id: '3',
    title: 'Financial Revenue Report',
    description: 'Detailed financial analysis and revenue breakdown',
    type: 'financial',
    category: 'financial',
    lastGenerated: '2024-01-20',
    status: 'completed',
    size: '3.2 MB',
    icon: DollarSign
  },
  {
    id: '4',
    title: 'Enrollment Trends Report',
    description: 'Student enrollment patterns and projections',
    type: 'enrollment',
    category: 'academic',
    lastGenerated: '2024-01-19',
    status: 'processing',
    size: '1.5 MB',
    icon: Users
  },
  {
    id: '5',
    title: 'Subject Performance Analysis',
    description: 'Subject-wise performance comparison and insights',
    type: 'subjects',
    category: 'academic',
    lastGenerated: '2024-01-18',
    status: 'completed',
    size: '2.1 MB',
    icon: BookOpen
  },
  {
    id: '6',
    title: 'System Usage Analytics',
    description: 'Platform usage statistics and user engagement',
    type: 'usage',
    category: 'system',
    lastGenerated: '2024-01-17',
    status: 'completed',
    size: '1.9 MB',
    icon: Clock
  }
];

const reportTemplates = [
  {
    id: 'template-1',
    title: 'Monthly Academic Report',
    description: 'Standard monthly academic performance report',
    category: 'academic',
    estimatedTime: '5 min',
    icon: FileText
  },
  {
    id: 'template-2',
    title: 'Quarterly Financial Summary',
    description: 'Comprehensive quarterly financial analysis',
    category: 'financial',
    estimatedTime: '8 min',
    icon: DollarSign
  },
  {
    id: 'template-3',
    title: 'Annual Enrollment Report',
    description: 'Yearly enrollment trends and projections',
    category: 'academic',
    estimatedTime: '10 min',
    icon: Users
  },
  {
    id: 'template-4',
    title: 'Custom Performance Report',
    description: 'Customizable performance analysis report',
    category: 'academic',
    estimatedTime: '15 min',
    icon: TrendingUp
  }
];

const Reports: React.FC = () => {
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'academic', label: 'Academic' },
    { id: 'financial', label: 'Financial' },
    { id: 'system', label: 'System' }
  ];

  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'completed', label: 'Completed' },
    { id: 'processing', label: 'Processing' },
    { id: 'failed', label: 'Failed' }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
      setShowGenerateModal(false);
      // Add new report to list
      const newReport = {
        id: Date.now().toString(),
        title: `Generated Report ${Date.now()}`,
        description: 'Newly generated report',
        type: 'custom',
        category: 'academic',
        lastGenerated: new Date().toISOString().split('T')[0],
        status: 'completed',
        size: '1.2 MB',
        icon: FileText
      };
      setReports([newReport, ...reports]);
    }, 3000);
  };

  const handleExportReport = (reportId: string, format: string) => {
    console.log(`Exporting report ${reportId} in ${format} format`);
    // Implement actual export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate, view, and export comprehensive analytical reports
          </p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader title="Report Templates" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{template.title}</h3>
                      <p className="text-sm text-gray-500">{template.estimatedTime}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader title={`Generated Reports (${filteredReports.length})`} />
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const Icon = report.icon;
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(report.category)}>
                        {report.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(report.lastGenerated).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">{report.size}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0">
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReport(report.id, 'pdf')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReport(report.id, 'excel')}>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Export Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Generate your first report to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'processing').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => {
                    const reportDate = new Date(r.lastGenerated);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader title="Generate New Report" />
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Select a report template to generate a new analytical report.
              </p>
              <div className="space-y-2">
                {reportTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={loading}
                  >
                    <template.icon className="w-4 h-4 mr-2" />
                    {template.title}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;


