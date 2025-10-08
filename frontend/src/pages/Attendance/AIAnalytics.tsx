import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  AcademicCapIcon,
  DocumentChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface TrendAnalysis {
  id: string;
  studentName: string;
  class: string;
  trend: 'improving' | 'declining' | 'stable';
  attendanceRate: number;
  previousRate: number;
  change: number;
  pattern: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface PredictiveInsight {
  id: string;
  type: 'dropout_risk' | 'engagement_risk' | 'performance_impact' | 'attendance_pattern';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedStudents: number;
  recommendations: string[];
  predictedOutcome: string;
}

interface AttendancePattern {
  id: string;
  pattern: string;
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  students: string[];
  suggestions: string[];
}

interface PerformanceCorrelation {
  id: string;
  subject: string;
  attendanceRate: number;
  averageGrade: number;
  correlation: number;
  trend: 'positive' | 'negative' | 'neutral';
  insights: string[];
}

const AIAnalytics: React.FC = () => {
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [attendancePatterns, setAttendancePatterns] = useState<AttendancePattern[]>([]);
  const [performanceCorrelations, setPerformanceCorrelations] = useState<PerformanceCorrelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'predictions' | 'patterns' | 'performance'>('trends');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  // Mock data for demonstration
  useEffect(() => {
    const mockTrendAnalysis: TrendAnalysis[] = [
      {
        id: '1',
        studentName: 'Ahmed Khan',
        class: 'Class 10A',
        trend: 'declining',
        attendanceRate: 78.5,
        previousRate: 85.2,
        change: -6.7,
        pattern: 'Consistent late arrivals on Mondays and Fridays',
        riskLevel: 'medium',
        recommendations: [
          'Schedule parent-teacher meeting',
          'Implement attendance incentives',
          'Monitor Monday/Friday attendance closely'
        ]
      },
      {
        id: '2',
        studentName: 'Fatima Rahman',
        class: 'Class 8B',
        trend: 'improving',
        attendanceRate: 92.3,
        previousRate: 88.1,
        change: 4.2,
        pattern: 'Improved punctuality after implementing reward system',
        riskLevel: 'low',
        recommendations: [
          'Continue positive reinforcement',
          'Share success with parents',
          'Consider peer mentoring opportunities'
        ]
      },
      {
        id: '3',
        studentName: 'Mohammed Ali',
        class: 'Class 9C',
        trend: 'declining',
        attendanceRate: 65.8,
        previousRate: 72.4,
        change: -6.6,
        pattern: 'Increasing absences, especially in morning classes',
        riskLevel: 'high',
        recommendations: [
          'Immediate intervention required',
          'Schedule counseling session',
          'Contact parents urgently',
          'Consider academic support'
        ]
      }
    ];

    const mockPredictiveInsights: PredictiveInsight[] = [
      {
        id: '1',
        type: 'dropout_risk',
        title: 'High Dropout Risk Detected',
        description: '3 students showing patterns consistent with potential dropout risk within the next 6 months',
        confidence: 87.5,
        severity: 'high',
        affectedStudents: 3,
        recommendations: [
          'Implement early intervention programs',
          'Schedule individual counseling sessions',
          'Engage parents in support programs',
          'Provide academic and social support'
        ],
        predictedOutcome: 'Potential dropout within 6 months if no intervention'
      },
      {
        id: '2',
        type: 'engagement_risk',
        title: 'Declining Engagement Trend',
        description: '15% of students showing signs of declining academic engagement',
        confidence: 76.2,
        severity: 'medium',
        affectedStudents: 12,
        recommendations: [
          'Review curriculum engagement',
          'Implement interactive learning methods',
          'Provide additional academic support',
          'Encourage extracurricular participation'
        ],
        predictedOutcome: 'Continued decline in academic performance'
      },
      {
        id: '3',
        type: 'performance_impact',
        title: 'Attendance-Performance Correlation',
        description: 'Strong correlation between attendance and academic performance identified',
        confidence: 94.1,
        severity: 'low',
        affectedStudents: 45,
        recommendations: [
          'Emphasize attendance importance',
          'Implement attendance-based incentives',
          'Regular attendance monitoring',
          'Parent communication about attendance impact'
        ],
        predictedOutcome: 'Improved academic outcomes with better attendance'
      }
    ];

    const mockAttendancePatterns: AttendancePattern[] = [
      {
        id: '1',
        pattern: 'Monday Absence Syndrome',
        description: 'Students are 40% more likely to be absent on Mondays',
        frequency: 23,
        impact: 'negative',
        students: ['Ahmed Khan', 'Mohammed Ali', 'Sarah Johnson', 'David Brown'],
        suggestions: [
          'Implement Monday motivation programs',
          'Schedule important activities on Mondays',
          'Provide Monday-specific incentives'
        ]
      },
      {
        id: '2',
        pattern: 'Post-Holiday Absence',
        description: 'Increased absences following school holidays',
        frequency: 15,
        impact: 'negative',
        students: ['Fatima Rahman', 'Emily Davis', 'Michael Wilson'],
        suggestions: [
          'Send pre-holiday reminders',
          'Implement post-holiday check-ins',
          'Provide holiday homework incentives'
        ]
      },
      {
        id: '3',
        pattern: 'Subject-Specific Attendance',
        description: 'Higher attendance in practical subjects vs theoretical subjects',
        frequency: 31,
        impact: 'positive',
        students: ['All students'],
        suggestions: [
          'Incorporate more practical elements in theoretical subjects',
          'Use hands-on learning methods',
          'Implement project-based learning'
        ]
      }
    ];

    const mockPerformanceCorrelations: PerformanceCorrelation[] = [
      {
        id: '1',
        subject: 'Mathematics',
        attendanceRate: 89.2,
        averageGrade: 78.5,
        correlation: 0.87,
        trend: 'positive',
        insights: [
          'Strong positive correlation between attendance and grades',
          'Students with 90%+ attendance achieve 15% higher grades',
          'Regular attendance crucial for mathematical concept building'
        ]
      },
      {
        id: '2',
        subject: 'Science',
        attendanceRate: 85.7,
        averageGrade: 82.1,
        correlation: 0.79,
        trend: 'positive',
        insights: [
          'Practical sessions significantly impact performance',
          'Lab attendance correlates strongly with exam scores',
          'Hands-on learning improves retention'
        ]
      },
      {
        id: '3',
        subject: 'English',
        attendanceRate: 91.3,
        averageGrade: 75.8,
        correlation: 0.65,
        trend: 'neutral',
        insights: [
          'Moderate correlation between attendance and performance',
          'Self-study plays significant role in English',
          'Regular practice more important than just attendance'
        ]
      }
    ];

    setTimeout(() => {
      setTrendAnalysis(mockTrendAnalysis);
      setPredictiveInsights(mockPredictiveInsights);
      setAttendancePatterns(mockAttendancePatterns);
      setPerformanceCorrelations(mockPerformanceCorrelations);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      improving: <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />,
      declining: <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />,
      stable: <MinusIcon className="h-5 w-5 text-gray-600" />
    };
    return icons[trend as keyof typeof icons];
  };

  const getImpactIcon = (impact: string) => {
    const icons = {
      positive: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
      negative: <XCircleIcon className="h-5 w-5 text-red-600" />,
      neutral: <MinusIcon className="h-5 w-5 text-gray-600" />
    };
    return icons[impact as keyof typeof icons];
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced attendance analytics powered by artificial intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
          </select>
          <Button className="flex items-center gap-2">
            <DocumentChartBarIcon className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'trends', label: 'Trend Analysis', icon: ChartBarIcon },
            { id: 'predictions', label: 'Predictive Insights', icon: LightBulbIcon },
            { id: 'patterns', label: 'Attendance Patterns', icon: BeakerIcon },
            { id: 'performance', label: 'Performance Correlation', icon: AcademicCapIcon }
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
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {trendAnalysis.map((trend) => (
              <Card key={trend.id}>
                <CardHeader 
                  title={trend.studentName}
                  right={
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(trend.riskLevel)}`}>
                      {trend.riskLevel} risk
                    </span>
                  }
                />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {getTrendIcon(trend.trend)}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{trend.attendanceRate}%</p>
                      <p className="text-sm text-gray-600">
                        {trend.change > 0 ? '+' : ''}{trend.change}% from previous period
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Pattern Identified:</p>
                    <p className="text-sm text-gray-900">{trend.pattern}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">AI Recommendations:</p>
                    <ul className="space-y-1">
                      {trend.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {predictiveInsights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader 
                title={insight.title}
                right={
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(insight.severity)}`}>
                      {insight.severity} severity
                    </span>
                    <span className="text-sm text-gray-600">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <p className="text-gray-700 mb-4">{insight.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations:</h4>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Predicted Outcome:</h4>
                    <p className="text-sm text-gray-700 mb-4">{insight.predictedOutcome}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Affected Students:</p>
                      <p className="text-lg font-semibold text-gray-900">{insight.affectedStudents}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {attendancePatterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader 
                  title={pattern.pattern}
                  right={
                    <div className="flex items-center gap-2">
                      {getImpactIcon(pattern.impact)}
                      <span className="text-sm text-gray-600">
                        {pattern.frequency} occurrences
                      </span>
                    </div>
                  }
                />
                <div className="p-4">
                  <p className="text-gray-700 mb-4">{pattern.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Affected Students:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.students.map((student, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {student}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">AI Suggestions:</p>
                    <ul className="space-y-1">
                      {pattern.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceCorrelations.map((correlation) => (
              <Card key={correlation.id}>
                <CardHeader 
                  title={correlation.subject}
                  right={
                    <div className="flex items-center gap-2">
                      {getTrendIcon(correlation.trend)}
                      <span className="text-sm text-gray-600">
                        r = {correlation.correlation}
                      </span>
                    </div>
                  }
                />
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{correlation.attendanceRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Grade</p>
                      <p className="text-2xl font-bold text-gray-900">{correlation.averageGrade}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">AI Insights:</p>
                    <ul className="space-y-1">
                      {correlation.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;
