import React, { useState, useEffect } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';

const Dashboard: React.FC = () => {
  const {
    dashboards: analyticsDashboards,
    dashboardsLoading: analyticsDashboardsLoading,
    dashboardsError: analyticsDashboardsError,
    fetchDashboards,
    getStudentPerformance,
    getAttendanceAnalytics,
    getExamTrends,
    getFinancialSummary,
    clearErrors
  } = useAnalyticsStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    fetchDashboards();
    loadDashboardData();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (analyticsDashboardsError) {
      setTimeout(() => clearErrors(), 5000);
    }
  }, [analyticsDashboardsError]);

  const loadDashboardData = async () => {
    try {
      const [performance, attendance, exams, financial] = await Promise.all([
        getStudentPerformance(1, { time_range: selectedTimeRange }), // Using student ID 1 as default
        getAttendanceAnalytics({ time_range: selectedTimeRange }),
        getExamTrends({ time_range: selectedTimeRange }),
        getFinancialSummary({ time_range: selectedTimeRange })
      ]);

      setPerformanceData(performance);
      setAttendanceData(attendance);
      setExamData(exams);
      setFinancialData(financial);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (analyticsDashboardsLoading && !analyticsDashboards) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {analyticsDashboardsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {analyticsDashboardsError}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData?.total_students ? formatNumber(performanceData.total_students) : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceData?.average_attendance ? formatPercentage(attendanceData.average_attendance) : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData?.average_grade ? `${performanceData.average_grade.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {financialData?.total_revenue ? formatCurrency(financialData.total_revenue) : '$0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {performanceData?.trends ? (
              <div className="text-center">
                <p className="text-sm text-gray-500">Performance data visualization</p>
                <p className="text-xs text-gray-400">Chart component would be rendered here</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {attendanceData?.overview ? (
              <div className="text-center">
                <p className="text-sm text-gray-500">Attendance data visualization</p>
                <p className="text-xs text-gray-400">Chart component would be rendered here</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No attendance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Students */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            {performanceData?.top_students?.slice(0, 5).map((student: any, index: number) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.grade}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">{student.average_score}%</span>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exam Results</h3>
          <div className="space-y-3">
            {examData?.recent_exams?.slice(0, 5).map((exam: any) => (
              <div key={exam.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{exam.name}</p>
                  <p className="text-xs text-gray-500">{exam.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{exam.average_score}%</p>
                  <p className="text-xs text-gray-500">{exam.participants} students</p>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-semibold text-green-600">
                {financialData?.total_revenue ? formatCurrency(financialData.total_revenue) : '$0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Expenses</span>
              <span className="text-sm font-semibold text-red-600">
                {financialData?.total_expenses ? formatCurrency(financialData.total_expenses) : '$0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Profit</span>
              <span className={`text-sm font-semibold ${
                financialData?.net_profit && financialData.net_profit > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {financialData?.net_profit ? formatCurrency(financialData.net_profit) : '$0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Outstanding Fees</span>
              <span className="text-sm font-semibold text-yellow-600">
                {financialData?.outstanding_fees ? formatCurrency(financialData.outstanding_fees) : '$0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Generate Report
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Insights
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
