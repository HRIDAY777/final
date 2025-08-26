from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Student, StudentProfile, StudentAcademicRecord, StudentGuardian,
    StudentDocument, StudentAchievement, StudentDiscipline, StudentSettings
)

User = get_user_model()


# Use UserSerializer from accounts app instead
from apps.accounts.serializers import UserSerializer


class StudentSettingsSerializer(serializers.ModelSerializer):
    """Student settings serializer"""
    
    class Meta:
        model = StudentSettings
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    """Student profile serializer"""
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentGuardianSerializer(serializers.ModelSerializer):
    """Student guardian serializer"""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentGuardian
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentDocumentSerializer(serializers.ModelSerializer):
    """Student document serializer"""
    
    class Meta:
        model = StudentDocument
        fields = '__all__'
        read_only_fields = ['file_size', 'file_type', 'created_at', 'updated_at']


class StudentAchievementSerializer(serializers.ModelSerializer):
    """Student achievement serializer"""
    
    class Meta:
        model = StudentAchievement
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentDisciplineSerializer(serializers.ModelSerializer):
    """Student discipline serializer"""
    
    class Meta:
        model = StudentDiscipline
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentAcademicRecordSerializer(serializers.ModelSerializer):
    """Student academic record serializer"""
    
    class Meta:
        model = StudentAcademicRecord
        fields = '__all__'
        read_only_fields = ['percentage', 'attendance_percentage', 'created_at', 'updated_at']


class StudentSerializer(serializers.ModelSerializer):
    """Base student serializer"""
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentListSerializer(serializers.ModelSerializer):
    """Student list serializer for list views"""
    
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'admission_number', 'full_name', 'age',
            'gender', 'current_class', 'current_class_name', 'academic_year',
            'academic_year_name', 'status', 'is_active', 'admission_date',
            'created_at'
        ]
        read_only_fields = ['created_at']


class StudentDetailSerializer(serializers.ModelSerializer):
    """Student detail serializer with nested relationships"""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    profile = StudentProfileSerializer(read_only=True)
    guardians = StudentGuardianSerializer(many=True, read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)
    achievements = StudentAchievementSerializer(many=True, read_only=True)
    disciplinary_records = StudentDisciplineSerializer(many=True, read_only=True)
    academic_records = StudentAcademicRecordSerializer(many=True, read_only=True)
    settings = StudentSettingsSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    """Student create serializer with user creation"""
    
    user = UserSerializer()
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Student
        fields = [
            'user', 'password', 'student_id', 'admission_number', 'first_name',
            'last_name', 'middle_name', 'date_of_birth', 'gender', 'blood_group',
            'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country',
            'current_class', 'admission_date', 'academic_year', 'status', 'is_active'
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
        
        # Create student
        student = Student.objects.create(user=user, **validated_data)
        
        # Create default settings
        StudentSettings.objects.create(student=student)
        
        return student
    
    def validate_student_id(self, value):
        """Validate unique student ID"""
        if Student.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student ID already exists.")
        return value
    
    def validate_admission_number(self, value):
        """Validate unique admission number"""
        if Student.objects.filter(admission_number=value).exists():
            raise serializers.ValidationError("Admission number already exists.")
        return value


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Student update serializer"""
    
    user = UserSerializer(partial=True)
    
    class Meta:
        model = Student
        fields = [
            'user', 'student_id', 'admission_number', 'first_name', 'last_name',
            'middle_name', 'date_of_birth', 'gender', 'blood_group', 'email',
            'phone', 'address', 'city', 'state', 'postal_code', 'country',
            'current_class', 'admission_date', 'academic_year', 'status', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update user
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Update student
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class StudentProfileCreateSerializer(serializers.ModelSerializer):
    """Student profile create serializer"""
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
    
    def validate_student(self, value):
        """Validate that student doesn't already have a profile"""
        if StudentProfile.objects.filter(student=value).exists():
            raise serializers.ValidationError("Student already has a profile.")
        return value


class StudentGuardianCreateSerializer(serializers.ModelSerializer):
    """Student guardian create serializer"""
    
    class Meta:
        model = StudentGuardian
        fields = '__all__'
    
    def validate(self, data):
        """Validate guardian data"""
        # Ensure only one primary guardian per student
        if data.get('is_primary_guardian'):
            StudentGuardian.objects.filter(
                student=data['student'],
                is_primary_guardian=True
            ).update(is_primary_guardian=False)
        
        # Ensure only one emergency contact per student
        if data.get('is_emergency_contact'):
            StudentGuardian.objects.filter(
                student=data['student'],
                is_emergency_contact=True
            ).update(is_emergency_contact=False)
        
        return data


class StudentDocumentCreateSerializer(serializers.ModelSerializer):
    """Student document create serializer"""
    
    class Meta:
        model = StudentDocument
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


class StudentAchievementCreateSerializer(serializers.ModelSerializer):
    """Student achievement create serializer"""
    
    class Meta:
        model = StudentAchievement
        fields = '__all__'
    
    def validate_date_achieved(self, value):
        """Validate achievement date"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Achievement date cannot be in the future.")
        return value


class StudentDisciplineCreateSerializer(serializers.ModelSerializer):
    """Student discipline create serializer"""
    
    class Meta:
        model = StudentDiscipline
        fields = '__all__'
    
    def validate_incident_date(self, value):
        """Validate incident date"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Incident date cannot be in the future.")
        return value


