from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Teacher, TeacherProfile, TeacherQualification, TeacherExperience,
    TeacherSubject, TeacherClass, TeacherAttendance, TeacherSalary,
    TeacherLeave, TeacherPerformance, TeacherDocument, TeacherSettings
)

User = get_user_model()


# Use UserSerializer from accounts app instead
from apps.accounts.serializers import UserSerializer


class TeacherSettingsSerializer(serializers.ModelSerializer):
    """Teacher settings serializer"""
    
    class Meta:
        model = TeacherSettings
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherProfileSerializer(serializers.ModelSerializer):
    """Teacher profile serializer"""
    
    class Meta:
        model = TeacherProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherQualificationSerializer(serializers.ModelSerializer):
    """Teacher qualification serializer"""
    
    class Meta:
        model = TeacherQualification
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherExperienceSerializer(serializers.ModelSerializer):
    """Teacher experience serializer"""
    
    class Meta:
        model = TeacherExperience
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherSubjectSerializer(serializers.ModelSerializer):
    """Teacher subject serializer"""
    
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = TeacherSubject
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherClassSerializer(serializers.ModelSerializer):
    """Teacher class serializer"""
    
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    class Meta:
        model = TeacherClass
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherAttendanceSerializer(serializers.ModelSerializer):
    """Teacher attendance serializer"""
    
    class Meta:
        model = TeacherAttendance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherSalarySerializer(serializers.ModelSerializer):
    """Teacher salary serializer"""
    
    class Meta:
        model = TeacherSalary
        fields = '__all__'
        read_only_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']


class TeacherLeaveSerializer(serializers.ModelSerializer):
    """Teacher leave serializer"""
    
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    
    class Meta:
        model = TeacherLeave
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherPerformanceSerializer(serializers.ModelSerializer):
    """Teacher performance serializer"""
    
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    evaluated_by_name = serializers.CharField(source='evaluated_by.full_name', read_only=True)
    
    class Meta:
        model = TeacherPerformance
        fields = '__all__'
        read_only_fields = ['overall_score', 'grade', 'created_at', 'updated_at']


class TeacherDocumentSerializer(serializers.ModelSerializer):
    """Teacher document serializer"""
    
    verified_by_name = serializers.CharField(source='verified_by.full_name', read_only=True)
    
    class Meta:
        model = TeacherDocument
        fields = '__all__'
        read_only_fields = ['file_size', 'file_type', 'created_at', 'updated_at']


class TeacherSerializer(serializers.ModelSerializer):
    """Base teacher serializer"""
    
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherListSerializer(serializers.ModelSerializer):
    """Teacher list serializer for list views"""
    
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    experience_years = serializers.ReadOnlyField()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'teacher_id', 'employee_number', 'full_name', 'age',
            'gender', 'designation', 'department', 'employment_type',
            'status', 'is_active', 'joining_date', 'experience_years',
            'created_at'
        ]
        read_only_fields = ['created_at']


class TeacherDetailSerializer(serializers.ModelSerializer):
    """Teacher detail serializer with nested relationships"""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    experience_years = serializers.ReadOnlyField()
    profile = TeacherProfileSerializer(read_only=True)
    qualifications = TeacherQualificationSerializer(many=True, read_only=True)
    experiences = TeacherExperienceSerializer(many=True, read_only=True)
    subjects = TeacherSubjectSerializer(many=True, read_only=True)
    classes = TeacherClassSerializer(many=True, read_only=True)
    attendance_records = TeacherAttendanceSerializer(many=True, read_only=True)
    salaries = TeacherSalarySerializer(many=True, read_only=True)
    leaves = TeacherLeaveSerializer(many=True, read_only=True)
    performance_records = TeacherPerformanceSerializer(many=True, read_only=True)
    documents = TeacherDocumentSerializer(many=True, read_only=True)
    settings = TeacherSettingsSerializer(read_only=True)
    
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherCreateSerializer(serializers.ModelSerializer):
    """Teacher create serializer with user creation"""
    
    user = UserSerializer()
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Teacher
        fields = [
            'user', 'password', 'teacher_id', 'employee_number', 'first_name',
            'last_name', 'middle_name', 'date_of_birth', 'gender', 'blood_group',
            'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country',
            'joining_date', 'employment_type', 'designation', 'department',
            'qualification', 'specialization', 'status', 'is_active'
        ]
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(
            username=user_data.get('username'),
            email=user_data.get('email'),
            password=password,
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            is_active=user_data.get('is_active', True)
        )
        
        # Create teacher
        teacher = Teacher.objects.create(user=user, **validated_data)
        
        # Create default settings
        TeacherSettings.objects.create(teacher=teacher)
        
        return teacher
    
    def validate_teacher_id(self, value):
        """Validate unique teacher ID"""
        if Teacher.objects.filter(teacher_id=value).exists():
            raise serializers.ValidationError("Teacher ID already exists.")
        return value
    
    def validate_employee_number(self, value):
        """Validate unique employee number"""
        if Teacher.objects.filter(employee_number=value).exists():
            raise serializers.ValidationError("Employee number already exists.")
        return value


