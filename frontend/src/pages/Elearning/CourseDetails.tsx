import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/Tabs';
import Progress from '@/components/UI/Progress';
import { useCourseDetails, useEnrollments } from '@/hooks/useElearning';
import { 
  Clock, 
  Star, 
  PlayCircle, 
  CheckCircle, 
  Lock,
  ArrowLeft,
  Award,
  FileText,
  Video,
  MessageSquare
} from 'lucide-react';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, lessons, loading, error } = useCourseDetails(courseId || '');
  const { enrollments, enrollInCourse } = useEnrollments();
  const [activeTab, setActiveTab] = useState('overview');

  const enrollment = enrollments.find(e => e.course.id === courseId);
  const isEnrolled = !!enrollment;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const handleEnroll = async () => {
    if (!courseId) return;
    
    const result = await enrollInCourse();
    if (result.success) {
      // Handle successful enrollment
      console.log('Successfully enrolled in course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading course: {error || 'Course not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            By {course.instructor.full_name} • {course.category} • {course.level}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Video/Image */}
          <Card>
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
              {course.video_intro && (
                <video
                  src={course.video_intro}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
              {course.thumbnail && !course.video_intro && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Preview Course
                </Button>
              </div>
            </div>
          </Card>

          {/* Course Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this course</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">What you&apos;ll learn</h3>
                  <ul className="space-y-2">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Target audience</h3>
                  <p className="text-sm text-muted-foreground">{course.target_audience}</p>
                </div>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Course Content ({course.total_lessons} lessons)
                  </h3>
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {lesson.is_free ? (
                              <PlayCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">
                              {index + 1}. {lesson.title}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDuration(lesson.video_duration)}</span>
                          {lesson.lesson_type === 'quiz' && (
                            <Badge variant="outline">Quiz</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Student Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({course.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">Reviews will be displayed here...</p>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {course.instructor.first_name[0]}{course.instructor.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{course.instructor.full_name}</h3>
                    <p className="text-muted-foreground">{course.instructor.email}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Expert instructor with years of experience in {course.category}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">
                  {formatPrice(course.price, course.is_free)}
                </div>
                {course.discount_price && (
                  <div className="text-sm text-muted-foreground line-through">
                    ${course.price.toFixed(2)}
                  </div>
                )}
              </div>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{enrollment.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>
                  <Button className="w-full" onClick={() => setActiveTab('curriculum')}>
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleEnroll}>
                  {course.is_free ? 'Enroll for Free' : 'Enroll Now'}
                </Button>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                30-Day Money-Back Guarantee
              </div>
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardHeader title="This course includes" />
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDuration(course.total_duration)} of content</span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Downloadable resources</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Certificate of completion</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Full lifetime access</span>
              </div>
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{course.enrolled_students.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Students enrolled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{course.completion_rate.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Completion rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;