class StudentAcademicRecordCreateSerializer(serializers.ModelSerializer):
    """Student academic record create serializer"""
    
    class Meta:
        model = StudentAcademicRecord
        fields = '__all__'
        read_only_fields = ['percentage', 'attendance_percentage']
    
    def validate(self, data):
        """Validate academic record data"""
        # Check if record already exists for this student, year, and class
        if StudentAcademicRecord.objects.filter(
            student=data['student'],
            academic_year=data['academic_year'],
            class_enrolled=data['class_enrolled']
        ).exists():
            raise serializers.ValidationError("Academic record already exists for this student, year, and class.")
        
        return data


class StudentDashboardSerializer(serializers.ModelSerializer):
    """Student dashboard serializer with summary data"""
    
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    # Summary data
    total_guardians = serializers.SerializerMethodField()
    total_documents = serializers.SerializerMethodField()
    total_achievements = serializers.SerializerMethodField()
    total_disciplinary_records = serializers.SerializerMethodField()
    latest_academic_record = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'admission_number', 'full_name', 'age',
            'gender', 'current_class', 'current_class_name', 'academic_year',
            'academic_year_name', 'status', 'is_active', 'admission_date',
            'total_guardians', 'total_documents', 'total_achievements',
            'total_disciplinary_records', 'latest_academic_record'
        ]
    
    def get_total_guardians(self, obj):
        return obj.guardians.count()
    
    def get_total_documents(self, obj):
        return obj.documents.count()
    
    def get_total_achievements(self, obj):
        return obj.achievements.count()
    
    def get_total_disciplinary_records(self, obj):
        return obj.disciplinary_records.count()
    
    def get_latest_academic_record(self, obj):
        latest_record = obj.academic_records.order_by('-academic_year').first()
        if latest_record:
            return {
                'academic_year': latest_record.academic_year.name,
                'class_enrolled': latest_record.class_enrolled.name,
                'percentage': float(latest_record.percentage),
                'grade': latest_record.grade,
                'rank': latest_record.rank,
                'attendance_percentage': float(latest_record.attendance_percentage)
            }
        return None


class StudentSearchSerializer(serializers.ModelSerializer):
    """Student search serializer for search functionality"""
    
    full_name = serializers.ReadOnlyField()
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'admission_number', 'full_name', 'gender',
            'current_class', 'current_class_name', 'status', 'is_active'
        ]
