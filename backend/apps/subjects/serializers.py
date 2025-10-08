from rest_framework import serializers
from .models import Subject, AcademicYear


class SubjectSerializer(serializers.ModelSerializer):
    """Base Subject Serializer"""
    
    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code', 'description', 'credits', 'semester',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating subjects"""
    
    class Meta:
        model = Subject
        fields = [
            'name', 'code', 'description', 'credits', 'semester',
            'is_active'
        ]


class SubjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating subjects"""
    
    class Meta:
        model = Subject
        fields = [
            'name', 'code', 'description', 'credits', 'semester',
            'is_active'
        ]


class AcademicYearSerializer(serializers.ModelSerializer):
    """Base Academic Year Serializer"""
    
    class Meta:
        model = AcademicYear
        fields = [
            'id', 'name', 'description', 'start_date', 'end_date',
            'is_active', 'is_current', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AcademicYearCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating academic years"""
    
    class Meta:
        model = AcademicYear
        fields = [
            'name', 'description', 'start_date', 'end_date',
            'is_active', 'is_current'
        ]


class AcademicYearUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating academic years"""
    
    class Meta:
        model = AcademicYear
        fields = [
            'name', 'description', 'start_date', 'end_date',
            'is_active', 'is_current'
        ]
