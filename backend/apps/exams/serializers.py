from rest_framework import serializers
from .models import (
    Exam, ExamSchedule, Question, Answer, ExamResult, 
    StudentAnswer, Quiz, ExamSettings
)
from apps.academics.serializers import (
    CourseSerializer, StudentSerializer, 
    TeacherSerializer, ClassSerializer
)


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            'id', 'answer_text', 'is_correct', 'order', 
            'explanation', 'created_at'
        ]


class AnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            'id', 'answer_text', 'is_correct', 'order', 'explanation'
        ]


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    correct_answers = serializers.SerializerMethodField()
    total_answers = serializers.ReadOnlyField()

    class Meta:
        model = Question
        fields = [
            'id', 'exam', 'question_text', 'question_type', 'difficulty',
            'marks', 'order', 'is_required', 'has_negative_marking',
            'negative_marks', 'explanation', 'answers', 'correct_answers',
            'total_answers', 'created_at', 'updated_at'
        ]

    def get_correct_answers(self, obj):
        return AnswerSerializer(obj.correct_answers, many=True).data


class QuestionCreateSerializer(serializers.ModelSerializer):
    answers = AnswerCreateSerializer(many=True)

    class Meta:
        model = Question
        fields = [
            'id', 'exam', 'question_text', 'question_type', 'difficulty',
            'marks', 'order', 'is_required', 'has_negative_marking',
            'negative_marks', 'explanation', 'answers'
        ]

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        
        for answer_data in answers_data:
            Answer.objects.create(question=question, **answer_data)
        
        return question


class ExamScheduleSerializer(serializers.ModelSerializer):
    exam = serializers.StringRelatedField()
    invigilator = TeacherSerializer(read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()

    class Meta:
        model = ExamSchedule
        fields = [
            'id', 'exam', 'start_date', 'start_time', 'end_time',
            'venue', 'room_number', 'invigilator', 'is_online',
            'online_platform', 'meeting_link', 'duration_minutes',
            'is_upcoming', 'is_ongoing', 'is_completed',
            'created_at', 'updated_at'
        ]


class ExamScheduleCreateSerializer(serializers.ModelSerializer):
    exam_id = serializers.UUIDField(write_only=True)
    invigilator_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = ExamSchedule
        fields = [
            'id', 'exam_id', 'start_date', 'start_time', 'end_time',
            'venue', 'room_number', 'invigilator_id', 'is_online',
            'online_platform', 'meeting_link'
        ]


class ExamSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer(read_only=True)
    created_by = TeacherSerializer(read_only=True)
    schedule = ExamScheduleSerializer(read_only=True)
    total_questions = serializers.ReadOnlyField()
    is_scheduled = serializers.ReadOnlyField()

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'exam_type', 'subject', 'course',
            'total_marks', 'duration_minutes', 'passing_marks', 'is_active',
            'allow_retake', 'max_attempts', 'instructions', 'created_by',
            'schedule', 'total_questions', 'is_scheduled',
            'created_at', 'updated_at'
        ]


class ExamCreateSerializer(serializers.ModelSerializer):
    subject_id = serializers.UUIDField(write_only=True)
    course_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'exam_type', 'subject_id', 'course_id',
            'total_marks', 'duration_minutes', 'passing_marks', 'is_active',
            'allow_retake', 'max_attempts', 'instructions'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user.teacher_profile
        return super().create(validated_data)


class StudentAnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    selected_answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'exam_result', 'question', 'selected_answers',
            'text_answer', 'numerical_answer', 'is_correct',
            'marks_obtained', 'time_taken_seconds', 'answered_at'
        ]


class StudentAnswerCreateSerializer(serializers.ModelSerializer):
    selected_answer_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )

    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'exam_result', 'question', 'selected_answer_ids',
            'text_answer', 'numerical_answer', 'time_taken_seconds'
        ]

    def create(self, validated_data):
        selected_answer_ids = validated_data.pop('selected_answer_ids', [])
        student_answer = StudentAnswer.objects.create(**validated_data)
        
        if selected_answer_ids:
            answers = Answer.objects.filter(id__in=selected_answer_ids)
            student_answer.selected_answers.set(answers)
        
        return student_answer


class ExamResultSerializer(serializers.ModelSerializer):
    exam = ExamSerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    graded_by = TeacherSerializer(read_only=True)
    student_answers = StudentAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ExamResult
        fields = [
            'id', 'exam', 'student', 'marks_obtained', 'percentage', 'grade',
            'is_passed', 'attempt_number', 'start_time', 'end_time',
            'duration_taken_minutes', 'is_submitted', 'submitted_at',
            'graded_by', 'graded_at', 'remarks', 'student_answers',
            'created_at', 'updated_at'
        ]


