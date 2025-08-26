from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta
import uuid

from .models import (
    Course, Lesson, Enrollment, LessonProgress, Quiz, QuizAttempt,
    CourseReview, Certificate, Discussion, CourseCategory
)
from .serializers import (
    CourseSerializer, CourseDetailSerializer, CourseCreateSerializer,
    LessonSerializer, LessonCreateSerializer, LessonProgressSerializer,
    LessonProgressUpdateSerializer, EnrollmentSerializer,
    EnrollmentCreateSerializer, QuizSerializer, QuizAttemptSerializer,
    QuizAttemptCreateSerializer, CourseReviewSerializer,
    CourseReviewCreateSerializer, CertificateSerializer,
    DiscussionSerializer, DiscussionCreateSerializer,
    CourseCategorySerializer, ELearningDashboardSerializer,
    CourseAnalyticsSerializer, StudentProgressSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing courses"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'is_published', 'is_featured', 'instructor']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['created_at', 'enrolled_students', 'average_rating', 'price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Only show published courses in list view
            queryset = queryset.filter(is_published=True)
        return queryset

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Get courses created by the current user (instructor)"""
        courses = self.get_queryset().filter(instructor=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def enrolled_courses(self, request):
        """Get courses where the current user is enrolled"""
        enrollments = Enrollment.objects.filter(student=request.user)
        courses = Course.objects.filter(enrollments__in=enrollments)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll current user in a course"""
        course = self.get_object()
        serializer = EnrollmentCreateSerializer(
            data={'course': course.id},
            context={'request': request}
        )
        
        if serializer.is_valid():
            enrollment = serializer.save()
            return Response({
                'message': 'Successfully enrolled in course',
                'enrollment_id': enrollment.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get analytics for a specific course"""
        course = self.get_object()
        
        # Calculate analytics
        enrollments_count = course.enrollments.count()
        completed_enrollments = course.enrollments.filter(status='completed').count()
        completion_rate = (completed_enrollments / enrollments_count * 100) if enrollments_count > 0 else 0
        
        # Revenue calculation
        total_revenue = course.enrollments.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        # Lesson completion data
        lesson_completion_data = []
        for lesson in course.lessons.all():
            completed_count = lesson.progress.filter(status='completed').count()
            lesson_completion_data.append({
                'lesson_id': lesson.id,
                'lesson_title': lesson.title,
                'completed_count': completed_count,
                'total_enrolled': enrollments_count,
                'completion_rate': (completed_count / enrollments_count * 100) if enrollments_count > 0 else 0
            })
        
        data = {
            'course_id': course.id,
            'course_title': course.title,
            'enrollments_count': enrollments_count,
            'completion_rate': completion_rate,
            'average_rating': course.average_rating,
            'revenue': total_revenue,
            'lesson_completion_data': lesson_completion_data
        }
        
        serializer = CourseAnalyticsSerializer(data)
        return Response(serializer.data)


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet for managing lessons"""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'lesson_type', 'is_free']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'create':
            return LessonCreateSerializer
        return LessonSerializer

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Mark a lesson as completed for the current user"""
        lesson = self.get_object()
        user = request.user
        
        # Get user's enrollment in this course
        enrollment = Enrollment.objects.filter(
            student=user, course=lesson.course
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'You must be enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create lesson progress
        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'status': 'not_started'}
        )
        
        # Update progress
        serializer = LessonProgressUpdateSerializer(
            progress,
            data={'status': 'completed'},
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Update enrollment progress
            completed_lessons = enrollment.lesson_progress.filter(
                status='completed'
            ).count()
            total_lessons = lesson.course.total_lessons
            enrollment.progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            enrollment.completed_lessons = completed_lessons
            enrollment.save()
            
            return Response({'message': 'Lesson marked as completed'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing enrollments"""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'student', 'status', 'payment_status']
    ordering_fields = ['started_at', 'completed_at', 'progress']
    ordering = ['-started_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Users can only see their own enrollments
            queryset = queryset.filter(student=self.request.user)
        return queryset

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark enrollment as completed"""
        enrollment = self.get_object()
        
        if enrollment.student != request.user:
            return Response(
                {'error': 'You can only complete your own enrollments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment.status = 'completed'
        enrollment.completed_at = timezone.now()
        enrollment.save()
        
        # Generate certificate
        certificate, created = Certificate.objects.get_or_create(
            enrollment=enrollment,
            defaults={
                'student': enrollment.student,
                'course': enrollment.course,
                'certificate_number': f"CERT-{uuid.uuid4().hex[:8].upper()}",
                'completion_date': enrollment.completed_at,
                'verification_code': uuid.uuid4().hex
            }
        )
        
        return Response({
            'message': 'Course completed successfully',
            'certificate_id': certificate.id
        })


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quizzes"""
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lesson', 'lesson__course']

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        """Submit a quiz attempt"""
        quiz = self.get_object()
        user = request.user
        
        # Get user's enrollment
        enrollment = Enrollment.objects.filter(
            student=user, course=quiz.lesson.course
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'You must be enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check attempt limit
        existing_attempts = QuizAttempt.objects.filter(
            enrollment=enrollment, quiz=quiz
        ).count()
        
        if existing_attempts >= quiz.max_attempts:
            return Response(
                {'error': 'Maximum attempts reached for this quiz'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create attempt
        serializer = QuizAttemptCreateSerializer(
            data={
                'quiz': quiz.id,
                'answers': request.data.get('answers', {})
            },
            context={'enrollment': enrollment}
        )
        
        if serializer.is_valid():
            attempt = serializer.save()
            
            # Update lesson progress if quiz passed
            if attempt.passed:
                progress, created = LessonProgress.objects.get_or_create(
                    enrollment=enrollment,
                    lesson=quiz.lesson,
                    defaults={'status': 'not_started'}
                )
                progress.status = 'completed'
                progress.quiz_passed = True
                progress.quiz_score = attempt.score
                progress.save()
            
            return Response({
                'attempt_id': attempt.id,
                'score': attempt.score,
                'passed': attempt.passed,
                'correct_answers': attempt.correct_answers,
                'total_questions': attempt.total_questions
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing course reviews"""
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'student', 'rating', 'is_approved']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return CourseReviewCreateSerializer
        return CourseReviewSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Only show approved reviews
            queryset = queryset.filter(is_approved=True)
        return queryset


class DiscussionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing course discussions"""
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'author', 'is_pinned', 'is_resolved']
    ordering_fields = ['created_at', 'views', 'likes']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return DiscussionCreateSerializer
        return DiscussionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Only show top-level discussions
            queryset = queryset.filter(parent__isnull=True)
        return queryset

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a discussion"""
        discussion = self.get_object()
        discussion.likes += 1
        discussion.save()
        return Response({'message': 'Discussion liked successfully'})

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """Increment view count"""
        discussion = self.get_object()
        discussion.views += 1
        discussion.save()
        return Response({'message': 'View count updated'})


class ELearningDashboardViewSet(viewsets.ViewSet):
    """ViewSet for E-learning dashboard analytics"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get E-learning dashboard overview"""
        user = request.user
        
        # Calculate statistics
        total_courses = Course.objects.filter(is_published=True).count()
        total_students = User.objects.filter(enrollments__isnull=False).distinct().count()
        total_enrollments = Enrollment.objects.count()
        
        # Revenue calculation
        total_revenue = Enrollment.objects.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        # Average completion rate
        completed_enrollments = Enrollment.objects.filter(status='completed').count()
        average_completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        
        # Popular courses
        popular_courses = Course.objects.annotate(
            enrollment_count=Count('enrollments')
        ).order_by('-enrollment_count')[:5]
        
        # Recent enrollments
        recent_enrollments = Enrollment.objects.select_related(
            'student', 'course'
        ).order_by('-started_at')[:10]
        
        # Top instructors
        top_instructors = User.objects.annotate(
            course_count=Count('courses_created'),
            total_students=Sum('courses_created__enrolled_students')
        ).filter(course_count__gt=0).order_by('-total_students')[:5]
        
        data = {
            'total_courses': total_courses,
            'total_students': total_students,
            'total_enrollments': total_enrollments,
            'total_revenue': total_revenue,
            'average_completion_rate': average_completion_rate,
            'popular_courses': [
                {
                    'id': course.id,
                    'title': course.title,
                    'enrollment_count': course.enrollment_count
                }
                for course in popular_courses
            ],
            'recent_enrollments': [
                {
                    'id': enrollment.id,
                    'student_name': enrollment.student.get_full_name(),
                    'course_title': enrollment.course.title,
                    'started_at': enrollment.started_at
                }
                for enrollment in recent_enrollments
            ],
            'top_instructors': [
                {
                    'id': instructor.id,
                    'name': instructor.get_full_name(),
                    'course_count': instructor.course_count,
                    'total_students': instructor.total_students or 0
                }
                for instructor in top_instructors
            ]
        }
        
        serializer = ELearningDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def student_progress(self, request):
        """Get current user's learning progress"""
        user = request.user
        
        enrollments = Enrollment.objects.filter(student=user)
        enrolled_courses = enrollments.count()
        completed_courses = enrollments.filter(status='completed').count()
        
        # Total time spent
        total_time_spent = enrollments.aggregate(
            total=Sum('time_spent')
        )['total'] or 0
        
        # Average quiz score
        quiz_attempts = QuizAttempt.objects.filter(enrollment__student=user)
        average_score = quiz_attempts.aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        # Certificates earned
        certificates_earned = Certificate.objects.filter(student=user).count()
        
        data = {
            'student_id': user.id,
            'student_name': user.get_full_name(),
            'enrolled_courses': enrolled_courses,
            'completed_courses': completed_courses,
            'total_time_spent': total_time_spent,
            'average_score': average_score,
            'certificates_earned': certificates_earned
        }
        
        serializer = StudentProgressSerializer(data)
        return Response(serializer.data)
