from rest_framework import serializers
from django.utils import timezone
from .models import (
    Notice, NoticeCategory, NoticeAttachment, 
    NoticeRecipient, NoticeTemplate
)


class NoticeCategorySerializer(serializers.ModelSerializer):
    """Serializer for NoticeCategory model"""
    
    class Meta:
        model = NoticeCategory
        fields = [
            'id', 'name', 'description', 'color', 'icon', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NoticeAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for NoticeAttachment model"""
    
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = NoticeAttachment
        fields = [
            'id', 'notice', 'file', 'filename', 'file_size', 
            'file_size_mb', 'file_type', 'description', 
            'file_url', 'created_at'
        ]
        read_only_fields = ['id', 'file_size', 'file_size_mb', 'created_at']
    
    def get_file_url(self, obj):
        """Get file URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_file_size_mb(self, obj):
        """Get file size in MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0


class NoticeRecipientSerializer(serializers.ModelSerializer):
    """Serializer for NoticeRecipient model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = NoticeRecipient
        fields = [
            'id', 'notice', 'user', 'user_name', 'user_email',
            'email_sent', 'sms_sent', 'push_sent', 'is_read',
            'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email_sent', 'sms_sent', 'push_sent',
            'created_at', 'updated_at'
        ]


class NoticeTemplateSerializer(serializers.ModelSerializer):
    """Serializer for NoticeTemplate model"""
    
    category_name = serializers.CharField(
        source='category.name', 
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', 
        read_only=True
    )
    
    class Meta:
        model = NoticeTemplate
        fields = [
            'id', 'name', 'description', 'subject', 'content',
            'category', 'category_name', 'is_active', 
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class NoticeSerializer(serializers.ModelSerializer):
    """Base serializer for Notice model"""
    
    category_name = serializers.CharField(
        source='category.name', 
        read_only=True
    )
    author_name = serializers.CharField(
        source='author.get_full_name', 
        read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name', 
        read_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    is_published = serializers.BooleanField(read_only=True)
    attachments_count = serializers.SerializerMethodField()
    recipients_count = serializers.SerializerMethodField()
    read_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'content', 'summary', 'category', 'category_name',
            'priority', 'status', 'target_audience', 'publish_date', 
            'expiry_date', 'author', 'author_name', 'requires_approval',
            'approved_by', 'approved_by_name', 'approved_at', 'send_email',
            'send_sms', 'send_push', 'pin_to_top', 'views_count', 
            'read_count', 'is_expired', 'is_published', 'attachments_count',
            'recipients_count', 'read_percentage', 'created_at', 
            'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'views_count', 'read_count', 'is_expired', 
            'is_published', 'attachments_count', 'recipients_count',
            'read_percentage', 'created_at', 'updated_at', 'published_at'
        ]
    
    def get_attachments_count(self, obj):
        """Get count of attachments"""
        return obj.attachments.count()
    
    def get_recipients_count(self, obj):
        """Get count of recipients"""
        return obj.recipients.count()
    
    def get_read_percentage(self, obj):
        """Get read percentage"""
        if obj.recipients.count() > 0:
            read_count = obj.recipients.filter(is_read=True).count()
            return round((read_count / obj.recipients.count()) * 100, 1)
        return 0


class NoticeDetailSerializer(NoticeSerializer):
    """Detailed serializer for Notice model with related data"""
    
    attachments = NoticeAttachmentSerializer(many=True, read_only=True)
    recipients = NoticeRecipientSerializer(many=True, read_only=True)
    target_classes = serializers.SerializerMethodField()
    target_grades = serializers.SerializerMethodField()
    target_users = serializers.SerializerMethodField()
    
    class Meta(NoticeSerializer.Meta):
        fields = NoticeSerializer.Meta.fields + [
            'attachments', 'recipients', 'target_classes', 
            'target_grades', 'target_users'
        ]
    
    def get_target_classes(self, obj):
        """Get target classes data"""
        from apps.classes.serializers import ClassSerializer
        return ClassSerializer(obj.target_classes.all(), many=True).data
    
    def get_target_grades(self, obj):
        """Get target grades data"""
        from apps.classes.serializers import GradeSerializer
        return GradeSerializer(obj.target_grades.all(), many=True).data
    
    def get_target_users(self, obj):
        """Get target users data"""
        from apps.accounts.serializers import UserSerializer
        return UserSerializer(obj.target_users.all(), many=True).data


class NoticeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notices"""
    
    class Meta:
        model = Notice
        fields = [
            'title', 'content', 'summary', 'category', 'priority', 
            'status', 'target_audience', 'target_classes', 'target_grades',
            'target_users', 'publish_date', 'expiry_date', 
            'requires_approval', 'send_email', 'send_sms', 'send_push', 
            'pin_to_top'
        ]
    
    def validate_publish_date(self, value):
        """Validate publish date"""
        if value < timezone.now():
            raise serializers.ValidationError(
                "Publish date cannot be in the past"
            )
        return value
    
    def validate_expiry_date(self, value):
        """Validate expiry date"""
        publish_date = self.initial_data.get('publish_date')
        if value and publish_date and value <= publish_date:
            raise serializers.ValidationError(
                "Expiry date must be after publish date"
            )
        return value
    
    def create(self, validated_data):
        """Create notice with current user as author"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class NoticeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notices"""
    
    class Meta:
        model = Notice
        fields = [
            'title', 'content', 'summary', 'category', 'priority', 
            'status', 'target_audience', 'target_classes', 'target_grades',
            'target_users', 'publish_date', 'expiry_date', 
            'requires_approval', 'send_email', 'send_sms', 'send_push', 
            'pin_to_top'
        ]
    
    def validate(self, data):
        """Validate notice update"""
        instance = self.instance
        
        # Check if notice can be updated
        if instance.status == 'published' and instance.published_at:
            # Only allow certain fields to be updated for published notices
            allowed_fields = ['pin_to_top', 'expiry_date']
            for field in data:
                if field not in allowed_fields:
                    raise serializers.ValidationError(
                        f"Cannot update {field} for published notices"
                    )
        
        return data


class NoticeApprovalSerializer(serializers.Serializer):
    """Serializer for notice approval"""
    
    approved = serializers.BooleanField()
    comments = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate approval data"""
        notice = self.context['notice']
        
        if data['approved'] and notice.status != 'draft':
            raise serializers.ValidationError(
                "Only draft notices can be approved"
            )
        
        return data


class NoticeStatsSerializer(serializers.Serializer):
    """Serializer for notice statistics"""
    
    total_notices = serializers.IntegerField()
    published_notices = serializers.IntegerField()
    draft_notices = serializers.IntegerField()
    expired_notices = serializers.IntegerField()
    urgent_notices = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_reads = serializers.IntegerField()
    read_rate = serializers.FloatField()
    notices_by_category = serializers.DictField()
    notices_by_priority = serializers.DictField()
    recent_notices = serializers.ListField()
