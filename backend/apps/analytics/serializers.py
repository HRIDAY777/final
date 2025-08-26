from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    StudentPerformance, AttendanceAnalytics, ExamAnalytics, SystemUsage,
    LearningAnalytics, PredictiveAnalytics, AnalyticsDashboard
)


class StudentPerformanceSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    subject = serializers.StringRelatedField(read_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    overall_performance_score = serializers.ReadOnlyField()
    assignment_completion_rate = serializers.ReadOnlyField()

    class Meta:
        model = StudentPerformance
        fields = [
            'id', 'student', 'student_id', 'subject', 'subject_id',
            'academic_year', 'semester', 'attendance_rate', 'average_score',
            'total_assignments', 'completed_assignments', 'exam_scores',
            'participation_score', 'predicted_grade', 'risk_level',
            'improvement_areas', 'recommendations', 'overall_performance_score',
            'assignment_completion_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'overall_performance_score', 'assignment_completion_rate',
            'created_at', 'updated_at'
        ]

    def validate(self, data):
        if 'attendance_rate' in data:
            if data['attendance_rate'] < 0 or data['attendance_rate'] > 100:
                raise ValidationError("Attendance rate must be between 0 and 100")
        
        if 'average_score' in data:
            if data['average_score'] < 0 or data['average_score'] > 100:
                raise ValidationError("Average score must be between 0 and 100")
        
        if 'completed_assignments' in data and 'total_assignments' in data:
            if data['completed_assignments'] > data['total_assignments']:
                raise ValidationError("Completed assignments cannot exceed total assignments")
        
        return data


class AttendanceAnalyticsSerializer(serializers.ModelSerializer):
    class_room = serializers.StringRelatedField(read_only=True)
    class_room_id = serializers.IntegerField(write_only=True)
    attendance_rate = serializers.ReadOnlyField()
    absence_rate = serializers.ReadOnlyField()

    class Meta:
        model = AttendanceAnalytics
        fields = [
            'id', 'class_room', 'class_room_id', 'date', 'total_students',
            'present_count', 'absent_count', 'late_count', 'excused_count',
            'attendance_rate', 'absence_rate', 'trend_direction', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'attendance_rate', 'absence_rate', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        if 'total_students' in data and 'present_count' in data and 'absent_count' in data:
            total = data['present_count'] + data['absent_count']
            if total != data['total_students']:
                raise ValidationError("Present + absent count must equal total students")
        
        return data


class ExamAnalyticsSerializer(serializers.ModelSerializer):
    exam = serializers.StringRelatedField(read_only=True)
    exam_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ExamAnalytics
        fields = [
            'id', 'exam', 'exam_id', 'total_students', 'average_score',
            'highest_score', 'lowest_score', 'median_score', 'grade_distribution',
            'pass_rate', 'question_analysis', 'time_analysis', 'difficulty_level',
            'recommendations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if 'average_score' in data:
            if data['average_score'] < 0 or data['average_score'] > 100:
                raise ValidationError("Average score must be between 0 and 100")
        
        if 'highest_score' in data and 'lowest_score' in data:
            if data['highest_score'] < data['lowest_score']:
                raise ValidationError("Highest score cannot be less than lowest score")
        
        return data


class SystemUsageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SystemUsage
        fields = [
            'id', 'user', 'user_id', 'session_id', 'login_time', 'logout_time',
            'session_duration', 'pages_visited', 'actions_performed', 'features_used',
            'user_agent', 'ip_address', 'device_type', 'page_load_times',
            'errors_encountered', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'session_duration', 'created_at', 'updated_at'
        ]


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    subject = serializers.StringRelatedField(read_only=True)
    subject_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LearningAnalytics
        fields = [
            'id', 'student', 'student_id', 'subject', 'subject_id', 'study_time',
            'resources_accessed', 'learning_path_progress', 'engagement_score',
            'participation_level', 'learning_style', 'skill_levels', 'knowledge_gaps',
            'learning_objectives', 'recommended_resources', 'study_suggestions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if 'engagement_score' in data:
            if data['engagement_score'] < 0 or data['engagement_score'] > 100:
                raise ValidationError("Engagement score must be between 0 and 100")
        
        if 'learning_path_progress' in data:
            if data['learning_path_progress'] < 0 or data['learning_path_progress'] > 100:
                raise ValidationError("Learning path progress must be between 0 and 100")
        
        return data


class PredictiveAnalyticsSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    student_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PredictiveAnalytics
        fields = [
            'id', 'student', 'student_id', 'predicted_gpa', 'graduation_probability',
            'dropout_risk', 'career_recommendations', 'skill_gaps', 'development_areas',
            'course_recommendations', 'subject_performance_predictions',
            'intervention_needed', 'intervention_type', 'intervention_priority',
            'model_version', 'confidence_score', 'last_updated', 'created_at'
        ]
        read_only_fields = [
            'id', 'last_updated', 'created_at'
        ]

    def validate(self, data):
        if 'predicted_gpa' in data:
            if data['predicted_gpa'] < 0 or data['predicted_gpa'] > 4:
                raise ValidationError("Predicted GPA must be between 0 and 4")
        
        if 'graduation_probability' in data:
            if data['graduation_probability'] < 0 or data['graduation_probability'] > 100:
                raise ValidationError("Graduation probability must be between 0 and 100")
        
        if 'dropout_risk' in data:
            if data['dropout_risk'] < 0 or data['dropout_risk'] > 100:
                raise ValidationError("Dropout risk must be between 0 and 100")
        
        if 'confidence_score' in data:
            if data['confidence_score'] < 0 or data['confidence_score'] > 100:
                raise ValidationError("Confidence score must be between 0 and 100")
        
        return data


class AnalyticsDashboardSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    allowed_users = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = AnalyticsDashboard
        fields = [
            'id', 'name', 'description', 'widgets', 'layout', 'filters',
            'is_public', 'allowed_users', 'allowed_roles', 'refresh_interval',
            'auto_refresh', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at'
        ]


# Dashboard and Analytics Serializers
class AnalyticsOverviewSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    average_attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_performance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    active_users_today = serializers.IntegerField()
    total_exams_this_month = serializers.IntegerField()
    system_uptime = serializers.DecimalField(max_digits=5, decimal_places=2)


class PerformanceTrendSerializer(serializers.Serializer):
    period = serializers.CharField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    student_count = serializers.IntegerField()


class AttendanceTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    class_name = serializers.CharField()
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()


class ExamTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    exam_name = serializers.CharField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    subject = serializers.CharField()


class StudentPerformanceSummarySerializer(serializers.Serializer):
    student = serializers.StringRelatedField()
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    risk_level = serializers.CharField()
    improvement_areas = serializers.ListField(child=serializers.CharField())


class ExamPerformanceSummarySerializer(serializers.Serializer):
    exam = serializers.StringRelatedField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    difficulty_level = serializers.CharField()


class SystemUsageSummarySerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    average_session_duration = serializers.IntegerField()
    most_used_features = serializers.ListField(child=serializers.CharField())
    device_distribution = serializers.DictField()
    active_users_by_hour = serializers.ListField()


# Action Serializers
class GeneratePerformanceReportSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    class_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    subject_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    report_type = serializers.ChoiceField(choices=[
        ('individual', 'Individual Student'),
        ('class', 'Class Performance'),
        ('subject', 'Subject Performance'),
        ('comparative', 'Comparative Analysis')
    ])


class UpdatePredictiveModelsSerializer(serializers.Serializer):
    model_type = serializers.ChoiceField(choices=[
        ('performance', 'Performance Prediction'),
        ('attendance', 'Attendance Prediction'),
        ('dropout', 'Dropout Risk'),
        ('career', 'Career Recommendation')
    ])
    force_update = serializers.BooleanField(default=False)


class ExportAnalyticsDataSerializer(serializers.Serializer):
    data_type = serializers.ChoiceField(choices=[
        ('performance', 'Student Performance'),
        ('attendance', 'Attendance Data'),
        ('exams', 'Exam Results'),
        ('usage', 'System Usage'),
        ('learning', 'Learning Analytics')
    ])
    format = serializers.ChoiceField(choices=[
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
        ('pdf', 'PDF')
    ])
    filters = serializers.DictField(required=False)
    include_charts = serializers.BooleanField(default=True)


class LearningPathSerializer(serializers.Serializer):
    student = serializers.StringRelatedField()
    current_level = serializers.CharField()
    recommended_path = serializers.ListField(child=serializers.CharField())
    estimated_completion_time = serializers.IntegerField()
    difficulty_level = serializers.CharField()


class PredictiveInsightSerializer(serializers.Serializer):
    insight_type = serializers.CharField()
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    prediction = serializers.CharField()
    factors = serializers.ListField(child=serializers.CharField())
    recommended_actions = serializers.ListField(child=serializers.CharField())


class DashboardConfigSerializer(serializers.Serializer):
    layout = serializers.DictField()
    widgets = serializers.ListField(child=serializers.DictField())
    refresh_interval = serializers.IntegerField()
    theme = serializers.CharField()


class ReportGeneratorSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=[
        ('performance', 'Performance Report'),
        ('attendance', 'Attendance Report'),
        ('exams', 'Exam Report'),
        ('usage', 'Usage Report')
    ])
    parameters = serializers.DictField(required=False)
    format = serializers.ChoiceField(choices=[
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV')
    ])


class ModelUpdateSerializer(serializers.Serializer):
    model_type = serializers.ChoiceField(choices=[
        ('performance', 'Performance Model'),
        ('attendance', 'Attendance Model'),
        ('dropout', 'Dropout Model')
    ])
    force_update = serializers.BooleanField(default=False)
    include_new_data = serializers.BooleanField(default=True)


class DataExportSerializer(serializers.Serializer):
    export_type = serializers.ChoiceField(choices=[
        ('performance', 'Performance Data'),
        ('attendance', 'Attendance Data'),
        ('exams', 'Exam Data'),
        ('usage', 'Usage Data'),
        ('all', 'All Data')
    ])
    format = serializers.ChoiceField(choices=[
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
        ('xml', 'XML')
    ])
    date_range = serializers.DictField(required=False)
    filters = serializers.DictField(required=False)
    include_metadata = serializers.BooleanField(default=True)