class TeacherUpdateSerializer(serializers.ModelSerializer):
    """Teacher update serializer"""
    
    user = UserSerializer(partial=True)
    
    class Meta:
        model = Teacher
        fields = [
            'user', 'teacher_id', 'employee_number', 'first_name', 'last_name',
            'middle_name', 'date_of_birth', 'gender', 'blood_group', 'email',
            'phone', 'address', 'city', 'state', 'postal_code', 'country',
            'joining_date', 'employment_type', 'designation', 'department',
            'qualification', 'specialization', 'status', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update user
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Update teacher
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class TeacherProfileCreateSerializer(serializers.ModelSerializer):
    """Teacher profile create serializer"""
    
    class Meta:
        model = TeacherProfile
        fields = '__all__'
    
    def validate_teacher(self, value):
        """Validate that teacher doesn't already have a profile"""
        if TeacherProfile.objects.filter(teacher=value).exists():
            raise serializers.ValidationError("Teacher already has a profile.")
        return value


class TeacherQualificationCreateSerializer(serializers.ModelSerializer):
    """Teacher qualification create serializer"""
    
    class Meta:
        model = TeacherQualification
        fields = '__all__'
    
    def validate_completion_year(self, value):
        """Validate completion year"""
        from datetime import date
        current_year = date.today().year
        if value > current_year:
            raise serializers.ValidationError("Completion year cannot be in the future.")
        return value


class TeacherExperienceCreateSerializer(serializers.ModelSerializer):
    """Teacher experience create serializer"""
    
    class Meta:
        model = TeacherExperience
        fields = '__all__'
    
    def validate(self, data):
        """Validate experience dates"""
        if data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date cannot be after end date.")
        
        if data.get('is_current') and data.get('end_date'):
            raise serializers.ValidationError("Current position cannot have an end date.")
        
        return data


class TeacherSubjectCreateSerializer(serializers.ModelSerializer):
    """Teacher subject create serializer"""
    
    class Meta:
        model = TeacherSubject
        fields = '__all__'
    
    def validate(self, data):
        """Validate subject assignment"""
        # Check if teacher already teaches this subject
        if TeacherSubject.objects.filter(
            teacher=data['teacher'],
            subject=data['subject']
        ).exists():
            raise serializers.ValidationError("Teacher already teaches this subject.")
        
        return data


class TeacherClassCreateSerializer(serializers.ModelSerializer):
    """Teacher class create serializer"""
    
    class Meta:
        model = TeacherClass
        fields = '__all__'
    
    def validate(self, data):
        """Validate class assignment"""
        # Check if teacher already assigned to this class for this academic year
        if TeacherClass.objects.filter(
            teacher=data['teacher'],
            class_obj=data['class_obj'],
            academic_year=data['academic_year']
        ).exists():
            raise serializers.ValidationError("Teacher already assigned to this class for this academic year.")
        
        return data


class TeacherAttendanceCreateSerializer(serializers.ModelSerializer):
    """Teacher attendance create serializer"""
    
    class Meta:
        model = TeacherAttendance
        fields = '__all__'
    
    def validate(self, data):
        """Validate attendance data"""
        # Check if attendance already exists for this teacher on this date
        if TeacherAttendance.objects.filter(
            teacher=data['teacher'],
            date=data['date']
        ).exists():
            raise serializers.ValidationError("Attendance already recorded for this teacher on this date.")
        
        return data


class TeacherSalaryCreateSerializer(serializers.ModelSerializer):
    """Teacher salary create serializer"""
    
    class Meta:
        model = TeacherSalary
        fields = '__all__'
        read_only_fields = ['gross_salary', 'total_deductions', 'net_salary']
    
    def validate(self, data):
        """Validate salary data"""
        # Check if salary already exists for this teacher for this month/year
        if TeacherSalary.objects.filter(
            teacher=data['teacher'],
            month=data['month'],
            year=data['year']
        ).exists():
            raise serializers.ValidationError("Salary already exists for this teacher for this month/year.")
        
        return data


class TeacherLeaveCreateSerializer(serializers.ModelSerializer):
    """Teacher leave create serializer"""
    
    class Meta:
        model = TeacherLeave
        fields = '__all__'
    
    def validate(self, data):
        """Validate leave data"""
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date cannot be after end date.")
        
        return data


class TeacherPerformanceCreateSerializer(serializers.ModelSerializer):
    """Teacher performance create serializer"""
    
    class Meta:
        model = TeacherPerformance
        fields = '__all__'
        read_only_fields = ['overall_score', 'grade']
    
    def validate(self, data):
        """Validate performance data"""
        # Check if performance evaluation already exists for this teacher, year, and period
        if TeacherPerformance.objects.filter(
            teacher=data['teacher'],
            academic_year=data['academic_year'],
            evaluation_period=data['evaluation_period']
        ).exists():
            raise serializers.ValidationError("Performance evaluation already exists for this teacher, year, and period.")
        
        return data


class TeacherDocumentCreateSerializer(serializers.ModelSerializer):
    """Teacher document create serializer"""
    
    class Meta:
        model = TeacherDocument
        fields = '__all__'
        read_only_fields = ['file_size', 'file_type']
    
    def validate_file(self, value):
        """Validate file size and type"""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 10MB.")
        
        # Check file type
        allowed_types = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_types:
            raise serializers.ValidationError(f"File type must be one of: {', '.join(allowed_types)}")
        
        return value


class TeacherDashboardSerializer(serializers.ModelSerializer):
    """Teacher dashboard serializer with summary data"""
    
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    experience_years = serializers.ReadOnlyField()
    
    # Summary data
    total_subjects = serializers.SerializerMethodField()
    total_classes = serializers.SerializerMethodField()
    total_qualifications = serializers.SerializerMethodField()
    total_experiences = serializers.SerializerMethodField()
    total_documents = serializers.SerializerMethodField()
    attendance_percentage = serializers.SerializerMethodField()
    latest_salary = serializers.SerializerMethodField()
    latest_performance = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'teacher_id', 'employee_number', 'full_name', 'age',
            'gender', 'designation', 'department', 'employment_type',
            'status', 'is_active', 'joining_date', 'experience_years',
            'total_subjects', 'total_classes', 'total_qualifications',
            'total_experiences', 'total_documents', 'attendance_percentage',
            'latest_salary', 'latest_performance'
        ]
    
    def get_total_subjects(self, obj):
        return obj.subjects.count()
    
    def get_total_classes(self, obj):
        return obj.classes.filter(is_active=True).count()
    
    def get_total_qualifications(self, obj):
        return obj.qualifications.count()
    
    def get_total_experiences(self, obj):
        return obj.experiences.count()
    
    def get_total_documents(self, obj):
        return obj.documents.count()
    
    def get_attendance_percentage(self, obj):
        from datetime import date, timedelta
        from django.utils import timezone
        
        # Calculate attendance for last 30 days
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        attendance_records = obj.attendance_records.filter(date__gte=thirty_days_ago)
        
        if not attendance_records:
            return 0
        
        present_days = attendance_records.filter(status='present').count()
        total_days = attendance_records.count()
        
        return round((present_days / total_days) * 100, 2) if total_days > 0 else 0
    
    def get_latest_salary(self, obj):
        latest_salary = obj.salaries.order_by('-year', '-month').first()
        if latest_salary:
            return {
                'month': latest_salary.month,
                'year': latest_salary.year,
                'net_salary': float(latest_salary.net_salary),
                'payment_status': latest_salary.payment_status
            }
        return None
    
    def get_latest_performance(self, obj):
        latest_performance = obj.performance_records.order_by('-evaluation_date').first()
        if latest_performance:
            return {
                'academic_year': latest_performance.academic_year.name,
                'evaluation_period': latest_performance.get_evaluation_period_display(),
                'overall_score': float(latest_performance.overall_score),
                'grade': latest_performance.grade
            }
        return None


class TeacherSearchSerializer(serializers.ModelSerializer):
    """Teacher search serializer for search functionality"""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'teacher_id', 'employee_number', 'full_name', 'gender',
            'designation', 'department', 'status', 'is_active'
        ]
