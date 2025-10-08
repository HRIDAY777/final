import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/UI/Select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  DollarSign,
  Calendar,
  PieChart,
  Activity,
  Target,
  Award
} from 'lucide-react';

// Mock data for charts (replace with real API calls)
const mockChartData = {
  studentPerformance: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Score',
        data: [75, 78, 82, 79, 85, 88],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Target Score',
        data: [80, 80, 80, 80, 80, 80],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  },
  attendanceTrends: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Present',
        data: [95, 92, 88, 94],
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'Absent',
        data: [5, 8, 12, 6],
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      }
    ]
  },
  subjectPerformance: {
    labels: ['Math', 'Science', 'English', 'History', 'Art'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 82, 75, 88],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  },
  enrollmentTrends: {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Total Students',
        data: [1200, 1250, 1180, 1320, 1400, 1450],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  },
  financialOverview: {
    labels: ['Tuition', 'Transport', 'Library', 'Sports', 'Technology'],
    datasets: [
      {
        label: 'Revenue',
        data: [450000, 80000, 25000, 35000, 60000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  }
};

const Charts: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('performance');
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(false);

  const chartTypes = [
    { id: 'performance', label: 'Student Performance', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance Trends', icon: Calendar },
    { id: 'subjects', label: 'Subject Performance', icon: BookOpen },
    { id: 'enrollment', label: 'Enrollment Trends', icon: Users },
    { id: 'financial', label: 'Financial Overview', icon: DollarSign }
  ];



  const getChartData = () => {
    switch (selectedChart) {
      case 'performance':
        return mockChartData.studentPerformance;
      case 'attendance':
        return mockChartData.attendanceTrends;
      case 'subjects':
        return mockChartData.subjectPerformance;
      case 'enrollment':
        return mockChartData.enrollmentTrends;
      case 'financial':
        return mockChartData.financialOverview;
      default:
        return mockChartData.studentPerformance;
    }
  };





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Charts</h1>
          <p className="text-gray-600 mt-2">
            Interactive visualizations and data insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setLoading(true)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <Card>
        <CardHeader title="Chart Types" />
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {chartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedChart === chart.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-6 h-6 ${
                      selectedChart === chart.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedChart === chart.id ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {chart.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader 
          title={`${chartTypes.find(c => c.id === selectedChart)?.label} Chart`}
          right={
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
            </div>
          }
        />
        <div className="p-6">
          <div className="h-96 relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Chart visualization would be rendered here using Chart.js or similar library
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Data: {JSON.stringify(getChartData(), null, 2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader 
            title="Key Insights"
            right={<TrendingUp className="w-4 h-4" />}
          />
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Score</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">85.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Improvement</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">+5.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target Met</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Yes</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="Performance Goals"
            right={<Target className="w-4 h-4" />}
          />
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target Score</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">80%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">85.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gap</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">+5.2%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="Top Performers"
            right={<Award className="w-4 h-4" />}
          />
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Math</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Science</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">English</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">85%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Subject Distribution"
            right={<PieChart className="w-5 h-5" />}
          />
          <div className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Pie chart visualization</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="Trend Analysis"
            right={<Activity className="w-5 h-5" />}
          />
          <div className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Trend analysis chart</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Charts;


