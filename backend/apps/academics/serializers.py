from rest_framework import serializers
from .models import (
    Course, Lesson, Grade
)
from apps.teachers.models import Teacher
from apps.students.models import Student
from apps.classes.models import Class
from apps.accounts.serializers import UserSerializer
from apps.accounts.models import User


class ClassSerializer(serializers.ModelSerializer):
    current_student_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'section', 'academic_year', 'capacity',
            'current_student_count', 'is_full', 'is_active',
            'created_at', 'updated_at'
        ]


# SubjectSerializer moved to apps.subjects


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField(source='user.get_full_name')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'teacher_id', 'department', 'qualification',
            'experience_years', 'specialization', 'joining_date',
            'is_active', 'full_name', 'email',
            'created_at', 'updated_at'
        ]


class TeacherCreateSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'teacher_id', 'department', 'qualification',
            'experience_years', 'specialization', 'joining_date',
            'is_active'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data, user_type='teacher')
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class_enrolled = ClassSerializer(read_only=True)
    full_name = serializers.ReadOnlyField(source='user.get_full_name')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'class_enrolled', 'admission_number',
            'admission_date', 'parent_name', 'parent_phone', 'parent_email',
            'address', 'emergency_contact', 'blood_group', 'is_active',
            'full_name', 'email', 'created_at', 'updated_at'
        ]


class StudentCreateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class_enrolled_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'class_enrolled_id',
            'admission_number', 'admission_date', 'parent_name',
            'parent_phone', 'parent_email', 'address',
            'emergency_contact', 'blood_group'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        class_enrolled_id = validated_data.pop('class_enrolled_id')

        user = User.objects.create_user(**user_data, user_type='student')
        class_enrolled = Class.objects.get(id=class_enrolled_id)

        student = Student.objects.create(
            user=user,
            class_enrolled=class_enrolled,
            **validated_data
        )
        return student


class CourseSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    class_enrolled = ClassSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'subject', 'class_enrolled', 'teacher', 'academic_year',
            'semester', 'is_active', 'created_at', 'updated_at'
        ]


class CourseCreateSerializer(serializers.ModelSerializer):
    subject_id = serializers.UUIDField(write_only=True)
    class_enrolled_id = serializers.UUIDField(write_only=True)
    teacher_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'subject_id', 'class_enrolled_id', 'teacher_id',
            'academic_year', 'semester', 'is_active'
        ]


class LessonSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'description', 'content',
            'duration_minutes', 'order', 'is_completed', 'scheduled_date',
            'created_at', 'updated_at'
        ]


class LessonCreateSerializer(serializers.ModelSerializer):
    course_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'course_id', 'title', 'description', 'content',
            'duration_minutes', 'order', 'scheduled_date'
        ]


# Assignment and AssignmentSubmission serializers moved to assignments app


class GradeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'course', 'assignment', 'score',
            'letter_grade', 'weight', 'academic_year', 'semester',
            'comments', 'created_at', 'updated_at'
        ]


class GradeCreateSerializer(serializers.ModelSerializer):
    student_id = serializers.UUIDField(write_only=True)
    course_id = serializers.UUIDField(write_only=True)
    assignment_id = serializers.UUIDField(
        write_only=True, required=False
    )

    class Meta:
        model = Grade
        fields = [
            'id', 'student_id', 'course_id', 'assignment_id',
            'score', 'weight', 'academic_year', 'semester', 'comments'
        ]


# Dashboard and Analytics Serializers
class ClassDashboardSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'section', 'academic_year', 'capacity',
            'student_count', 'teacher_count', 'course_count', 'is_active'
        ]

    def get_student_count(self, obj):
        return obj.students.count()

    def get_teacher_count(self, obj):
        return obj.courses.values('teacher').distinct().count()

    def get_course_count(self, obj):
        return obj.courses.count()


class StudentPerformanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class_enrolled = ClassSerializer(read_only=True)
    average_percentage = serializers.SerializerMethodField()
    total_assignments = serializers.SerializerMethodField()
    completed_assignments = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'class_enrolled', 'admission_number',
            'average_percentage', 'total_assignments', 'completed_assignments',
            'is_active'
        ]

    def get_average_percentage(self, obj):
        grades = obj.grades.all()
        if grades:
            return sum(grade.percentage for grade in grades) / len(grades)
        return 0

    def get_total_assignments(self, obj):
        return obj.assignment_submissions.count()

    def get_completed_assignments(self, obj):
        return obj.assignment_submissions.filter(
            marks_obtained__isnull=False
        ).count()
