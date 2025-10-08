from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.db import models
from .models import AcademicYear


class AcademicYearSerializer(serializers.ModelSerializer):
    """Base academic year serializer"""

    duration_display = serializers.ReadOnlyField()

    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AcademicYearListSerializer(serializers.ModelSerializer):
    """Academic year list serializer for list views"""

    duration_display = serializers.ReadOnlyField()

    class Meta:
        model = AcademicYear
        fields = [
            'id', 'name', 'start_date', 'end_date',
            'duration_display', 'is_current', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']


class AcademicYearDetailSerializer(serializers.ModelSerializer):
    """Academic year detail serializer with additional information"""

    duration_display = serializers.ReadOnlyField()
    days_remaining = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()
    is_future = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_days_remaining(self, obj):
        """Calculate days remaining in the academic year"""
        from datetime import date
        if obj.end_date and obj.is_current:
            today = date.today()
            if today <= obj.end_date:
                return (obj.end_date - today).days
        return None

    def get_is_past(self, obj):
        """Check if academic year is in the past"""
        from datetime import date
        return obj.end_date < date.today() if obj.end_date else False

    def get_is_future(self, obj):
        """Check if academic year is in the future"""
        from datetime import date
        return obj.start_date > date.today() if obj.start_date else False


class AcademicYearCreateSerializer(serializers.ModelSerializer):
    """Academic year create serializer with validation"""

    class Meta:
        model = AcademicYear
        fields = [
            'name', 'start_date', 'end_date', 'is_current', 'is_active'
        ]

    def validate(self, data):
        """Validate academic year data"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        # Validate date range
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    'end_date': _('End date must be after start date.')
                })

            # Check for overlapping academic years
            overlapping_years = AcademicYear.objects.filter(
                is_active=True
            ).filter(
                models.Q(
                    start_date__lte=end_date, end_date__gte=start_date
                )
            )

            if overlapping_years.exists():
                raise serializers.ValidationError({
                    'start_date': _(
                        'Academic year overlaps with existing active '
                        'academic year.'
                    ),
                    'end_date': _(
                        'Academic year overlaps with existing active '
                        'academic year.'
                    )
                })

        # Validate name format (e.g., 2024-25)
        name = data.get('name', '')
        if name and not self._validate_name_format(name):
            raise serializers.ValidationError({
                'name': _('Name should be in format YYYY-YY (e.g., 2024-25).')
            })

        return data

    def _validate_name_format(self, name):
        """Validate academic year name format"""
        import re
        pattern = r'^\d{4}-\d{2}$'
        if not re.match(pattern, name):
            return False

        # Check if the years are consecutive
        try:
            start_year = int(name[:4])
            end_year = int('20' + name[5:])
            return end_year == start_year + 1
        except (ValueError, IndexError):
            return False

    def validate_name(self, value):
        """Validate unique academic year name"""
        if AcademicYear.objects.filter(name=value).exists():
            raise serializers.ValidationError(
                _('Academic year with this name already exists.')
            )
        return value

    def create(self, validated_data):
        """Create academic year with proper current year handling"""
        # If setting as current, first unset all other current years
        if validated_data.get('is_current'):
            AcademicYear.objects.filter(
                is_current=True
            ).update(is_current=False)

        return super().create(validated_data)


class AcademicYearUpdateSerializer(serializers.ModelSerializer):
    """Academic year update serializer"""

    class Meta:
        model = AcademicYear
        fields = [
            'name', 'start_date', 'end_date', 'is_current', 'is_active'
        ]

    def validate(self, data):
        """Validate academic year update data"""
        start_date = data.get('start_date', self.instance.start_date)
        end_date = data.get('end_date', self.instance.end_date)

        # Validate date range
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    'end_date': _('End date must be after start date.')
                })

            # Check for overlapping academic years (excluding current instance)
            overlapping_years = AcademicYear.objects.filter(
                is_active=True
            ).exclude(id=self.instance.id).filter(
                models.Q(
                    start_date__lte=end_date, end_date__gte=start_date
                )
            )

            if overlapping_years.exists():
                raise serializers.ValidationError({
                    'start_date': _(
                        'Academic year overlaps with existing active '
                        'academic year.'
                    ),
                    'end_date': _(
                        'Academic year overlaps with existing active '
                        'academic year.'
                    )
                })

        return data

    def validate_name(self, value):
        """Validate unique academic year name (excluding current instance)"""
        if AcademicYear.objects.filter(
            name=value
        ).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError(
                _('Academic year with this name already exists.')
            )
        return value

    def update(self, instance, validated_data):
        """Update academic year with proper current year handling"""
        # If setting as current, first unset all other current years
        if validated_data.get('is_current'):
            AcademicYear.objects.filter(
                is_current=True
            ).update(is_current=False)

        return super().update(instance, validated_data)


class AcademicYearDashboardSerializer(serializers.ModelSerializer):
    """Academic year dashboard serializer with summary data"""

    duration_display = serializers.ReadOnlyField()
    days_remaining = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()
    is_future = serializers.SerializerMethodField()

    # Summary data
    total_students = serializers.SerializerMethodField()
    total_teachers = serializers.SerializerMethodField()
    total_classes = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYear
        fields = [
            'id', 'name', 'start_date', 'end_date', 'duration_display',
            'days_remaining', 'is_past', 'is_future', 'is_current',
            'is_active', 'total_students', 'total_teachers',
            'total_classes', 'created_at'
        ]

    def get_days_remaining(self, obj):
        """Calculate days remaining in the academic year"""
        from datetime import date
        if obj.end_date and obj.is_current:
            today = date.today()
            if today <= obj.end_date:
                return (obj.end_date - today).days
        return None

    def get_is_past(self, obj):
        """Check if academic year is in the past"""
        from datetime import date
        return obj.end_date < date.today() if obj.end_date else False

    def get_is_future(self, obj):
        """Check if academic year is in the future"""
        from datetime import date
        return obj.start_date > date.today() if obj.start_date else False

    def get_total_students(self, obj):
        """Get total students in this academic year"""
        # This would need to be implemented based on your student model
        # For now, returning 0 as placeholder
        return 0

    def get_total_teachers(self, obj):
        """Get total teachers in this academic year"""
        # This would need to be implemented based on your teacher model
        # For now, returning 0 as placeholder
        return 0

    def get_total_classes(self, obj):
        """Get total classes in this academic year"""
        # This would need to be implemented based on your class model
        # For now, returning 0 as placeholder
        return 0


class AcademicYearSearchSerializer(serializers.ModelSerializer):
    """Academic year search serializer for search functionality"""

    duration_display = serializers.ReadOnlyField()

    class Meta:
        model = AcademicYear
        fields = [
            'id', 'name', 'start_date', 'end_date', 'duration_display',
            'is_current', 'is_active'
        ]
