from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Basic event serializer for list views"""
    
    event_type_display = serializers.CharField(
        source='get_event_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    is_ongoing = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'event_type_display',
            'status', 'status_display', 'start_date', 'end_date', 'start_time',
            'end_time', 'venue', 'organizer', 'is_public',
            'requires_registration', 'is_ongoing', 'is_upcoming', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed event serializer for create/update/retrieve views"""
    
    event_type_display = serializers.CharField(
        source='get_event_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    is_ongoing = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'event_type_display',
            'status', 'status_display', 'start_date', 'end_date', 'start_time',
            'end_time', 'venue', 'address', 'organizer', 'contact_person',
            'contact_email', 'contact_phone', 'target_audience',
            'max_participants', 'is_public', 'requires_registration',
            'registration_deadline', 'is_ongoing', 'is_upcoming',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate event data"""
        # Check if end_date is after start_date
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    "End date must be after start date."
                )
        
        # Check if end_time is after start_time when dates are the same
        if (data.get('end_date') == data.get('start_date') and
                data.get('end_time') and data.get('start_time')):
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError(
                    "End time must be after start time when dates are the same."
                )
        
        # Check registration deadline
        if (data.get('requires_registration') and
                data.get('registration_deadline') and
                data.get('start_date')):
            if data['registration_deadline'].date() >= data['start_date']:
                raise serializers.ValidationError(
                    "Registration deadline must be before the event start date."
                )
        
        return data


class EventCalendarSerializer(serializers.ModelSerializer):
    """Serializer for calendar view"""
    
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'start', 'end', 'event_type', 'status',
            'venue', 'color'
        ]
    
    def get_start(self, obj):
        return f"{obj.start_date}T{obj.start_time}"
    
    def get_end(self, obj):
        return f"{obj.end_date}T{obj.end_time}"
    
    def get_color(self, obj):
        colors = {
            'academic': '#3B82F6',  # Blue
            'sports': '#10B981',    # Green
            'cultural': '#F59E0B',  # Yellow
            'social': '#EF4444',    # Red
            'other': '#6B7280',     # Gray
        }
        return colors.get(obj.event_type, '#6B7280')
