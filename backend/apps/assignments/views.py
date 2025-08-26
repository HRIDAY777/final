from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Q, Avg, F
from django.contrib.auth import get_user_model

from .models import Assignment, AssignmentSubmission, AssignmentComment
from .serializers import (
    AssignmentSerializer, AssignmentDetailSerializer, AssignmentCreateSerializer,
    AssignmentUpdateSerializer, AssignmentSubmissionSerializer,
    AssignmentSubmissionDetailSerializer, AssignmentSubmissionCreateSerializer,
    AssignmentSubmissionUpdateSerializer, AssignmentGradingSerializer,
    AssignmentCommentSerializer, AssignmentCommentCreateSerializer,
    AssignmentStatsSerializer
)

User = get_user_model()


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment model"""
    
    queryset = Assignment.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'assignment_type', 'status', 'subject', 'class_group', 'is_active'
    ]
    search_fields = ['title', 'description', 'instructions']
    ordering_fields = [
        'title', 'assigned_date', 'due_date', 'total_marks', 'created_at'
    ]
    ordering = ['-due_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AssignmentUpdateSerializer
        elif self.action == 'retrieve':
            return AssignmentDetailSerializer
        return AssignmentSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all assignments
        if self.request.user.is_staff:
            return queryset
        
        # For teachers, show assignments they created
        if hasattr(self.request.user, 'teacher_profile'):
            return queryset.filter(created_by=self.request.user)
        
        # For students, show assignments for their class
        if hasattr(self.request.user, 'student_user'):
            student = self.request.user.student_user
            if student.current_class:
                return queryset.filter(class_group=student.current_class)
        
        return queryset.none()

    def perform_create(self, serializer):
        """Set the creator when creating an assignment"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active assignments"""
        active_assignments = self.get_queryset().filter(
            status__in=['published', 'active'],
            is_active=True
        )
        serializer = self.get_serializer(active_assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue assignments"""
        overdue_assignments = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            status__in=['published', 'active']
        )
        serializer = self.get_serializer(overdue_assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming assignments"""
        upcoming_assignments = self.get_queryset().filter(
            due_date__gte=timezone.now(),
            status__in=['published', 'active']
        ).order_by('due_date')[:10]
        serializer = self.get_serializer(upcoming_assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish an assignment"""
        assignment = self.get_object()
        assignment.status = 'published'
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive an assignment"""
        assignment = self.get_object()
        assignment.status = 'archived'
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get assignment statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_assignments': queryset.count(),
            'active_assignments': queryset.filter(
                status__in=['published', 'active']
            ).count(),
            'overdue_assignments': queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['published', 'active']
            ).count(),
            'total_submissions': AssignmentSubmission.objects.filter(
                assignment__in=queryset
            ).count(),
            'graded_submissions': AssignmentSubmission.objects.filter(
                assignment__in=queryset,
                is_graded=True
            ).count(),
            'pending_submissions': AssignmentSubmission.objects.filter(
                assignment__in=queryset,
                is_graded=False
            ).count(),
            'average_score': AssignmentSubmission.objects.filter(
                assignment__in=queryset,
                is_graded=True
            ).aggregate(avg=Avg('percentage'))['avg'] or 0,
            'submissions_by_status': dict(
                AssignmentSubmission.objects.filter(
                    assignment__in=queryset
                ).values('status').annotate(
                    count=Count('id')
                ).values_list('status', 'count')
            ),
            'assignments_by_type': dict(
                queryset.values('assignment_type').annotate(
                    count=Count('id')
                ).values_list('assignment_type', 'count')
            ),
            'recent_assignments': AssignmentSerializer(
                queryset.order_by('-created_at')[:5], many=True
            ).data,
            'upcoming_deadlines': AssignmentSerializer(
                queryset.filter(
                    due_date__gte=timezone.now(),
                    status__in=['published', 'active']
                ).order_by('due_date')[:5], many=True
            ).data,
        }
        
        serializer = AssignmentStatsSerializer(stats)
        return Response(serializer.data)


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for AssignmentSubmission model"""
    
    queryset = AssignmentSubmission.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'assignment', 'student', 'status', 'is_graded', 'is_late'
    ]
    search_fields = ['submission_text', 'feedback']
    ordering_fields = [
        'submission_date', 'marks_obtained', 'percentage', 'created_at'
    ]
    ordering = ['-submission_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentSubmissionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AssignmentSubmissionUpdateSerializer
        elif self.action == 'retrieve':
            return AssignmentSubmissionDetailSerializer
        elif self.action == 'grade':
            return AssignmentGradingSerializer
        return AssignmentSubmissionSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all submissions
        if self.request.user.is_staff:
            return queryset
        
        # For teachers, show submissions for their assignments
        if hasattr(self.request.user, 'teacher_profile'):
            return queryset.filter(
                assignment__created_by=self.request.user
            )
        
        # For students, show only their own submissions
        if hasattr(self.request.user, 'student_user'):
            return queryset.filter(student=self.request.user.student_user)
        
        return queryset.none()

    def perform_create(self, serializer):
        """Set the student when creating a submission"""
        if hasattr(self.request.user, 'student_user'):
            serializer.save(student=self.request.user.student_user)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade a submission"""
        submission = self.get_object()
        serializer = AssignmentGradingSerializer(
            submission, data=request.data, context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending_grading(self, request):
        """Get submissions pending grading"""
        pending_submissions = self.get_queryset().filter(
            is_graded=False
        ).order_by('submission_date')
        serializer = self.get_serializer(pending_submissions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def late_submissions(self, request):
        """Get late submissions"""
        late_submissions = self.get_queryset().filter(
            is_late=True
        ).order_by('-submission_date')
        serializer = self.get_serializer(late_submissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        """Resubmit an assignment"""
        submission = self.get_object()
        
        # Check if resubmission is allowed
        if not submission.assignment.allow_resubmission:
            return Response(
                {'error': 'Resubmission is not allowed for this assignment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if submission.resubmission_count >= submission.assignment.max_resubmissions:
            return Response(
                {'error': 'Maximum resubmissions reached.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new submission
        new_submission = AssignmentSubmission.objects.create(
            assignment=submission.assignment,
            student=submission.student,
            submission_text=request.data.get('submission_text', ''),
            attachment=request.data.get('attachment'),
            original_submission=submission,
            resubmission_count=submission.resubmission_count + 1,
            status='resubmitted'
        )
        
        # Update original submission
        submission.status = 'returned'
        submission.save()
        
        serializer = self.get_serializer(new_submission)
        return Response(serializer.data)


class AssignmentCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for AssignmentComment model"""
    
    queryset = AssignmentComment.objects.all()
    serializer_class = AssignmentCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['assignment', 'submission', 'comment_type', 'is_private']
    search_fields = ['content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentCommentCreateSerializer
        return AssignmentCommentSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all comments
        if self.request.user.is_staff:
            return queryset
        
        # For teachers, show comments on their assignments
        if hasattr(self.request.user, 'teacher_profile'):
            return queryset.filter(
                Q(assignment__created_by=self.request.user) |
                Q(submission__assignment__created_by=self.request.user)
            )
        
        # For students, show public comments and their own private comments
        if hasattr(self.request.user, 'student_user'):
            return queryset.filter(
                Q(is_private=False) |
                Q(author=self.request.user)
            )
        
        return queryset.none()

    def perform_create(self, serializer):
        """Set the author when creating a comment"""
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public comments only"""
        public_comments = self.get_queryset().filter(is_private=False)
        serializer = self.get_serializer(public_comments, many=True)
        return Response(serializer.data)
