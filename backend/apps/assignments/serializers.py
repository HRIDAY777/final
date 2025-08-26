from rest_framework import serializers
from .models import Assignment, AssignmentSubmission, AssignmentComment
from apps.students.serializers import StudentSerializer
# SubjectSerializer moved to apps.subjects
from apps.classes.serializers import ClassSerializer
from django.utils import timezone


class AssignmentSerializer(serializers.ModelSerializer):
    """Basic assignment serializer"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='class_group.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    submission_count = serializers.ReadOnlyField()
    graded_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'assignment_type', 'subject', 
            'subject_name', 'class_group', 'class_name', 'assigned_date', 
            'due_date', 'total_marks', 'weightage', 'status', 'is_active',
            'created_by_name', 'is_overdue', 'submission_count', 'graded_count',
            'created_at'
        ]


class AssignmentDetailSerializer(serializers.ModelSerializer):
    """Detailed assignment serializer with related data"""
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    class_group = ClassSerializer(read_only=True)
    created_by = serializers.SerializerMethodField()
    submissions = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    submission_count = serializers.ReadOnlyField()
    graded_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'name': obj.created_by.get_full_name(),
            'email': obj.created_by.email
        }
    
    def get_submissions(self, obj):
        submissions = obj.submissions.all()[:10]  # Limit to 10 recent submissions
        return AssignmentSubmissionSerializer(submissions, many=True).data
    
    def get_comments(self, obj):
        comments = obj.comments.filter(is_private=False)[:5]  # Limit to 5 public comments
        return AssignmentCommentSerializer(comments, many=True).data


class AssignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assignments"""
    
    class Meta:
        model = Assignment
        fields = [
            'title', 'description', 'instructions', 'assignment_type', 
            'subject', 'class_group', 'due_date', 'late_submission_deadline',
            'total_marks', 'weightage', 'allow_late_submission', 
            'late_submission_penalty', 'allow_resubmission', 'max_resubmissions',
            'attachment', 'rubric'
        ]
    
    def validate(self, data):
        """Validate assignment data"""
        if data.get('due_date') <= data.get('assigned_date', timezone.now()):
            raise serializers.ValidationError(
                "Due date must be after the assigned date."
            )
        
        if data.get('late_submission_deadline'):
            if data['late_submission_deadline'] <= data['due_date']:
                raise serializers.ValidationError(
                    "Late submission deadline must be after the due date."
                )
        
        return data


class AssignmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating assignments"""
    
    class Meta:
        model = Assignment
        fields = [
            'title', 'description', 'instructions', 'assignment_type', 
            'subject', 'class_group', 'due_date', 'late_submission_deadline',
            'total_marks', 'weightage', 'allow_late_submission', 
            'late_submission_penalty', 'allow_resubmission', 'max_resubmissions',
            'attachment', 'rubric', 'status'
        ]


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Basic submission serializer"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    days_late = serializers.ReadOnlyField()
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'submission_date', 'marks_obtained', 'percentage', 'grade', 
            'status', 'is_graded', 'is_late', 'days_late', 'created_at'
        ]


class AssignmentSubmissionDetailSerializer(serializers.ModelSerializer):
    """Detailed submission serializer"""
    student = StudentSerializer(read_only=True)
    assignment = AssignmentSerializer(read_only=True)
    graded_by = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    days_late = serializers.ReadOnlyField()
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
    
    def get_graded_by(self, obj):
        if obj.graded_by:
            return {
                'id': obj.graded_by.id,
                'name': obj.graded_by.get_full_name(),
                'email': obj.graded_by.email
            }
        return None
    
    def get_comments(self, obj):
        comments = obj.comments.all()
        return AssignmentCommentSerializer(comments, many=True).data


class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating submissions"""
    
    class Meta:
        model = AssignmentSubmission
        fields = ['assignment', 'submission_text', 'attachment']
    
    def validate(self, data):
        """Validate submission data"""
        assignment = data['assignment']
        
        # Check if assignment is active
        if not assignment.is_active:
            raise serializers.ValidationError(
                "Cannot submit to an inactive assignment."
            )
        
        # Check if submission is allowed
        if assignment.status not in ['published', 'active']:
            raise serializers.ValidationError(
                "Assignment is not accepting submissions."
            )
        
        # Check if student is in the assignment's class
        student = self.context['request'].user.student_user
        if student.current_class != assignment.class_group:
            raise serializers.ValidationError(
                "You can only submit to assignments for your class."
            )
        
        return data


class AssignmentSubmissionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating submissions"""
    
    class Meta:
        model = AssignmentSubmission
        fields = ['submission_text', 'attachment']


class AssignmentGradingSerializer(serializers.ModelSerializer):
    """Serializer for grading submissions"""
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'marks_obtained', 'grade', 'feedback', 'rubric_scores', 'status'
        ]
    
    def validate(self, data):
        """Validate grading data"""
        marks_obtained = data.get('marks_obtained')
        assignment = self.instance.assignment
        
        if marks_obtained is not None:
            if marks_obtained < 0:
                raise serializers.ValidationError(
                    "Marks cannot be negative."
                )
            if marks_obtained > assignment.total_marks:
                raise serializers.ValidationError(
                    f"Marks cannot exceed the total marks ({assignment.total_marks})."
                )
        
        return data
    
    def update(self, instance, validated_data):
        """Update submission with grading data"""
        instance.marks_obtained = validated_data.get('marks_obtained', instance.marks_obtained)
        instance.grade = validated_data.get('grade', instance.grade)
        instance.feedback = validated_data.get('feedback', instance.feedback)
        instance.rubric_scores = validated_data.get('rubric_scores', instance.rubric_scores)
        instance.status = validated_data.get('status', instance.status)
        instance.is_graded = True
        instance.graded_by = self.context['request'].user
        instance.graded_at = timezone.now()
        
        # Calculate percentage
        if instance.marks_obtained is not None and instance.assignment.total_marks > 0:
            instance.percentage = (instance.marks_obtained / instance.assignment.total_marks) * 100
        
        instance.save()
        return instance


class AssignmentCommentSerializer(serializers.ModelSerializer):
    """Serializer for assignment comments"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = AssignmentComment
        fields = [
            'id', 'assignment', 'submission', 'comment_type', 'content',
            'is_private', 'author', 'author_name', 'created_at'
        ]
        read_only_fields = ['author']


class AssignmentCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = AssignmentComment
        fields = ['assignment', 'submission', 'comment_type', 'content', 'is_private']
    
    def validate(self, data):
        """Validate comment data"""
        # Ensure either assignment or submission is provided
        if not data.get('assignment') and not data.get('submission'):
            raise serializers.ValidationError(
                "Either assignment or submission must be specified."
            )
        
        return data


class AssignmentStatsSerializer(serializers.Serializer):
    """Serializer for assignment statistics"""
    total_assignments = serializers.IntegerField()
    active_assignments = serializers.IntegerField()
    overdue_assignments = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    graded_submissions = serializers.IntegerField()
    pending_submissions = serializers.IntegerField()
    average_score = serializers.FloatField()
    submissions_by_status = serializers.DictField()
    assignments_by_type = serializers.DictField()
    recent_assignments = AssignmentSerializer(many=True)
    upcoming_deadlines = AssignmentSerializer(many=True)