class ExamResultCreateSerializer(serializers.ModelSerializer):
    exam_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ExamResult
        fields = [
            'id', 'exam_id', 'start_time', 'end_time', 'duration_taken_minutes'
        ]

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user.student_profile
        return super().create(validated_data)


class QuizSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer(read_only=True)
    created_by = TeacherSerializer(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'subject', 'course',
            'total_questions', 'time_limit_minutes', 'passing_score',
            'is_randomized', 'show_results_immediately', 'allow_review',
            'is_active', 'created_by', 'created_at', 'updated_at'
        ]


class QuizCreateSerializer(serializers.ModelSerializer):
    subject_id = serializers.UUIDField(write_only=True)
    course_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'subject_id', 'course_id',
            'total_questions', 'time_limit_minutes', 'passing_score',
            'is_randomized', 'show_results_immediately', 'allow_review',
            'is_active'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user.teacher_profile
        return super().create(validated_data)


class ExamSettingsSerializer(serializers.ModelSerializer):
    class_enrolled = ClassSerializer(read_only=True)

    class Meta:
        model = ExamSettings
        fields = [
            'id', 'class_enrolled', 'default_exam_duration',
            'default_passing_percentage', 'allow_exam_retakes',
            'max_retake_attempts', 'auto_grade_objective_questions',
            'require_teacher_approval', 'send_result_notifications',
            'created_at', 'updated_at'
        ]


class ExamSettingsCreateSerializer(serializers.ModelSerializer):
    class_enrolled_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ExamSettings
        fields = [
            'id', 'class_enrolled_id', 'default_exam_duration',
            'default_passing_percentage', 'allow_exam_retakes',
            'max_retake_attempts', 'auto_grade_objective_questions',
            'require_teacher_approval', 'send_result_notifications'
        ]


# Dashboard and Analytics Serializers
class ExamSummarySerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer(read_only=True)
    total_students = serializers.SerializerMethodField()
    completed_students = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    pass_rate = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'exam_type', 'subject', 'course',
            'total_marks', 'passing_marks', 'total_students',
            'completed_students', 'average_score', 'pass_rate',
            'is_active', 'created_at'
        ]

    def get_total_students(self, obj):
        return obj.course.class_enrolled.students.count()

    def get_completed_students(self, obj):
        return obj.results.filter(is_submitted=True).count()

    def get_average_score(self, obj):
        results = obj.results.filter(is_submitted=True)
        if results:
            return sum(result.percentage for result in results) / results.count()
        return 0

    def get_pass_rate(self, obj):
        total_submitted = obj.results.filter(is_submitted=True).count()
        if total_submitted == 0:
            return 0
        passed_count = obj.results.filter(is_submitted=True, is_passed=True).count()
        return (passed_count / total_submitted) * 100


class StudentExamPerformanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    exam = ExamSerializer(read_only=True)
    subject = serializers.ReadOnlyField(source='exam.subject.name')
    exam_type = serializers.ReadOnlyField(source='exam.exam_type')

    class Meta:
        model = ExamResult
        fields = [
            'id', 'student', 'exam', 'subject', 'exam_type',
            'marks_obtained', 'percentage', 'grade', 'is_passed',
            'attempt_number', 'duration_taken_minutes', 'submitted_at'
        ]


class ExamAnalyticsSerializer(serializers.Serializer):
    total_exams = serializers.IntegerField()
    upcoming_exams = serializers.IntegerField()
    ongoing_exams = serializers.IntegerField()
    completed_exams = serializers.IntegerField()
    average_pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    total_results = serializers.IntegerField()
    grade_distribution = serializers.DictField()


class BulkQuestionCreateSerializer(serializers.Serializer):
    exam_id = serializers.UUIDField()
    questions = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of questions with their answers"
    )

    def validate_questions(self, value):
        for question_data in value:
            if 'question_text' not in question_data:
                raise serializers.ValidationError("question_text is required for each question")
            if 'answers' not in question_data:
                raise serializers.ValidationError("answers are required for each question")
            if not question_data['answers']:
                raise serializers.ValidationError("At least one answer is required")
        return value


class ExamSubmissionSerializer(serializers.Serializer):
    exam_result_id = serializers.UUIDField()
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of student answers"
    )

    def validate_answers(self, value):
        for answer_data in value:
            if 'question_id' not in answer_data:
                raise serializers.ValidationError("question_id is required for each answer")
        return value
