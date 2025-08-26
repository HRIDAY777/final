import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useLearningStats, useEnrollments, useCourses } from '@/hooks/useElearning';
import {
  BookOpen,
  PlayCircle,
  Users,
  Award,
  Clock,
  Star,
  CheckCircle,
  Calendar,
  Target,
  Trophy,
  Zap
} from 'lucide-react';

const ELearningPage: React.FC = () => {
  const { stats, loading: statsLoading } = useLearningStats();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { courses, loading: coursesLoading } = useCourses();
  const [activeTab, setActiveTab] = useState('dashboard');

  const loading = statsLoading || enrollmentsLoading || coursesLoading;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Learning Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and continue your learning journey
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Browse All Courses
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.enrolled_courses}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed_courses}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTimeSpent(stats.total_time_spent)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.certificates_earned}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: 'Learning Dashboard', icon: BookOpen },
            { id: 'courses', label: 'All Courses', icon: PlayCircle },
            { id: 'progress', label: 'My Progress', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Courses */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Recent Courses" />
                <div>
                  {enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.slice(0, 3).map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{enrollment.course.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {enrollment.completed_lessons}/{enrollment.total_lessons} lessons completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.progress.toFixed(0)}%</div>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-300" 
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No courses enrolled yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Start your learning journey by enrolling in a course
                      </p>
                      <Button>Browse Courses</Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Weekly Goal Progress */}
              {stats && (
                <Card>
                  <CardHeader title="Weekly Learning Goal" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.weekly_progress}/{stats.weekly_goal} hours
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 transition-all duration-300" 
                        style={{ width: `${(stats.weekly_progress / stats.weekly_goal) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Zap className="h-4 w-4" />
                      <span>Current streak: {stats.current_streak} days</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader title="Quick Actions" />
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    View Certificates
                  </Button>
                </div>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader title="Upcoming Deadlines" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">JavaScript Quiz</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due in 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Science Assignment</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due in 5 days</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Learning Stats */}
              {stats && (
                <Card>
                  <CardHeader title="Learning Stats" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{stats.average_score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {((stats.completed_courses / stats.enrolled_courses) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Study Streak</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{stats.current_streak} days</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs rounded-md ${
                      course.is_free 
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {course.is_free ? 'Free' : `$${course.price.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-white/80 text-gray-800">
                      {course.level}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {course.short_description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(course.total_duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolled_students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">By {course.instructor.full_name}</span>
                    </div>
                    <Button variant="outline" className="text-sm px-3 py-1">
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <Card>
            <CardHeader title="My Learning Progress" />
            <div>
              {enrollments.length > 0 ? (
                <div className="space-y-6">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{enrollment.course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Started {new Date(enrollment.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          enrollment.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {enrollment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-gray-100">{enrollment.progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300" 
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Lessons completed:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                              {enrollment.completed_lessons}/{enrollment.total_lessons}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Time spent:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                              {formatTimeSpent(enrollment.time_spent)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="text-sm px-3 py-1">Continue Learning</Button>
                          <Button variant="outline" className="text-sm px-3 py-1">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No progress to show</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enroll in a course to start tracking your progress
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'achievements' && (
          <Card>
            <CardHeader title="Achievements & Certificates" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock achievements */}
              <div className="text-center p-6 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">First Course Completed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Completed your first course successfully
                </p>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Earned</span>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">7-Day Streak</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Studied for 7 consecutive days
                </p>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Earned</span>
              </div>

              <div className="text-center p-6 border rounded-lg opacity-50">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Perfect Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get 100% on any quiz
                </p>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-500">Locked</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ELearningPage;
