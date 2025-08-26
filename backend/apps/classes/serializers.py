from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Class, Subject, ClassSubject, ClassRoom, ClassSchedule,
    ClassEnrollment, SubjectPrerequisite, ClassSettings
)

User = get_user_model()

class ClassSerializer(serializers.ModelSerializer):
    """Base class serializer"""
    
    class Meta:
        model = Class
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ClassListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.full_name', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'code', 'name', 'full_name', 'grade_level', 'section',
            'capacity', 'current_students', 'available_seats', 'occupancy_rate',
            'class_teacher', 'class_teacher_name', 'room', 'room_name',
            'is_active', 'created_at'
        ]
        read_only_fields = ['current_students', 'created_at']

class ClassDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.full_name', read_only=True)
    subjects = serializers.SerializerMethodField()
    enrollments = serializers.SerializerMethodField()
    schedules = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'code', 'name', 'full_name', 'description', 'academic_year',
            'grade_level', 'section', 'capacity', 'current_students',
            'available_seats', 'occupancy_rate', 'class_teacher',
            'class_teacher_name', 'room', 'room_name', 'is_active',
            'subjects', 'enrollments', 'schedules', 'settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_students', 'created_at', 'updated_at']

    def get_subjects(self, obj):
        return ClassSubjectSerializer(obj.subjects.all(), many=True).data

    def get_enrollments(self, obj):
        return ClassEnrollmentSerializer(obj.enrollments.all(), many=True).data

    def get_schedules(self, obj):
        return ClassScheduleSerializer(obj.schedules.all(), many=True).data

    def get_settings(self, obj):
        try:
            return ClassSettingsSerializer(obj.settings).data
        except ClassSettings.DoesNotExist:
            return None

class ClassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = [
            'name', 'code', 'description', 'academic_year', 'grade_level',
            'section', 'capacity', 'class_teacher', 'room', 'is_active'
        ]

    def validate_code(self, value):
        if Class.objects.filter(code=value).exists():
            raise serializers.ValidationError("Class code already exists.")
        return value

    def validate(self, data):
        # Check if class with same name, section, and academic year exists
        if Class.objects.filter(
            name=data.get('name'),
            section=data.get('section', ''),
            academic_year=data.get('academic_year')
        ).exists():
            raise serializers.ValidationError("Class with this name, section, and academic year already exists.")
        return data

class ClassUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = [
            'name', 'code', 'description', 'academic_year', 'grade_level',
            'section', 'capacity', 'class_teacher', 'room', 'is_active'
        ]

    def validate_code(self, value):
        if Class.objects.filter(code=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Class code already exists.")
        return value

class SubjectListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'category', 'grade_level', 'credit_hours',
            'max_marks', 'pass_marks', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

class SubjectDetailSerializer(serializers.ModelSerializer):
    prerequisites = serializers.SerializerMethodField()
    required_for = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'description', 'category', 'grade_level',
            'credit_hours', 'max_marks', 'pass_marks', 'is_active',
            'prerequisites', 'required_for', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_prerequisites(self, obj):
        return SubjectPrerequisiteSerializer(obj.prerequisites.all(), many=True).data

    def get_required_for(self, obj):
        return SubjectPrerequisiteSerializer(obj.required_for.all(), many=True).data

class SubjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            'name', 'code', 'description', 'category', 'grade_level',
            'credit_hours', 'max_marks', 'pass_marks', 'is_active'
        ]

    def validate_code(self, value):
        if Subject.objects.filter(code=value).exists():
            raise serializers.ValidationError("Subject code already exists.")
        return value

    def validate(self, data):
        if data.get('pass_marks', 0) > data.get('max_marks', 100):
            raise serializers.ValidationError("Pass marks cannot be greater than maximum marks.")
        return data

class SubjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            'name', 'code', 'description', 'category', 'grade_level',
            'credit_hours', 'max_marks', 'pass_marks', 'is_active'
        ]

    def validate_code(self, value):
        if Subject.objects.filter(code=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Subject code already exists.")
        return value

class ClassSubjectSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = ClassSubject
        fields = [
            'id', 'class_obj', 'class_name', 'subject', 'subject_name',
            'teacher', 'teacher_name', 'academic_year', 'is_compulsory',
            'weekly_hours', 'order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ClassSubjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSubject
        fields = [
            'class_obj', 'subject', 'teacher', 'academic_year',
            'is_compulsory', 'weekly_hours', 'order', 'is_active'
        ]

    def validate(self, data):
        # Check if class-subject combination already exists for the academic year
        if ClassSubject.objects.filter(
            class_obj=data.get('class_obj'),
            subject=data.get('subject'),
            academic_year=data.get('academic_year')
        ).exists():
            raise serializers.ValidationError("This subject is already assigned to this class for the academic year.")
        return data

class ClassRoomSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'name', 'number', 'full_name', 'building', 'floor',
            'capacity', 'room_type', 'equipment', 'is_available',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ClassRoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRoom
        fields = [
            'name', 'number', 'building', 'floor', 'capacity',
            'room_type', 'equipment', 'is_available', 'is_active'
        ]

    def validate_number(self, value):
        if ClassRoom.objects.filter(number=value).exists():
            raise serializers.ValidationError("Room number already exists.")
        return value

class ClassScheduleSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.full_name', read_only=True)
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = ClassSchedule
        fields = [
            'id', 'class_obj', 'class_name', 'subject', 'subject_name',
            'teacher', 'teacher_name', 'room', 'room_name', 'academic_year',
            'day_of_week', 'start_time', 'end_time', 'period_number',
            'duration_minutes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['duration_minutes', 'created_at', 'updated_at']

class ClassScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSchedule
        fields = [
            'class_obj', 'subject', 'teacher', 'room', 'academic_year',
            'day_of_week', 'start_time', 'end_time', 'period_number', 'is_active'
        ]

    def validate(self, data):
        # Check for time conflicts
        schedule = ClassSchedule(**data)
        if schedule.has_time_conflict():
            raise serializers.ValidationError("This schedule conflicts with existing schedules for the same class, teacher, or room.")
        
        # Validate time range
        if data.get('start_time') >= data.get('end_time'):
            raise serializers.ValidationError("End time must be after start time.")
        
        return data

class ClassEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    class_name = serializers.CharField(source='class_obj.full_name', read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = [
            'id', 'student', 'student_name', 'class_obj', 'class_name',
            'academic_year', 'enrollment_date', 'status', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ClassEnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassEnrollment
        fields = [
            'student', 'class_obj', 'academic_year', 'enrollment_date',
            'status', 'remarks'
        ]

    def validate(self, data):
        # Check if student is already enrolled in this class for the academic year
        if ClassEnrollment.objects.filter(
            student=data.get('student'),
            class_obj=data.get('class_obj'),
            academic_year=data.get('academic_year')
        ).exists():
            raise serializers.ValidationError("Student is already enrolled in this class for the academic year.")
        
        # Check if class has available capacity
        class_obj = data.get('class_obj')
        if not class_obj.can_add_student():
            raise serializers.ValidationError("Class is at full capacity.")
        
        return data

class SubjectPrerequisiteSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    prerequisite_subject_name = serializers.CharField(source='prerequisite_subject.name', read_only=True)

    class Meta:
        model = SubjectPrerequisite
        fields = [
            'id', 'subject', 'subject_name', 'prerequisite_subject',
            'prerequisite_subject_name', 'minimum_grade', 'is_mandatory', 'created_at'
        ]
        read_only_fields = ['created_at']

class SubjectPrerequisiteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectPrerequisite
        fields = [
            'subject', 'prerequisite_subject', 'minimum_grade', 'is_mandatory'
        ]

    def validate(self, data):
        # Check if prerequisite relationship already exists
        if SubjectPrerequisite.objects.filter(
            subject=data.get('subject'),
            prerequisite_subject=data.get('prerequisite_subject')
        ).exists():
            raise serializers.ValidationError("This prerequisite relationship already exists.")
        
        # Prevent self-prerequisite
        if data.get('subject') == data.get('prerequisite_subject'):
            raise serializers.ValidationError("A subject cannot be a prerequisite for itself.")
        
        return data

class ClassSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSettings
        fields = [
            'id', 'class_obj', 'max_absences', 'attendance_required',
            'grading_system', 'pass_percentage', 'allow_repeat',
            'max_repeats', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ClassSettingsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSettings
        fields = [
            'class_obj', 'max_absences', 'attendance_required',
            'grading_system', 'pass_percentage', 'allow_repeat', 'max_repeats'
        ]

    def validate(self, data):
        if data.get('pass_percentage', 0) > 100:
            raise serializers.ValidationError("Pass percentage cannot exceed 100%.")
        return data

class ClassDashboardSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    total_subjects = serializers.SerializerMethodField()
    total_schedules = serializers.SerializerMethodField()
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    room_name = serializers.CharField(source='room.full_name', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'code', 'name', 'full_name', 'grade_level', 'section',
            'capacity', 'current_students', 'available_seats', 'occupancy_rate',
            'class_teacher_name', 'room_name', 'total_subjects', 'total_schedules'
        ]

    def get_total_subjects(self, obj):
        return obj.subjects.filter(is_active=True).count()

    def get_total_schedules(self, obj):
        return obj.schedules.filter(is_active=True).count()

class SubjectDashboardSerializer(serializers.ModelSerializer):
    total_classes = serializers.SerializerMethodField()
    total_prerequisites = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'category', 'grade_level', 'credit_hours',
            'max_marks', 'pass_marks', 'total_classes', 'total_prerequisites'
        ]

    def get_total_classes(self, obj):
        return obj.classsubject_set.filter(is_active=True).count()

    def get_total_prerequisites(self, obj):
        return obj.prerequisites.count()

class ClassSearchSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'code', 'name', 'full_name', 'grade_level', 'section',
            'capacity', 'current_students', 'available_seats',
            'class_teacher_name', 'is_active'
        ]

class SubjectSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'category', 'grade_level',
            'credit_hours', 'is_active'
        ]
