from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import (
    Course, Lesson, Grade
)
from apps.teachers.models import Teacher
from apps.students.models import Student
from apps.classes.models import Class
from .serializers import (
    ClassSerializer, TeacherSerializer,
    TeacherCreateSerializer, StudentSerializer, StudentCreateSerializer,
    CourseSerializer, CourseCreateSerializer, LessonSerializer,
    LessonCreateSerializer, GradeSerializer, GradeCreateSerializer,
    ClassDashboardSerializer, StudentPerformanceSerializer
)
from apps.assignments.serializers import (
    AssignmentSerializer, AssignmentSubmissionSerializer
)


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['academic_year', 'is_active']
    search_fields = ['name', 'section']
    ordering_fields = ['name', 'academic_year', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'create':
            return ClassSerializer
        return ClassSerializer

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get dashboard data for a specific class"""
        class_obj = self.get_object()
        serializer = ClassDashboardSerializer(class_obj)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students in a class"""
        class_obj = self.get_object()
        students = class_obj.students.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        """Get all courses in a class"""
        class_obj = self.get_object()
        courses = class_obj.courses.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def performance_summary(self, request, pk=None):
        """Get performance summary for a class"""
        class_obj = self.get_object()

        # Get average grades for the class
        grades = Grade.objects.filter(student__class_enrolled=class_obj)
        avg_percentage = grades.aggregate(avg=Avg('percentage'))['avg'] or 0

        # Get grade distribution
        grade_distribution = grades.values('grade').annotate(
            count=Count('grade')
        )

        # Get top performers
        top_students = class_obj.students.annotate(
            avg_percentage=Avg('grades__percentage')
        ).order_by('-avg_percentage')[:5]

        return Response({
            'class_name': class_obj.name,
            'total_students': class_obj.students.count(),
            'average_percentage': round(avg_percentage, 2),
            'grade_distribution': grade_distribution,
            'top_students': StudentPerformanceSerializer(
                top_students, many=True
            ).data
        })


# SubjectViewSet moved to apps.subjects


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['department', 'is_active']
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email', 'teacher_id'
    ]
    ordering_fields = ['user__first_name', 'user__last_name', 'joining_date']
    ordering = ['user__first_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherSerializer

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        """Get all courses taught by a teacher"""
        teacher = self.get_object()
        courses = teacher.courses.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def performance_summary(self, request, pk=None):
        """Get performance summary for a teacher's courses"""
        teacher = self.get_object()

        # Get average grades for all courses taught by this teacher
        grades = Grade.objects.filter(course__teacher=teacher)
        avg_percentage = grades.aggregate(avg=Avg('percentage'))['avg'] or 0

        # Get course-wise performance
        course_performance = teacher.courses.annotate(
            avg_percentage=Avg('grades__percentage'),
            total_students=Count('grades__student', distinct=True)
        )

        return Response({
            'teacher_name': teacher.full_name,
            'total_courses': teacher.courses.count(),
            'average_percentage': round(avg_percentage, 2),
            'course_performance': [
                {
                    'course': course.subject.name,
                    'average_percentage': round(
                        course.avg_percentage or 0, 2
                    ),
                    'total_students': course.total_students
                }
                for course in course_performance
            ]
        })


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['class_enrolled', 'is_active']
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email',
        'student_id', 'roll_number'
    ]
    ordering_fields = ['user__first_name', 'user__last_name', 'admission_date']
    ordering = ['user__first_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get detailed performance data for a student"""
        student = self.get_object()
        serializer = StudentPerformanceSerializer(student)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        """Get all grades for a student"""
        student = self.get_object()
        grades = student.grades.all()
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Get all assignments for a student"""
        student = self.get_object()
        submissions = student.assignment_submissions.all()
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attendance_summary(self, request, pk=None):
        """Get attendance summary for a student"""
        student = self.get_object()
        # This will be implemented when attendance app is created
        return Response({
            'student_name': student.full_name,
            'total_days': 0,
            'present_days': 0,
            'absent_days': 0,
            'attendance_percentage': 0
        })


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'subject', 'class_enrolled', 'teacher', 'academic_year', 'is_active'
    ]
    search_fields = [
        'subject__name', 'teacher__user__first_name',
        'teacher__user__last_name'
    ]
    ordering_fields = ['subject__name', 'academic_year']
    ordering = ['subject__name']

    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """Get all lessons for a course"""
        course = self.get_object()
        lessons = course.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Get all assignments for a course"""
        course = self.get_object()
        assignments = course.assignments.all()
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        """Get all grades for a course"""
        course = self.get_object()
        grades = course.grades.all()
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def performance_summary(self, request, pk=None):
        """Get performance summary for a course"""
        course = self.get_object()

        # Get average grades for the course
        grades = course.grades.all()
        avg_percentage = grades.aggregate(avg=Avg('percentage'))['avg'] or 0

        # Get grade distribution
        grade_distribution = grades.values('grade').annotate(
            count=Count('grade')
        )

        # Get top performers
        top_students = course.class_enrolled.students.annotate(
            avg_percentage=Avg(
                'grades__percentage', filter=Q(grades__course=course)
            )
        ).order_by('-avg_percentage')[:5]

        return Response({
            'course_name': course.subject.name,
            'teacher': course.teacher.full_name,
            'total_students': course.class_enrolled.students.count(),
            'average_percentage': round(avg_percentage, 2),
            'grade_distribution': grade_distribution,
            'top_students': StudentPerformanceSerializer(
                top_students, many=True
            ).data
        })


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['course', 'is_completed']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'scheduled_date']
    ordering = ['course', 'order']

    def get_serializer_class(self):
        if self.action == 'create':
            return LessonCreateSerializer
        return LessonSerializer

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a lesson as completed"""
        lesson = self.get_object()
        lesson.is_completed = True
        lesson.save()
        serializer = self.get_serializer(lesson)
        return Response(serializer.data)


# Assignment and AssignmentSubmission ViewSets moved to assignments app


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['student', 'course', 'assignment', 'letter_grade']
    search_fields = [
        'student__user__first_name', 'student__user__last_name'
    ]
    ordering_fields = ['graded_at', 'percentage']
    ordering = ['-graded_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return GradeCreateSerializer
        return GradeSerializer

    @action(detail=False, methods=['get'])
    def grade_distribution(self, request):
        """Get overall grade distribution"""
        grade_distribution = self.queryset.values('grade').annotate(
            count=Count('grade')
        ).order_by('grade')

        return Response(grade_distribution)

    @action(detail=False, methods=['get'])
    def performance_trends(self, request):
        """Get performance trends over time"""
        # Get grades from last 6 months
        six_months_ago = timezone.now() - timedelta(days=180)
        recent_grades = self.queryset.filter(graded_at__gte=six_months_ago)

        # Group by month
        monthly_performance = recent_grades.extra(
            select={'month': "EXTRACT(month FROM graded_at)"}
        ).values('month').annotate(
            avg_percentage=Avg('percentage'),
            count=Count('id')
        ).order_by('month')

        return Response(monthly_performance)
