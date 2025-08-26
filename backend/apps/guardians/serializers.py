from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Guardian, GuardianProfile, GuardianStudent, GuardianDocument,
    GuardianSettings, GuardianNotification
)

User = get_user_model()

# Use UserSerializer from accounts app instead
from apps.accounts.serializers import UserSerializer

class GuardianListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            'id', 'guardian_id', 'full_name', 'age', 'gender', 'occupation',
            'phone', 'email', 'status', 'is_active', 'total_students', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_total_students(self, obj):
        return obj.students.count()

class GuardianDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    profile = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            'id', 'user', 'guardian_id', 'full_name', 'age', 'first_name', 'last_name',
            'middle_name', 'date_of_birth', 'gender', 'blood_group', 'email', 'phone',
            'address', 'city', 'state', 'postal_code', 'country', 'occupation', 'employer',
            'annual_income', 'education_level', 'status', 'is_active', 'profile',
            'students', 'documents', 'settings', 'notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_profile(self, obj):
        try:
            return GuardianProfileSerializer(obj.profile).data
        except GuardianProfile.DoesNotExist:
            return None

    def get_students(self, obj):
        return GuardianStudentSerializer(obj.students.all(), many=True).data

    def get_documents(self, obj):
        return GuardianDocumentSerializer(obj.documents.all(), many=True).data

    def get_settings(self, obj):
        try:
            return GuardianSettingsSerializer(obj.settings).data
        except GuardianSettings.DoesNotExist:
            return None

    def get_notifications(self, obj):
        return GuardianNotificationSerializer(obj.notifications.all()[:10], many=True).data

class GuardianCreateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Guardian
        fields = [
            'user', 'password', 'guardian_id', 'first_name', 'last_name', 'middle_name',
            'date_of_birth', 'gender', 'blood_group', 'email', 'phone', 'address',
            'city', 'state', 'postal_code', 'country', 'occupation', 'employer',
            'annual_income', 'education_level', 'status', 'is_active'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=user_data.get('username'),
            email=user_data.get('email'),
            password=password
        )
        guardian = Guardian.objects.create(user=user, **validated_data)
        GuardianSettings.objects.create(guardian=guardian)
        return guardian

    def validate_guardian_id(self, value):
        if Guardian.objects.filter(guardian_id=value).exists():
            raise serializers.ValidationError("Guardian ID already exists.")
        return value

    def validate_email(self, value):
        if Guardian.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_phone(self, value):
        if Guardian.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists.")
        return value

class GuardianUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(partial=True)

    class Meta:
        model = Guardian
        fields = [
            'user', 'guardian_id', 'first_name', 'last_name', 'middle_name',
            'date_of_birth', 'gender', 'blood_group', 'email', 'phone', 'address',
            'city', 'state', 'postal_code', 'country', 'occupation', 'employer',
            'annual_income', 'education_level', 'status', 'is_active'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class GuardianProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianProfile
        fields = [
            'id', 'guardian', 'profile_picture', 'bio', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relationship',
            'preferred_contact_method', 'communication_preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class GuardianProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianProfile
        fields = [
            'guardian', 'profile_picture', 'bio', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relationship',
            'preferred_contact_method', 'communication_preferences'
        ]

    def validate_profile_picture(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError("Profile picture size must be less than 5MB.")
            if not value.content_type.startswith('image/'):
                raise serializers.ValidationError("File must be an image.")
        return value

class GuardianStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    class_name = serializers.CharField(source='student.class_enrolled.name', read_only=True)

    class Meta:
        model = GuardianStudent
        fields = [
            'id', 'guardian', 'student', 'student_name', 'student_id', 'class_name',
            'relationship', 'is_primary_guardian', 'emergency_contact', 'created_at'
        ]
        read_only_fields = ['created_at']

class GuardianStudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianStudent
        fields = [
            'guardian', 'student', 'relationship', 'is_primary_guardian', 'emergency_contact'
        ]

    def validate(self, data):
        guardian = data.get('guardian')
        student = data.get('student')
        
        # Check if relationship already exists
        if GuardianStudent.objects.filter(guardian=guardian, student=student).exists():
            raise serializers.ValidationError("This guardian-student relationship already exists.")
        
        # If this is primary guardian, unset other primary guardians for this student
        if data.get('is_primary_guardian'):
            GuardianStudent.objects.filter(student=student, is_primary_guardian=True).update(is_primary_guardian=False)
        
        return data

class GuardianDocumentSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(source='file.name', read_only=True)
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = GuardianDocument
        fields = [
            'id', 'guardian', 'document_type', 'file', 'file_name', 'file_size',
            'description', 'expiry_date', 'verified', 'verified_by', 'verified_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['verified', 'verified_by', 'verified_at', 'created_at', 'updated_at']

    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return 0

class GuardianDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianDocument
        fields = [
            'guardian', 'document_type', 'file', 'description', 'expiry_date'
        ]

    def validate_file(self, value):
        if value:
            if value.size > 10 * 1024 * 1024:  # 10MB limit
                raise serializers.ValidationError("File size must be less than 10MB.")
            allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("File type not supported. Please upload PDF or image files.")
        return value

    def validate_expiry_date(self, value):
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Expiry date cannot be in the past.")
        return value

class GuardianSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianSettings
        fields = [
            'id', 'guardian', 'email_notifications', 'sms_notifications',
            'push_notifications', 'notification_frequency', 'language',
            'theme', 'timezone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class GuardianNotificationSerializer(serializers.ModelSerializer):
    guardian_name = serializers.CharField(source='guardian.full_name', read_only=True)

    class Meta:
        model = GuardianNotification
        fields = [
            'id', 'guardian', 'guardian_name', 'title', 'message', 'notification_type',
            'priority', 'read', 'read_at', 'created_at'
        ]
        read_only_fields = ['read', 'read_at', 'created_at']

class GuardianDashboardSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_students = serializers.SerializerMethodField()
    total_notifications = serializers.SerializerMethodField()
    unread_notifications = serializers.SerializerMethodField()
    recent_notifications = serializers.SerializerMethodField()
    student_summary = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            'id', 'guardian_id', 'full_name', 'email', 'phone', 'status',
            'total_students', 'total_notifications', 'unread_notifications',
            'recent_notifications', 'student_summary'
        ]

    def get_total_students(self, obj):
        return obj.students.count()

    def get_total_notifications(self, obj):
        return obj.notifications.count()

    def get_unread_notifications(self, obj):
        return obj.notifications.filter(read=False).count()

    def get_recent_notifications(self, obj):
        notifications = obj.notifications.filter(read=False).order_by('-created_at')[:5]
        return GuardianNotificationSerializer(notifications, many=True).data

    def get_student_summary(self, obj):
        students = obj.students.all()
        summary = {
            'total': students.count(),
            'by_class': {},
            'by_status': {}
        }
        
        for student_rel in students:
            student = student_rel.student
            class_name = student.class_enrolled.name if student.class_enrolled else 'Unknown'
            status = student.status
            
            summary['by_class'][class_name] = summary['by_class'].get(class_name, 0) + 1
            summary['by_status'][status] = summary['by_status'].get(status, 0) + 1
        
        return summary

class GuardianSearchSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            'id', 'guardian_id', 'full_name', 'email', 'phone', 'occupation',
            'status', 'total_students'
        ]

    def get_total_students(self, obj):
        return obj.students.count()
